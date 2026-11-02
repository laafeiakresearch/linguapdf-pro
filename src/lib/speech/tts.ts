/**
 * LinguaPDF Pro - Text to Speech Engine with Word Boundary Karaoke Tracking
 */

export interface TTSOptions {
  rate?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 1.5
  volume?: number; // 0 to 1
  voiceURI?: string;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    const cleanLang = langCode.toLowerCase().split('-')[0];
    return all.filter((v) => v.lang.toLowerCase().startsWith(cleanLang));
  }

  public speak(text: string, langCode: string, options: TTSOptions = {}) {
    if (!this.synth) {
      options.onError?.(new Error('Speech Synthesis not supported in this browser.'));
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    utterance.lang = langCode;

    // Pick best matching voice
    const voices = this.getVoicesForLanguage(langCode);
    if (options.voiceURI) {
      const selected = this.voices.find((v) => v.voiceURI === options.voiceURI);
      if (selected) utterance.voice = selected;
    } else if (voices.length > 0) {
      // Prefer default or localService voice
      const preferred = voices.find((v) => v.default) || voices[0];
      utterance.voice = preferred;
    }

    // Word boundary event for karaoke-style word highlighting
    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Approximation of word length
        const remaining = text.slice(charIndex);
        const match = remaining.match(/^\S+/);
        const charLength = match ? match[0].length : 1;
        options.onBoundary?.(charIndex, charLength);
      }
    };

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public pause() {
    if (this.synth) this.synth.pause();
  }

  public resume() {
    if (this.synth) this.synth.resume();
  }
}

export const ttsService = new TTSService();
