import React, { useEffect, useState } from "react";
import {
  User,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  MoreHorizontal,
  LogIn,
  UserPlus,
  LogOut,
  Scale,
} from "lucide-react";
import AnalysisHistorySidebar from "../analysis/AnalysisHistorySidebar.tsx";
import type { AnalysisHistoryItem } from "../types/history.ts";

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AppShellProps {
  current: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
  analysisHistory?: AnalysisHistoryItem[];
  selectedAnalysisId?: string;
  onSelectAnalysis?: (item: AnalysisHistoryItem) => void;
  onFetchHistory?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  isSaved?: boolean;
  isGeneratingPdf?: boolean;
  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  language: "en" | "hi"; // ✅ new
  onLanguageChange: (lang: "en" | "hi") => void;
}

const navItems: NavItem[] = [
  { id: "upload", label: "Upload", icon: null },
  { id: "results", label: "Results", icon: null },
  { id: "visuals", label: "Visuals", icon: null },
];

const AppShell: React.FC<AppShellProps> = ({
  current,
  onNavigate,
  children,
  analysisHistory = [],
  selectedAnalysisId,
  onSelectAnalysis,
  onFetchHistory,
  onSave,
  onDownload,
  isSaved,
  isGeneratingPdf,
  user,
  onLogout,
  onLogin,
  onSignup,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("theme") as "light" | "dark")) ||
      "light"
  );

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Failed to set theme:", error);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Bottom nav tab selection mapping (three tabs)
  const tabToRoute = {
    upload: "upload",
    results: "results",
    visuals: "visuals",
  } as const;

  const routeToTab = (route: string) => {
    if (route === "upload") return "upload" as const;
    if (route === "results") return "results" as const;
    if (route === "visuals") return "visuals" as const;
    return "upload" as const;
  };

  const selectedTab = routeToTab(current);

  const handleTabKey = (
    e: React.KeyboardEvent<HTMLLabelElement>,
    routeId: keyof typeof tabToRoute
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate(tabToRoute[routeId]);
    }
  };

  return (
    <div className="w-screen h-screen grid grid-rows-[56px_1fr_72px] md:grid-rows-[64px_1fr] md:grid-cols-[300px_1fr] bg-slate-50 dark:bg-slate-900">
      {/* Top bar */}
      <div className="md:col-span-2 h-14 md:h-16 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-between px-3 md:px-4">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-700 bg-white"
            aria-label="Open menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm md:text-base">
            L
          </div>
          <div className="leading-tight">
            <div className="text-gray-900 dark:text-slate-100 font-semibold text-sm md:text-base">
              LegalEase AI
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-500 dark:text-slate-400 tracking-wide">
              Demystifying Legal Docs
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[11px] md:text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>
              This is not legal advice. Consult a lawyer for decisions.
            </span>
          </div>
          {/* Header icon actions */}

          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
            aria-label="Profile"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            {" "}
            {/* gap added for spacing between buttons */}
            {!user ? (
              <>
                {/* Sign In */}
                <button
                  onClick={onLogin}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
          bg-gradient-to-r from-blue-500 to-indigo-600 text-white
          border border-white/10 shadow-sm shadow-blue-500/20
          transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>

                {/* Sign Up */}
                <button
                  onClick={onSignup}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
          bg-gradient-to-r from-emerald-500 to-teal-600 text-white
          border border-white/10 shadow-sm shadow-emerald-500/20
          transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40 active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              /* Logout Icon */
              <button
                onClick={onLogout}
                className="relative flex items-center justify-center w-10 h-10 rounded-full
        bg-gradient-to-r from-red-500 to-rose-600 text-white
        border border-white/10 shadow-md shadow-red-500/20
        transition-all duration-300 hover:scale-110 hover:shadow-red-500/40 active:scale-95"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar (hidden on mobile) with integrated History */}
      <aside className="hidden md:block row-start-2 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="h-full flex flex-col">
          <div className="p-3">
            <button
              onClick={() => onNavigate("upload")}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
            >
              + New Analysis
            </button>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border
                flex items-center gap-2
                ${
                  current === item.id
                    ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-transparent dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate("lawyer")}
            className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Scale className="h-4 w-4" />
            <span>
              <strong>Lawyer Locator AI</strong>
            </span>
          </button>
          {/* Integrated History content */}
          <div className="mt-4 border-t border-gray-200 dark:border-slate-700 flex-1 min-h-0">
            <AnalysisHistorySidebar
              items={analysisHistory}
              onSelect={(item) => onSelectAnalysis?.(item)}
              selectedId={selectedAnalysisId}
              onFetch={onFetchHistory}
            />
          </div>

          {/* Authentication and Action buttons at bottom */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700">
            <div className="space-y-2">
              {/* Settings and More buttons */}
              <button
                onClick={() => onNavigate("settings")}
                className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => onNavigate("more")}
                className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>More</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="row-start-2 overflow-auto p-3 md:p-6">
        <div className="max-w-7xl mx-auto pb-24 md:pb-0 text-[15px] md:text-base leading-[1.45] md:leading-6">
          {children}
        </div>
      </main>

      {/* Bottom navigation - Uiverse tabs (JSX version) */}
      <div className="md:hidden fixed bottom-2 left-0 right-0 z-40 flex justify-center">
        <div className="container bottom-nav">
          <div className="tabs" role="tablist" aria-label="Primary navigation">
            <input
              type="radio"
              id="radio-1"
              name="tabs"
              checked={selectedTab === "upload"}
              onChange={() => onNavigate(tabToRoute.upload)}
            />
            <label
              className="tab"
              htmlFor="radio-1"
              role="tab"
              aria-selected={selectedTab === "upload"}
              tabIndex={selectedTab === "upload" ? 0 : -1}
              onKeyDown={(e) => handleTabKey(e, "upload")}
            >
              Upload
            </label>

            <input
              type="radio"
              id="radio-2"
              name="tabs"
              checked={selectedTab === "results"}
              onChange={() => onNavigate(tabToRoute.results)}
            />
            <label
              className="tab"
              htmlFor="radio-2"
              role="tab"
              aria-selected={selectedTab === "results"}
              tabIndex={selectedTab === "results" ? 0 : -1}
              onKeyDown={(e) => handleTabKey(e, "results")}
            >
              Results
            </label>

            <input
              type="radio"
              id="radio-3"
              name="tabs"
              checked={selectedTab === "visuals"}
              onChange={() => onNavigate(tabToRoute.visuals)}
            />
            <label
              className="tab"
              htmlFor="radio-3"
              role="tab"
              aria-selected={selectedTab === "visuals"}
              tabIndex={selectedTab === "visuals" ? 0 : -1}
              onKeyDown={(e) => handleTabKey(e, "visuals")}
            >
              Visuals
            </label>

            <span className="glider" />
          </div>
        </div>
      </div>

      {/* Mobile slide-over sidebar */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-xl flex flex-col">
            <div className="h-14 px-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="font-semibold">Menu</div>
              <button
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                aria-label="Close menu"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1 overflow-auto">
              <button
                onClick={() => {
                  onNavigate("upload");
                  setIsMobileNavOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
              >
                + New Analysis
              </button>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border mt-1
                  flex items-center gap-2
                  ${
                    current === item.id
                      ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900"
                      : "bg-white text-gray-800 hover:bg-gray-50 border-transparent dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button
            onClick={() => onNavigate("lawyer")}
            className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Scale className="h-4 w-4" />
            <span>
              <strong>Lawyer Locator AI</strong>
            </span>
          </button>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                  History
                </div>
                <AnalysisHistorySidebar
                  items={analysisHistory}
                  onSelect={(item) => {
                    onSelectAnalysis?.(item);
                    setIsMobileNavOpen(false);
                  }}
                  selectedId={selectedAnalysisId}
                  onFetch={onFetchHistory}
                />
              </div>
            </nav>

            <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => {
                  onNavigate("profile");
                  setIsMobileNavOpen(false);
                }}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => {
                  onNavigate("settings");
                  setIsMobileNavOpen(false);
                }}
                className=" inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  onNavigate("more");
                  setIsMobileNavOpen(false);
                }}
                className=" inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;
