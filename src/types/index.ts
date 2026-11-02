export type DocumentType = 'pdf' | 'docx' | 'txt';

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  size: number;
  totalPages: number;
  lastReadPage: number;
  lastReadAt: number;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number;
  fileData?: ArrayBuffer | string; // ArrayBuffer for PDF/DOCX, string for TXT
  textContent?: string; // Extracted plain text or HTML for fast search & side-by-side
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  romanization?: string;
  partOfSpeech?: string;
  contextSentence?: string;
  contextTranslation?: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentId?: string;
  documentTitle?: string;
  pageNumber?: number;
  addedAt: number;
  tags: string[];
  mastered: boolean;
  srs: SrsState;
}

export interface SrsState {
  repetitions: number;
  interval: number; // days
  easeFactor: number; // 2.5 default
  nextReviewDate: number; // timestamp
  lastReviewedDate?: number;
}

export type ReaderTheme = 'light' | 'dark' | 'sepia' | 'high-contrast';

export type ReaderLayout = 'continuous' | 'single' | 'side-by-side';

export interface OutlineItem {
  title: string;
  pageNumber: number;
  items?: OutlineItem[];
}

export interface ReadingStats {
  wordsLearned: number;
  pagesRead: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  readingTimeSeconds: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  script?: 'latin' | 'cyrillic' | 'cjk' | 'devanagari' | 'arabic' | 'hangul' | 'other';
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  phonetic?: string;
  romanization?: string;
  partOfSpeech?: string;
  provider?: string;
}
