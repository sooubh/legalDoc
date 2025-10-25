import { generateExplanation } from '../services/geminiPdfService';

/**
 * Generates HTML for PDF from analysis result using Gemini AI.
 * @param analysisResult The analysis result object or JSON string.
 * @returns Promise<string> HTML content for PDF.
 */
export async function generatePdfHtmlFromAnalysis(analysisResult: object | string): Promise<string> {
  return await generateExplanation(analysisResult);
}
