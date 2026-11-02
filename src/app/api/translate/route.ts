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
        params.append('target_lang', targetLang.toUpperCase());
        if (sourceLang && sourceLang !== 'auto') {
          params.append('source_lang', sourceLang.toUpperCase());
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
        console.warn('DeepL translation failed, trying fallback...', err);
      }
    }

    // 2. Try Google Translate API if configured
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      try {
        const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        const url = `https://translation.googleapis.com/language/translate/v2?key=${googleKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: trimmedText,
            target: targetLang,
            source: sourceLang === 'auto' ? undefined : sourceLang,
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
        console.warn('Google Translate failed, trying fallback...', err);
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
            source: sourceLang === 'auto' ? 'auto' : sourceLang,
            target: targetLang,
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
        console.warn('LibreTranslate failed, trying fallback...', err);
      }
    }

    // 4. Free Fallback: MyMemory API (supports 100+ languages, 10,000 words/day free)
    try {
      const srcPair = sourceLang === 'auto' ? '' : sourceLang;
      const langPair = `${srcPair}|${targetLang}`;
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmedText
      )}&langpair=${encodeURIComponent(langPair)}`;

      const res = await fetch(myMemoryUrl, {
        headers: {
          'User-Agent': 'LinguaPDF-Pro/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const translation = data.responseData?.translatedText;
        if (translation && translation !== 'NO QUERY SPECIFIED' && !translation.startsWith('MYMEMORY WARNING:')) {
          return NextResponse.json({
            translatedText: translation,
            detectedLanguage: sourceLang !== 'auto' ? sourceLang : undefined,
            provider: 'MyMemory (Free)',
          });
        }
      }
    } catch (err) {
      console.warn('MyMemory fallback failed:', err);
    }

    // 5. Ultimate Fallback: Lingva public instances
    try {
      const lingvaUrl = `https://lingva.ml/api/v1/${sourceLang === 'auto' ? 'auto' : sourceLang}/${targetLang}/${encodeURIComponent(
        trimmedText
      )}`;
      const res = await fetch(lingvaUrl, {
        headers: { 'User-Agent': 'LinguaPDF-Pro/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translation) {
          return NextResponse.json({
            translatedText: data.translation,
            detectedLanguage: data.info?.detectedSource,
            provider: 'Lingva (Free)',
          });
        }
      }
    } catch (err) {
      console.warn('Lingva fallback failed:', err);
    }

    // If all providers fail or network is offline
    return NextResponse.json({
      translatedText: `[Translation unavailable: ${trimmedText}]`,
      error: 'All translation providers failed',
      provider: 'Offline fallback',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal translation error' },
      { status: 500 }
    );
  }
}
