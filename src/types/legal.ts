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

export interface AuthenticityAnalysis {
  authenticityScore: number; // 0-100
  isCompliant: boolean;
  compliantWith: string; // e.g., "Indian Contract Act, 1872"
  redFlags: string[];
  safetyScore: number; // 0-100
  safetyAnalysis: string;
  fakeIndication: "Low" | "Medium" | "High";
  recommendation: string;
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
  overallRiskLevel?: 'low' | 'medium' | 'high';
  authenticity?: AuthenticityAnalysis;
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

// Enhanced timeline types for POV-based timelines
export interface POVTimelineEvent {
  title: string;
  subtitle: string;
  date: string;
  description: string;
  color: string;
  icon: 'file' | 'clock' | 'warning' | 'check';
}

export interface POVTimelineData {
  court: POVTimelineEvent[];
  receiver: POVTimelineEvent[];
  overall: POVTimelineEvent[];
}

// Legacy timeline types (deprecated - use POVTimelineData instead)

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
  flows: ProcessFlow[];
  responsibilities: ResponsibilityMatrix | null;
  povTimeline?: POVTimelineData; // New POV-based timeline data
}