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
