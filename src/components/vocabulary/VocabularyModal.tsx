'use client';

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { getAllVocabulary, deleteVocabularyItem, saveVocabularyItem } from '@/lib/db';
import { VocabularyItem } from '@/types';
import { ttsService } from '@/lib/speech/tts';
import {
  X,
  Search,
  BookOpen,
  Volume2,
  Trash2,
  Download,
  CheckCircle,
  Tag,
  Filter,
  Sparkles,
} from 'lucide-react';

export const VocabularyModal: React.FC = () => {
  const { isVocabularyModalOpen, setVocabularyModalOpen, ttsRate, ttsVoiceURI } = useReaderStore();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);

  const loadItems = async () => {
    try {
      const vocab = await getAllVocabulary();
      setItems(vocab);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isVocabularyModalOpen) {
      loadItems();
    }
  }, [isVocabularyModalOpen]);

  if (!isVocabularyModalOpen) return null;

  const tags = Array.from(new Set(items.flatMap((i) => i.tags || [])));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'all' || (item.tags && item.tags.includes(selectedTag));
    const matchesMastered = !onlyUnmastered || !item.mastered;
    return matchesSearch && matchesTag && matchesMastered;
  });

  const handleDelete = async (id: string) => {
    await deleteVocabularyItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleMastered = async (item: VocabularyItem) => {
    const updated = { ...item, mastered: !item.mastered };
    await saveVocabularyItem(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  const handleSpeak = (text: string, lang: string) => {
    ttsService.speak(text, lang, { rate: ttsRate, voiceURI: ttsVoiceURI });
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Word', 'Translation', 'Romanization', 'Part of Speech', 'Context Sentence', 'Document', 'Page'];
    const rows = items.map((i) => [
      `"${i.word.replace(/"/g, '""')}"`,
      `"${i.translation.replace(/"/g, '""')}"`,
      `"${(i.romanization || '').replace(/"/g, '""')}"`,
      `"${(i.partOfSpeech || '').replace(/"/g, '""')}"`,
      `"${(i.contextSentence || '').replace(/"/g, '""')}"`,
      `"${(i.documentTitle || '').replace(/"/g, '""')}"`,
      i.pageNumber || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `linguapdf_vocab_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAnki = () => {
    if (items.length === 0) return;
    // Anki tab-separated text: Front \t Back \t Tags
    const lines = items.map((i) => {
      const front = `${i.word}${i.romanization ? ` [${i.romanization}]` : ''}<br><small><i>${i.contextSentence || ''}</i></small>`;
      const back = `${i.translation}${i.partOfSpeech ? ` (${i.partOfSpeech})` : ''}`;
      const tag = i.tags.join(' ');
      return `${front}\t${back}\t${tag}`;
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguapdf_anki_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setVocabularyModalOpen(false)}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Vocabulary Bank</h3>
              <p className="text-xs text-zinc-400">
                {items.length} words saved across your reading sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
              title="Export saved words to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportAnki}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-500/20 transition-colors disabled:opacity-40"
              title="Export flashcards for Anki import"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anki Deck</span>
            </button>
            <button
              onClick={() => setVocabularyModalOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="px-6 py-3 border-b border-zinc-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words, translations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {tags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none text-zinc-700 dark:text-zinc-200"
              >
                <option value="all">All Tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyUnmastered}
                onChange={(e) => setOnlyUnmastered(e.target.checked)}
                className="rounded accent-brand-600"
              />
              <span>Learning only</span>
            </label>
          </div>
        </div>

        {/* Vocabulary list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">No saved words match your filters.</p>
              <p className="text-xs">Click any word in your document to translate and save it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col justify-between gap-3 group hover:border-brand-500/50 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {item.word}
                          </span>
                          {item.partOfSpeech && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium">
                              {item.partOfSpeech}
                            </span>
                          )}
                        </div>
                        {item.romanization && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                            /{item.romanization}/
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(item.word, item.sourceLanguage)}
                          className="p-1 rounded text-zinc-400 hover:text-brand-600 transition-colors"
                          title="Pronounce word"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleMastered(item)}
                          className={`p-1 rounded transition-colors ${
                            item.mastered ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-emerald-500'
                          }`}
                          title={item.mastered ? 'Mastered!' : 'Mark as mastered'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete word"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {item.translation}
                    </div>

                    {item.contextSentence && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2 bg-white/60 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        “{item.contextSentence}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40">
                    <span>
                      {item.documentTitle ? `p. ${item.pageNumber || 1}` : 'Quick entry'}
                    </span>
                    <span className="font-mono">
                      Repetitions: {item.srs?.repetitions || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
