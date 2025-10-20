export type SimplificationLevel = 'professional' | 'simple' | 'eli5';

export type RoleType = 'Tenant' | 'Landlord' | 'Employee' | 'Employer' | 'Consumer' | 'Business';

export interface RolePerspective {
  role: RoleType;
  interpretation: string;
  obligations: string[];
  risks: string[];
}

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  simplifiedText: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  rolePerspectives?: RolePerspective[];
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

export interface TimelineEvent {
  date: string;
  event: string;
  summary: string;
}
export interface DocumentAnalysis {
  id: string;
  documentType: string;
  plainSummary: string;
  clauses: Clause[];
  risks: Risk[];
  actionPoints: string[];
  citations: Citation[];
  timeline?: TimelineEvent[];
  overallRiskLevel?: 'low' | 'medium' | 'high'; // ✅ add this
}

export type EnforceabilityStatus = 'enforceable' | 'restricted' | 'not_enforceable' | 'uncertain';

export interface ClauseEnforceabilityResult {
  clause: string;
  jurisdiction: string;
  simplifiedMeaning: string;
  status: EnforceabilityStatus;
  jurisdictionNotes: string;
  references: Citation[]; // legal principles, statutes, or cases if available
  alternatives?: string[]; // suggested alternative interpretations or language
}

// Visualization types
export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  // ISO date string if absolute, or relative description like "T+30 days after invoice" if relative
  when: string;
  relatedClause?: string; // optional clause title or id
}

export interface ObligationTimeline {
  id: string;
  label: string; // e.g., Payment Schedule, Notice Periods
  milestones: TimelineMilestone[];
}

export interface FlowNode {
  id: string;
  label: string;
  type?: 'start' | 'decision' | 'process' | 'end';
}

export interface FlowEdge {
  from: string; // node id
  to: string;   // node id
  label?: string; // e.g., Yes/No or condition
}

export interface ProcessFlow {
  id: string;
  label: string; // e.g., Termination Process, Renewal Process
  nodes: FlowNode[];
  edges: FlowEdge[];
  relatedClauses?: string[]; // optional
}

export interface ResponsibilityItem {
  topic: string; // e.g., Rent Payment, Repairs, Security Deposit
  partyA: string; // responsibilities for party A (e.g., Tenant/Employee/Consumer)
  partyB: string; // responsibilities for party B (e.g., Landlord/Employer/Business)
  relatedClause?: string;
}

export interface ResponsibilityMatrix {
  label: string; // e.g., Responsibilities Overview
  partyALabel: string; // e.g., Tenant
  partyBLabel: string; // e.g., Landlord
  items: ResponsibilityItem[];
}

export interface VisualizationBundle {
  textSummary: string; // human-readable summary of the visuals
  timelines: ObligationTimeline[];
  flows: ProcessFlow[];
  responsibilities: ResponsibilityMatrix | null;
}