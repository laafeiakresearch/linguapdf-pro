'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { runOcrOnCanvas, OcrWord } from '@/lib/ocr/ocrHelper';
import { Loader2, ScanText, Check } from 'lucide-react';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { inferLanguageFromTitle } from '@/lib/translation/languages';

interface PdfPageViewProps {
  pdfDoc: any;
  pageNumber: number;
}

export const PdfPageView: React.FC<PdfPageViewProps> = ({ pdfDoc, pageNumber }) => {
  const {
    zoom,
    theme,
    setActiveSelection,
    setCurrentPage,
    sourceLang,
    currentDoc,
    ocrTriggerPage,
    triggerOcrForPage,
    setOcrProgress,
  } = useReaderStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ocrWordsByPageRef = useRef<Record<number, OcrWord[]>>({});
  const defaultOcrLanguage =
    sourceLang !== 'auto' ? sourceLang : inferLanguageFromTitle(currentDoc?.title || '') || 'en';

  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [textItems, setTextItems] = useState<any[]>([]);
  const [ocrLanguage, setOcrLanguage] = useState(defaultOcrLanguage);
  const [viewportDims, setViewportDims] = useState({ width: 600, height: 800 });
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [ocrPercent, setOcrPercent] = useState(0);
  const [hasScannedContent, setHasScannedContent] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  useEffect(() => {
    ocrWordsByPageRef.current = {};
  }, [pdfDoc]);

  useEffect(() => {
    setOcrLanguage(defaultOcrLanguage);
  }, [defaultOcrLanguage]);

  // Virtualization: IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (entry.intersectionRatio > 0.4) {
            setCurrentPage(pageNumber);
          }
        }
      },
      {
        rootMargin: '600px 0px 600px 0px',
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
    let renderTask: { promise: Promise<void>; cancel: () => void } | undefined;

    const renderPage = async () => {
      setIsRendered(false);
      setHasScannedContent(false);
      setTextItems([]);

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

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

        const pageRenderTask = page.render(renderContext);
        renderTask = pageRenderTask;
        await pageRenderTask.promise;
        if (isCancelled) return;

        setIsRendered(true);

        // Extract Text Layer with precise coordinates
        const content = await page.getTextContent();
        if (isCancelled) return;

        if (!content.items.some((item: any) => item.str?.trim())) {
          const ocrWords = ocrWordsByPageRef.current[pageNumber] || [];
          setTextItems(ocrWords);
          setHasScannedContent(ocrWords.length === 0);
        } else {
          const displayViewport = page.getViewport({ scale: zoom });
          const positioned = content.items.map((item: any) => {
            if (!item.transform) return item;
            const [left, top] = displayViewport.convertToViewportPoint(
              item.transform[4],
              item.transform[5]
            );
            const fontHeight = Math.max(
              11,
              Math.hypot(item.transform[0], item.transform[1]) * zoom
            );
            return {
              ...item,
              left,
              top: Math.max(0, top - fontHeight),
              fontSize: fontHeight,
            };
          });

          setTextItems(positioned);
          setHasScannedContent(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    };

    void renderPage();

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDoc, pageNumber, zoom, isVisible]);

  // Handle OCR recognition on current page
  const handleRunOcr = useCallback(async () => {
    if (!canvasRef.current || !isRendered || isOcrLoading) return;
    setIsOcrLoading(true);
    setOcrPercent(10);
    setOcrStatusText('Preparing page image...');
    setOcrError('');

    try {
      const result = await runOcrOnCanvas(
        canvasRef.current,
        ocrLanguage,
        viewportDims,
        (status, pct) => {
          setOcrStatusText(status);
          setOcrPercent(pct);
          setOcrProgress({ status, percent: pct, pageNumber });
        }
      );

      if (result.words.length === 0) {
        setHasScannedContent(true);
        setOcrError('No selectable words were detected. Check the OCR language and try again.');
        return;
      }

      ocrWordsByPageRef.current[pageNumber] = result.words;
      setTextItems(result.words);
      setHasScannedContent(false);
      setOcrSuccess(true);
      setOcrStatusText(`Recognized ${result.words.length} words.`);
      setTimeout(() => setOcrSuccess(false), 3000);
    } catch (err) {
      console.error('OCR failed on page', pageNumber, err);
      setOcrError(err instanceof Error ? `OCR failed: ${err.message}` : 'OCR failed.');
    } finally {
      setIsOcrLoading(false);
      if (useReaderStore.getState().ocrProgress?.pageNumber === pageNumber) {
        setOcrProgress(null);
      }
      if (ocrTriggerPage === pageNumber) triggerOcrForPage(null);
    }
  }, [
    isOcrLoading,
    isRendered,
    ocrTriggerPage,
    pageNumber,
    ocrLanguage,
    setOcrProgress,
    sourceLang,
    triggerOcrForPage,
    viewportDims,
  ]);

  // Watch for external OCR trigger on this page
  useEffect(() => {
    if (ocrTriggerPage === pageNumber && isRendered && !isOcrLoading) {
      void handleRunOcr();
    }
  }, [ocrTriggerPage, pageNumber, isRendered, isOcrLoading, handleRunOcr]);

  // Click & Selection handlers for words and sentences
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
      {/* Top page indicator pill and OCR Quick Action */}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-1.5 select-none">
        <button
          onClick={() => triggerOcrForPage(pageNumber)}
          disabled={isOcrLoading}
          className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
          title={`Run OCR on page ${pageNumber}`}
        >
          {isOcrLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
          ) : ocrSuccess ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <ScanText className="w-3 h-3 text-amber-400" />
          )}
          <span>{isOcrLoading ? `${ocrPercent}%` : ocrSuccess ? 'OCR Done' : 'OCR'}</span>
        </button>

        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
          Page {pageNumber}
        </span>
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

      {/* Pixel-aligned Interactive Text Layer */}
      {isRendered && textItems.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          <div className="w-full h-full relative pointer-events-auto select-text">
            {textItems.map((item, idx) => {
              const text = item.str || '';
              if (!text.trim()) return null;

              const words = text.split(/(\s+)/);

              return (
                <span
                  key={idx}
                  style={
                    item.left !== undefined
                      ? {
                          position: 'absolute',
                          left: `${item.left}px`,
                          top: `${item.top}px`,
                          fontSize: `${item.fontSize}px`,
                          lineHeight: '1',
                          whiteSpace: 'pre',
                          color: 'transparent',
                          transformOrigin: '0% 0%',
                        }
                      : { display: 'inline-block', color: 'transparent' }
                  }
                  className="select-text"
                >
                  {words.map((w: string, wIdx: number) => {
                    const cleanWord = w.trim();
                    if (!cleanWord) return <span key={wIdx}>{w}</span>;

                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => handleWordClick(cleanWord, item.sentence || text, e)}
                        className="hover:bg-yellow-300/40 dark:hover:bg-yellow-400/30 hover:underline hover:decoration-brand-500 hover:decoration-2 cursor-pointer rounded transition-colors inline-block"
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

      {/* Scanned page detection prompt */}
      {isRendered && hasScannedContent && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-2rem)] bg-black/85 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ScanText className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold">Scanned Page (No embedded text)</p>
            <p className="text-[10px] text-zinc-400">
              {isOcrLoading
                ? ocrStatusText
                : ocrError || 'Run OCR to make this page selectable and translatable.'}
            </p>
          </div>
          <LanguageSelector
            value={ocrLanguage}
            onChange={setOcrLanguage}
            includeAuto={false}
            compact
            className="w-28 shrink-0"
          />
          <button
            onClick={() => triggerOcrForPage(pageNumber)}
            disabled={isOcrLoading}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            {isOcrLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{ocrPercent}%</span>
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
