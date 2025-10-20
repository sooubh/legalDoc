export interface AnalysisHistoryItem {
  id: string;
  title: string;
  timestamp: number; // milliseconds epoch
  analysis: any; // DocumentAnalysis, kept as any to avoid circular imports here
  visuals: any; // VisualizationBundle
  metadata?: {
    language?: 'en' | 'hi';
    simplificationLevel?: 'professional' | 'simple' | 'eli5';
    documentType?: string;
  };
}

import { Timestamp } from 'firebase/firestore';
import { DocumentAnalysis, SimplificationLevel, VisualizationBundle } from './legal';

export interface AnalysisHistoryItem {
  id: string;
  title: string;
  timestamp: Timestamp;
  analysis: DocumentAnalysis;
  originalContent: string;
  analysisResults: string;
  visuals: VisualizationBundle;
  metadata: {
    language: 'en' | 'hi';
    simplificationLevel: SimplificationLevel;
    documentType?: string;
  };
}
