import { useState } from "react";
import AppShell from "./components/AppShell";
import DocumentInput from "./components/DocumentInput";
import AnalysisResults from "./components/AnalysisResults";
// Footer removed per user request
import LoadingScreen from "./components/LoadingScreen";
import OriginalContent from "./components/OriginalContent";
import { AnimatePresence, motion } from "framer-motion";
import {
  DocumentAnalysis,
  SimplificationLevel,
  VisualizationBundle,
} from "./types/legal";
import {
  analyzeDocumentWithGemini,
  generateVisualizationsWithGemini,
} from "./services/gemini";
import ChatPanel from "./components/ChatPanel";
import ChatFloating from "./components/ChatFloating";
import type { ChatMessage } from "./types/chat";
import { chatWithGemini } from "./services/gemini";
import Visualizations from "./components/Visualizations";
import ProfilePage from "./components/ProfilePage";
import MorePage from "./components/MorePage";
import FullscreenModal from "./components/FullscreenModal";

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, _setLanguage] = useState<"en" | "hi">("en");
  const [simplificationLevel, _setSimplificationLevel] =
    useState<SimplificationLevel>("simple");

  const [route, setRoute] = useState<"upload" | "results" | "visuals" | "chat" | "profile" | "more">("upload");
  const [submittedContent, setSubmittedContent] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [visuals, setVisuals] = useState<VisualizationBundle | null>(null);
  const [isVisualsLoading, setIsVisualsLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<{ id: string; title: string; timestamp: number }[]>(() => {
    try {
      const raw = localStorage.getItem('recentChats');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [fs, setFs] = useState<null | { key: 'analysis' | 'visuals' | 'document' }>(null);

  const handleDocumentSubmit = async (
    content: string,
    fileMeta?: { pdfUrl?: string; mime?: string }
  ) => {
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
        partyALabel: "Party A",
        partyBLabel: "Party B",
      })
        .then(setVisuals)
        .catch((e) => console.warn("Visualization generation failed", e))
        .finally(() => setIsVisualsLoading(false));
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please set VITE_GEMINI_API_KEY and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async (text: string) => {
    const next: ChatMessage = { role: "user", content: text };
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
      // Update recent chats sidebar store
      try {
        const title = (text || 'Message').slice(0, 40);
        const id = String(Date.now());
        const next = [{ id, title, timestamp: Date.now() }, ...recentChats].slice(0, 20);
        setRecentChats(next);
        localStorage.setItem('recentChats', JSON.stringify(next));
      } catch {}
    } catch (err) {
      console.error(err);
      const fallback: ChatMessage = {
        role: "model",
        content:
          language === "hi"
            ? "क्षमा करें, अभी उत्तर देने में समस्या आ रही है।"
            : "Sorry, I could not answer right now.",
      };
      setChatMessages((prev) => [...prev, fallback]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <AppShell
      current={route}
      onNavigate={(r) => setRoute(r as any)}
      recentChats={recentChats}
      onSelectChat={() => { /* could load specific chat if persisted */ }}
    >
      <AnimatePresence mode="wait">
        {route === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <DocumentInput
                onSubmit={(c, meta) => {
                  handleDocumentSubmit(c, meta);
                  setRoute("results");
                }}
                isAnalyzing={isAnalyzing}
                language={language}
              />
            </div>
          </motion.div>
        )}

        {route === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {isAnalyzing ? (
              <LoadingScreen />
            ) : analysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">Analysis</div>
                      <button onClick={() => setFs({ key: 'analysis' })} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Fullscreen</button>
                    </div>
                    <AnalysisResults
                      analysis={analysis}
                      language={language}
                      simplificationLevel={simplificationLevel}
                      onNewAnalysis={() => {
                        setAnalysis(null);
                        setRoute("upload");
                      }}
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">Visualizations</div>
                      <button onClick={() => setFs({ key: 'visuals' })} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Fullscreen</button>
                    </div>
                    <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6 sticky top-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">Original Document</div>
                      <button onClick={() => setFs({ key: 'document' })} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Fullscreen</button>
                    </div>
                    <OriginalContent
                      content={submittedContent}
                      pdfUrl={pdfPreviewUrl ?? undefined}
                      height={"calc(100vh - 96px)"}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">No analysis yet. Upload a document first.</div>
            )}
          </motion.div>
        )}

        {route === "visuals" && (
          <motion.div
            key="visuals"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
            </div>
          </motion.div>
        )}

        {route === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <ChatPanel
                document={submittedContent}
                messages={chatMessages}
                onSend={handleSendChat}
                isBusy={isChatting}
                language={language}
              />
            </div>
          </motion.div>
        )}

        {route === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ProfilePage />
          </motion.div>
        )}

        {route === "more" && (
          <motion.div
            key="more"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <MorePage />
          </motion.div>
        )}
      </AnimatePresence>

      <ChatFloating
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        document={submittedContent}
        messages={chatMessages}
        onSend={handleSendChat}
        isBusy={isChatting}
        language={language}
      />

      {fs && (
        <FullscreenModal
          title={fs.key === 'analysis' ? 'Analysis' : fs.key === 'visuals' ? 'Visualizations' : 'Original Document'}
          onClose={() => setFs(null)}
        >
          {fs.key === 'analysis' && (
            <div className="p-4">
              <AnalysisResults
                analysis={analysis as any}
                language={language}
                simplificationLevel={simplificationLevel}
                onNewAnalysis={() => {
                  setAnalysis(null);
                  setRoute('upload');
                  setFs(null);
                }}
              />
            </div>
          )}
          {fs.key === 'visuals' && (
            <div className="p-4">
              <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
            </div>
          )}
          {fs.key === 'document' && (
            <div className="p-4">
              <OriginalContent
                content={submittedContent}
                pdfUrl={pdfPreviewUrl ?? undefined}
                height={"calc(94vh - 56px)"}
              />
            </div>
          )}
        </FullscreenModal>
      )}
    </AppShell>
  );
}

export default App;
