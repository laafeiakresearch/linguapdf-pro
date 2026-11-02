'use client';

import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { getStats } from '@/lib/db';
import { ReadingStats } from '@/types';
import { X, Flame, BookOpen, Layers, Clock, TrendingUp } from 'lucide-react';

export const StatsDrawer: React.FC = () => {
  const { isStatsOpen, setStatsOpen } = useReaderStore();
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    if (isStatsOpen) {
      getStats().then(setStats);
    }
  }, [isStatsOpen]);

  if (!isStatsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setStatsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reading Stats & Streak</h3>
              <p className="text-xs text-zinc-400">Track your daily language learning progress</p>
            </div>
          </div>
          <button
            onClick={() => setStatsOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4">
          {/* Daily streak card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Daily Reading Streak
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                  {stats?.streakDays || 1}
                </span>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {stats?.streakDays === 1 ? 'day streak' : 'consecutive days'}
                </span>
              </div>
            </div>
            <Flame className="w-10 h-10 text-orange-500 fill-orange-500/30 animate-pulse" />
          </div>

          {/* Grid stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>Words Learned</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats?.wordsLearned || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pages Read</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats?.pagesRead || 0}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Last Active</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {stats?.lastActiveDate || 'Today'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
