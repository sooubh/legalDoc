import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import AppShell from "./components/AppShell";
import DocumentInput from "./components/DocumentInput";
import AnalysisResults from "./components/AnalysisResults";
import type { AnalysisHistoryItem } from "./types/history.ts";
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
import { saveAnalysisToHistory, getAnalysisHistoryForUser } from './services/analysis';
import ChatFloating from "./components/ChatFloating";
import CenteredDesktopChatBot from "./components/CenteredDesktopChatBot";
import Visualizations from "./components/Visualizations";
import ProfilePage from "./components/ProfilePage";
import MorePage from "./components/MorePage";
import FullscreenModal from "./components/FullscreenModal";
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, _setLanguage] = useState<"en" | "hi">("en");
  const [simplificationLevel, _setSimplificationLevel] =
    useState<SimplificationLevel>("simple");

  const [route, setRoute] = useState<
    "login" | "signup" | "upload" | "results" | "visuals" | "chat" | "profile" | "more"
  >("login");
  const [submittedContent, setSubmittedContent] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [visuals, setVisuals] = useState<VisualizationBundle | null>(null);
  const [isVisualsLoading, setIsVisualsLoading] = useState(false);
  const [fs, setFs] = useState<null | {
    key: "analysis" | "visuals" | "document";
  }>(null);

  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setRoute("upload");
        // Load user's analysis history from Firestore
        getAnalysisHistoryForUser().then(setAnalysisHistory);
      } else {
        setUser(null);
        setRoute("login");
        setAnalysisHistory([]); // Clear history on logout
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDocumentSubmit = async (
    content: string,
    fileMeta?: { pdfUrl?: string; mime?: string }
  ) => {
    setIsAnalyzing(true);
    setSubmittedContent(content);
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
      const visualsResult = await generateVisualizationsWithGemini({
        document: content,
        language,
        partyALabel: "Party A",
        partyBLabel: "Party B",
      });
      setVisuals(visualsResult);

      // Save to history in Firestore
      const newAnalysis: Omit<AnalysisHistoryItem, 'id'> = {
        timestamp: Date.now(), // This will be replaced by server timestamp in the backend function
        title: (result as any).plainSummary?.slice(0, 100) || "Document Analysis",
        analysis: result,
        visuals: visualsResult,
        metadata: {
          language,
          simplificationLevel,
          documentType: fileMeta?.mime,
        },
      };
      
      const newId = await saveAnalysisToHistory(newAnalysis);
      const newAnalysisWithId = { ...newAnalysis, id: newId };

      setAnalysisHistory((prev) => [newAnalysisWithId, ...prev].slice(0, 50));
      setSelectedAnalysisId(newAnalysisWithId.id);
      setIsVisualsLoading(false);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please set VITE_GEMINI_API_KEY and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectAnalysis = (item: AnalysisHistoryItem) => {
    setAnalysis(item.analysis);
    setVisuals(item.visuals);
    setSelectedAnalysisId(item.id);
    if (item.metadata) {
      if (item.metadata.language === "en" || item.metadata.language === "hi") {
        _setLanguage(item.metadata.language);
      }
      _setSimplificationLevel(
        item.metadata.simplificationLevel as SimplificationLevel
      );
    }
    setRoute("results");
  };
  
  if (!user) {
    return (
      <div className="w-screen h-screen bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
        <div className="w-full max-w-md">
          {route === 'login' && (
            <>
              <LoginPage />
              <p className="text-center mt-4">
                Don't have an account{' '}
                <button onClick={() => setRoute('signup')} className="text-blue-600 hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}
          {route === 'signup' && (
            <>
              <SignupPage />
              <p className="text-center mt-4">
                Already have an account{' '}
                <button onClick={() => setRoute('login')} className="text-blue-600 hover:underline">
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell
      current={route}
      onNavigate={(r) => setRoute(r as any)}
      analysisHistory={analysisHistory}
      selectedAnalysisId={selectedAnalysisId}
      onSelectAnalysis={handleSelectAnalysis}
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
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 border border-gray-100">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">
                        Analysis
                      </div>
                      <button
                        onClick={() => setFs({ key: "analysis" })}
                        className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Fullscreen
                      </button>
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
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">
                        Visualizations
                      </div>
                      <button
                        onClick={() => setFs({ key: "visuals" })}
                        className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Fullscreen
                      </button>
                    </div>
                    <Visualizations
                      visuals={visuals}
                      isLoading={isVisualsLoading}
                    />
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-4 md:p-6 lg:sticky lg:top-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">
                        Original Document
                      </div>
                      <button
                        onClick={() => setFs({ key: "document" })}
                        className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Fullscreen
                      </button>
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
              <div className="text-gray-600">
                No analysis yet. Upload a document first.
              </div>
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
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 md:p-6">
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
            className="h-full"
          >
            <div className="h-full max-w-4xl mx-auto">
              <CenteredDesktopChatBot />
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
        language={language}
      />

      {fs && (
        <FullscreenModal
          title={
            fs.key === "analysis"
              ? "Analysis"
              : fs.key === "visuals"
              ? "Visualizations"
              : "Original Document"
          }
          onClose={() => setFs(null)}
        >
          {fs.key === "analysis" && (
            <div className="p-4 md:p-6">
              <AnalysisResults
                analysis={analysis as any}
                language={language}
                simplificationLevel={simplificationLevel}
                onNewAnalysis={() => {
                  setAnalysis(null);
                  setRoute("upload");
                  setFs(null);
                }}
              />
            </div>
          )}
          {fs.key === "visuals" && (
            <div className="p-4 md:p-6">
              <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
            </div>
          )}
          {fs.key === "document" && (
            <div className="p-4 md:p-6">
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
