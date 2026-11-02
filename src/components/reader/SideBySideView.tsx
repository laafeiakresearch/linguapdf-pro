'use client';

import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { translateText } from '@/lib/translation/translator';
import { ttsService } from '@/lib/speech/tts';
import { Volume2, Loader2, Sparkles, X, Check } from 'lucide-react';

interface SideBySideViewProps {
  originalText: string;
}

interface ParagraphPair {
  original: string;
  translated: string;
  loading: boolean;
}

export const SideBySideView: React.FC<SideBySideViewProps> = ({ originalText }) => {
  const { isSideBySideOpen, toggleSideBySide, sourceLang, targetLang, ttsRate, ttsVoiceURI } =
    useReaderStore();

  const [pairs, setPairs] = useState<ParagraphPair[]>([]);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isSideBySideOpen || !originalText) return;

    const rawParagraphs = originalText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 5);

    const initialPairs = rawParagraphs.map((p) => ({
      original: p,
      translated: '',
      loading: true,
    }));

    setPairs(initialPairs);
    setTranslatingAll(true);

    let isCancelled = false;

    // Translate paragraphs
    const translateAll = async () => {
      const updatedPairs = [...initialPairs];
      for (let i = 0; i < updatedPairs.length; i++) {
        if (isCancelled) return;
        try {
          const res = await translateText(updatedPairs[i].original, sourceLang, targetLang);
          updatedPairs[i] = {
            ...updatedPairs[i],
            translated: res.translatedText,
            loading: false,
          };
          setPairs([...updatedPairs]);
        } catch (err) {
          updatedPairs[i] = {
            ...updatedPairs[i],
            translated: '[Translation failed]',
            loading: false,
          };
          setPairs([...updatedPairs]);
        }
      }
      setTranslatingAll(false);
    };

    translateAll();

    return () => {
      isCancelled = true;
    };
  }, [isSideBySideOpen, originalText, sourceLang, targetLang]);

  if (!isSideBySideOpen) return null;

  const handleSpeak = (text: string, index: number, isTarget: boolean = false) => {
    if (speakingIndex === index) {
      ttsService.stop();
      setSpeakingIndex(null);
      return;
    }

    setSpeakingIndex(index);
    const lang = isTarget ? targetLang : sourceLang !== 'auto' ? sourceLang : 'en';

    ttsService.speak(text, lang, {
      rate: ttsRate,
      voiceURI: ttsVoiceURI,
      onEnd: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null),
    });
  };

  return (
    <div className="fixed inset-y-16 right-0 z-40 w-full lg:w-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Side-by-Side Dual Translation
          </h3>
          {translatingAll && (
            <span className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Translating page...
            </span>
          )}
        </div>

        <button
          onClick={toggleSideBySide}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {pairs.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-400">
            No paragraph text found on this page.
          </div>
        ) : (
          pairs.map((pair, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3"
            >
              {/* Original */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Original</span>
                  <button
                    onClick={() => handleSpeak(pair.original, idx, false)}
                    className="p-1 rounded text-zinc-400 hover:text-brand-600 transition-colors"
                    title="Listen to original"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                  {pair.original}
                </p>
              </div>

              <div className="h-[1px] bg-zinc-200/60 dark:bg-zinc-700/60" />

              {/* Translation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  <span>Translation</span>
                  {pair.translated && (
                    <button
                      onClick={() => handleSpeak(pair.translated, idx + 1000, true)}
                      className="p-1 rounded text-zinc-400 hover:text-brand-600 transition-colors"
                      title="Listen to translation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {pair.loading ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                    <span>Translating paragraph...</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-brand-950 dark:text-brand-100 leading-relaxed">
                    {pair.translated}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
