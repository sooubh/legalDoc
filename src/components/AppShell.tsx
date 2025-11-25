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
  Languages,
  Video,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  PieChart,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  onDeleteAnalysis?: (id: string) => void;



  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  language: "en" | "hi"; // ✅ new
  onLanguageChange: (lang: "en" | "hi") => void;
}

const AppShell: React.FC<AppShellProps> = ({
  current,
  onNavigate,
  children,
  analysisHistory = [],
  selectedAnalysisId,
  onSelectAnalysis,
  onFetchHistory,

  onDeleteAnalysis,



  user,
  onLogout,
  onLogin,
  onSignup,
  language,
  onLanguageChange,
}) => {
  const translations = {
    en: {
      upload: "Upload",
      results: "Results",
      visuals: "Visuals",
      newAnalysis: "New Analysis",
      lawyerLocator: "Lawyer Locator",
      lawyerLocatorAI: "Lawyer Locator AI",
      settings: "Settings",
      videoShowcase: "Video Showcase",
      more: "More",
      video: "Video",
      login: "Login",
      signup: "Sign Up",
      welcomeBack: "Welcome back",
      premiumPlan: "Premium Plan",
      aiActive: "AI Legal Assistant Active",
      menu: "Menu",
      history: "History",
      language: "Language",
      profile: "Profile",
      toggleTheme: "Toggle theme",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      logout: "Logout",
      documents: "Documents",
      utilities: "Utilities",
    },
    hi: {
      upload: "अपलोड",
      results: "परिणाम",
      visuals: "दृश्य",
      newAnalysis: "नया विश्लेषण",
      lawyerLocator: "वकील खोजें",
      lawyerLocatorAI: "वकील खोज एआई",
      settings: "सेटिंग्स",
      videoShowcase: "वीडियो शोकेस",
      more: "अधिक",
      video: "वीडियो",
      login: "लॉग इन",
      signup: "साइन अप",
      welcomeBack: "वापसी पर स्वागत है",
      premiumPlan: "प्रीमियम योजना",
      aiActive: "एआई कानूनी सहायक सक्रिय",
      menu: "मेनू",
      history: "इतिहास",
      language: "भाषा",
      profile: "प्रोफ़ाइल",
      toggleTheme: "थीम बदलें",
      lightMode: "लाइट मोड",
      darkMode: "डार्क मोड",
      logout: "लॉग आउट",
      documents: "दस्तावेज़",
      utilities: "उपयोगिताएँ",
    },
  };

  const t = translations[language];

  const navItems: NavItem[] = [
    { id: "upload", label: t.upload, icon: <Upload className="h-5 w-5" /> },
    { id: "results", label: t.results, icon: <FileText className="h-5 w-5" /> },
    { id: "visuals", label: t.visuals, icon: <PieChart className="h-5 w-5" /> },
  ];

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Mapping for bottom tabs
  const tabToRoute: Record<string, string> = {
    upload: "upload",
    results: "results",
    visuals: "visuals",
  };

  const routeToTab: Record<string, string> = {
    upload: "upload",
    results: "results",
    visuals: "visuals",
  };

  const selectedTab = routeToTab[current] || "upload";

  const handleTabKey = (e: React.KeyboardEvent, tab: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate(tabToRoute[tab]);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Top bar - Fixed height on mobile, part of flex column */}
      <div className="md:hidden h-14 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-3 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-foreground bg-background"
            aria-label="Open menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/logo.png" alt="LegalEase AI" className="h-8 w-8 object-contain" />
          <div className="leading-tight">
            <div className="text-foreground font-semibold text-sm">
              LegalEase AI
            </div>
          </div>
        </div>
        {/* Mobile header actions if needed */}
      </div>

      {/* Sidebar (Desktop) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col border-r border-border bg-card text-card-foreground relative z-30 h-full shrink-0"
      >
        {/* Header Logo Area */}
        <div className={`h-16 flex items-center px-4 border-b border-border ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
           {!isSidebarCollapsed ? (
             <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <img src="/logo.png" alt="LegalEase AI" className="h-10 w-10 object-contain shrink-0" />
                <div className="leading-tight">
                  <div className="text-foreground font-bold text-lg">
                    LegalEase
                  </div>
                  <div className="text-[10px] text-muted-foreground tracking-wide">
                    AI Legal Assistant
                  </div>
                </div>
             </div>
           ) : (
             <img src="/logo.png" alt="LegalEase AI" className="h-10 w-10 object-contain" />
           )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 z-50 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-accent text-primary transition-all hover:scale-110"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Navigation Section - Compact and auto-sized */}
          <div className="px-3 py-3 shrink-0">
            <div className="mb-4">
              <button
                onClick={() => onNavigate("upload")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200
                ${isSidebarCollapsed 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-primary text-primary-foreground hover:shadow-primary/25 hover:shadow-lg'
                }`}
                title={isSidebarCollapsed ? t.newAnalysis : ""}
              >
                <span className="text-xl leading-none">+</span>
                {!isSidebarCollapsed && <span>{t.newAnalysis}</span>}
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
                    ${
                      current === item.id
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <span className={`${current === item.id ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                  
                  {/* Animated Tooltip for Collapsed State */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-popover text-popover-foreground border border-border text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-1">
               <div className="relative group">
                  <button
                    onClick={() => onNavigate("lawyer")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
                    ${isSidebarCollapsed ? 'justify-center px-0' : ''} text-muted-foreground hover:bg-accent hover:text-accent-foreground`}
                  >
                    <Scale className="h-5 w-5" />
                    {!isSidebarCollapsed && <span>{t.lawyerLocator}</span>}
                  </button>
                   {isSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-popover text-popover-foreground border border-border text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
                      {t.lawyerLocator}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* History content - Takes remaining space */}
          <div className="border-t border-border flex-1 min-h-0 flex flex-col overflow-hidden">
            {!isSidebarCollapsed ? (
              <AnalysisHistorySidebar
                items={analysisHistory}
                onSelect={(item) => onSelectAnalysis?.(item)}
                selectedId={selectedAnalysisId}
                onFetch={onFetchHistory}
                onDelete={onDeleteAnalysis}
                language={language}
              />
            ) : (
               <div className="flex flex-col items-center pt-6 gap-4 opacity-50">
                 <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                    HIS
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Pinned to bottom, more compact */}
        <div className="px-3 py-2 border-t border-border bg-muted/50 shrink-0">
          <div className="space-y-0.5">
            {/* Utilities Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsUtilitiesOpen(!isUtilitiesOpen)}
                className={`w-full inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  {!isSidebarCollapsed && <span>{t.utilities}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isUtilitiesOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Utilities Menu */}
              <AnimatePresence>
                {isUtilitiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`overflow-hidden ${isSidebarCollapsed ? 'absolute left-full bottom-0 ml-3 w-48 bg-popover border border-border rounded-xl shadow-xl z-50 p-1' : 'mt-1 space-y-0.5 pl-2'}`}
                  >
                    {[
                      { id: 'settings', icon: <Settings className="h-4 w-4" />, label: t.settings, action: () => onNavigate("settings") },
                      { id: 'video', icon: <Video className="h-4 w-4" />, label: t.videoShowcase, action: () => onNavigate("video") },
                      { id: 'more', icon: <MoreHorizontal className="h-4 w-4" />, label: t.more, action: () => onNavigate("more") },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          btn.action();
                          if (isSidebarCollapsed) setIsUtilitiesOpen(false);
                        }}
                        className={`w-full inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isSidebarCollapsed ? 'justify-start px-3 py-2 text-sm' : ''}`}
                      >
                        {btn.icon}
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* User Profile / Logout Section */}
          <div className={`mt-2 pt-2 border-t border-border flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
             <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? t.lightMode : t.darkMode}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            {!isSidebarCollapsed && (
               <div className="h-4 w-px bg-border" />
            )}

            {/* Profile Dropdown */}
            <div className="relative group">
              <button
                onClick={() => onNavigate("profile")}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative overflow-hidden"
                title={t.profile}
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-full bottom-0 ml-3 w-48 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                <div className="p-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => onNavigate("profile")}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{t.profile}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            </div>

            {!isSidebarCollapsed && user && (
               <div className="h-4 w-px bg-border" />
            )}
            
            {user && (
               <button
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         {/* Desktop Header (Top Bar) - Only visible on desktop inside main area now */}
         <header className="hidden md:flex h-16 border-b border-border bg-background/80 backdrop-blur items-center justify-between px-6 shrink-0 relative z-50">
            {/* Left side of header */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-medium">{t.aiActive}</span>
               </div>
               
               {/* Documents Link in Header */}
               <button
                 onClick={() => onNavigate("documents")}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${current === 'documents' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
               >
                 <FileText className="h-4 w-4" />
                 <span>{t.documents}</span>
               </button>
            </div>

            {/* Right side of header */}
            <div className="flex items-center gap-4">


               {/* Language Switcher */}
               <div className="relative group">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsLanguageDropdownOpen(false), 200)}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-foreground bg-background hover:bg-accent hover:text-accent-foreground transition-all text-sm font-medium"
                  >
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
                  </button>
                   {isLanguageDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          onLanguageChange('en');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                          language === 'en' ? 'bg-secondary text-secondary-foreground font-medium' : 'text-foreground'
                        }`}
                      >
                        <span>English</span>
                        {language === 'en' && <span className="text-primary">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          onLanguageChange('hi');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                          language === 'hi' ? 'bg-secondary text-secondary-foreground font-medium' : 'text-foreground'
                        }`}
                      >
                        <span>हिंदी (Hindi)</span>
                        {language === 'hi' && <span className="text-primary">✓</span>}
                      </button>
                    </div>
                  )}
               </div>

               {!user ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onLogin}
                      className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t.login}
                    </button>
                    <button
                      onClick={onSignup}
                      className="px-5 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                      {t.signup}
                    </button>
                  </div>
               ) : (
                  <div className="relative group">
                     <button
                        className="flex items-center gap-3 focus:outline-none"
                     >
                        <div className="text-sm text-right hidden lg:block">
                           <div className="font-medium text-foreground">{user.displayName || 'User'}</div>
                           <div className="text-xs text-muted-foreground">{t.premiumPlan}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md overflow-hidden border-2 border-background ring-2 ring-primary/20">
                           {user.photoURL ? (
                              <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                           ) : (
                              user.displayName?.[0] || 'U'
                           )}
                        </div>
                     </button>

                     {/* Header Dropdown */}
                     <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                        <div className="p-4 border-b border-border bg-muted/30">
                           <p className="font-medium text-foreground truncate">
                              {user.displayName || 'User'}
                           </p>
                           <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {user.email}
                           </p>
                        </div>
                        <div className="p-1">
                           <button
                              onClick={() => onNavigate("profile")}
                              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3"
                           >
                              <User className="h-4 w-4" />
                              <span>{t.profile}</span>
                           </button>
                           <button
                              onClick={onLogout}
                              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-3"
                           >
                              <LogOut className="h-4 w-4" />
                              <span>{t.logout}</span>
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </header>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto">
               {children}
            </div>
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
              {t.upload}
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
              {t.results}
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
              {t.visuals}
            </label>

            <span className="glider" />
          </div>
        </div>
      </div>

      {/* Mobile slide-over sidebar */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-background border-r border-border shadow-xl flex flex-col">
            <div className="h-14 px-3 border-b border-border flex items-center justify-between">
              <div className="font-semibold text-foreground">{t.menu}</div>
              <button
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground bg-background"
                aria-label="Close menu"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1 overflow-auto">
              {!user && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => {
                      onLogin?.();
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-secondary text-secondary-foreground border border-border"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t.login}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignup?.();
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground border border-primary"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{t.signup}</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  onNavigate("upload");
                  setIsMobileNavOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
              >
                + {t.newAnalysis}
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
                      ? "bg-secondary text-secondary-foreground border-border"
                      : "bg-background text-foreground hover:bg-accent border-transparent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button
            onClick={() => onNavigate("lawyer")}
            className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-accent text-foreground bg-background"
          >
            <Scale className="h-4 w-4" />
            <span>
              <strong>{t.lawyerLocatorAI}</strong>
            </span>
          </button>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  {t.history}
                </div>
                <AnalysisHistorySidebar
                  items={analysisHistory}
                  onSelect={(item) => {
                    onSelectAnalysis?.(item);
                    setIsMobileNavOpen(false);
                  }}
                  selectedId={selectedAnalysisId}
                  onFetch={onFetchHistory}
                  onDelete={onDeleteAnalysis}
                  language={language}
                />
              </div>
              
              {/* Mobile Language Switcher */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  {t.language}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onLanguageChange('en');
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border flex items-center justify-between ${
                      language === 'en'
                        ? 'bg-secondary text-secondary-foreground border-border'
                        : 'bg-background text-foreground hover:bg-accent border-transparent'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="text-primary">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      onLanguageChange('hi');
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border flex items-center justify-between ${
                      language === 'hi'
                        ? 'bg-secondary text-secondary-foreground border-border'
                        : 'bg-background text-foreground hover:bg-accent border-transparent'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="text-primary">✓</span>}
                  </button>
                </div>
              </div>
            </nav>

            <div className="p-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  onNavigate("profile");
                  setIsMobileNavOpen(false);
                }}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-foreground bg-background"
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-foreground bg-background"
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
                className=" inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-accent text-foreground bg-background"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  onNavigate("video");
                  setIsMobileNavOpen(false);
                }}
                className=" inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-accent text-foreground bg-background"
              >
                <Video className="h-4 w-4" />
                <span className="text-xs">{t.video}</span>
              </button>
              <button
                onClick={() => {
                  onNavigate("more");
                  setIsMobileNavOpen(false);
                }}
                className=" inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-accent text-foreground bg-background"
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
