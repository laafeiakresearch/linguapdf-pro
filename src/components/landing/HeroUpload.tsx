'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveDocument } from '@/lib/db';
import { DocumentRecord, DocumentType } from '@/types';
import { loadPdfDocument } from '@/lib/pdf/pdfLoader';
import {
  UploadCloud,
  FileText,
  Link as LinkIcon,
  Clipboard,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HeroUpload: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'url'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Process File
  const handleProcessFile = async (file: File) => {
    try {
      setLoading(true);
      setErrorMsg('');

      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: DocumentType = 'pdf';
      let totalPages = 1;
      let fileData: ArrayBuffer | string;
      let textContent: string | undefined = undefined;

      if (ext === 'docx') {
        type = 'docx';
        fileData = await file.arrayBuffer();
      } else if (ext === 'txt') {
        type = 'txt';
        const text = await file.text();
        fileData = text;
        textContent = text;
      } else {
        type = 'pdf';
        fileData = await file.arrayBuffer();
        try {
          // Pass a sliced copy so fileData is never detached by Web Worker transfer
          const pdf = await loadPdfDocument(fileData.slice(0));
          totalPages = pdf.numPages;
        } catch (e) {
          console.warn('PDF page count preview error:', e);
        }
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const docRecord: DocumentRecord = {
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type,
        size: file.size,
        totalPages: Math.max(1, totalPages),
        lastReadPage: 1,
        lastReadAt: Date.now(),
        sourceLanguage: 'auto',
        targetLanguage: 'en',
        createdAt: Date.now(),
        // Ensure the ArrayBuffer stored in IndexedDB is fresh and non-detached
        fileData: typeof fileData === 'string' ? fileData : fileData.slice(0),
        textContent,
      };

      await saveDocument(docRecord);
      router.push(`/read/${docId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process document');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    try {
      setLoading(true);
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const title = pasteTitle.trim() || 'Pasted Reading Text';

      const docRecord: DocumentRecord = {
        id: docId,
        title,
        type: 'txt',
        size: pasteText.length,
        totalPages: 1,
        lastReadPage: 1,
        lastReadAt: Date.now(),
        sourceLanguage: 'auto',
        targetLanguage: 'en',
        createdAt: Date.now(),
        fileData: pasteText,
        textContent: pasteText,
      };

      await saveDocument(docRecord);
      router.push(`/read/${docId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(urlInput);
      if (!res.ok) throw new Error('Failed to download document from URL');

      const arrayBuffer = await res.arrayBuffer();
      let totalPages = 1;
      try {
        const pdf = await loadPdfDocument(arrayBuffer.slice(0));
        totalPages = pdf.numPages;
      } catch (e) {
        console.warn('URL PDF preview error:', e);
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const docRecord: DocumentRecord = {
        id: docId,
        title: urlInput.split('/').pop()?.split('?')[0] || 'Web Document',
        type: 'pdf',
        size: arrayBuffer.byteLength,
        totalPages,
        lastReadPage: 1,
        lastReadAt: Date.now(),
        sourceLanguage: 'auto',
        targetLanguage: 'en',
        createdAt: Date.now(),
        fileData: arrayBuffer.slice(0),
      };

      await saveDocument(docRecord);
      router.push(`/read/${docId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not fetch or parse URL');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-1 p-1 bg-zinc-200/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl max-w-sm mx-auto mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-zinc-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'paste'
              ? 'bg-white dark:bg-zinc-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span>Paste Text</span>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'url'
              ? 'bg-white dark:bg-zinc-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>From URL</span>
        </button>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/50 hover:border-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
          } shadow-xl backdrop-blur-sm`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-brand-600 dark:text-brand-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-semibold text-sm">Processing document & initializing worker...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Drop your document here, or <span className="text-brand-600 dark:text-brand-400 underline decoration-brand-500/30">browse</span>
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Supports <strong className="text-zinc-700 dark:text-zinc-300">PDF, Word (.docx) and Plain Text (.txt)</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Private (Processed in browser)
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Go-to-Page & Pre-rendering
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Text */}
      {activeTab === 'paste' && (
        <form
          onSubmit={handlePasteSubmit}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="e.g. Spanish Short Story or German News Article"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Paste Text in Any Foreign Language
            </label>
            <textarea
              rows={7}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste paragraphs, book excerpts, dialogues or foreign text here..."
              className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-brand-500 leading-relaxed custom-scrollbar"
            />
          </div>

          <button
            type="submit"
            disabled={!pasteText.trim() || loading}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Open in Reader</span>
          </button>
        </form>
      )}

      {/* From URL */}
      {activeTab === 'url' && (
        <form
          onSubmit={handleUrlSubmit}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Public PDF Document URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/spanish-book.pdf"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={!urlInput.trim() || loading}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Fetch and Read</span>
          </button>
        </form>
      )}

      {errorMsg && (
        <p className="mt-3 text-xs text-red-500 text-center font-medium">{errorMsg}</p>
      )}
    </div>
  );
};
