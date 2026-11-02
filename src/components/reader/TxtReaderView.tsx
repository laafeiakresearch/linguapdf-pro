'use client';

import React, { useMemo } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';

interface TxtReaderViewProps {
  content: string;
}

export const TxtReaderView: React.FC<TxtReaderViewProps> = ({ content }) => {
  const { currentPage, totalPages, theme, zoom, setActiveSelection } = useReaderStore();

  // Split content by explicit page break or smart paragraphs
  const pages = useMemo(() => {
    if (content.includes('===PAGE_BREAK===')) {
      return content.split('===PAGE_BREAK===').map((p) => p.trim());
    }

    // Smart chunking into ~350 words per page
    const paragraphs = content.split(/\n\s*\n/);
    const resultPages: string[] = [];
    let currentChunk = '';
    let wordCount = 0;

    for (const p of paragraphs) {
      const wordsInP = p.split(/\s+/).length;
      if (wordCount + wordsInP > 350 && currentChunk) {
        resultPages.push(currentChunk.trim());
        currentChunk = p;
        wordCount = wordsInP;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + p;
        wordCount += wordsInP;
      }
    }

    if (currentChunk) {
      resultPages.push(currentChunk.trim());
    }

    return resultPages.length > 0 ? resultPages : [content];
  }, [content]);

  const activePageContent = pages[currentPage - 1] || pages[0] || '';

  const handleWordClick = (word: string, sentence: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '').trim();
    if (!cleanWord) return;

    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveSelection({
      text: cleanWord,
      sentence: sentence.trim(),
      rect: {
        top: targetRect.top,
        left: targetRect.left,
        bottom: targetRect.bottom,
        right: targetRect.right,
        width: targetRect.width,
        height: targetRect.height,
      },
      pageNumber: currentPage,
    });
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setActiveSelection({
        text: selectedText,
        sentence: selectedText,
        rect: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        },
        pageNumber: currentPage,
      });
    }
  };

  const paragraphs = activePageContent.split('\n\n');

  return (
    <div
      className="w-full flex justify-center py-6 px-4"
      onMouseUp={handleMouseUp}
    >
      <div
        id={`pdf-page-${currentPage}`}
        style={{ fontSize: `${zoom * 1.1}rem` }}
        className={`w-full max-w-3xl min-h-[750px] p-8 md:p-14 rounded-2xl shadow-xl transition-all leading-relaxed ${
          theme === 'dark'
            ? 'bg-zinc-900 border border-zinc-800 text-zinc-100'
            : theme === 'sepia'
            ? 'bg-sepia-50 border border-sepia-200 text-sepia-950 font-serif'
            : theme === 'high-contrast'
            ? 'bg-black border-2 border-yellow-400 text-yellow-300 font-mono'
            : 'bg-white border border-zinc-200 text-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200/60 dark:border-zinc-800 select-none">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Text Reader
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            Page {currentPage} of {pages.length}
          </span>
        </div>

        <div className="space-y-6">
          {paragraphs.map((p, pIdx) => {
            if (!p.trim()) return null;
            // Split paragraph into sentences for better context extraction
            const sentences = p.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [p];

            return (
              <p key={pIdx} className="text-justify">
                {sentences.map((sentence, sIdx) => {
                  const words = sentence.split(/(\s+)/);
                  return (
                    <span key={sIdx} className="group">
                      {words.map((w, wIdx) => {
                        const trimmedWord = w.trim();
                        if (!trimmedWord) return <span key={wIdx}>{w}</span>;

                        return (
                          <span
                            key={wIdx}
                            onClick={(e) => handleWordClick(w, sentence, e)}
                            className="cursor-pointer hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors inline-block"
                            title="Click word to translate and pronounce"
                          >
                            {w}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
