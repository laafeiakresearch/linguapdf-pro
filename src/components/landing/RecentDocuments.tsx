'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDocuments, deleteDocument } from '@/lib/db';
import { DocumentRecord } from '@/types';
import { BookOpen, Clock, Trash2, ArrowRight, FileText } from 'lucide-react';

export const RecentDocuments: React.FC = () => {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);

  const loadDocs = async () => {
    try {
      const records = await getAllDocuments();
      setDocs(records);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  if (docs.length === 0) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDocument(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Continue Reading
          </h2>
        </div>
        <span className="text-xs text-zinc-400 font-medium">{docs.length} documents</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => {
          const progress =
            doc.totalPages > 1
              ? Math.round(((doc.lastReadPage || 1) / doc.totalPages) * 100)
              : 100;

          return (
            <div
              key={doc.id}
              onClick={() => router.push(`/read/${doc.id}?page=${doc.lastReadPage || 1}`)}
              className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {doc.type}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-1 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Page {doc.lastReadPage || 1} of {doc.totalPages} ({progress}%)
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>Resume Reading</span>
                <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
