import { NextRequest, NextResponse } from 'next/server';

interface TranslateRequestBody {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TranslateRequestBody = await req.json();
    const { text, sourceLang = 'auto', targetLang = 'en' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const trimmedText = text.trim();
    const cleanSource = !sourceLang || sourceLang === 'auto' ? 'auto' : sourceLang.toLowerCase();
    const cleanTarget = !targetLang ? 'en' : targetLang.toLowerCase();

    // 1. Try DeepL if configured
    if (process.env.DEEPL_API_KEY) {
      try {
        const deeplKey = process.env.DEEPL_API_KEY;
        const isFree = deeplKey.endsWith(':fx');
        const endpoint = isFree
          ? 'https://api-free.deepl.com/v2/translate'
          : 'https://api.deepl.com/v2/translate';

        const params = new URLSearchParams();
        params.append('text', trimmedText);
        params.append('target_lang', cleanTarget.toUpperCase());
        if (cleanSource !== 'auto') {
          params.append('source_lang', cleanSource.toUpperCase());
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `DeepL-Auth-Key ${deeplKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translations && data.translations.length > 0) {
            return NextResponse.json({
              translatedText: data.translations[0].text,
              detectedLanguage: data.translations[0].detected_source_language?.toLowerCase(),
              provider: 'DeepL',
            });
          }
        }
      } catch (err) {
        console.warn('DeepL translation failed, trying next provider...', err);
      }
    }

    // 2. Try Google Cloud Translation API if configured
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      try {
        const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        const url = `https://translation.googleapis.com/language/translate/v2?key=${googleKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: trimmedText,
            target: cleanTarget,
            source: cleanSource === 'auto' ? undefined : cleanSource,
            format: 'text',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const item = data.data?.translations?.[0];
          if (item) {
            return NextResponse.json({
              translatedText: item.translatedText,
              detectedLanguage: item.detectedSourceLanguage,
              provider: 'Google Cloud Translate',
            });
          }
        }
      } catch (err) {
        console.warn('Google Cloud Translate failed, trying next provider...', err);
      }
    }

    // 3. Try LibreTranslate if configured
    if (process.env.LIBRETRANSLATE_URL) {
      try {
        const libreUrl = process.env.LIBRETRANSLATE_URL.replace(/\/$/, '');
        const res = await fetch(`${libreUrl}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: trimmedText,
            source: cleanSource,
            target: cleanTarget,
            api_key: process.env.LIBRETRANSLATE_API_KEY || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            return NextResponse.json({
              translatedText: data.translatedText,
              detectedLanguage: data.detectedLanguage?.language,
              provider: 'LibreTranslate',
            });
          }
        }
      } catch (err) {
        console.warn('LibreTranslate failed, trying next provider...', err);
      }
    }

    // 4. Primary Free Provider: Google Public Web Translate Engine (supports all 100+ languages, auto-detect, POS & romanization)
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${cleanSource}&tl=${cleanTarget}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(
        trimmedText
      )}`;

      const res = await fetch(gtxUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const data = await res.json();
        // data[0] contains translated segments: [[translated, original], ...]
        if (data && Array.isArray(data[0])) {
          const translatedParts: string[] = [];
          let romanization: string | undefined = undefined;

          for (const item of data[0]) {
            if (item && item[0]) {
              translatedParts.push(item[0]);
            }
            // dt=rm romanization
            if (item && item[3]) {
              romanization = item[3];
            }
          }

          const translatedText = translatedParts.join('');
          const detectedLanguage = data[2] || (cleanSource !== 'auto' ? cleanSource : undefined);

          // Part of speech from data[1] if single word
          let partOfSpeech: string | undefined = undefined;
          if (data[1] && Array.isArray(data[1]) && data[1][0] && data[1][0][0]) {
            partOfSpeech = data[1][0][0]; // e.g. "noun", "verb", "adjective"
          }

          if (translatedText) {
            return NextResponse.json({
              translatedText,
              detectedLanguage,
              romanization,
              partOfSpeech,
              provider: 'Google (Instant)',
            });
          }
        }
      }
    } catch (err) {
      console.warn('Primary free translate failed, trying MyMemory...', err);
    }

    // 5. Fallback Free Provider: MyMemory
    try {
      const srcPair = cleanSource === 'auto' ? 'es' : cleanSource; // default fallback if auto
      const langPair = `${srcPair}|${cleanTarget}`;
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmedText
      )}&langpair=${encodeURIComponent(langPair)}`;

      const res = await fetch(myMemoryUrl);
      if (res.ok) {
        const data = await res.json();
        const translation = data.responseData?.translatedText;
        if (
          translation &&
          translation !== 'NO QUERY SPECIFIED' &&
          !translation.startsWith('MYMEMORY WARNING:') &&
          !translation.startsWith('INVALID LANGUAGE PAIR')
        ) {
          return NextResponse.json({
            translatedText: translation,
            detectedLanguage: srcPair,
            provider: 'MyMemory (Free)',
          });
        }
      }
    } catch (err) {
      console.warn('MyMemory fallback failed:', err);
    }

    return NextResponse.json({
      translatedText: trimmedText,
      detectedLanguage: cleanSource !== 'auto' ? cleanSource : undefined,
      provider: 'Raw text (Offline)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal translation error' },
      { status: 500 }
    );
  }
}
