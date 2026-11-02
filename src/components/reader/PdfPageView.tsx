'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { getCachedPage, setCachedPage } from '@/lib/db';
import { Loader2, ScanText } from 'lucide-react';

interface PdfPageViewProps {
  pdfDoc: any;
  pageNumber: number;
}

export const PdfPageView: React.FC<PdfPageViewProps> = ({ pdfDoc, pageNumber }) => {
  const { zoom, theme, setActiveSelection, setCurrentPage } = useReaderStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [textItems, setTextItems] = useState<any[]>([]);
  const [viewportDims, setViewportDims] = useState({ width: 600, height: 800 });
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [hasScannedContent, setHasScannedContent] = useState(false);

  // Virtualization: IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          // If page takes up significant viewport, update current page
          if (entry.intersectionRatio > 0.4) {
            setCurrentPage(pageNumber);
          }
        } else {
          // Keep rendered canvas, but don't re-render offscreen
        }
      },
      {
        rootMargin: '600px 0px 600px 0px', // Prerender ±2 pages ahead
        threshold: [0, 0.4, 0.8],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, setCurrentPage]);

  // Render PDF Page when visible or zoom changes
  useEffect(() => {
    if (!isVisible || !pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const baseViewport = page.getViewport({ scale: 1.0 });
        const scale = zoom * (typeof window !== 'undefined' ? window.devicePixelRatio || 1.5 : 1.5);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
        canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1)}px`;

        setViewportDims({
          width: viewport.width / (window.devicePixelRatio || 1),
          height: viewport.height / (window.devicePixelRatio || 1),
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        await page.render(renderContext).promise;
        if (isCancelled) return;

        setIsRendered(true);

        // Extract Text Layer
        const content = await page.getTextContent();
        if (isCancelled) return;

        if (content.items.length === 0) {
          setHasScannedContent(true);
        } else {
          setTextItems(content.items);
          setHasScannedContent(false);
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, zoom, isVisible]);

  // Handle OCR fallback for scanned PDFs
  const handleRunOcr = async () => {
    if (!canvasRef.current) return;
    setIsOcrLoading(true);

    try {
      // Dynamic import to keep initial bundle ultra fast
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const dataUrl = canvasRef.current.toDataURL();
      const ret = await worker.recognize(dataUrl);
      await worker.terminate();

      const data = ret.data as any;
      if (data && data.words) {
        const ocrItems = data.words.map((w: any) => ({
          str: w.text,
          ocr: true,
          bbox: w.bbox,
        }));
        setTextItems(ocrItems);
        setHasScannedContent(false);
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setIsOcrLoading(false);
    }
  };

  // Click & Selection handlers for words and sentences
  const handleWordClick = (word: string, sentence: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    setActiveSelection({
      text: word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '').trim(),
      sentence: sentence.trim(),
      rect: {
        top: targetRect.top,
        left: targetRect.left,
        bottom: targetRect.bottom,
        right: targetRect.right,
        width: targetRect.width,
        height: targetRect.height,
      },
      pageNumber,
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
        pageNumber,
      });
    }
  };

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={containerRef}
      className={`relative mx-auto my-6 rounded-xl shadow-lg transition-all ${
        theme === 'dark'
          ? 'bg-zinc-900 border border-zinc-800'
          : theme === 'sepia'
          ? 'bg-sepia-100 border border-sepia-200'
          : theme === 'high-contrast'
          ? 'bg-black border-2 border-yellow-400'
          : 'bg-white border border-zinc-200'
      }`}
      style={{
        width: `${viewportDims.width}px`,
        minHeight: `${viewportDims.height}px`,
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Top page indicator pill */}
      <div className="absolute top-2 right-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono select-none">
        Page {pageNumber}
      </div>

      {/* Loading state placeholder */}
      {!isRendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <span className="text-xs">Loading page {pageNumber}...</span>
        </div>
      )}

      {/* PDF Canvas */}
      <canvas
        ref={canvasRef}
        className={`block rounded-xl transition-opacity duration-200 ${
          isRendered ? 'opacity-100' : 'opacity-0'
        } ${theme === 'dark' ? 'filter invert hue-rotate-180 contrast-90 brightness-95' : ''}`}
      />

      {/* Interactive Text Layer for Word Clicking & Hovering */}
      {isRendered && textItems.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          <div className="w-full h-full relative pointer-events-auto select-text">
            {textItems.map((item, idx) => {
              const text = item.str || '';
              if (!text.trim()) return null;

              // Break item into words for fine-grained clicking
              const words = text.split(/(\s+)/);

              return (
                <span
                  key={idx}
                  className="inline-block text-transparent hover:text-inherit hover:bg-brand-500/10 cursor-pointer select-text transition-colors"
                >
                  {words.map((w: string, wIdx: number) => {
                    const cleanWord = w.trim();
                    if (!cleanWord) return <span key={wIdx}>{w}</span>;

                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => handleWordClick(cleanWord, text, e)}
                        className="hover:underline hover:decoration-brand-500 hover:decoration-2 cursor-pointer"
                        title={`Click to translate "${cleanWord}"`}
                      >
                        {w}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* OCR Prompt if page has no selectable text (scanned PDF) */}
      {isRendered && hasScannedContent && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
          <ScanText className="w-4 h-4 text-brand-400" />
          <span className="text-xs">Scanned page detected (no embedded text)</span>
          <button
            onClick={handleRunOcr}
            disabled={isOcrLoading}
            className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {isOcrLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running OCR...</span>
              </>
            ) : (
              <span>Run OCR</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
