import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DocumentAnalysis, SimplificationLevel } from '../types/legal';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
  // We don't throw at import time to avoid breaking build; callers should handle errors.
  // eslint-disable-next-line no-console
  console.warn('VITE_GEMINI_API_KEY is not set. Gemini analysis will fail until configured.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODEL_NAME = 'gemini-2.0-flash';

export interface AnalyzeParams {
  content: string;
  language: 'en' | 'hi';
  simplificationLevel: SimplificationLevel;
}

export async function analyzeDocumentWithGemini(params: AnalyzeParams): Promise<DocumentAnalysis> {
  const { content, language, simplificationLevel } = params;

  if (!genAI) {
    throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.');
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = buildPrompt(content, language, simplificationLevel);

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const text = response.response.text();
  // Log the raw generated content for debugging/inspection
  // eslint-disable-next-line no-console
  console.log('[Gemini][raw]', text);

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  const analysis = mapToDocumentAnalysis(data);
  // Log the mapped analysis object
  // eslint-disable-next-line no-console
  console.log('[Gemini][mapped]', analysis);
  return analysis;
}

function buildPrompt(content: string, language: 'en' | 'hi', level: SimplificationLevel): string {
  return [
    'You are a legal analyst AI. Analyze the following legal document text and return a strict JSON object that adheres to this TypeScript interface:',
    '',
    'interface Clause {',
    "  id: string;",
    "  title: string;",
    "  originalText: string;",
    "  simplifiedText: string;",
    "  riskLevel: 'low' | 'medium' | 'high';",
    "  explanation: string;",
    '}',
    'interface Risk {',
    "  id: string;",
    "  clause: string;",
    "  description: string;",
    "  severity: 'low' | 'medium' | 'high';",
    "  recommendation: string;",
    '}',
    'interface Citation {',
    '  title: string;',
    '  url: string;',
    '  description: string;',
    '}',
    'interface DocumentAnalysis {',
    '  id: string;',
    '  documentType: string;',
    '  plainSummary: string;',
    '  clauses: Clause[];',
    '  risks: Risk[];',
    '  actionPoints: string[];',
    '  citations: Citation[];',
    '}',
    '',
    `- Language for plainSummary and explanations: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    `- Simplification level for simplifiedText: ${level} (use ${
      level === 'eli5' ? 'very simple, everyday language' : level === 'simple' ? 'clear, non-legal language' : 'concise professional tone'
    }).`,
    '- Keep clause.originalText as quotes from the input where possible.',
    '- Provide realistic, non-fabricated citations with working URLs only if clearly inferable; otherwise return an empty citations array.',
    '- Do not include any commentary outside the JSON. Return ONLY the JSON.',
    '',
    'Document Text:',
    content,
  ].join('\n');
}

function mapToDocumentAnalysis(data: any): DocumentAnalysis {
  // Minimal runtime validation and mapping
  const safeString = (v: any, fallback = ''): string => (typeof v === 'string' ? v : fallback);
  const safeArray = (v: any): any[] => (Array.isArray(v) ? v : []);

  const clauses = safeArray(data.clauses).map((c: any, idx: number) => ({
    id: safeString(c.id, String(idx + 1)),
    title: safeString(c.title),
    originalText: safeString(c.originalText),
    simplifiedText: safeString(c.simplifiedText),
    riskLevel: (['low', 'medium', 'high'] as const).includes(c.riskLevel) ? c.riskLevel : 'medium',
    explanation: safeString(c.explanation),
  }));

  const risks = safeArray(data.risks).map((r: any, idx: number) => ({
    id: safeString(r.id, String(idx + 1)),
    clause: safeString(r.clause),
    description: safeString(r.description),
    severity: (['low', 'medium', 'high'] as const).includes(r.severity) ? r.severity : 'medium',
    recommendation: safeString(r.recommendation),
  }));

  const citations = safeArray(data.citations).map((ct: any) => ({
    title: safeString(ct.title),
    url: safeString(ct.url),
    description: safeString(ct.description),
  }));

  const analysis: DocumentAnalysis = {
    id: safeString(data.id) || String(Date.now()),
    documentType: safeString(data.documentType) || 'Legal Document',
    plainSummary: safeString(data.plainSummary),
    clauses,
    risks,
    actionPoints: safeArray(data.actionPoints).map((s) => safeString(s)).filter(Boolean),
    citations,
  };

  return analysis;
}


