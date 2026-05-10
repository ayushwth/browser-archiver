import pdf from 'pdf-parse/lib/pdf-parse.js';
import Tesseract from 'tesseract.js';

// Minimum character threshold — if less text than this, try OCR
const MIN_TEXT_LENGTH = 50;

/**
 * Extract text from a PDF buffer.
 * Falls back to OCR if the PDF has very little extractable text.
 *
 * Returns { text, ocrUsed }
 */
export async function extractText(pdfBuffer) {
  let text = '';
  let ocrUsed = false;

  try {
    // Try standard text extraction first
    const data = await pdf(pdfBuffer);
    text = data.text || '';
  } catch (err) {
    console.warn('⚠️  pdf-parse failed:', err.message);
  }

  // If very little text was extracted, try OCR
  if (text.trim().length < MIN_TEXT_LENGTH) {
    console.log('📸 Text too sparse, attempting OCR...');
    try {
      const ocrText = await performOcr(pdfBuffer);
      if (ocrText.trim().length > text.trim().length) {
        text = ocrText;
        ocrUsed = true;
      }
    } catch (err) {
      console.warn('⚠️  OCR failed:', err.message);
    }
  }

  // Clean up the text
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { text, ocrUsed };
}

/**
 * Perform OCR on a PDF buffer using Tesseract.js
 * Note: Tesseract works on images, so this is best when pages are image-based
 */
async function performOcr(pdfBuffer) {
  // Tesseract.js expects image data; for a basic implementation
  // we'll try to recognize text from the raw buffer
  // In production, you'd convert PDF pages to images first using something like pdf2pic
  const worker = await Tesseract.createWorker('eng');
  try {
    const { data } = await worker.recognize(pdfBuffer);
    return data.text || '';
  } finally {
    await worker.terminate();
  }
}
