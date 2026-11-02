'use client';

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { getAllVocabulary, saveVocabularyItem } from '@/lib/db';
import { VocabularyItem } from '@/types';
import { calculateSM2, isDueForReview } from '@/lib/srs/sm2';
import { ttsService } from '@/lib/speech/tts';
import confetti from 'canvas-confetti';
import {
  X,
  GraduationCap,
  Volume2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';

export const FlashcardsModal: React.FC = () => {
  const { isFlashcardsModalOpen, setFlashcardsModalOpen, ttsRate, ttsVoiceURI } = useReaderStore();
  const [cards, setCards] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    if (isFlashcardsModalOpen) {
      loadDueCards();
    }
  }, [isFlashcardsModalOpen]);

  const loadDueCards = async () => {
    try {
      const all = await getAllVocabulary();
      // Filter due cards or cards with fewest repetitions
      const due = all.filter((i) => !i.mastered && isDueForReview(i.srs));
      const pool = due.length > 0 ? due : all.slice(0, 15);
      setCards(pool);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isFlashcardsModalOpen) return null;

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGrade = async (grade: number) => {
    if (!currentCard) return;

    const newSrs = calculateSM2(currentCard.srs, grade);
    const updated: VocabularyItem = {
      ...currentCard,
      srs: newSrs,
      mastered: grade === 5 && newSrs.repetitions >= 4,
    };

    await saveVocabularyItem(updated);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors
      }
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    ttsService.speak(text, lang, { rate: ttsRate, voiceURI: ttsVoiceURI });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setFlashcardsModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Spaced Repetition Flashcards</h3>
              <p className="text-xs text-zinc-400">
                SuperMemo SM-2 smart review algorithm
              </p>
            </div>
          </div>

          <button
            onClick={() => setFlashcardsModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {sessionCompleted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold">Awesome work!</h4>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              You reviewed {cards.length} cards today. Your memory intervals have been scheduled!
            </p>
            <button
              onClick={loadDueCards}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all"
            >
              Review More
            </button>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-zinc-400">
            <Sparkles className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-medium">No cards due for review!</p>
            <p className="text-xs">Click words while reading documents to add them to your flashcards.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span className="font-mono">Repetition: #{currentCard?.srs?.repetitions || 0}</span>
            </div>

            {/* Flashcard Box with Flip */}
            <div
              onClick={handleFlip}
              className={`w-full min-h-[260px] p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between items-center text-center select-none shadow-sm ${
                isFlipped
                  ? 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="w-full flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.word, currentCard.sourceLanguage);
                  }}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-500 hover:text-brand-600 shadow-sm"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Front or Back Content */}
              {!isFlipped ? (
                <div className="space-y-3">
                  <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {currentCard.word}
                  </h2>
                  {currentCard.romanization && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-mono">
                      /{currentCard.romanization}/
                    </p>
                  )}
                  {currentCard.contextSentence && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic max-w-sm mt-2">
                      “{currentCard.contextSentence}”
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-400 pt-2">Tap card to reveal answer</p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 font-semibold">
                    Translation
                  </span>
                  <h2 className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                    {currentCard.translation}
                  </h2>
                  {currentCard.partOfSpeech && (
                    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {currentCard.partOfSpeech}
                    </span>
                  )}
                </div>
              )}

              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>{isFlipped ? 'Click to flip back' : 'Click to flip'}</span>
              </div>
            </div>

            {/* SRS Action Buttons */}
            {isFlipped && (
              <div className="grid grid-cols-4 gap-2 pt-2 animate-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => handleGrade(1)}
                  className="py-2.5 px-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                >
                  Again (1d)
                </button>
                <button
                  onClick={() => handleGrade(2)}
                  className="py-2.5 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors"
                >
                  Hard (2d)
                </button>
                <button
                  onClick={() => handleGrade(4)}
                  className="py-2.5 px-2 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold transition-colors"
                >
                  Good (4d)
                </button>
                <button
                  onClick={() => handleGrade(5)}
                  className="py-2.5 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
                >
                  Easy (7d)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
