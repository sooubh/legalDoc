import React, { useState } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle, Clock, Globe, Search, Download } from 'lucide-react';
import Header from './components/Header';
import DocumentInput from './components/DocumentInput';
import AnalysisResults from './components/AnalysisResults';
// Footer removed per user request
import LoadingScreen from './components/LoadingScreen';
import OriginalContent from './components/OriginalContent';
import { AnimatePresence, motion } from 'framer-motion';
import { DocumentAnalysis, SimplificationLevel, VisualizationBundle } from './types/legal';
import { analyzeDocumentWithGemini, generateVisualizationsWithGemini } from './services/gemini';
import ChatPanel from './components/ChatPanel';
import ChatFloating from './components/ChatFloating';
import type { ChatMessage } from './types/chat';
import { chatWithGemini } from './services/gemini';
import Visualizations from './components/Visualizations';

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [simplificationLevel, setSimplificationLevel] = useState<SimplificationLevel>('simple');
  const [submittedContent, setSubmittedContent] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [visuals, setVisuals] = useState<VisualizationBundle | null>(null);
  const [isVisualsLoading, setIsVisualsLoading] = useState(false);

  const handleDocumentSubmit = async (content: string, fileMeta?: { pdfUrl?: string; mime?: string }) => {
    setIsAnalyzing(true);
    setSubmittedContent(content);
    setChatMessages([]);
    setPdfPreviewUrl(fileMeta?.pdfUrl ?? null);
    try {
      const result = await analyzeDocumentWithGemini({
        content,
        language,
        simplificationLevel,
      });
      setAnalysis(result);

      // Generate visualization bundle in the background
      setIsVisualsLoading(true);
      generateVisualizationsWithGemini({
        document: content,
        language,
        partyALabel: 'Party A',
        partyBLabel: 'Party B',
      })
        .then(setVisuals)
        .catch((e) => console.warn('Visualization generation failed', e))
        .finally(() => setIsVisualsLoading(false));
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please set VITE_GEMINI_API_KEY and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async (text: string) => {
    const next: ChatMessage = { role: 'user', content: text };
    setChatMessages((prev) => [...prev, next]);
    setIsChatting(true);
    try {
      const reply = await chatWithGemini({
        document: submittedContent,
        language,
        history: chatMessages,
        message: text,
      });
      setChatMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error(err);
      const fallback: ChatMessage = {
        role: 'model',
        content: language === 'hi' ? 'क्षमा करें, अभी उत्तर देने में समस्या आ रही है।' : 'Sorry, I could not answer right now.',
      };
      setChatMessages((prev) => [...prev, fallback]);
    } finally {
      setIsChatting(false);
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="order-2 lg:order-1 lg:col-span-2">
                  <AnalysisResults 
                    analysis={analysis} 
                    language={language}
                    simplificationLevel={simplificationLevel}
                    onNewAnalysis={() => setAnalysis(null)}
                  />
                  <div className="mt-6">
                    <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <OriginalContent content={submittedContent} pdfUrl={pdfPreviewUrl ?? undefined} />
                  <div className="mt-6">
                    <ChatPanel
                      document={submittedContent}
                      messages={chatMessages}
                      onSend={handleSendChat}
                      isBusy={isChatting}
                      language={language}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer removed */}

      {/* Floating Chat */}
      <ChatFloating
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        document={submittedContent}
        messages={chatMessages}
        onSend={handleSendChat}
        isBusy={isChatting}
        language={language}
      />
    </div>
  );
}

export default App;