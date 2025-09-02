import React, { useState } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle, Clock, Globe, Search, Download } from 'lucide-react';
import Header from './components/Header';
import DocumentInput from './components/DocumentInput';
import AnalysisResults from './components/AnalysisResults';
// Footer removed per user request
import LoadingScreen from './components/LoadingScreen';
import OriginalContent from './components/OriginalContent';
import { AnimatePresence, motion } from 'framer-motion';
import { DocumentAnalysis, SimplificationLevel } from './types/legal';
import { analyzeDocumentWithGemini } from './services/gemini';

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [simplificationLevel, setSimplificationLevel] = useState<SimplificationLevel>('simple');
  const [submittedContent, setSubmittedContent] = useState<string>('');

  const handleDocumentSubmit = async (content: string) => {
    setIsAnalyzing(true);
    setSubmittedContent(content);
    try {
      const result = await analyzeDocumentWithGemini({
        content,
        language,
        simplificationLevel,
      });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please set VITE_GEMINI_API_KEY and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        language={language} 
        onLanguageChange={setLanguage}
        simplificationLevel={simplificationLevel}
        onSimplificationChange={setSimplificationLevel}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing && (
            <motion.div
              key="input-centered"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <DocumentInput 
                  onSubmit={handleDocumentSubmit} 
                  isAnalyzing={isAnalyzing}
                  language={language}
                />
              </div>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingScreen />
            </motion.div>
          )}

          {analysis && !isAnalyzing && (
            <motion.div
              key="results-split"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="order-2 lg:order-1">
                  <AnalysisResults 
                    analysis={analysis} 
                    language={language}
                    simplificationLevel={simplificationLevel}
                    onNewAnalysis={() => setAnalysis(null)}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <OriginalContent content={submittedContent} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer removed */}
    </div>
  );
}

export default App;