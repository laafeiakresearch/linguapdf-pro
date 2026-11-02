/**
 * LinguaPDF Pro - Lazy DOCX Loader using Mammoth.js
 */

export async function convertDocxToHtml(arrayBuffer: ArrayBuffer): Promise<{ html: string; text: string }> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

    return {
      html: result.value,
      text: rawTextResult.value,
    };
  } catch (error) {
    console.error('DOCX conversion failed:', error);
    throw new Error('Failed to parse DOCX file. Please check if the file is valid.');
  }
}
