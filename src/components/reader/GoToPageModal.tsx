'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { Compass, ArrowRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

export const GoToPageModal: React.FC = () => {
  const { isGoToPageModalOpen, setGoToPageModalOpen, currentPage, totalPages, goToPage } =
    useReaderStore();

  const [inputVal, setInputVal] = useState(currentPage.toString());
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGoToPageModalOpen) {
      setInputVal(currentPage.toString());
      setErrorMsg('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isGoToPageModalOpen, currentPage]);

  if (!isGoToPageModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > totalPages) {
      setErrorMsg(`Please enter a page between 1 and ${totalPages}`);
      return;
    }

    goToPage(parsed);
    setGoToPageModalOpen(false);
  };

  const jumpRelative = (delta: number) => {
    const target = Math.max(1, Math.min(currentPage + delta, totalPages));
    goToPage(target);
    setGoToPageModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setGoToPageModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Go to Page</h3>
              <p className="text-xs text-zinc-400">
                Jump directly to any page (1 – {totalPages})
              </p>
            </div>
          </div>
          <button
            onClick={() => setGoToPageModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={totalPages}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={`1 - ${totalPages}`}
                className="w-full px-4 py-3.5 text-2xl font-bold tracking-tight text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">
                / {totalPages}
              </span>
            </div>
            {errorMsg && <p className="text-xs text-red-500 mt-1.5 text-center">{errorMsg}</p>}
          </div>

          {/* Quick jump suggestions */}
          <div className="flex items-center justify-between gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => jumpRelative(-10)}
              className="flex-1 py-1.5 px-2 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => jumpRelative(-5)}
              className="flex-1 py-1.5 px-2 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => jumpRelative(5)}
              className="flex-1 py-1.5 px-2 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => jumpRelative(10)}
              className="flex-1 py-1.5 px-2 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              +10
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                goToPage(1);
                setGoToPageModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
              <span>Page 1</span>
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
            >
              <span>Jump to Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                goToPage(totalPages);
                setGoToPageModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>End</span>
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-zinc-400 mt-4">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Enter</kbd> to jump instantly, or <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Esc</kbd> to cancel.
        </p>
      </div>
    </div>
  );
};
