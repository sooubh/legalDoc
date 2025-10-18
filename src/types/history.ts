import type { DocumentAnalysis } from './legal';
import type { VisualizationBundle } from './legal';

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  analysis: DocumentAnalysis;
  visuals: VisualizationBundle | null;
  metadata?: {
    documentType?: string;
    language: 'en' | 'hi';
    simplificationLevel: string;
  };
}

export interface AnalysisHistory {
  items: AnalysisHistoryItem[];
}