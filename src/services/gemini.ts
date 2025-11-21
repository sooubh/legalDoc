import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DocumentAnalysis, SimplificationLevel, ClauseEnforceabilityResult, VisualizationBundle } from '../types/legal';
import type { ChatRequest, ChatMessage } from '../types/chat';
import { jsonrepair } from 'jsonrepair';

import { getGeminiApiKey } from '../utils/apiKey';

const getGenAI = () => {
  const key = getGeminiApiKey();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

const MODEL_NAME = 'gemini-2.0-flash';

export interface AnalyzeParams {
  content: string;
  language: 'en' | 'hi';
  simplificationLevel: SimplificationLevel;
}

function truncateForLog(text: string, max = 2000): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + `\n... [truncated ${text.length - max} chars]`;
}

function extractJsonFromText(raw: string): string | null {
  // Prefer fenced ```json blocks
  const fenceMatch = raw.match(/```\s*json\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  // Any fenced block
  const anyFence = raw.match(/```[\s\S]*?```/);
  if (anyFence) {
    const inner = anyFence[0].replace(/```/g, '').trim();
    // Try to locate first { ... }
    const braceStart = inner.indexOf('{');
    if (braceStart >= 0) {
      const sliced = inner.slice(braceStart);
      const balanced = extractBalancedBraces(sliced);
      if (balanced) return balanced;
    }
  }
  // Try directly from the whole text: take substring from first { with balancing
  const start = raw.indexOf('{');
  if (start >= 0) {
    const sliced = raw.slice(start);
    const balanced = extractBalancedBraces(sliced);
    if (balanced) return balanced;
  }
  return null;
}

function extractBalancedBraces(text: string): string | null {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(0, i + 1);
      }
    }
  }
  return null;
}

function tryParse(str: string): any {
  return JSON.parse(str);
}

function tryRepairThenParse(str: string): any {
  const repaired = jsonrepair(str);
  return JSON.parse(repaired);
}

function safeParseJson(raw: string): any {
  // 1) Direct parse
  try {
    return tryParse(raw);
  } catch { }
  // 2) Repair raw then parse
  try {
    return tryRepairThenParse(raw);
  } catch (eRepairRaw) {
    // eslint-disable-next-line no-console
    console.warn('[Gemini][parse] Raw repair failed', { error: eRepairRaw });
  }
  // 3) Extract JSON portion
  const extracted = extractJsonFromText(raw);
  if (extracted) {
    // 3a) Parse extracted
    try {
      return tryParse(extracted);
    } catch { }
    // 3b) Repair extracted then parse
    try {
      return tryRepairThenParse(extracted);
    } catch (eRepairExtracted) {
      // eslint-disable-next-line no-console
      console.error('[Gemini][parse] Failed to parse extracted JSON even after repair', { error: eRepairExtracted, extracted: truncateForLog(extracted) });
      throw eRepairExtracted;
    }
  }
  // eslint-disable-next-line no-console
  console.error('[Gemini][parse] Raw response not JSON', { raw: truncateForLog(raw) });
  throw new Error('Non-JSON response');
}

export async function analyzeDocumentWithGemini(params: AnalyzeParams): Promise<DocumentAnalysis> {
  const { content, language, simplificationLevel } = params;
  const genAI = getGenAI();

  if (!genAI) {
    throw new Error('Missing Gemini API key. Please configure it in Settings.');
  }

  const chunks = splitTextIntoChunks(content, 4000, 400);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Aggregate containers
  const merged: DocumentAnalysis = {
    id: String(Date.now()),
    documentType: '',
    plainSummary: '',
    clauses: [],
    risks: [],
    actionPoints: [],
    citations: [],
  };

  const seenClauseKeys = new Set<string>();
  const seenRiskKeys = new Set<string>();
  const seenAction = new Set<string>();
  const seenCitationUrl = new Set<string>();

  // Analyze each chunk focusing on clauses/risks/actions/citations for reliability
  for (let i = 0; i < chunks.length; i++) {
    const part = chunks[i];
    const prompt = buildChunkPrompt(part, language, simplificationLevel, i + 1, chunks.length);
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const text = response.response.text();
    // eslint-disable-next-line no-console
    console.log('[Gemini][chunk][raw]', { idx: i + 1, of: chunks.length, text: truncateForLog(text) });

    let data: any;
    try {
      data = safeParseJson(text);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Gemini] Failed to parse chunk JSON', { chunk: i + 1, error: err });
      continue;
    }
    const partial = mapToDocumentAnalysis(data);

    // Merge documentType if empty
    if (!merged.documentType && partial.documentType) merged.documentType = partial.documentType;
    // Merge clauses
    for (const c of partial.clauses) {
      const key = `${c.title}::${c.originalText}`.toLowerCase();
      if (key && !seenClauseKeys.has(key)) {
        seenClauseKeys.add(key);
        merged.clauses.push(c);
      }
    }
    // Merge risks
    for (const r of partial.risks) {
      const key = `${r.clause}::${r.description}`.toLowerCase();
      if (key && !seenRiskKeys.has(key)) {
        seenRiskKeys.add(key);
        merged.risks.push(r);
      }
    }
    // Merge actions
    for (const a of partial.actionPoints) {
      const s = (a || '').trim();
      if (s && !seenAction.has(s.toLowerCase())) {
        seenAction.add(s.toLowerCase());
        merged.actionPoints.push(s);
      }
    }
    // Merge citations (validate URL-ish)
    for (const ct of partial.citations) {
      const url = (ct.url || '').trim();
      if (url && isLikelyUrl(url) && !seenCitationUrl.has(url)) {
        seenCitationUrl.add(url);
        merged.citations.push(ct);
      }
    }
  }

  // Build a final concise summary if empty
  if (!merged.plainSummary) {
    try {
      const sumPrompt = buildSummaryPrompt({
        language,
        level: simplificationLevel,
        clauses: merged.clauses.slice(0, 30), // keep short
        risks: merged.risks.slice(0, 30),
      });
      const sumResp = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: sumPrompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      });
      merged.plainSummary = sumResp.response.text().trim();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Gemini][summary] Failed to build final summary', e);
    }
  }

  if (!merged.documentType) merged.documentType = 'Legal Document';
  // eslint-disable-next-line no-console
  console.log('[Gemini][merged]', {
    clauses: merged.clauses.length,
    risks: merged.risks.length,
    actions: merged.actionPoints.length,
    citations: merged.citations.length,
  });
  return merged;
}

function buildPrompt(content: string, language: 'en' | 'hi', level: SimplificationLevel): string {
  return [
    'You are a legal analyst AI. Analyze the following legal document text and return ONLY a strict JSON object conforming to this schema. Do not include any commentary or markdown fences.',
    '',
    'interface Clause {',
    "  id: string;",
    "  title: string;",
    "  originalText: string;",
    "  simplifiedText: string;",
    "  riskLevel: 'low' | 'medium' | 'high';",
    "  explanation: string;",
    "  rolePerspectives?: { role: 'Tenant' | 'Landlord' | 'Employee' | 'Employer' | 'Consumer' | 'Business'; interpretation: string; obligations: string[]; risks: string[]; }[];",
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
    `- Simplification level for simplifiedText: ${level} (use ${level === 'eli5' ? 'very simple, everyday language' : level === 'simple' ? 'clear, non-legal language' : 'concise professional tone'
    }).`,
    '- Keep clause.originalText as quotes from the input where possible.',
    "- For each clause, include rolePerspectives with tailored interpretations for relevant roles depending on document type: Tenancy (Tenant/Landlord), Employment (Employee/Employer), Consumer contract (Consumer/Business). If unclear, include the most plausible roles.",
    '- Each role perspective must include: interpretation (plain-language), obligations (bullet-like strings), risks (bullet-like strings).',
    '- Provide realistic, non-fabricated citations with working URLs only if clearly inferable; otherwise return an empty citations array.',
    '- Return ONLY JSON. No markdown, no code fences, no commentary.',
    '',
    'Document Text:',
    content,
  ].join('\n');
}

function buildChunkPrompt(content: string, language: 'en' | 'hi', level: SimplificationLevel, index: number, total: number): string {
  return [
    `You are a legal analyst AI. You will receive chunk ${index}/${total} of a legal document. Analyze ONLY this chunk and return a strict JSON object with these fields:`,
    '',
    'interface Clause { id: string; title: string; originalText: string; simplifiedText: string; riskLevel: "low" | "medium" | "high"; explanation: string; rolePerspectives?: { role: "Tenant" | "Landlord" | "Employee" | "Employer" | "Consumer" | "Business"; interpretation: string; obligations: string[]; risks: string[]; }[] }',
    'interface Risk { id: string; clause: string; description: string; severity: "low" | "medium" | "high"; recommendation: string; }',
    'interface Citation { title: string; url: string; description: string; }',
    'interface DocumentAnalysis { documentType?: string; plainSummary?: string; clauses: Clause[]; risks: Risk[]; actionPoints: string[]; citations: Citation[]; }',
    '',
    `- Language for explanations: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    `- Simplification level for simplifiedText: ${level}.`,
    '- Do not fabricate. If a field is not inferable from this chunk, leave it empty (e.g., empty arrays).',
    '- Prefer quoting clause.originalText from this chunk.',
    '- Citations must have plausible working URLs; otherwise return an empty array.',
    '- Return ONLY JSON. No commentary.',
    '',
    'Chunk Text:',
    content,
  ].join('\n');
}

function buildSummaryPrompt(input: { language: 'en' | 'hi'; level: SimplificationLevel; clauses: any[]; risks: any[]; }): string {
  return [
    'Write a concise plain-language summary (4-6 sentences) of the contract based on the following extracted clauses and risks. Return plain text only.',
    `Language: ${input.language === 'hi' ? 'Hindi' : 'English'}. Tone: ${input.level === 'eli5' ? 'very simple' : input.level === 'simple' ? 'clear, non-legal' : 'concise professional'}.`,
    '',
    'Clauses:',
    JSON.stringify(input.clauses.slice(0, 20)),
    '',
    'Risks:',
    JSON.stringify(input.risks.slice(0, 20)),
  ].join('\n');
}

function splitTextIntoChunks(text: string, targetLen = 4000, overlap = 400): string[] {
  if (!text || text.length <= targetLen) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + targetLen);
    let slice = text.slice(start, end);
    // try to end at paragraph boundary
    const lastBreak = slice.lastIndexOf('\n\n');
    if (end < text.length && lastBreak > targetLen * 0.6) {
      slice = slice.slice(0, lastBreak);
    }
    chunks.push(slice);
    if (end >= text.length) break;
    start = start + (slice.length - Math.min(overlap, slice.length));
  }
  return chunks;
}

function isLikelyUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return !!url.protocol && !!url.hostname;
  } catch { }
  return false;
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
    rolePerspectives: safeArray(c.rolePerspectives).map((rp: any) => ({
      role: ['Tenant', 'Landlord', 'Employee', 'Employer', 'Consumer', 'Business'].includes(rp?.role) ? rp.role : undefined,
      interpretation: safeString(rp?.interpretation),
      obligations: safeArray(rp?.obligations).map((s) => safeString(s)).filter(Boolean),
      risks: safeArray(rp?.risks).map((s) => safeString(s)).filter(Boolean),
    })).filter((rp: any) => rp.role && (rp.interpretation || rp.obligations.length || rp.risks.length)),
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

export async function chatWithGemini(req: ChatRequest): Promise<ChatMessage> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('Missing Gemini API key. Please configure it in Settings.');
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const systemPreamble = [
    'You are LegalEase AI, a helpful legal assistant that answers questions strictly based on the provided document content and the ongoing conversation history.',
    'Behavior rules:',
    '- Use the uploaded document as the ground truth. If the answer is not in the document, say you are unsure and suggest what to look for.',
    '- Keep answers concise and clear. Use bullet points when helpful.',
    '- Respect the selected language for your responses.',
    '- Maintain context and refer back to earlier messages naturally.',
    '',
    'When the current question is a hypothetical or "what-if" scenario (e.g., breaking a lease early, rent increase, late payment, termination, warranty issues), produce a structured scenario analysis with these sections:',
    '1) Short Summary: A one-paragraph summary of likely outcomes.',
    '2) What the Contract Says: Cite relevant clause titles or quotes from the provided document only.',
    '3) Risks and Penalties: Enumerate fees, damages, notices, cure periods, or other consequences described in the document.',
    '4) Alternative Actions: List practical options available under the contract (e.g., negotiate, notice, cure rights, assignment/sublet, dispute resolution).',
    '5) Plain-Language Explanation: Simple explanation for a non-lawyer.',
    '',
    'If the document does not address the scenario explicitly, say so and suggest what clause(s) to look for (e.g., early termination, liquidated damages, rent escalation, force majeure, non-compete, severability). Do not invent terms not present in the document.',
  ].join('\n');

  // Build a single message with document and a compacted history to reduce token use
  const historyText = req.history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const userPrompt = [
    systemPreamble,
    '',
    `Language: ${req.language === 'hi' ? 'Hindi' : 'English'}`,
    '',
    'Document Context (verbatim):',
    '---',
    req.document,
    '---',
    '',
    'Conversation so far:',
    historyText || '(no prior messages) ',
    '',
    'Current user question:',
    req.message,
  ].join('\n');

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const text = response.response.text().trim();
  // eslint-disable-next-line no-console
  console.log('[Gemini][chat]', truncateForLog(text));
  return { role: 'model', content: text };
}

export interface EnforceabilityParams {
  clause: string;
  jurisdiction: string; // e.g., "India", "USA-California"
  language: 'en' | 'hi';
}

export async function analyzeClauseEnforceabilityWithGemini(params: EnforceabilityParams): Promise<ClauseEnforceabilityResult> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('Missing Gemini API key. Please configure it in Settings.');
  }

  const { clause, jurisdiction, language } = params;
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = [
    'You are a legal analyst AI. Given a single legal clause and a specified jurisdiction, return a strict JSON object describing its meaning and enforceability:',
    '',
    'type EnforceabilityStatus = "enforceable" | "restricted" | "not_enforceable" | "uncertain";',
    'interface Citation { title: string; url: string; description: string; }',
    'interface ClauseEnforceabilityResult {',
    '  clause: string;',
    '  jurisdiction: string;',
    '  simplifiedMeaning: string;',
    '  status: EnforceabilityStatus;',
    '  jurisdictionNotes: string;',
    '  references: Citation[];',
    '  alternatives?: string[];',
    '}',
    '',
    `- Language for outputs (simplifiedMeaning, jurisdictionNotes): ${language === 'hi' ? 'Hindi' : 'English'}.`,
    '- Assess enforceability only at a high level based on general legal principles; do not fabricate certainty.',
    '- Provide references only if they are plausible and have working URLs; otherwise return an empty array.',
    '- Do not include any commentary outside the JSON. Return ONLY the JSON.',
    '',
    'Inputs:',
    `Jurisdiction: ${jurisdiction}`,
    'Clause:',
    clause,
  ].join('\n');

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const text = response.response.text();
  // eslint-disable-next-line no-console
  console.log('[Gemini][enforceability][raw]', truncateForLog(text));

  let data: unknown;
  try {
    data = safeParseJson(text);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Gemini] Failed to parse enforceability JSON', { error: err, raw: truncateForLog(text) });
    throw new Error('Failed to parse Gemini enforceability response as JSON');
  }

  const safeString = (v: any, fallback = ''): string => (typeof v === 'string' ? v : fallback);
  const safeArray = (v: any): any[] => (Array.isArray(v) ? v : []);
  const validStatus = (s: any): ClauseEnforceabilityResult['status'] => (
    ['enforceable', 'restricted', 'not_enforceable', 'uncertain'].includes(s) ? s : 'uncertain'
  ) as ClauseEnforceabilityResult['status'];

  const result: ClauseEnforceabilityResult = {
    clause: safeString((data as any)?.clause) || clause,
    jurisdiction: safeString((data as any)?.jurisdiction) || jurisdiction,
    simplifiedMeaning: safeString((data as any)?.simplifiedMeaning),
    status: validStatus((data as any)?.status),
    jurisdictionNotes: safeString((data as any)?.jurisdictionNotes),
    references: safeArray((data as any)?.references).map((ct: any) => ({
      title: safeString(ct?.title),
      url: safeString(ct?.url),
      description: safeString(ct?.description),
    })).filter((ct: any) => ct.title && ct.url),
    alternatives: safeArray((data as any)?.alternatives).map((s) => safeString(s)).filter(Boolean),
  };

  // eslint-disable-next-line no-console
  console.log('[Gemini][enforceability][mapped]', result);
  return result;
}

export interface VisualizationParams {
  document: string;
  language: 'en' | 'hi';
  partyALabel?: string; // e.g., Tenant/Employee/Consumer
  partyBLabel?: string; // e.g., Landlord/Employer/Business
}

export async function generateVisualizationsWithGemini(params: VisualizationParams): Promise<VisualizationBundle> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('Missing Gemini API key. Please configure it in Settings.');
  }

  const { document, language, partyALabel = 'Party A', partyBLabel = 'Party B' } = params;
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = [
    'You are a legal analyst AI. Convert the following contract into visualization-ready structures.',
    '',
    'Types:',
    "interface FlowNode { id: string; label: string; type?: 'start' | 'decision' | 'process' | 'end'; }",
    'interface FlowEdge { from: string; to: string; label?: string; }',
    'interface ProcessFlow { id: string; label: string; nodes: FlowNode[]; edges: FlowEdge[]; relatedClauses?: string[]; }',
    'interface ResponsibilityItem { topic: string; partyA: string; partyB: string; relatedClause?: string; }',
    'interface ResponsibilityMatrix { label: string; partyALabel: string; partyBLabel: string; items: ResponsibilityItem[]; }',
    'interface POVTimelineEvent { title: string; subtitle: string; date: string; description: string; color: string; icon: "file" | "clock" | "warning" | "check"; }',
    'interface POVTimelineData { court: POVTimelineEvent[]; receiver: POVTimelineEvent[]; overall: POVTimelineEvent[]; }',
    'interface VisualizationBundle { textSummary: string; flows: ProcessFlow[]; responsibilities: ResponsibilityMatrix | null; povTimeline?: POVTimelineData; }',
    '',
    `- Language for textSummary and descriptions: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    '- Flows: Extract end-to-end processes (termination, renewal, breach/notice/cure, payment dispute, delivery/acceptance) with decision points.',
    "  - Use node.type: 'start' for entry, 'decision' for branch points, 'process' for actions, 'end' for outcomes.",
    "  - Edges should include concise labels like 'Yes'/'No' or condition names when helpful.",
    '- IDs: Provide stable, unique IDs for nodes/edges (e.g., flow1_n1).',
    `- Responsibilities: Compare ${partyALabel} vs ${partyBLabel} with clear, concise duties.`,
    '- POV Timeline: Create a comprehensive legal process timeline with three perspectives:',
    '  - court: Events from court/judicial perspective (filing, hearings, decisions)',
    '  - receiver: Events from the party receiving legal notice (receipt, response, compliance)',
    '  - overall: General process events that affect both parties',
    '  - Use realistic dates (ISO format) and appropriate colors: bg-blue-* for court, bg-red-* for receiver, bg-gray-* for overall',
    '  - Use appropriate icons: "file" for documents, "clock" for scheduling, "warning" for alerts, "check" for completion',
    '  - Generate 4-6 events per perspective with logical chronological order',
    '- Use precise clause titles/quotes in relatedClause/relatedClauses when possible.',
    '- Prefer multiple flows if distinct processes exist.',
    '- Return ONLY JSON conforming to VisualizationBundle. Do not add commentary.',
    '',
    'Document:',
    document,
  ].join('\n');

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const text = response.response.text();
  // eslint-disable-next-line no-console
  console.log('[Gemini][visualizations][raw]', truncateForLog(text));

  let data: unknown;
  try {
    data = safeParseJson(text);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Gemini] Failed to parse visualization JSON', { error: err, raw: truncateForLog(text) });
    throw new Error('Failed to parse Gemini visualization response as JSON');
  }

  const safeString = (v: any, fb = '') => (typeof v === 'string' ? v : fb);
  const safeArray = (v: any) => (Array.isArray(v) ? v : []);

  const bundle: VisualizationBundle = {
    textSummary: safeString((data as any)?.textSummary),
    povTimeline: (data as any)?.povTimeline ? {
      court: safeArray((data as any).povTimeline.court).map((e: any) => ({
        title: safeString(e.title),
        subtitle: safeString(e.subtitle),
        date: safeString(e.date),
        description: safeString(e.description),
        color: safeString(e.color),
        icon: ["file", "clock", "warning", "check"].includes(e.icon) ? e.icon : "file",
      })),
      receiver: safeArray((data as any).povTimeline.receiver).map((e: any) => ({
        title: safeString(e.title),
        subtitle: safeString(e.subtitle),
        date: safeString(e.date),
        description: safeString(e.description),
        color: safeString(e.color),
        icon: ["file", "clock", "warning", "check"].includes(e.icon) ? e.icon : "file",
      })),
      overall: safeArray((data as any).povTimeline.overall).map((e: any) => ({
        title: safeString(e.title),
        subtitle: safeString(e.subtitle),
        date: safeString(e.date),
        description: safeString(e.description),
        color: safeString(e.color),
        icon: ["file", "clock", "warning", "check"].includes(e.icon) ? e.icon : "file",
      })),
    } : undefined,
    flows: safeArray((data as any)?.flows).map((f: any, fidx: number) => ({
      id: safeString(f?.id, String(fidx + 1)),
      label: safeString(f?.label),
      nodes: safeArray(f?.nodes).map((n: any, nidx: number) => ({
        id: safeString(n?.id, `${fidx + 1}-n${nidx + 1}`),
        label: safeString(n?.label),
        type: ['start', 'decision', 'process', 'end'].includes(n?.type) ? n?.type : undefined,
      })),
      edges: safeArray(f?.edges).map((e: any) => ({
        from: safeString(e?.from),
        to: safeString(e?.to),
        label: safeString(e?.label),
      })),
      relatedClauses: safeArray(f?.relatedClauses).map((s: any) => safeString(s)).filter(Boolean),
    })),
    responsibilities: (data as any)?.responsibilities ? {
      label: safeString((data as any).responsibilities?.label),
      partyALabel: safeString((data as any).responsibilities?.partyALabel, partyALabel),
      partyBLabel: safeString((data as any).responsibilities?.partyBLabel, partyBLabel),
      items: safeArray((data as any).responsibilities?.items).map((it: any) => ({
        topic: safeString(it?.topic),
        partyA: safeString(it?.partyA),
        partyB: safeString(it?.partyB),
        relatedClause: safeString(it?.relatedClause),
      })),
    } : null,
  };

  // eslint-disable-next-line no-console
  console.log('[Gemini][visualizations][mapped]', bundle);
  return bundle;
}

