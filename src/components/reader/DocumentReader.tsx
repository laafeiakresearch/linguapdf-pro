'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { loadPdfDocument, extractPdfOutline, extractPageText } from '@/lib/pdf/pdfLoader';
import { getDocument, getAllVocabulary, incrementStats } from '@/lib/db';
import { getSampleDocument } from '@/lib/samples/sampleDocs';
import { OutlineItem, DocumentRecord } from '@/types';
import { TopToolbar } from './TopToolbar';
import { PdfPageView } from './PdfPageView';
import { TxtReaderView } from './TxtReaderView';
import { DocxReaderView } from './DocxReaderView';
import { SideBySideView } from './SideBySideView';
import { ThumbnailsSidebar } from './ThumbnailsSidebar';
import { OutlineSidebar } from './OutlineSidebar';
import { ScrubberBar } from './ScrubberBar';
import { GoToPageModal } from './GoToPageModal';
import { TranslationPopup } from './TranslationPopup';
import { VocabularyModal } from '../vocabulary/VocabularyModal';
import { FlashcardsModal } from '../vocabulary/FlashcardsModal';
import { QuizModal } from '../vocabulary/QuizModal';
import { StatsDrawer } from '../common/StatsDrawer';
import { ShortcutHelpModal } from '../common/ShortcutHelpModal';
import { translateText } from '@/lib/translation/translator';
import { Loader2, AlertCircle } from 'lucide-react';

interface DocumentReaderProps {
  docId: string;
  initialPage?: number;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ docId, initialPage }) => {
  const {
    currentDoc,
    setCurrentDoc,
    currentPage,
    totalPages,
    setTotalPages,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    setGoToPageModalOpen,
    setVocabularyModalOpen,
    setFlashcardsModalOpen,
    setActiveSelection,
    setIsTranslatingPage,
    setPageTranslation,
    pageTranslations,
    sourceLang,
    targetLang,
    layout,
  } = useReaderStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activePageText, setActivePageText] = useState<string>('');
  const [vocabCount, setVocabCount] = useState(0);

  // Load document from DB or Sample registry
  useEffect(() => {
    let isCancelled = false;

    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);

        let doc: DocumentRecord | null | undefined = null;

        if (docId.startsWith('sample-')) {
          doc = getSampleDocument(docId);
        } else {
          doc = await getDocument(docId);
        }

        if (!doc) {
          throw new Error('Document not found in storage. Please re-upload or select a sample.');
        }

        if (isCancelled) return;

        setCurrentDoc(doc);

        if (doc.type === 'pdf' && doc.fileData) {
          const loadedPdf = await loadPdfDocument(doc.fileData);
          if (isCancelled) return;

          setPdfDoc(loadedPdf);
          setTotalPages(loadedPdf.numPages);

          const extractedOutline = await extractPdfOutline(loadedPdf);
          if (isCancelled) return;
          setOutline(extractedOutline);
        } else if (doc.totalPages) {
          setTotalPages(doc.totalPages);
        }

        // Honor deep link initial page if provided
        const targetPage = initialPage || doc.lastReadPage || 1;
        goToPage(targetPage);

        // Fetch vocab count
        const vocab = await getAllVocabulary();
        setVocabCount(vocab.length);
      } catch (err: any) {
        console.error('Failed to load document:', err);
        if (!isCancelled) setError(err.message || 'Error loading document');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchDoc();

    return () => {
      isCancelled = true;
    };
  }, [docId, initialPage, setCurrentDoc, setTotalPages, goToPage]);

  // Extract page text when page changes for Side-by-side translation
  useEffect(() => {
    if (pdfDoc) {
      extractPageText(pdfDoc, currentPage).then(setActivePageText);
    } else if (currentDoc?.textContent) {
      setActivePageText(currentDoc.textContent);
    }
    // Track stats
    incrementStats('pagesRead', 1);
  }, [pdfDoc, currentDoc, currentPage]);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Ctrl+G / Cmd+G: Go to page
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setGoToPageModalOpen(true);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setVocabularyModalOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFlashcardsModalOpen(true);
      } else if (e.key === 'Escape') {
        setActiveSelection(null);
        setGoToPageModalOpen(false);
      }
    },
    [
      nextPage,
      prevPage,
      zoomIn,
      zoomOut,
      setGoToPageModalOpen,
      setVocabularyModalOpen,
      setFlashcardsModalOpen,
      setActiveSelection,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Full page translation handler
  const handleTranslateFullPage = async () => {
    if (!activePageText.trim()) return;

    try {
      setIsTranslatingPage(true);
      const res = await translateText(activePageText, sourceLang, targetLang);
      setPageTranslation(currentPage, res.translatedText);
    } catch (err) {
      console.error('Page translation failed:', err);
    } finally {
      setIsTranslatingPage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="relative">
          <div className="w-14 h-14 rounded-3xl bg-brand-500/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-base">Opening Document in LinguaPDF Pro...</h3>
          <p className="text-xs text-zinc-400">Rendering high-speed viewport and text overlay</p>
        </div>
      </div>
    );
  }

  if (error || !currentDoc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Failed to load document</h3>
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 transition-colors">
      {/* Top Navigation & Controls */}
      <TopToolbar
        onTranslateFullPage={handleTranslateFullPage}
        vocabCount={vocabCount}
      />

      {/* Main Reader Viewport */}
      <main className="flex-1 overflow-y-auto pb-28 pt-2 relative custom-scrollbar">
        {currentDoc.type === 'pdf' && pdfDoc ? (
          <div className="w-full flex flex-col items-center">
            {layout === 'single' ? (
              <PdfPageView pdfDoc={pdfDoc} pageNumber={currentPage} />
            ) : (
              // Continuous scroll virtualization: renders all pages with IntersectionObserver
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PdfPageView key={pageNum} pdfDoc={pdfDoc} pageNumber={pageNum} />
              ))
            )}
          </div>
        ) : currentDoc.type === 'docx' && currentDoc.fileData ? (
          <DocxReaderView fileData={currentDoc.fileData as ArrayBuffer} />
        ) : (
          <TxtReaderView content={currentDoc.textContent || (currentDoc.fileData as string) || ''} />
        )}
      </main>

      {/* Scrubber bottom bar with instant jump */}
      <ScrubberBar />

      {/* Sidebars and Modals */}
      <ThumbnailsSidebar />
      <OutlineSidebar outline={outline} />
      <SideBySideView originalText={activePageText} />
      <GoToPageModal />
      <TranslationPopup />
      <VocabularyModal />
      <FlashcardsModal />
      <QuizModal />
      <StatsDrawer />
      <ShortcutHelpModal />
    </div>
  );
};
