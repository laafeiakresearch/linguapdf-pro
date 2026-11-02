'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/translation/languages';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  includeAuto?: boolean;
  className?: string;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
  includeAuto = false,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = getLanguageByCode(value);

  const availableLanguages = includeAuto
    ? SUPPORTED_LANGUAGES
    : SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto');

  const filteredLanguages = availableLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl transition-all border ${
          compact
            ? 'px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200'
            : 'px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-brand-500 shadow-sm text-zinc-900 dark:text-zinc-100'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-base shrink-0">{selectedLang.flag}</span>
          <span className="font-semibold truncate">{selectedLang.name}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-64 max-w-[90vw] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 50+ languages..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-brand-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400">No language found</div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm shrink-0">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          ({lang.nativeName})
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
