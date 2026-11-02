'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_DOCUMENTS } from '@/lib/samples/sampleDocs';
import { BookOpen, ArrowRight, Languages } from 'lucide-react';

export const SampleDocuments: React.FC = () => {
  const router = useRouter();

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1.5">
            <Languages className="w-4 h-4" />
            <span>Interactive Library</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Or start with a curated sample book
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Read authentic literary texts with instant translations and pronunciations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_DOCUMENTS.map((sample) => (
          <div
            key={sample.id}
            onClick={() => router.push(`/read/${sample.id}`)}
            className="group relative p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl" role="img" aria-label={sample.languageName}>
                  {sample.flag}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {sample.level}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {sample.title}
                </h3>
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                  {sample.languageName}
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {sample.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
              <span>Read Now</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
