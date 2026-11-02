'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { saveDocument } from '@/lib/db';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  BookOpen,
  LayoutGrid,
  Bookmark,
  Sun,
  Moon,
  Coffee,
  Globe,
  Sparkles,
  Layers,
  GraduationCap,
  BarChart2,
  HelpCircle,
  Loader2,
  Languages,
  ArrowRightLeft,
  Volume2,
  ScanText,
} from 'lucide-react';

interface TopToolbarProps {
  onTranslateFullPage?: () => void;
  vocabCount?: number;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onTranslateFullPage, vocabCount = 0 }) => {
  const router = useRouter();
  const {
    currentDoc,
    currentPage,
    totalPages,
    goToPage,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    theme,
    setTheme,
    layout,
    setLayout,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    toggleThumbnails,
    toggleOutline,
    toggleSideBySide,
    isSideBySideOpen,
    setGoToPageModalOpen,
    setVocabularyModalOpen,
    setFlashcardsModalOpen,
    setQuizModalOpen,
    setStatsOpen,
    setShortcutsOpen,
    isTranslatingPage,
    triggerOcrForPage,
    ocrTriggerPage,
    ocrProgress,
  } = useReaderStore();

  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      goToPage(parsed);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('sepia');
    else if (theme === 'sepia') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('light');
  };

  const handleSourceLangChange = (code: string) => {
    setSourceLang(code);
    if (currentDoc) {
      currentDoc.sourceLanguage = code;
      saveDocument(currentDoc);
    }
  };

  const handleTargetLangChange = (code: string) => {
    setTargetLang(code);
    if (currentDoc) {
      currentDoc.targetLanguage = code;
      saveDocument(currentDoc);
    }
  };

  const handleSwapLangs = () => {
    if (sourceLang !== 'auto') {
      const prevSource = sourceLang;
      const prevTarget = targetLang;
      handleSourceLangChange(prevTarget);
      handleTargetLangChange(prevSource);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3 md:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-zinc-800 dark:text-zinc-100 select-none shadow-sm">
      {/* Left: Back & Document Title & Sidebars */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Back to Documents Library"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleThumbnails}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Page Thumbnails"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={toggleOutline}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Table of Contents / Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden lg:flex flex-col min-w-0 ml-1">
          <h1 className="text-sm font-bold truncate max-w-[160px]" title={currentDoc?.title}>
            {currentDoc?.title || 'Document Reader'}
          </h1>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
            {currentDoc?.type || 'PDF'}
          </span>
        </div>
      </div>

      {/* Center: Instant "Go to Page" Input & Navigation */}
      <div className="flex items-center gap-2">
        <form onSubmit={handlePageInputSubmit} className="flex items-center">
          <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700/60 shadow-inner">
            <span className="text-xs text-zinc-400 pl-2 pr-1 font-medium select-none">
              Pg
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(pageInput, 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
                  goToPage(parsed);
                } else {
                  setPageInput(currentPage.toString());
                }
              }}
              title="Type page number and press Enter to jump instantly"
              className="w-12 bg-transparent text-center font-bold text-sm focus:outline-none focus:ring-0 text-brand-600 dark:text-brand-400"
            />
            <span className="text-xs text-zinc-400 pr-2 select-none">
              / {totalPages}
            </span>
          </div>
        </form>

        <button
          onClick={() => setGoToPageModalOpen(true)}
          className="inline-flex items-center text-[11px] font-mono px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60"
          title="Open Go to Page Quick Jump (Ctrl+G)"
        >
          ⌘G
        </button>

        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700/60">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors text-zinc-600 dark:text-zinc-300"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-0.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= 3.0}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors text-zinc-600 dark:text-zinc-300"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prominent Language Bar: Document Language ➔ Output Language */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-sm">
        <LanguageSelector
          value={sourceLang}
          onChange={handleSourceLangChange}
          includeAuto={true}
          compact={true}
          className="w-32"
        />

        <button
          type="button"
          onClick={handleSwapLangs}
          disabled={sourceLang === 'auto'}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30 transition-colors"
          title="Swap source and target languages"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>

        <LanguageSelector
          value={targetLang}
          onChange={handleTargetLangChange}
          includeAuto={false}
          compact={true}
          className="w-32"
        />
      </div>

      {/* Right Tools: Side-by-side, Full page translate, Vocab, Flashcards, Stats, Theme */}
      <div className="flex items-center gap-1.5 shrink-0">
        {currentDoc?.type === 'pdf' && (
          <button
            type="button"
            onClick={() => triggerOcrForPage(currentPage)}
            disabled={ocrTriggerPage !== null || ocrProgress?.pageNumber === currentPage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-50 text-xs font-semibold border border-amber-200 dark:border-amber-800/60 transition-colors"
            title={`Recognize text on the currently viewed page (${currentPage})`}
          >
            {ocrTriggerPage === currentPage || ocrProgress?.pageNumber === currentPage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ScanText className="w-3.5 h-3.5" />
            )}
            <span>OCR page</span>
          </button>
        )}

        {/* Side-by-side mode toggle */}
        <button
          onClick={toggleSideBySide}
          className={`p-2 rounded-xl transition-all ${
            isSideBySideOpen
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Toggle Side-by-Side Dual Pane Translation"
        >
          <Columns className="w-4 h-4" />
        </button>

        {/* Full Page Translation Button */}
        {onTranslateFullPage && (
          <button
            onClick={onTranslateFullPage}
            disabled={isTranslatingPage}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-200 dark:border-brand-800/60 transition-all"
            title="Translate this entire page"
          >
            {isTranslatingPage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Translate Page</span>
          </button>
        )}

        {/* Vocabulary Manager */}
        <button
          onClick={() => setVocabularyModalOpen(true)}
          className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Vocabulary & Word Bank (V)"
        >
          <BookOpen className="w-4 h-4" />
          {vocabCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {vocabCount > 99 ? '99+' : vocabCount}
            </span>
          )}
        </button>

        {/* Flashcards SRS */}
        <button
          onClick={() => setFlashcardsModalOpen(true)}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
          title="Flashcards (Spaced Repetition SM-2)"
        >
          <GraduationCap className="w-4 h-4" />
        </button>

        {/* Stats */}
        <button
          onClick={() => setStatsOpen(true)}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden md:inline-flex"
          title="Reading Stats & Streak"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Theme Cycle button */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={`Current theme: ${theme}. Click to switch.`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : theme === 'sepia' ? (
            <Coffee className="w-4 h-4 text-amber-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Shortcuts */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors hidden lg:inline-flex"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
