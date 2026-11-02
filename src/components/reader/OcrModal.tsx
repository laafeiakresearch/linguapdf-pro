'use client';

import React, { useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { runOcrOnCanvas } from '@/lib/ocr/ocrHelper';
import { X, ScanText, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';

interface OcrModalProps {
  onOcrSuccess?: (pageNumber: number, text: string, words: any[]) => void;
}

export const OcrModal: React.FC<OcrModalProps> = ({ onOcrSuccess }) => {
  const {
    isOcrModalOpen,
    setOcrModalOpen,
    currentPage,
    sourceLang,
    ocrProgress,
    setOcrProgress,
  } = useReaderStore();

  const [ocrLang, setOcrLang] = useState<string>(
    sourceLang !== 'auto' ? sourceLang : 'en'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [percent, setPercent] = useState(0);

  if (!isOcrModalOpen) return null;

  const handleRunOcr = async () => {
    try {
      setIsRunning(true);
      setErrorMsg('');
      setStatusMsg('Locating page canvas...');
      setPercent(10);

      // Find the active page canvas
      const pageEl = document.getElementById(`pdf-page-${currentPage}`);
      const canvas = pageEl?.querySelector('canvas');

      if (!canvas) {
        throw new Error(`Could not find canvas for Page ${currentPage}. Make sure the page is visible.`);
      }

      const displayWidth = parseFloat(canvas.style.width) || canvas.width;
      const displayHeight = parseFloat(canvas.style.height) || canvas.height;

      const result = await runOcrOnCanvas(
        canvas,
        ocrLang,
        { width: displayWidth, height: displayHeight },
        (status, pct) => {
          setStatusMsg(status);
          setPercent(pct);
          setOcrProgress({
            status,
            percent: pct,
            pageNumber: currentPage,
          });
        }
      );

      setPercent(100);
      setStatusMsg('OCR Complete! Clickable text layer enabled.');

      if (onOcrSuccess) {
        onOcrSuccess(currentPage, result.text, result.words);
      }

      setTimeout(() => {
        setIsRunning(false);
        setOcrProgress(null);
        setOcrModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error('OCR failed:', err);
      setErrorMsg(err.message || 'OCR recognition failed. Please try again.');
      setIsRunning(false);
      setOcrProgress(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isRunning) setOcrModalOpen(false);
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ScanText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">OCR Current Page</h3>
              <p className="text-xs text-zinc-400">
                Recognize text on Page {currentPage}
              </p>
            </div>
          </div>
          {!isRunning && (
            <button
              onClick={() => setOcrModalOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Extracts text from scanned or image-based PDF pages so every word becomes selectable, translatable, and pronounceable.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              Recognition Language
            </label>
            <LanguageSelector
              value={ocrLang}
              onChange={setOcrLang}
              includeAuto={false}
            />
          </div>

          {/* Progress Bar when running */}
          {isRunning && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMsg}</span>
                </span>
                <span className="font-mono font-bold text-zinc-500">{percent}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          {!isRunning && (
            <button
              type="button"
              onClick={() => setOcrModalOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunOcr}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running OCR...</span>
              </>
            ) : (
              <>
                <ScanText className="w-4 h-4" />
                <span>Run OCR on Page {currentPage}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
