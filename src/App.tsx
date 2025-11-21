  import { useState, useEffect } from "react";
  import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
  import AppShell from "./components/AppShell";
  import DocumentInput from "./components/DocumentInput";
  import AnalysisResults from "./analysis/AnalysisResults";
  import type { AnalysisHistoryItem } from "./types/history";
  import LoadingScreen from "./components/LoadingScreen";
  import OriginalContent from "./components/OriginalContent";
  import { AnimatePresence, motion } from "framer-motion";
  import LawyerLocatorPage from "./pages/LawyerLocatorPage";
  import {
    DocumentAnalysis,
    SimplificationLevel,
    VisualizationBundle,
  } from "./types/legal";
  import {
    analyzeDocumentWithGemini,
    generateVisualizationsWithGemini,
    analyzeDocumentAuthenticity,
  } from "./services/gemini";
  import {
    saveAnalysisToHistory,
    getAnalysisHistoryForUser,
    deleteAnalysisFromHistory,
  } from "./services/analysis";
import { subscribeToUserProfile, getUserProfile, updateUserPreferences } from "./services/userService";
  import Visualizations from "./components/Visualizations";
import ProfilePage from "./pages/ProfilePage";
import MorePage from "./pages/MorePage";
import FullscreenModal from "./components/FullscreenModal";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatFloating from "./chatbot/ChatFloating";
import RoadmapPage from "./pages/RoadmapPage";
import VideoShowcasePage from "./pages/VideoShowcasePage";
import VideoShowcaseModal from "./components/VideoShowcaseModal";
import SettingsPage from "./pages/SettingsPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

  // Define a type for the route
  export type Route =
    | "login"
    | "signup"
    | "upload"
    | "results"
    | "visuals"
    | "profile"
    | "more"
    | "lawyer"
    | "roadmap"
    | "video"
    | "settings"
    | "terms"
    | "privacy";

  function App() {
  const [user, setUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    const saved = localStorage.getItem("language");
    return (saved === "en" || saved === "hi") ? saved : "en";
  });
  const [showLanguageModal, setShowLanguageModal] = useState(() => {
    const hasSelected = localStorage.getItem("language") !== null;
    return !hasSelected;
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [simplificationLevel, _setSimplificationLevel] =
    useState<SimplificationLevel>("simple");

    const [route, setRoute] = useState<Route>("upload");
    const [submittedContent, setSubmittedContent] = useState<string>("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [visuals, setVisuals] = useState<VisualizationBundle | null>(null);
    const [isVisualsLoading, setIsVisualsLoading] = useState(false);
    const [fs, setFs] = useState<null | {
      key: "analysis" | "visuals" | "document";
    }>(null);
    // Default minimized
    const [isDocumentMinimized, setIsDocumentMinimized] = useState(true);

    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>(
      []
    );
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Load local analyses from localStorage
    const loadLocalAnalyses = (): AnalysisHistoryItem[] => {
      try {
        const raw = localStorage.getItem("localAnalyses");
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? (arr as AnalysisHistoryItem[]) : [];
      } catch (e) {
        console.error("Failed to load localAnalyses", e);
        return [];
      }
    };

    const appendLocalAnalysis = (entry: AnalysisHistoryItem) => {
      try {
        const current = loadLocalAnalyses();
        const next = [entry, ...current].slice(0, 100);
        localStorage.setItem("localAnalyses", JSON.stringify(next));
        setAnalysisHistory(next);
      } catch (e) {
        console.error("Failed to append to localAnalyses", e);
      }
    };

    // Firebase Auth state observer with realtime profile sync
    useEffect(() => {
      const auth = getAuth();
      let profileUnsubscribe: (() => void) | null = null;

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          // Close login/signup modals when user successfully authenticates
          if (route === "login" || route === "signup") {
            const previousRoute = localStorage.getItem("previousRoute") || "upload";
            setRoute(previousRoute as Route);
            localStorage.removeItem("previousRoute");
          }
          setAnalysisHistory(loadLocalAnalyses());

          // Get user profile from Firestore and sync preferences
          try {
            const profile = await getUserProfile(user.uid);
            if (profile?.preferences) {
              // Sync language preference from Firestore
              if (profile.preferences.language && profile.preferences.language !== language) {
                setLanguage(profile.preferences.language);
                localStorage.setItem("language", profile.preferences.language);
              }
            }
          } catch (error) {
            console.warn("Failed to load user profile:", error);
          }

          // Subscribe to realtime user profile updates
          profileUnsubscribe = subscribeToUserProfile(user.uid, (profile) => {
            if (profile?.preferences) {
              // Sync language preference in realtime
              if (profile.preferences.language && profile.preferences.language !== language) {
                setLanguage(profile.preferences.language);
                localStorage.setItem("language", profile.preferences.language);
              }
            }
          });

          getAnalysisHistoryForUser()
            .then(setAnalysisHistory)
            .catch((error) => {
              console.warn(
                "Failed to load Firestore history, using local only:",
                error
              );
            });

          const unsavedAnalysisJson = localStorage.getItem("unsavedAnalysis");
          if (unsavedAnalysisJson) {
            const unsavedAnalysis = JSON.parse(unsavedAnalysisJson);
            setAnalysis(unsavedAnalysis.analysis);
            setVisuals(unsavedAnalysis.visuals);
            setSubmittedContent(unsavedAnalysis.submittedContent);
            setPdfPreviewUrl(unsavedAnalysis.pdfPreviewUrl);
            setLanguage(unsavedAnalysis.language);
            _setSimplificationLevel(unsavedAnalysis.simplificationLevel);
            setRoute("results");
          } else {
            setRoute("upload");
          }
        } else {
          setUser(null);
          setAnalysisHistory([]);
          // Unsubscribe from profile updates when user logs out
          if (profileUnsubscribe) {
            profileUnsubscribe();
            profileUnsubscribe = null;
          }
        }
      });
      return () => {
        unsubscribe();
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }
      };
    }, []);
    // Handle new document upload
    const handleLanguageChange = (lang: "en" | "hi") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setShowLanguageModal(false);
    // Update language preference in Firestore if user is logged in
    if (user) {
      updateUserPreferences(user.uid, { language: lang }).catch((error) => {
        console.warn("Failed to update language preference in Firestore:", error);
      });
    }
    // Show video modal after language selection if not seen yet
    const hasSeenVideo = localStorage.getItem("videoShowcaseSeen") === "true";
    if (!hasSeenVideo) {
      setTimeout(() => setShowVideoModal(true), 800);
    }
  };

  // Check on mount if video should be shown (for users who already have language selected)
  useEffect(() => {
    const hasSeenVideo = localStorage.getItem("videoShowcaseSeen") === "true";
    const hasSelectedLanguage = localStorage.getItem("language") !== null;
    
    // Show video modal if language is already selected and video hasn't been seen
    if (hasSelectedLanguage && !hasSeenVideo) {
      // Wait a bit for the app to initialize
      const timer = setTimeout(() => {
        setShowVideoModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVideoModalClose = () => {
    setShowVideoModal(false);
    localStorage.setItem("videoShowcaseSeen", "true");
  };

  const handleDocumentSubmit = async (
      content: string,
      fileMeta?: { pdfUrl?: string; mime?: string }
    ) => {
      setIsAnalyzing(true);
      setSubmittedContent(content);
      setPdfPreviewUrl(fileMeta?.pdfUrl ?? null);
      setSelectedAnalysisId(undefined);

      try {
        const result = await analyzeDocumentWithGemini({
          content,
          language,
          simplificationLevel,
        });
        setAnalysis(result);
        setRoute("results");



        // Generate visualizations
        setIsVisualsLoading(true);
        const visualsResult = await generateVisualizationsWithGemini({
          document: content,
          language,
          partyALabel: "Party A",
          partyBLabel: "Party B",
        });
        setVisuals(visualsResult);
        setIsVisualsLoading(false);

        // Run Authenticity Check
        try {
            const authResult = await analyzeDocumentAuthenticity(content, language);
            setAnalysis(prev => prev ? { ...prev, authenticity: authResult } : null);
        } catch (e) {
            console.error("Authenticity check failed", e);
        }

        // Save unsaved analysis to localStorage
        const unsavedAnalysis = {
          analysis: result,
          visuals: visualsResult,
          submittedContent: content,
          pdfPreviewUrl: fileMeta?.pdfUrl ?? null,
          language,
          simplificationLevel,
        };
        localStorage.setItem("unsavedAnalysis", JSON.stringify(unsavedAnalysis));

        // Add to local history
        const localItem: AnalysisHistoryItem = {
          id: `local-${Date.now()}`,
          title: result.documentType?.slice(0, 100) || "Document Analysis",
          analysis: result,
          originalContent: content,
          analysisResults: JSON.stringify(result),
          visuals: visualsResult,
          metadata: { language, simplificationLevel },
          timestamp: new Date() as any,
        };
        appendLocalAnalysis(localItem);
      } catch (err: any) {
        console.error(err);
        if (err.message && (err.message.includes("API key") || err.message.includes("VITE_GEMINI_API_KEY"))) {
            if (confirm(language === "hi" ? "API कुंजी गायब है। क्या आप इसे सेटिंग्स में कॉन्फ़िगर करना चाहते हैं?" : "Missing API Key. Go to Settings to configure it?")) {
                setRoute("settings");
            }
        } else {
            alert(language === "hi" ? "विश्लेषण विफल रहा। कृपया पुन: प्रयास करें।" : "Analysis failed. Please try again.");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Save analysis to Firestore
    const handleSaveAnalysis = async () => {
      if (!analysis || !submittedContent || !visuals) return;

      // Check if user is authenticated
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      const newAnalysis: Omit<AnalysisHistoryItem, "id"> = {
        title: analysis.documentType?.slice(0, 100) || "Document Analysis",
        analysis: analysis,
        originalContent: submittedContent,
        analysisResults: JSON.stringify(analysis),
        visuals: visuals,
        metadata: { language, simplificationLevel },
        timestamp: Date.now(),
      };

      try {
        const newId = await saveAnalysisToHistory(newAnalysis);
        const newAnalysisWithId = { ...newAnalysis, id: newId };

        setAnalysisHistory((prev) => [newAnalysisWithId, ...prev].slice(0, 50));
        setSelectedAnalysisId(newAnalysisWithId.id);

        localStorage.removeItem("unsavedAnalysis");
      } catch (error) {
        console.error("Failed to save analysis:", error);
        alert("There was an error saving your analysis. Please try again.");
      }
    };

    const handleDownloadPdf = async () => {
      if (!analysis || !visuals) return;

      setIsGeneratingPdf(true);
      try {
        const { generatePdfHtmlFromAnalysis } = await import("./pdfDownlode/generatePdfFromAnalysis.ts");
        await generatePdfHtmlFromAnalysis(analysis);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setIsGeneratingPdf(false);
      }
    };

    const handleLogout = async () => {
      try {
        await signOut(getAuth());
        setRoute("upload");
      } catch (error) {
        console.error("Failed to sign out:", error);
      }
    };

    const handleFetchHistory = async () => {
      try {
        const items = await getAnalysisHistoryForUser();
        setAnalysisHistory(items);
      } catch (e) {
        console.error("Failed to fetch analysis history:", e);
        alert("Failed to fetch analysis history.");
      }
    };

    const handleDeleteAnalysis = async (id: string) => {
      if (!confirm(language === "hi" ? "क्या आप वाकई इस विश्लेषण को हटाना चाहते हैं?" : "Are you sure you want to delete this analysis?")) {
        return;
      }

      try {
        // Optimistic update
        const previousHistory = [...analysisHistory];
        setAnalysisHistory(prev => prev.filter(item => item.id !== id));

        // If it's the currently selected analysis, clear it
        if (selectedAnalysisId === id) {
          handleNewAnalysis();
        }

        // Delete from storage
        await deleteAnalysisFromHistory(id);

        // Update local storage if it was a local item
        if (id.startsWith("local-")) {
          const localAnalyses = loadLocalAnalyses();
          const updatedLocal = localAnalyses.filter(item => item.id !== id);
          localStorage.setItem("localAnalyses", JSON.stringify(updatedLocal));
        }
      } catch (error) {
        console.error("Failed to delete analysis:", error);
        alert("Failed to delete analysis. Please try again.");
        // Revert optimistic update on error
        handleFetchHistory();
      }
    };

    const handleSelectAnalysis = (item: AnalysisHistoryItem) => {
      setAnalysis(item.analysis);
      setVisuals(item.visuals);
      setSelectedAnalysisId(item.id);
      if (item.metadata) {
        if (item.metadata.language === "en" || item.metadata.language === "hi") {
          setLanguage(item.metadata.language);
        }
        _setSimplificationLevel(
          item.metadata.simplificationLevel as SimplificationLevel
        );
      }
      setRoute("results");
      localStorage.removeItem("unsavedAnalysis");
    };

    const handleNewAnalysis = () => {
      setAnalysis(null);
      setVisuals(null);
      setSubmittedContent("");
      setSelectedAnalysisId(undefined);
      setRoute("upload");
      localStorage.removeItem("unsavedAnalysis");
    };

    const handleToggleChat = () => {
      setIsChatOpen(!isChatOpen);
    };

    const documentContext = submittedContent || "";

    return (
      <div className="min-h-screen bg-background">
        {/* Video Showcase Modal - Fullscreen Popup for New Users */}
        {showVideoModal && (
          <VideoShowcaseModal isOpen={showVideoModal} onClose={handleVideoModalClose} />
        )}

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-border">
              <h2 className="text-2xl font-semibold mb-2 text-foreground text-center">
                Choose Your Language / अपनी भाषा चुनें
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                Select your preferred language for responses
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className="w-full px-6 py-4 rounded-lg border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>🇬🇧</span>
                    <span>English</span>
                  </div>
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className="w-full px-6 py-4 rounded-lg border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>🇮🇳</span>
                    <span>हिंदी (Hindi)</span>
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                You can change this later from the header menu
              </p>
            </div>
          </div>
        )}
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 border border-border shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Sign In Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to save your analysis to your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setRoute("login");
                  }}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setRoute("signup");
                  }}
                  className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login/Signup Modals - Popup Overlays */}
        {(route === "login" || route === "signup") && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
            onClick={() => {
              // Close modal when clicking outside
              const previousRoute = localStorage.getItem("previousRoute") || "upload";
              setRoute(previousRoute as Route);
              localStorage.removeItem("previousRoute");
            }}
          >
            <div 
              className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative transform transition-all animate-in zoom-in-95 duration-200 hide-scrollbar border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  const previousRoute = localStorage.getItem("previousRoute") || "upload";
                  setRoute(previousRoute as Route);
                  localStorage.removeItem("previousRoute");
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground z-10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="p-6 sm:p-8 pb-8">
                {route === "login" && (
                  <LoginPage 
                    onNavigate={(r) => {
                      if (r === "signup") {
                        setRoute("signup");
                      } else if (r === "terms" || r === "privacy") {
                        setRoute(r as Route);
                      }
                    }} 
                  />
                )}
                {route === "signup" && (
                  <SignupPage 
                    onNavigate={(r) => {
                      if (r === "login") {
                        setRoute("login");
                      } else if (r === "terms" || r === "privacy") {
                        setRoute(r as Route);
                      }
                    }} 
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terms and Privacy Pages - Still Full Page */}
        {(route === "terms" || route === "privacy") ? (
          <div className="min-h-screen bg-background">
            {route === "terms" && (
              <TermsAndConditionsPage 
                onNavigate={(r) => {
                  // If navigating back, go to login if user is not authenticated
                  if (r === "settings") {
                    setRoute("settings");
                  } else {
                    setRoute("login");
                  }
                }}
                language={language}
              />
            )}
            {route === "privacy" && (
              <PrivacyPolicyPage 
                onNavigate={(r) => {
                  // If navigating back, go to login if user is not authenticated
                  if (r === "settings") {
                    setRoute("settings");
                  } else {
                    setRoute("login");
                  }
                }}
                language={language}
              />
            )}
          </div>
        ) : (
          <AppShell
            current={route}
            onNavigate={(r) => setRoute(r as Route)}
            analysisHistory={analysisHistory}
            selectedAnalysisId={selectedAnalysisId}
            onSelectAnalysis={handleSelectAnalysis}
            onFetchHistory={handleFetchHistory}
            onDeleteAnalysis={handleDeleteAnalysis}
            onSave={handleSaveAnalysis}
            onDownload={handleDownloadPdf}
            isSaved={analysisHistory.some(
              (item) => item.id === selectedAnalysisId
            )}
            isGeneratingPdf={isGeneratingPdf}
            user={user}
            onLogout={handleLogout}
                  onLogin={() => {
                    // Keep current route but show login modal
                    const currentRoute = route;
                    if (currentRoute !== "login") {
                      setRoute("login");
                      // Store previous route to return to it
                      if (currentRoute !== "signup") {
                        localStorage.setItem("previousRoute", currentRoute);
                      }
                    }
                  }}
                  onSignup={() => {
                    // Keep current route but show signup modal
                    const currentRoute = route;
                    if (currentRoute !== "signup") {
                      setRoute("signup");
                      // Store previous route to return to it
                      if (currentRoute !== "login") {
                        localStorage.setItem("previousRoute", currentRoute);
                      }
                    }
                  }}
            language={language}
            onLanguageChange={handleLanguageChange}
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
        <div className="bg-card text-card-foreground rounded-2xl shadow p-4 md:p-6 border border-border">
          <DocumentInput
            onSubmit={handleDocumentSubmit}
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
        className="relative"
      >
        {isAnalyzing ? (
          <LoadingScreen />
        ) : analysis ? (
          <div
            className={`grid grid-cols-1 gap-4 md:gap-6 transition-all duration-300 ease-in-out ${
              isDocumentMinimized ? "lg:grid-cols-1" : "lg:grid-cols-2"
            }`}
          >
            {/* Analysis Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-card text-card-foreground rounded-2xl shadow border border-border p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-foreground">Analysis</div>
                  <button
                    onClick={() => setFs({ key: "analysis" })}
                    className="text-xs px-3 py-1 rounded border border-input hover:bg-accent hover:text-accent-foreground"
                  >
                    Fullscreen
                  </button>
                </div>
                <AnalysisResults
                  analysis={analysis}
                  language={language}
                  simplificationLevel={simplificationLevel}
                  onNewAnalysis={handleNewAnalysis}
                  onSave={handleSaveAnalysis}
                  isSaved={analysisHistory.some(
                    (item) => item.id === selectedAnalysisId
                  )}
                />
              </div>

              {/* Visualizations */}
              <div className="bg-card text-card-foreground rounded-2xl shadow border border-border p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-foreground">Visualizations</div>
                  <button
                    onClick={() => setFs({ key: "visuals" })}
                    className="text-xs px-3 py-1 rounded border border-input hover:bg-accent hover:text-accent-foreground"
                  >
                    Fullscreen
                  </button>
                </div>
                <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
              </div>
            </div>

            {/* Original Document */}
            <AnimatePresence mode="popLayout">
              {!isDocumentMinimized && (
                <motion.div
                  key="document-expanded"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="bg-card text-card-foreground rounded-2xl shadow border border-border p-4 md:p-6 lg:sticky lg:top-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-foreground">
                        Original Document
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setIsDocumentMinimized(!isDocumentMinimized)
                          }
                          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium
                            text-secondary-foreground bg-secondary
                            border border-border
                            hover:bg-secondary/80
                            active:scale-95 transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 text-secondary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span>Minimize</span>
                        </button>

                        <button
                          onClick={() => setFs({ key: "document" })}
                          className="text-xs px-3 py-1 rounded border border-input hover:bg-accent hover:text-accent-foreground"
                        >
                          Fullscreen
                        </button>
                      </div>
                    </div>
                    <OriginalContent
                      content={submittedContent}
                      pdfUrl={pdfPreviewUrl ?? undefined}
                      height={"calc(100vh - 96px)"}
                    />
                  </div>
                </motion.div>
              )}

              {/* Minimized Document Bar */}
              {isDocumentMinimized && (
                <motion.div
                  key="document-minimized"
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="fixed bottom-4 right-4 z-50"
                >
                  <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-foreground">
                        Original Document
                      </div>
                      <button
                        onClick={() => setIsDocumentMinimized(false)}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium
                          text-primary-foreground bg-primary
                          hover:bg-primary/90
                          shadow-sm active:scale-95 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        <span>Expand</span>
                      </button>

                      <button
                        onClick={() => setFs({ key: "document" })}
                        className="text-xs px-3 py-1 rounded border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Fullscreen
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            
          </div>
        ) : (
          <div className="text-muted-foreground">
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
     {route === "lawyer" && (
      <motion.div
        key="lawyer"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
     <LawyerLocatorPage />
      </motion.div>
    )}

    {route === "roadmap" && (
      <motion.div
        key="roadmap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <RoadmapPage />
      </motion.div>
    )}

    {route === "video" && (
      <motion.div
        key="video"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <VideoShowcasePage />
      </motion.div>
    )}

    {route === "settings" && (
      <motion.div
        key="settings"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <SettingsPage 
          onNavigate={(r) => setRoute(r as Route)}
          onLanguageChange={handleLanguageChange}
          language={language}
          currentTheme={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"}
          onThemeChange={(theme) => {
            const root = document.documentElement;
            if (theme === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
            localStorage.setItem("theme", theme);
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
  {/* ChatFloating with smooth shift */}
            <motion.div
              animate={{
                bottom: isDocumentMinimized ? 4 + 72 : 4, // 72px ≈ minimized bar height + margin
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed right-4 z-50"
            >
            
  <ChatFloating
                isOpen={isChatOpen}
                onToggle={handleToggleChat}
                document={documentContext}
                language={language}
              />
              </motion.div>
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
                  <div className="p-4 md:p-6 h-full overflow-auto">
                    <AnalysisResults
                      analysis={analysis!}
                      language={language}
                      simplificationLevel={simplificationLevel}
                      onNewAnalysis={handleNewAnalysis}
                      onSave={handleSaveAnalysis}
                      isSaved={analysisHistory.some(
                        (item) => item.id === selectedAnalysisId
                      )}
                    />
                  </div>
                )}
                {fs.key === "visuals" && (
                  <div className="p-4 md:p-6 h-full overflow-auto">
                    <Visualizations visuals={visuals} isLoading={isVisualsLoading} />
                  </div>
                )}
                {fs.key === "document" && (
                  <div className="p-4 md:p-6 h-full overflow-auto">
                    <OriginalContent
                      content={submittedContent}
                      pdfUrl={pdfPreviewUrl ?? undefined}
                      height={"calc(100vh - 120px)"}
                    />
                  </div>
                )}
              </FullscreenModal>
            )}
          </AppShell>
        )}
      </div>
    );
  }

  export default App;
