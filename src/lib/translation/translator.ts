import { TranslationResult } from '@/types';
import { romanizeText } from '../romanization/romanizer';

// In-memory translation cache to avoid duplicate API requests
const translationCache = new Map<string, TranslationResult>();

export async function translateText(
  text: string,
  sourceLang: string = 'auto',
  targetLang: string = 'en'
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translatedText: '' };
  }

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: trimmed,
        sourceLang,
        targetLang,
      }),
    });

    if (!res.ok) {
      throw new Error(`Translation API error: ${res.statusText}`);
    }

    const data: TranslationResult = await res.json();

    // Auto-detect script & compute romanization if applicable
    const detectedLang = data.detectedLanguage || sourceLang;
    const romanization = romanizeText(trimmed, detectedLang);
    if (romanization && romanization !== trimmed) {
      data.romanization = romanization;
    }

    // Try dictionary lookup for single English words or target definitions
    if (!trimmed.includes(' ') && trimmed.length <= 30) {
      try {
        // Simple POS heuristic or dictionary lookup
        data.partOfSpeech = inferPartOfSpeech(trimmed, data.translatedText);
      } catch {
        // Ignore POS error
      }
    }

    translationCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Translation failed:', error);
    const fallbackResult: TranslationResult = {
      translatedText: trimmed,
      romanization: romanizeText(trimmed, sourceLang) || undefined,
      provider: 'Error fallback',
    };
    return fallbackResult;
  }
}

function inferPartOfSpeech(original: string, translated: string): string {
  const lower = original.toLowerCase();
  if (lower.endsWith('ly') || lower.endsWith('mente')) return 'Adverb';
  if (lower.endsWith('tion') || lower.endsWith('ción') || lower.endsWith('ung')) return 'Noun';
  if (lower.endsWith('ed') || lower.endsWith('ing') || lower.endsWith('ar') || lower.endsWith('er') || lower.endsWith('ir')) return 'Verb';
  if (lower.endsWith('ous') || lower.endsWith('ful') || lower.endsWith('able') || lower.endsWith('oso')) return 'Adjective';
  return 'Word';
}
