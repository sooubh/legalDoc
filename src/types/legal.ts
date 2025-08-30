export type SimplificationLevel = 'professional' | 'simple' | 'eli5';

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  simplifiedText: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface Risk {
  id: string;
  clause: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface Citation {
  title: string;
  url: string;
  description: string;
}

export interface DocumentAnalysis {
  id: string;
  documentType: string;
  plainSummary: string;
  clauses: Clause[];
  risks: Risk[];
  actionPoints: string[];
  citations: Citation[];
}