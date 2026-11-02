'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { translateText } from '@/lib/translation/translator';
import { ttsService } from '@/lib/speech/tts';
import { saveVocabularyItem } from '@/lib/db';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/translation/languages';
import { TranslationResult, VocabularyItem } from '@/types';
import { Volume2, Bookmark, Check, X, Loader2, Sparkles, BookOpen, ChevronDown } from 'lucide-react';

export const TranslationPopup: React.FC = () => {
  const {
    activeSelection,
    setActiveSelection,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    currentDoc,
    currentPage,
    ttsRate,
    ttsVoiceURI,
  } = useReaderStore();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeSelection || !activeSelection.text.trim()) {
      setResult(null);
      setIsSaved(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setIsSaved(false);

    translateText(activeSelection.text, sourceLang, targetLang)
      .then((res) => {
        if (isMounted) {
          setResult(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeSelection, sourceLang, targetLang]);

  if (!activeSelection || !activeSelection.text.trim()) {
    return null;
  }

  // Calculate coordinates with screen boundary clamping
  const { rect } = activeSelection;
  let top = 100;
  let left = 100;

  if (rect) {
    const popupWidth = 330;
    const popupHeight = 240;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Prefer positioning below the word, if space permits
    if (rect.bottom + popupHeight + 10 < screenHeight) {
      top = rect.bottom + 8;
    } else {
      top = Math.max(10, rect.top - popupHeight - 8);
    }

    // Horizontal centering over selection
    left = rect.left + rect.width / 2 - popupWidth / 2;
    if (left < 12) left = 12;
    if (left + popupWidth > screenWidth - 12) {
      left = screenWidth - popupWidth - 12;
    }
  }

  const handleSpeak = (textToSpeak: string) => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechLang =
      result?.detectedLanguage && result.detectedLanguage !== 'auto'
        ? result.detectedLanguage
        : sourceLang !== 'auto'
        ? sourceLang
        : 'en';

    ttsService.speak(textToSpeak, speechLang, {
      rate: ttsRate,
      voiceURI: ttsVoiceURI,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSaveWord = async () => {
    if (!result || isSaved) return;

    const vocabItem: VocabularyItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      word: activeSelection.text.trim(),
      translation: result.translatedText,
      romanization: result.romanization,
      partOfSpeech: result.partOfSpeech,
      contextSentence: activeSelection.sentence || activeSelection.text,
      sourceLanguage: result.detectedLanguage || sourceLang || 'auto',
      targetLanguage: targetLang,
      documentId: currentDoc?.id,
      documentTitle: currentDoc?.title,
      pageNumber: activeSelection.pageNumber || currentPage,
      addedAt: Date.now(),
      tags: [currentDoc?.title ? currentDoc.title.substring(0, 15) : 'General'],
      mastered: false,
      srs: {
        repetitions: 0,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now(),
      },
    };

    try {
      await saveVocabularyItem(vocabItem);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save vocabulary:', err);
    }
  };

  const activeSrcCode = result?.detectedLanguage || (sourceLang !== 'auto' ? sourceLang : 'auto');
  const srcLangObj = getLanguageByCode(activeSrcCode);

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      }}
      className="w-80 max-w-[90vw] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-2xl rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 transition-all animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg text-brand-600 dark:text-brand-400 truncate">
              {activeSelection.text}
            </h4>
            {result?.partOfSpeech && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                {result.partOfSpeech}
              </span>
            )}
          </div>
          {result?.romanization && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              /{result.romanization}/
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => handleSpeak(activeSelection.text)}
            title="Listen pronunciation (S)"
            className={`p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
              isSpeaking ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/50 animate-pulse' : ''
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSelection(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Switch Bar inside Popup */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {srcLangObj.flag} {srcLangObj.name}
          </span>
          <span>➔</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md font-semibold text-brand-600 dark:text-brand-400 focus:outline-none cursor-pointer"
            title="Change output translation language"
          >
            {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code} className="dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">
          {result?.provider || 'Instant'}
        </span>
      </div>

      {/* Translation Body */}
      <div className="py-2.5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            <span>Translating...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
              {result.translatedText}
            </div>

            {/* Context sentence if available */}
            {activeSelection.sentence && activeSelection.sentence !== activeSelection.text && (
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-zinc-400 block mb-0.5 text-[10px] uppercase">
                  Context
                </span>
                <p className="line-clamp-2 italic">“{activeSelection.sentence}”</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-red-500">Could not retrieve translation.</p>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-500" />
          <span>Click word or select phrase</span>
        </span>

        <button
          onClick={handleSaveWord}
          disabled={isSaved || loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
            isSaved
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Word</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
