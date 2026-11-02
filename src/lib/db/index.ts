import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DocumentRecord, VocabularyItem, ReadingStats } from '@/types';

interface LinguaPDFDB extends DBSchema {
  documents: {
    key: string;
    value: DocumentRecord;
    indexes: { 'by-last-read': number };
  };
  vocabulary: {
    key: string;
    value: VocabularyItem;
    indexes: {
      'by-document': string;
      'by-due-date': number;
      'by-added-date': number;
    };
  };
  pageCache: {
    key: string; // `${docId}_page_${pageNumber}_scale_${scale}`
    value: {
      dataUrl: string;
      timestamp: number;
    };
  };
  stats: {
    key: string;
    value: ReadingStats;
  };
}

const DB_NAME = 'linguapdf_pro_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LinguaPDFDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<LinguaPDFDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser'));
  }

  if (!dbPromise) {
    dbPromise = openDB<LinguaPDFDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-last-read', 'lastReadAt');
        }

        // 2. Vocabulary store
        if (!db.objectStoreNames.contains('vocabulary')) {
          const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
          vocabStore.createIndex('by-document', 'documentId');
          vocabStore.createIndex('by-due-date', 'srs.nextReviewDate');
          vocabStore.createIndex('by-added-date', 'addedAt');
        }

        // 3. Page image/render Cache store
        if (!db.objectStoreNames.contains('pageCache')) {
          db.createObjectStore('pageCache');
        }

        // 4. Reading Stats store
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats');
        }
      },
    });
  }

  return dbPromise;
}

// Document operations
export async function saveDocument(doc: DocumentRecord): Promise<void> {
  const db = await getDB();
  await db.put('documents', doc);
}

export async function getDocument(id: string): Promise<DocumentRecord | undefined> {
  const db = await getDB();
  return db.get('documents', id);
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const db = await getDB();
  const tx = db.transaction('documents', 'readonly');
  const index = tx.store.index('by-last-read');
  const docs = await index.getAll();
  return docs.reverse(); // Most recently read first
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('documents', id);
}

export async function updateDocumentProgress(id: string, pageNumber: number): Promise<void> {
  const db = await getDB();
  const doc = await db.get('documents', id);
  if (doc) {
    doc.lastReadPage = pageNumber;
    doc.lastReadAt = Date.now();
    await db.put('documents', doc);
  }
}

// Vocabulary operations
export async function saveVocabularyItem(item: VocabularyItem): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', item);
  await incrementStats('wordsLearned', 1);
}

export async function getVocabularyItem(id: string): Promise<VocabularyItem | undefined> {
  const db = await getDB();
  return db.get('vocabulary', id);
}

export async function getAllVocabulary(): Promise<VocabularyItem[]> {
  const db = await getDB();
  const tx = db.transaction('vocabulary', 'readonly');
  const index = tx.store.index('by-added-date');
  const items = await index.getAll();
  return items.reverse();
}

export async function deleteVocabularyItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vocabulary', id);
}

// Page Cache operations
export async function getCachedPage(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    const entry = await db.get('pageCache', key);
    return entry ? entry.dataUrl : null;
  } catch {
    return null;
  }
}

export async function setCachedPage(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put('pageCache', { dataUrl, timestamp: Date.now() }, key);
  } catch {
    // Cache failures should not break the app
  }
}

// Stats operations
export async function getStats(): Promise<ReadingStats> {
  const db = await getDB();
  const stats = await db.get('stats', 'global');
  const todayStr = new Date().toISOString().split('T')[0];

  if (!stats) {
    const defaultStats: ReadingStats = {
      wordsLearned: 0,
      pagesRead: 0,
      streakDays: 1,
      lastActiveDate: todayStr,
      readingTimeSeconds: 0,
    };
    await db.put('stats', defaultStats, 'global');
    return defaultStats;
  }

  // Check streak
  if (stats.lastActiveDate !== todayStr) {
    const lastDate = new Date(stats.lastActiveDate);
    const currentDate = new Date(todayStr);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      stats.streakDays += 1;
    } else if (diffDays > 1) {
      stats.streakDays = 1;
    }
    stats.lastActiveDate = todayStr;
    await db.put('stats', stats, 'global');
  }

  return stats;
}

export async function incrementStats(field: 'wordsLearned' | 'pagesRead', amount: number = 1): Promise<void> {
  try {
    const db = await getDB();
    const stats = await getStats();
    stats[field] += amount;
    await db.put('stats', stats, 'global');
  } catch {
    // Ignore stats errors
  }
}
