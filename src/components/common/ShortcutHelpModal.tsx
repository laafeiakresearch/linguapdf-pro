'use client';

import React from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { X, Command } from 'lucide-react';

export const ShortcutHelpModal: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = useReaderStore();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + G', desc: 'Open "Go to Page" jump box' },
    { key: '← / →', desc: 'Previous / Next page' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: 'S', desc: 'Pronounce word / Text-to-Speech' },
    { key: 'V', desc: 'Open Vocabulary bank' },
    { key: 'F', desc: 'Open Flashcards (SRS review)' },
    { key: 'Esc', desc: 'Close popup or dialog' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setShortcutsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Command className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
              <p className="text-xs text-zinc-400">Read faster with keyboard controls</p>
            </div>
          </div>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
            >
              <span className="text-xs text-zinc-600 dark:text-zinc-300">{s.desc}</span>
              <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
