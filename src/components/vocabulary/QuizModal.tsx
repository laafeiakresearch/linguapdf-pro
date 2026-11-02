'use client';

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { getAllVocabulary } from '@/lib/db';
import { VocabularyItem } from '@/types';
import confetti from 'canvas-confetti';
import { X, Award, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const QuizModal: React.FC = () => {
  const { isQuizModalOpen, setQuizModalOpen } = useReaderStore();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (isQuizModalOpen) {
      loadQuiz();
    }
  }, [isQuizModalOpen]);

  const loadQuiz = async () => {
    const all = await getAllVocabulary();
    if (all.length >= 3) {
      // Shuffle items
      const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 10);
      setItems(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setQuizFinished(false);
      setupQuestion(0, shuffled, all);
    } else {
      setItems(all);
    }
  };

  const setupQuestion = (index: number, quizItems: VocabularyItem[], pool: VocabularyItem[]) => {
    const current = quizItems[index];
    if (!current) return;

    // Pick 3 distractors
    const otherTranslations = pool
      .filter((i) => i.id !== current.id)
      .map((i) => i.translation);

    const shuffledOthers = [...otherTranslations].sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = [current.translation, ...shuffledOthers].sort(() => 0.5 - Math.random());

    setOptions(choices);
    setSelectedAnswer(null);
  };

  if (!isQuizModalOpen) return null;

  const currentItem = items[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(opt);

    const isCorrect = opt === currentItem.translation;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setupQuestion(nextIdx, items, items);
      } else {
        setQuizFinished(true);
        if (score + (isCorrect ? 1 : 0) > items.length / 2) {
          try {
            confetti({ particleCount: 70, spread: 60 });
          } catch {
            // ignore
          }
        }
      }
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setQuizModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Vocabulary Quiz</h3>
              <p className="text-xs text-zinc-400">Test what you’ve read</p>
            </div>
          </div>
          <button
            onClick={() => setQuizModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length < 3 ? (
          <div className="py-14 text-center space-y-2 text-zinc-400">
            <Sparkles className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-medium">Need at least 3 saved words to generate a quiz!</p>
            <p className="text-xs">Save words while reading your documents to unlock quizzes.</p>
          </div>
        ) : quizFinished ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto text-2xl font-black">
              {score}/{items.length}
            </div>
            <h4 className="text-xl font-bold">Quiz Finished!</h4>
            <p className="text-sm text-zinc-400">
              You scored {Math.round((score / items.length) * 100)}% accuracy.
            </p>
            <button
              onClick={loadQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Question {currentIndex + 1} of {items.length}</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">Score: {score}</span>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
                What is the translation for:
              </span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {currentItem?.word}
              </h3>
              {currentItem?.romanization && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                  /{currentItem.romanization}/
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentItem.translation;

                let btnStyle = 'border-zinc-200 dark:border-zinc-700 hover:border-brand-500 bg-white dark:bg-zinc-800/80';
                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300';
                  } else {
                    btnStyle = 'opacity-50 border-zinc-200 dark:border-zinc-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer !== null && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {selectedAnswer !== null && isSelected && !isCorrect && (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
