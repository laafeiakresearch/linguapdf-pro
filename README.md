# 📖 LinguaPDF Pro

> A blazing-fast, modern document and PDF reader engineered specifically for English speakers to master foreign languages through authentic reading.

Inspired by [linguapdf.vercel.app](https://linguapdf.vercel.app/), **LinguaPDF Pro** introduces major performance breakthroughs, instant page jumping, dual-pane side-by-side translation, spaced repetition flashcards (SuperMemo SM-2), native Web Speech pronunciation, and 100% client-side privacy.

---

## ✨ Key Features

### 1. 🚀 Instant "Go to Page" Jump & Scrubber (Key Highlight)
- **Direct Page Jump**: Type a page number into the top bar, press <kbd>Enter</kbd>, and jump to that page in the reader viewport.
- **Quick Jump Command Palette**: Press <kbd>Ctrl+G</kbd> (or <kbd>Cmd+G</kbd>) from anywhere to trigger the quick jump modal with ±5, ±10, First, and Last page controls.
- **Visual Scrubber & Slider**: Live progress percentage indicator with smooth drag scrubbing.
- **Deep Linking**: Share or bookmark exact pages with `/read/[docId]?page=45`.
- **Auto-Resume**: Remembers your exact last-read page per document and automatically resumes when you return.
- **Table of Contents & Thumbnails**: Full sidebar navigation for PDF bookmarks and responsive thumbnail previews.

### 2. ⚡ Blazing Fast Loading & Rendering
- **Virtualized Rendering**: Only renders the visible viewport with progressive pre-rendering of ±2 pages ahead.
- **PDF.js Web Worker**: Heavy parsing executes off the main thread; smooth 60fps scrolling.
- **IndexedDB Multi-Tier Caching**: Caches full documents, text streams, and render metadata in browser IndexedDB (`idb`).
- **Zero Server Uploads**: 100% privacy-first. Documents never leave your device.
- **OCR Fallback (Tesseract.js)**: Run OCR on the currently viewed PDF page when needed. OCR creates selectable, clickable word overlays, supports a selectable recognition language, and reuses its language worker for subsequent pages.

### 3. 🌐 Instant Translation & Romanization
- **1-Click Word Translation**: Click any word in the document to instantly see its translation, part of speech, and sentence context.
- **Sentence & Selection Translation**: Select or double-click any phrase or sentence for instant contextual translation.
- **Multi-Script Romanization Engine**:
  - 🇯🇵 Japanese: Hiragana / Katakana to Hepburn Romaji
  - 🇰🇷 Korean: Hangul decomposition to Revised Romanization
  - 🇨🇳 Chinese: Pinyin
  - 🇮🇳 Hindi / Sanskrit / Marathi: Devanagari transliteration
  - 🇸🇦 Arabic / Urdu / Persian: ALA-LC romanization
  - 🇷🇺 Russian / Ukrainian: Cyrillic transliteration
- **Dual-Pane Side-by-Side Mode**: Split-view with original paragraph on the left and translation on the right.
- **Translate Full Page**: 1-click full page translation with translation cache.
- **Pluggable Translation API**: DeepL API, Google Cloud Translation, LibreTranslate, or free built-in fallback (MyMemory & Lingva).

### 4. 🔊 Native Speech & Karaoke Highlighting
- **Web Speech API**: Crystal clear native pronunciation in 50+ languages.
- **Speed & Pitch Controls**: Adjust playback speed (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
- **Voice Selector**: Pick from your browser's installed neural/native voices.
- **Karaoke Word Highlighting**: Tracks speech boundaries in real time while reading sentences aloud.

### 5. 🧠 Spaced Repetition (SM-2) Flashcards & Revision
- **1-Click Word Saving**: Save words with their exact sentence context and document page.
- **SuperMemo SM-2 SRS Algorithm**: Automatically schedules reviews based on recall difficulty (Again, Hard, Good, Easy).
- **Interactive Quiz Generator**: 4-choice multiple choice quizzes dynamically generated from your saved word bank.
- **Export to Anki & CSV**: 1-click export to Anki deck format (`.txt`/`.tsv`) and CSV spreadsheets.
- **Reading Stats & Daily Streak**: Tracks words learned, pages read, reading streak, and activity.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with Light, Dark, Sepia, and High-Contrast themes
- **State Management**: Zustand
- **Local Storage & Caching**: IndexedDB (`idb`)
- **Document Engines**:
  - PDF: `pdfjs-dist` with Web Worker
  - DOCX: `mammoth` (lazy loaded)
  - Plain Text: Custom responsive paginator
  - OCR: `tesseract.js` (lazy loaded)
- **Pronunciation**: Web Speech API (`SpeechSynthesis`)
- **PWA**: Service Worker (`public/sw.js`) and Web App Manifest (`public/manifest.json`)
- **Deployment**: Vercel ready

---

## 📁 Project Structure

```
linguapdf-pro/
├── public/
│   ├── manifest.json            # PWA Web App Manifest
│   └── sw.js                    # Service Worker for offline capability
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── translate/
│   │   │       └── route.ts     # Pluggable server translation route handler
│   │   ├── read/
│   │   │   └── [docId]/
│   │   │       └── page.tsx     # Deep link reader page (?page=45)
│   │   ├── globals.css          # Tailwind CSS and custom scrollbars
│   │   ├── layout.tsx           # Root layout & PWA registration
│   │   └── page.tsx             # Landing page with upload, samples & recent docs
│   ├── components/
│   │   ├── common/
│   │   │   ├── ShortcutHelpModal.tsx
│   │   │   └── StatsDrawer.tsx
│   │   ├── landing/
│   │   │   ├── HeroUpload.tsx   # File drag-drop, paste text, URL fetcher
│   │   │   ├── RecentDocuments.tsx # IndexedDB reading history & progress
│   │   │   └── SampleDocuments.tsx # Curated foreign literature books
│   │   ├── reader/
│   │   │   ├── DocumentReader.tsx # Master reader coordinator
│   │   │   ├── TopToolbar.tsx   # Go to page input, zoom, theme, tools
│   │   │   ├── GoToPageModal.tsx # Ctrl+G jump palette
│   │   │   ├── ScrubberBar.tsx  # Bottom page slider & progress
│   │   │   ├── PdfPageView.tsx  # Virtualized PDF canvas + text layer + OCR
│   │   │   ├── TxtReaderView.tsx
│   │   │   ├── DocxReaderView.tsx
│   │   │   ├── SideBySideView.tsx # Dual pane original / translated view
│   │   │   ├── TranslationPopup.tsx # Interactive word/sentence popup
│   │   │   ├── ThumbnailsSidebar.tsx
│   │   │   └── OutlineSidebar.tsx
│   │   └── vocabulary/
│   │       ├── VocabularyModal.tsx # Word bank, search, Anki/CSV export
│   │       ├── FlashcardsModal.tsx # SM-2 Spaced repetition review
│   │       └── QuizModal.tsx    # Multiple choice revision quiz
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts         # IndexedDB client database
│   │   ├── docx/
│   │   │   └── docxLoader.ts    # Mammoth DOCX parser
│   │   ├── pdf/
│   │   │   └── pdfLoader.ts     # PDF.js worker setup & outline extraction
│   │   ├── romanization/
│   │   │   └── romanizer.ts     # Multi-script transliterator
│   │   ├── samples/
│   │   │   └── sampleDocs.ts    # Spanish, French, German, Japanese samples
│   │   ├── speech/
│   │   │   └── tts.ts           # SpeechSynthesis wrapper with word tracking
│   │   ├── srs/
│   │   │   └── sm2.ts           # SuperMemo 2 algorithm
│   │   ├── store/
│   │   │   └── useReaderStore.ts # Zustand global reader store
│   │   └── translation/
│   │       ├── languages.ts     # 50+ languages catalog
│   │       └── translator.ts    # Client translation engine & memory cache
│   └── types/
│       └── index.ts             # TypeScript definitions
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>⌘ / Ctrl + G</kbd> | Open "Go to Page" jump box |
| <kbd>→</kbd> or <kbd>PageDown</kbd> | Next Page |
| <kbd>←</kbd> or <kbd>PageUp</kbd> | Previous Page |
| <kbd>+</kbd> / <kbd>-</kbd> | Zoom In / Zoom Out |
| <kbd>S</kbd> | Speak / Pronounce Selected Word |
| <kbd>V</kbd> | Open Vocabulary Bank |
| <kbd>F</kbd> | Open Spaced Repetition Flashcards |
| <kbd>Esc</kbd> | Close Popups and Modals |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 20 & 22)
- npm or pnpm

### Installation

1. Clone or download the repository:
```bash
git clone https://github.com/your-username/linguapdf-pro.git
cd linguapdf-pro
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Translation API Keys:
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your optional keys if you wish to use DeepL or Google Translate. If left blank, the app automatically uses free built-in translation providers.

4. Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

LinguaPDF Pro is built with Next.js App Router and is 100% ready for one-click Vercel deployment:

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"New Project"**.
3. Import your GitHub repository.
4. (Optional) In the **Environment Variables** section, add:
   - `DEEPL_API_KEY` (optional)
   - `GOOGLE_TRANSLATE_API_KEY` (optional)
   - `LIBRETRANSLATE_URL` (optional)
5. Click **Deploy**. Your app will be live with full global CDN caching and edge optimization!

---

## 🔒 Privacy Guarantee
All documents (PDFs, DOCX, and Text) are processed and parsed strictly inside the user's browser client via WebAssembly and Web Workers. No document files or reading logs are ever transmitted to or stored on any server.
"# linguapdf-pro" 
"# linguapdf-pro" 
