import { create } from 'zustand';
import { DocumentRecord, ReaderTheme, ReaderLayout } from '@/types';
import { updateDocumentProgress } from '../db';
import { inferLanguageFromTitle } from '../translation/languages';

interface SelectionState {
  text: string;
  sentence?: string;
  rect?: { top: number; left: number; bottom: number; right: number; width: number; height: number };
  pageNumber?: number;
}

export interface OcrProgressInfo {
  status: string;
  percent: number;
  pageNumber: number;
}

interface ReaderState {
  currentDoc: DocumentRecord | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  theme: ReaderTheme;
  layout: ReaderLayout;
  sourceLang: string;
  targetLang: string;
  ttsRate: number;
  ttsPitch: number;
  ttsVoiceURI?: string;

  // Modals & Panels
  isThumbnailsOpen: boolean;
  isOutlineOpen: boolean;
  isSideBySideOpen: boolean;
  isGoToPageModalOpen: boolean;
  isVocabularyModalOpen: boolean;
  isFlashcardsModalOpen: boolean;
  isQuizModalOpen: boolean;
  isStatsOpen: boolean;
  isShortcutsOpen: boolean;
  isAudioModalOpen: boolean;
  isOcrModalOpen: boolean;

  // OCR state
  ocrTriggerPage: number | null;
  ocrProgress: OcrProgressInfo | null;

  // Page translations cache
  pageTranslations: Record<number, string>;
  isTranslatingPage: boolean;

  // Active word/sentence selection popup
  activeSelection: SelectionState | null;

  // Actions
  setCurrentDoc: (doc: DocumentRecord | null) => void;
  setCurrentPage: (page: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setTheme: (theme: ReaderTheme) => void;
  setLayout: (layout: ReaderLayout) => void;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  setTtsRate: (rate: number) => void;
  setTtsPitch: (pitch: number) => void;
  setTtsVoiceURI: (uri?: string) => void;

  toggleThumbnails: () => void;
  toggleOutline: () => void;
  toggleSideBySide: () => void;
  setGoToPageModalOpen: (open: boolean) => void;
  setVocabularyModalOpen: (open: boolean) => void;
  setFlashcardsModalOpen: (open: boolean) => void;
  setQuizModalOpen: (open: boolean) => void;
  setStatsOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setAudioModalOpen: (open: boolean) => void;
  setOcrModalOpen: (open: boolean) => void;

  triggerOcrForPage: (pageNumber: number | null) => void;
  setOcrProgress: (progress: OcrProgressInfo | null) => void;

  setActiveSelection: (selection: SelectionState | null) => void;
  setPageTranslation: (page: number, text: string) => void;
  setIsTranslatingPage: (isTranslating: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentDoc: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 1.0,
  theme: 'light',
  layout: 'single', // Default to single page for instant 60fps load and zero lag
  sourceLang: 'auto',
  targetLang: 'en',
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsVoiceURI: undefined,

  isThumbnailsOpen: false,
  isOutlineOpen: false,
  isSideBySideOpen: false,
  isGoToPageModalOpen: false,
  isVocabularyModalOpen: false,
  isFlashcardsModalOpen: false,
  isQuizModalOpen: false,
  isStatsOpen: false,
  isShortcutsOpen: false,
  isAudioModalOpen: false,
  isOcrModalOpen: false,

  ocrTriggerPage: null,
  ocrProgress: null,

  pageTranslations: {},
  isTranslatingPage: false,
  activeSelection: null,

  setCurrentDoc: (doc) => {
    set({
      currentDoc: doc,
      currentPage: doc?.lastReadPage || 1,
      totalPages: doc?.totalPages || 1,
      sourceLang:
        doc?.sourceLanguage && doc.sourceLanguage !== 'auto'
          ? doc.sourceLanguage
          : inferLanguageFromTitle(doc?.title || '') || 'auto',
      targetLang: doc?.targetLanguage || 'en',
      pageTranslations: {},
      activeSelection: null,
      ocrTriggerPage: null,
      ocrProgress: null,
    });
  },

  setCurrentPage: (page) => {
    const { totalPages, currentDoc } = get();
    const clamped = Math.max(1, Math.min(page, Math.max(1, totalPages)));
    set({ currentPage: clamped });
    if (currentDoc) {
      updateDocumentProgress(currentDoc.id, clamped);
    }
  },

  goToPage: (page) => {
    const { totalPages, currentDoc, layout } = get();
    const clamped = Math.max(1, Math.min(page, Math.max(1, totalPages)));
    set({ currentPage: clamped });

    if (currentDoc) {
      updateDocumentProgress(currentDoc.id, clamped);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('page', clamped.toString());
        window.history.replaceState({}, '', url.toString());
      }
    }

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const scrollContainer = document.getElementById('reader-scroll-container');
          if (!scrollContainer) return;

          if (layout === 'single') {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          const pageEl = document.getElementById(`pdf-page-${clamped}`);
          if (!pageEl) return;

          const targetTop =
            scrollContainer.scrollTop +
            pageEl.getBoundingClientRect().top -
            scrollContainer.getBoundingClientRect().top -
            8;
          scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
      });
    }
  },

  nextPage: () => {
    const { currentPage, totalPages, goToPage } = get();
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  },

  prevPage: () => {
    const { currentPage, goToPage } = get();
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  },

  setTotalPages: (total) => set({ totalPages: Math.max(1, total) }),

  setZoom: (zoom) => {
    const clamped = Math.max(0.5, Math.min(zoom, 3.0));
    set({ zoom: parseFloat(clamped.toFixed(2)) });
  },

  zoomIn: () => {
    const { zoom, setZoom } = get();
    setZoom(zoom + 0.15);
  },

  zoomOut: () => {
    const { zoom, setZoom } = get();
    setZoom(zoom - 0.15);
  },

  resetZoom: () => set({ zoom: 1.0 }),

  setTheme: (theme) => set({ theme }),

  setLayout: (layout) => set({ layout }),

  setSourceLang: (sourceLang) => set({ sourceLang }),

  setTargetLang: (targetLang) => set({ targetLang }),

  setTtsRate: (ttsRate) => set({ ttsRate }),

  setTtsPitch: (ttsPitch) => set({ ttsPitch }),

  setTtsVoiceURI: (ttsVoiceURI) => set({ ttsVoiceURI }),

  toggleThumbnails: () => set((state) => ({ isThumbnailsOpen: !state.isThumbnailsOpen, isOutlineOpen: false })),

  toggleOutline: () => set((state) => ({ isOutlineOpen: !state.isOutlineOpen, isThumbnailsOpen: false })),

  toggleSideBySide: () => set((state) => ({ isSideBySideOpen: !state.isSideBySideOpen })),

  setGoToPageModalOpen: (isGoToPageModalOpen) => set({ isGoToPageModalOpen }),

  setVocabularyModalOpen: (isVocabularyModalOpen) => set({ isVocabularyModalOpen }),

  setFlashcardsModalOpen: (isFlashcardsModalOpen) => set({ isFlashcardsModalOpen }),

  setQuizModalOpen: (isQuizModalOpen) => set({ isQuizModalOpen }),

  setStatsOpen: (isStatsOpen) => set({ isStatsOpen }),

  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),

  setAudioModalOpen: (isAudioModalOpen) => set({ isAudioModalOpen }),

  setOcrModalOpen: (isOcrModalOpen) => set({ isOcrModalOpen }),

  triggerOcrForPage: (ocrTriggerPage) => set({ ocrTriggerPage }),

  setOcrProgress: (ocrProgress) => set({ ocrProgress }),

  setActiveSelection: (activeSelection) => set({ activeSelection }),

  setPageTranslation: (page, text) =>
    set((state) => ({
      pageTranslations: { ...state.pageTranslations, [page]: text },
    })),

  setIsTranslatingPage: (isTranslatingPage) => set({ isTranslatingPage }),
}));
