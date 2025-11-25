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
  alternatives?: string[]; // suggested alternative interpretations or language
}

// Enhanced timeline types for POV-based timelines
export interface POVTimelineEvent {
  title: string;
  subtitle: string;
  date: string;
  description: string;
  color: string;
  icon: 'file' | 'clock' | 'warning' | 'check' | 'money' | 'calendar' | 'contract' | 'alert';
  type?: 'deadline' | 'obligation' | 'event';
  consequence?: string;
  timeRemaining?: string;
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

export interface AuthenticityAnalysis {
  authenticityScore: number;
  safetyScore: number;
  isCompliant: boolean;
  compliantWith: string;
  fakeIndication: 'Low' | 'Medium' | 'High';
  redFlags: string[];
  recommendation: string;
}

export interface NegotiationPoint {
  id: string;
  clauseId: string;
  originalClause: string;
  issue: string;
  counterProposal: string;
  talkingPoint: string;
}

export interface DocumentAnalysis {
  id: string;
  documentType: string;
  plainSummary: string;
  clauses: Clause[];
  risks: Risk[];
  actionPoints: string[];
  citations: Citation[];
  negotiationPoints: NegotiationPoint[];
  authenticity?: AuthenticityAnalysis;
  timeline?: POVTimelineData;
}