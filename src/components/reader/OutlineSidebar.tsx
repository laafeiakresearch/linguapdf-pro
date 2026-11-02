'use client';

import React from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { OutlineItem } from '@/types';
import { X, Bookmark, ChevronRight, FileText } from 'lucide-react';

interface OutlineSidebarProps {
  outline: OutlineItem[];
}

export const OutlineSidebar: React.FC<OutlineSidebarProps> = ({ outline }) => {
  const { isOutlineOpen, toggleOutline, goToPage, currentPage } = useReaderStore();

  if (!isOutlineOpen) return null;

  const renderItems = (items: OutlineItem[], level = 0) => {
    return (
      <ul className={`space-y-1 ${level > 0 ? 'ml-3 pl-2 border-l border-zinc-200 dark:border-zinc-800' : ''}`}>
        {items.map((item, idx) => {
          const isCurrent = item.pageNumber === currentPage;
          return (
            <li key={idx}>
              <button
                onClick={() => goToPage(item.pageNumber)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                  isCurrent
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{item.title}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                  p. {item.pageNumber}
                </span>
              </button>
              {item.items && item.items.length > 0 && renderItems(item.items, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 z-30 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
          <Bookmark className="w-4 h-4 text-brand-500" />
          <span>Table of Contents</span>
        </div>
        <button
          onClick={toggleOutline}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {outline.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400">
            No table of contents / bookmarks detected for this document.
          </div>
        ) : (
          renderItems(outline)
        )}
      </div>
    </aside>
  );
};
