/**
 * LinguaPDF Pro - PDF Engine Loader & Utility
 * Handles pdfjs-dist configuration, bookmark outline extraction, and page rendering
 */

import { OutlineItem } from '@/types';

let pdfjsLib: any = null;

export async function getPdfJs() {
  if (typeof window === 'undefined') return null;

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Configure worker
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  return pdfjsLib;
}

export async function loadPdfDocument(source: ArrayBuffer | string) {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error('PDF.js could not be initialized');

  const loadingTask = pdfjs.getDocument(
    typeof source === 'string' ? source : { data: source }
  );

  return loadingTask.promise;
}

export async function extractPdfOutline(pdfDoc: any): Promise<OutlineItem[]> {
  try {
    const rawOutline = await pdfDoc.getOutline();
    if (!rawOutline || !Array.isArray(rawOutline)) return [];

    const formatItems = async (items: any[]): Promise<OutlineItem[]> => {
      const result: OutlineItem[] = [];
      for (const item of items) {
        let pageNumber = 1;
        try {
          if (typeof item.dest === 'string') {
            const dest = await pdfDoc.getDestination(item.dest);
            if (dest && dest[0]) {
              const pageIndex = await pdfDoc.getPageIndex(dest[0]);
              pageNumber = pageIndex + 1;
            }
          } else if (Array.isArray(item.dest) && item.dest[0]) {
            const pageIndex = await pdfDoc.getPageIndex(item.dest[0]);
            pageNumber = pageIndex + 1;
          }
        } catch {
          // Fallback to 1 if destination can't be resolved
        }

        const formatted: OutlineItem = {
          title: item.title || 'Untitled section',
          pageNumber,
          items: item.items && item.items.length > 0 ? await formatItems(item.items) : undefined,
        };
        result.push(formatted);
      }
      return result;
    };

    return await formatItems(rawOutline);
  } catch (err) {
    console.warn('Could not extract PDF outline:', err);
    return [];
  }
}

export async function extractPageText(pdfDoc: any, pageNumber: number): Promise<string> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(' ');
  } catch (err) {
    console.error('Failed to extract text for page', pageNumber, err);
    return '';
  }
}
