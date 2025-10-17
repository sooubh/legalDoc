import React from "react";
import { Scale, Globe, BookOpen, AlertTriangle } from "lucide-react";
import { SimplificationLevel } from "../types/legal";

interface HeaderProps {
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  simplificationLevel: SimplificationLevel;
  onSimplificationChange: (level: SimplificationLevel) => void;
}

const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  simplificationLevel,
  onSimplificationChange,
}) => {
  const translations = {
    en: {
      title: "LegalEase AI",
      subtitle: "Demystifying Legal Documents",
      disclaimer: "This is not legal advice. Consult a lawyer for decisions.",
    },
    hi: {
      title: "लीगलईज़ AI",
      subtitle: "कानूनी दस्तावेजों को सरल बनाना",
      disclaimer: "यह कानूनी सलाह नहीं है। निर्णयों के लिए वकील से सलाह लें।",
    },
  };

  const levelLabels = {
    professional: language === "en" ? "Professional" : "व्यावसायिक",
    simple: language === "en" ? "Simple" : "सरल",
    eli5: language === "en" ? "Explain Like I'm 5" : "बहुत सरल",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-500 p-0 shadow-lg rounded-b-2xl backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="LegalEase AI" className="h-8" />
          <h1 className="text-white text-xl font-bold flex items-center">
            LegalEase AI
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded ml-2">
              BETA
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-white hover:bg-white/20 p-2 rounded-full"
            title="Toggle dark mode"
          >
            🌙
          </button>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as "en" | "hi")}
            className="bg-white/20 text-white rounded px-2 py-1 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <img
            src="/avatar.jpg"
            alt="Profile"
            className="h-8 w-8 rounded-full border-2 border-white"
          />
        </div>
      </div>
      {/* Subtle disclaimer bar */}
      <div className="bg-amber-100 text-amber-800 text-sm py-1 px-4 flex items-center gap-2 border-b border-amber-300">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 6v12"
          />
        </svg>
        <p className="truncate">{translations[language].disclaimer}</p>
      </div>
    </header>
  );
};

export default Header;
