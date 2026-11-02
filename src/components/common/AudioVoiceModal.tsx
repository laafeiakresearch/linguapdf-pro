'use client';

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/lib/store/useReaderStore';
import { ttsService } from '@/lib/speech/tts';
import { X, Volume2, Play, Square, Gauge, Sliders, Check, Search } from 'lucide-react';

export const AudioVoiceModal: React.FC = () => {
  const {
    isAudioModalOpen,
    setAudioModalOpen,
    ttsRate,
    setTtsRate,
    ttsPitch,
    setTtsPitch,
    ttsVoiceURI,
    setTtsVoiceURI,
    sourceLang,
    targetLang,
  } = useReaderStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [searchVoice, setSearchVoice] = useState('');

  const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateVoices = () => {
      const all = ttsService.getVoices();
      if (all.length > 0) {
        setVoices(all);
      }
    };

    updateVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    const timer = setTimeout(updateVoices, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isAudioModalOpen) return null;

  const currentLangCode = sourceLang !== 'auto' ? sourceLang : 'en';

  const filteredVoices = voices.filter(
    (v) =>
      v.name.toLowerCase().includes(searchVoice.toLowerCase()) ||
      v.lang.toLowerCase().includes(searchVoice.toLowerCase())
  );

  const handleTestVoice = () => {
    if (isPlayingTest) {
      ttsService.stop();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    const sampleText =
      sourceLang === 'es'
        ? 'Hola, esto es una prueba de pronunciación en LinguaPDF Pro.'
        : sourceLang === 'fr'
        ? 'Bonjour, ceci est un test de prononciation dans LinguaPDF Pro.'
        : sourceLang === 'de'
        ? 'Hallo, dies ist ein Test für die Aussprache in LinguaPDF Pro.'
        : sourceLang === 'ja'
        ? 'こんにちは、これはリンガPDFの発音テストです。'
        : sourceLang === 'hi'
        ? 'नमस्ते, यह लिंगुआपीडीएफ प्रो में उच्चारण का एक परीक्षण है।'
        : 'Hello! This is a test of pronunciation in LinguaPDF Pro.';

    ttsService.speak(sampleText, currentLangCode, {
      rate: ttsRate,
      pitch: ttsPitch,
      voiceURI: ttsVoiceURI,
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setAudioModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Voice Model & Speed</h3>
              <p className="text-xs text-zinc-400">
                Custom speech synthesis voice and pronunciation speed
              </p>
            </div>
          </div>
          <button
            onClick={() => setAudioModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar pr-1">
          {/* Speed of Speak */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-brand-500" />
                <span>Speed of Speak</span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
                {ttsRate.toFixed(2)}x
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-6 gap-1.5">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTtsRate(preset)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    Math.abs(ttsRate - preset) < 0.01
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={ttsRate}
              onChange={(e) => setTtsRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          {/* Voice Model Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Voice Model</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">
                {voices.length} voices installed
              </span>
            </div>

            {/* Search filter for voices */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchVoice}
                onChange={(e) => setSearchVoice(e.target.value)}
                placeholder="Search voice model (Google, Microsoft, Natural...)"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-brand-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Voices List */}
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-1.5 bg-zinc-50/50 dark:bg-zinc-950/40 custom-scrollbar">
              {filteredVoices.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">
                  {voices.length === 0
                    ? 'Loading installed system voices...'
                    : 'No matching voice found.'}
                </div>
              ) : (
                filteredVoices.map((v) => {
                  const isSelected =
                    ttsVoiceURI === v.voiceURI || (!ttsVoiceURI && v.default);

                  return (
                    <button
                      key={v.voiceURI}
                      type="button"
                      onClick={() => setTtsVoiceURI(v.voiceURI)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-800'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{v.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {v.lang} {v.default ? '• Default' : ''}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold uppercase text-[10px] tracking-wider">
                Voice Pitch
              </span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400">
                {ttsPitch.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={ttsPitch}
              onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>
        </div>

        {/* Footer with Test Button */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTestVoice}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
              isPlayingTest
                ? 'bg-red-500 text-white border-red-500 shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {isPlayingTest ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Sample</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sample</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAudioModalOpen(false)}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
