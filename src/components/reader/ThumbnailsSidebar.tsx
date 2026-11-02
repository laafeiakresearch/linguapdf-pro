'use client';

import React from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { X, LayoutGrid } from 'lucide-react';

export const ThumbnailsSidebar: React.FC = () => {
  const { isThumbnailsOpen, toggleThumbnails, totalPages, currentPage, goToPage } =
    useReaderStore();

  if (!isThumbnailsOpen) return null;

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 z-30 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col animate-in slide-in-from-left duration-200"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
          <LayoutGrid className="w-4 h-4 text-brand-500" />
          <span>Page Thumbnails</span>
        </div>
        <button
          onClick={toggleThumbnails}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${
                isCurrent
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {/* Thumbnail page preview wireframe */}
              <div
                className={`w-28 h-36 rounded-lg border flex flex-col justify-between p-2 shadow-sm transition-all group-hover:scale-105 ${
                  isCurrent
                    ? 'border-brand-500 bg-white dark:bg-zinc-900 shadow-brand-500/10'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="space-y-1.5 opacity-40">
                  <div className="h-2 w-3/4 bg-current rounded" />
                  <div className="h-1.5 w-full bg-current rounded" />
                  <div className="h-1.5 w-5/6 bg-current rounded" />
                  <div className="h-1.5 w-2/3 bg-current rounded" />
                </div>
                <div className="text-right text-[10px] font-mono font-bold opacity-60">
                  #{pageNum}
                </div>
              </div>

              <span className="text-xs font-semibold">Page {pageNum}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
