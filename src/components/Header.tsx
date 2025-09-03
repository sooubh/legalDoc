import React from 'react';
import { Scale, Globe, BookOpen, AlertTriangle } from 'lucide-react';
import { SimplificationLevel } from '../types/legal';

interface HeaderProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  simplificationLevel: SimplificationLevel;
  onSimplificationChange: (level: SimplificationLevel) => void;
}

const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  simplificationLevel,
  onSimplificationChange
}) => {
  const translations = {
    en: {
      title: 'LegalEase AI',
      subtitle: 'Demystifying Legal Documents',
      disclaimer: 'This is not legal advice. Consult a lawyer for decisions.'
    },
    hi: {
      title: 'लीगलईज़ AI',
      subtitle: 'कानूनी दस्तावेजों को सरल बनाना',
      disclaimer: 'यह कानूनी सलाह नहीं है। निर्णयों के लिए वकील से सलाह लें।'
    }
  };

  const levelLabels = {
    professional: language === 'en' ? 'Professional' : 'व्यावसायिक',
    simple: language === 'en' ? 'Simple' : 'सरल',
    eli5: language === 'en' ? 'Explain Like I\'m 5' : 'बहुत सरल'
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">
      {/* Decorative lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(800px_400px_at_20%_-10%,#ffffff,transparent),radial-gradient(800px_400px_at_80%_110%,#ffffff,transparent)]" />
      </div>

      <div className="relative">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 shadow-sm ring-1 ring-white/10">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {translations[language].title}
                    </span>
                  </h1>
                  <p className="text-sm text-white/85">
                    {translations[language].subtitle}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/15 text-white/80 border border-white/20">
                  Beta
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pl-3 pr-1 py-1.5 border border-white/20 shadow-sm ring-1 ring-white/10">
                <div className="flex items-center gap-2 pr-2 border-r border-white/15">
                  <BookOpen className="h-4 w-4 text-white/90" />
                  <select
                    value={simplificationLevel}
                    onChange={(e) => onSimplificationChange(e.target.value as SimplificationLevel)}
                    className="text-sm bg-transparent text-white/90 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option className="text-gray-900" value="professional">{levelLabels.professional}</option>
                    <option className="text-gray-900" value="simple">{levelLabels.simple}</option>
                    <option className="text-gray-900" value="eli5">{levelLabels.eli5}</option>
                  </select>
                </div>
                <button
                  onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white bg-white/0 hover:bg-white/15 rounded-full transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Disclaimer bar */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-t border-amber-200/70">
        <div className="container mx-auto px-4 py-2.5 max-w-7xl">
          <p className="text-xs sm:text-sm text-amber-900 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            {translations[language].disclaimer}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;