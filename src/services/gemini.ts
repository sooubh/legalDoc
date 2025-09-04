import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DocumentAnalysis, SimplificationLevel, ClauseEnforceabilityResult, VisualizationBundle } from '../types/legal';
import type { ChatRequest, ChatMessage } from '../types/chat';

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
    `- Simplification level for simplifiedText: ${level} (use ${
      level === 'eli5' ? 'very simple, everyday language' : level === 'simple' ? 'clear, non-legal language' : 'concise professional tone'
    }).`,
    '- Keep clause.originalText as quotes from the input where possible.',
    "- For each clause, include rolePerspectives with tailored interpretations for relevant roles depending on document type: Tenancy (Tenant/Landlord), Employment (Employee/Employer), Consumer contract (Consumer/Business). If unclear, include the most plausible roles.",
    '- Each role perspective must include: interpretation (plain-language), obligations (bullet-like strings), risks (bullet-like strings).',
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
    rolePerspectives: safeArray(c.rolePerspectives).map((rp: any) => ({
      role: ['Tenant','Landlord','Employee','Employer','Consumer','Business'].includes(rp?.role) ? rp.role : undefined,
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
  if (!genAI) {
    throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.');
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
    contents: [{ role: 'user', parts: [{ text: userPrompt }]}],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const text = response.response.text().trim();
  // eslint-disable-next-line no-console
  console.log('[Gemini][chat]', text);
  return { role: 'model', content: text };
}

export interface EnforceabilityParams {
  clause: string;
  jurisdiction: string; // e.g., "India", "USA-California"
  language: 'en' | 'hi';
}

export async function analyzeClauseEnforceabilityWithGemini(params: EnforceabilityParams): Promise<ClauseEnforceabilityResult> {
  if (!genAI) {
    throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.');
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
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const text = response.response.text();
  // eslint-disable-next-line no-console
  console.log('[Gemini][enforceability][raw]', text);

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse Gemini enforceability response as JSON');
  }

  const safeString = (v: any, fallback = ''): string => (typeof v === 'string' ? v : fallback);
  const safeArray = (v: any): any[] => (Array.isArray(v) ? v : []);
  const validStatus = (s: any): ClauseEnforceabilityResult['status'] => (
    ['enforceable','restricted','not_enforceable','uncertain'].includes(s) ? s : 'uncertain'
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
  if (!genAI) {
    throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.');
  }

  const { document, language, partyALabel = 'Party A', partyBLabel = 'Party B' } = params;
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = [
    'You are a legal analyst AI. Convert the following contract into visualization-ready structures.',
    '',
    'Types:',
    'interface TimelineMilestone { id: string; title: string; description: string; when: string; relatedClause?: string; }',
    'interface ObligationTimeline { id: string; label: string; milestones: TimelineMilestone[]; }',
    "interface FlowNode { id: string; label: string; type?: 'start' | 'decision' | 'process' | 'end'; }",
    'interface FlowEdge { from: string; to: string; label?: string; }',
    'interface ProcessFlow { id: string; label: string; nodes: FlowNode[]; edges: FlowEdge[]; relatedClauses?: string[]; }',
    'interface ResponsibilityItem { topic: string; partyA: string; partyB: string; relatedClause?: string; }',
    'interface ResponsibilityMatrix { label: string; partyALabel: string; partyBLabel: string; items: ResponsibilityItem[]; }',
    'interface VisualizationBundle { textSummary: string; timelines: ObligationTimeline[]; flows: ProcessFlow[]; responsibilities: ResponsibilityMatrix | null; }',
    '',
    `- Language for textSummary and descriptions: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    '- Timelines: Identify concrete time triggers (e.g., "on invoice date", "within 30 days", "at renewal") and convert to milestones.',
    "  - If an absolute date is present use ISO like '2025-01-15'.",
    "  - If relative, keep 'when' as a human-readable relative string like 'T+30 days after invoice'; do not fabricate dates.",
    '- Flows: Extract end-to-end processes (termination, renewal, breach/notice/cure, payment dispute, delivery/acceptance) with decision points.',
    "  - Use node.type: 'start' for entry, 'decision' for branch points, 'process' for actions, 'end' for outcomes.",
    "  - Edges should include concise labels like 'Yes'/'No' or condition names when helpful.",
    '- IDs: Provide stable, unique IDs for nodes/edges/milestones (e.g., flow1_n1).',
    `- Responsibilities: Compare ${partyALabel} vs ${partyBLabel} with clear, concise duties.`,
    '- Use precise clause titles/quotes in relatedClause/relatedClauses when possible.',
    '- Prefer multiple flows if distinct processes exist; prefer multiple timelines if separate schedules exist.',
    '- Return ONLY JSON conforming to VisualizationBundle. Do not add commentary.',
    '',
    'Document:',
    document,
  ].join('\n');

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const text = response.response.text();
  // eslint-disable-next-line no-console
  console.log('[Gemini][visualizations][raw]', text);

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse Gemini visualization response as JSON');
  }

  const safeString = (v: any, fb = '') => (typeof v === 'string' ? v : fb);
  const safeArray = (v: any) => (Array.isArray(v) ? v : []);

  const bundle: VisualizationBundle = {
    textSummary: safeString((data as any)?.textSummary),
    timelines: safeArray((data as any)?.timelines).map((t: any, idx: number) => ({
      id: safeString(t?.id, String(idx + 1)),
      label: safeString(t?.label),
      milestones: safeArray(t?.milestones).map((m: any, midx: number) => ({
        id: safeString(m?.id, `${idx + 1}.${midx + 1}`),
        title: safeString(m?.title),
        description: safeString(m?.description),
        when: safeString(m?.when),
        relatedClause: safeString(m?.relatedClause),
      })),
    })),
    flows: safeArray((data as any)?.flows).map((f: any, fidx: number) => ({
      id: safeString(f?.id, String(fidx + 1)),
      label: safeString(f?.label),
      nodes: safeArray(f?.nodes).map((n: any, nidx: number) => ({
        id: safeString(n?.id, `${fidx + 1}-n${nidx + 1}`),
        label: safeString(n?.label),
        type: ['start','decision','process','end'].includes(n?.type) ? n?.type : undefined,
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

