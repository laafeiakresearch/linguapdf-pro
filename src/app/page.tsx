'use client';

import React, { useState } from 'react';
import { HeroUpload } from '@/components/landing/HeroUpload';
import { RecentDocuments } from '@/components/landing/RecentDocuments';
import { SampleDocuments } from '@/components/landing/SampleDocuments';
import { VocabularyModal } from '@/components/vocabulary/VocabularyModal';
import { FlashcardsModal } from '@/components/vocabulary/FlashcardsModal';
import { QuizModal } from '@/components/vocabulary/QuizModal';
import { StatsDrawer } from '@/components/common/StatsDrawer';
import { useReaderStore } from '@/lib/store/useReaderStore';
import {
  BookOpen,
  Compass,
  Sparkles,
  Volume2,
  GraduationCap,
  ShieldCheck,
  Zap,
  BarChart2,
  Sun,
  Moon,
  Coffee,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const {
    theme,
    setTheme,
    setVocabularyModalOpen,
    setFlashcardsModalOpen,
    setQuizModalOpen,
    setStatsOpen,
  } = useReaderStore();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('sepia');
    else setTheme('light');
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        theme === 'dark'
          ? 'bg-zinc-950 text-zinc-100'
          : theme === 'sepia'
          ? 'bg-sepia-50 text-sepia-950'
          : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300">
                LinguaPDF Pro
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Fast Document Reader for Language Learners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVocabularyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">Word Bank</span>
          </button>

          <button
            onClick={() => setFlashcardsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flashcards (SM-2)</span>
          </button>

          <button
            onClick={() => setStatsOpen(true)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Reading Stats"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Switch Theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'sepia' ? (
              <Coffee className="w-4 h-4 text-amber-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Instant "Go to Page", Fast Loading & Spaced Repetition SRS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
          Read Foreign Documents{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-400">
            With Zero Language Barriers
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload any <strong className="text-zinc-800 dark:text-zinc-200">PDF, Word DOCX, or text</strong> in Spanish, French, German, Japanese, and more.
          Click any word for instant translation, native speech, romanization, and flashcards.
        </p>

        {/* Upload Container */}
        <div className="pt-6">
          <HeroUpload />
        </div>
      </section>

      {/* Recent Reading Sessions */}
      <RecentDocuments />

      {/* Preloaded Literature Samples */}
      <SampleDocuments />

      {/* Key Feature Highlights */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Engineered for Serious Language Learners
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Everything you need to master languages naturally by reading authentic material.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Instant "Go to Page" Jump</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Jump instantly to page 50 or 250 with <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">Ctrl+G</kbd>, the top bar input, interactive scrubber, or table of contents bookmarks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Pronunciation & Karaoke</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Listen to native accents powered by the Web Speech API with adjustable speeds (0.5x–2.0x), pitch controls, and word boundary highlighting.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Spaced Repetition (SM-2)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Save any unknown word with its sentence context. Review with the SuperMemo SM-2 algorithm, generate quizzes, and export to Anki/CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">LinguaPDF Pro</span>
            <span>•</span>
            <span>Client-side Privacy First (No documents sent to server)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVocabularyModalOpen(true)}
              className="hover:text-brand-600 transition-colors"
            >
              Vocabulary
            </button>
            <button
              onClick={() => setFlashcardsModalOpen(true)}
              className="hover:text-brand-600 transition-colors"
            >
              Flashcards
            </button>
            <button
              onClick={() => setQuizModalOpen(true)}
              className="hover:text-brand-600 transition-colors"
            >
              Quiz
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals for Landing Page */}
      <VocabularyModal />
      <FlashcardsModal />
      <QuizModal />
      <StatsDrawer />
    </div>
  );
}
