/**
 * LinguaPDF Pro - Fast Client-side OCR Engine with Tesseract.js
 * Preprocesses and downscales canvas for ultra-fast recognition and low memory footprint
 */

export interface OcrWord {
  str: string;
  sentence: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  ocr: true;
}

export interface OcrResult {
  text: string;
  words: OcrWord[];
}

type OcrWorker = Awaited<ReturnType<typeof import('tesseract.js').createWorker>>;

interface OcrWorkerEntry {
  worker: Promise<OcrWorker>;
  queue: Promise<void>;
  onProgress?: (status: string, percent: number) => void;
}

const workerCache = new Map<string, OcrWorkerEntry>();

export function mapToTesseractLang(code: string): string {
  const c = code.toLowerCase().split('-')[0];
  const map: Record<string, string> = {
    es: 'spa',
    fr: 'fra',
    de: 'deu',
    it: 'ita',
    pt: 'por',
    ru: 'rus',
    ja: 'jpn',
    zh: 'chi_sim',
    ko: 'kor',
    hi: 'hin',
    ar: 'ara',
    nl: 'nld',
    pl: 'pol',
    tr: 'tur',
    sv: 'swe',
    el: 'ell',
    vi: 'vie',
    en: 'eng',
  };
  return map[c] || 'eng';
}

function getWorkerEntry(lang: string): OcrWorkerEntry {
  const cached = workerCache.get(lang);
  if (cached) return cached;

  const entry: OcrWorkerEntry = {
    worker: import('tesseract.js').then(({ createWorker }) =>
      createWorker(lang, 1, {
        logger: (message: any) => {
          if (!message.status) return;
          const progress = entry.onProgress;
          if (!progress) return;

          if (message.status === 'recognizing text') {
            const percent = Math.round((message.progress || 0) * 100);
            progress(`Recognizing text (${percent}%)...`, 30 + Math.round(percent * 0.65));
          } else {
            progress(`${message.status}...`, 25);
          }
        },
      })
    ),
    queue: Promise.resolve(),
  };
  workerCache.set(lang, entry);
  void entry.worker.catch(() => {
    if (workerCache.get(lang) === entry) workerCache.delete(lang);
  });
  return entry;
}

export async function runOcrOnCanvas(
  canvas: HTMLCanvasElement,
  langCode: string,
  displayDims: { width: number; height: number },
  onProgress?: (status: string, percent: number) => void
): Promise<OcrResult> {
  const tessLang = mapToTesseractLang(langCode);

  onProgress?.('Preparing image for recognition...', 10);

  // Downscale canvas to optimal resolution (max 1200px) for 10x faster OCR and low memory
  const maxDim = 1200;
  const scaleFactor = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
  const ocrCanvas = document.createElement('canvas');
  ocrCanvas.width = Math.round(canvas.width * scaleFactor);
  ocrCanvas.height = Math.round(canvas.height * scaleFactor);
  const ctx = ocrCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the page image for OCR.');
  ctx.drawImage(canvas, 0, 0, ocrCanvas.width, ocrCanvas.height);

  const ocrDataUrl = ocrCanvas.toDataURL('image/jpeg', 0.85);

  onProgress?.('Initializing OCR model...', 25);

  const entry = getWorkerEntry(tessLang);
  const recognizeJob = entry.queue.then(async () => {
    entry.onProgress = onProgress;
    try {
      const worker = await entry.worker;
      return await worker.recognize(ocrDataUrl, {}, { blocks: true });
    } finally {
      entry.onProgress = undefined;
    }
  });
  entry.queue = recognizeJob.then(
    () => undefined,
    () => undefined
  );
  const ret = await recognizeJob;

  onProgress?.('Mapping words...', 95);

  const words: OcrWord[] = [];
  for (const block of ret.data.blocks || []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        for (const word of line.words) {
          if (!word.text.trim()) continue;

          const bbox = word.bbox;
          const left = (bbox.x0 / ocrCanvas.width) * displayDims.width;
          const top = (bbox.y0 / ocrCanvas.height) * displayDims.height;
          const width = ((bbox.x1 - bbox.x0) / ocrCanvas.width) * displayDims.width;
          const height = ((bbox.y1 - bbox.y0) / ocrCanvas.height) * displayDims.height;

          words.push({
            str: word.text.trim(),
            sentence: line.text.trim(),
            left,
            top,
            width,
            fontSize: Math.max(10, Math.round(height)),
            ocr: true,
          });
        }
      }
    }
  }

  onProgress?.('Complete', 100);

  return {
    text: ret.data.text || '',
    words,
  };
}
