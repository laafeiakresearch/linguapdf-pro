'use client';

import React, { useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';

export const ScrubberBar: React.FC = () => {
  const { currentPage, totalPages, goToPage, nextPage, prevPage, setGoToPageModalOpen } =
    useReaderStore();

  const [hoverPage, setHoverPage] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = totalPages > 1 ? ((currentPage - 1) / (totalPages - 1)) * 100 : 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    goToPage(val);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 text-zinc-800 dark:text-zinc-100 transition-all">
      {/* Prev button */}
      <button
        onClick={prevPage}
        disabled={currentPage <= 1}
        title="Previous Page (Left Arrow)"
        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Scrubber slider and indicator */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between text-xs mb-1">
          <button
            onClick={() => setGoToPageModalOpen(true)}
            className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
            title="Click to open Go to Page (Ctrl+G)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </button>
          <span className="text-[11px] text-zinc-400 font-mono">
            {Math.round(percentage)}%
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={nextPage}
        disabled={currentPage >= totalPages}
        title="Next Page (Right Arrow)"
        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
