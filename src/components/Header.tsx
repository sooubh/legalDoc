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
    <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(800px_400px_at_20%_-10%,#ffffff,transparent),radial-gradient(800px_400px_at_80%_110%,#ffffff,transparent)]" />
      <div className="relative">
        <div className="container mx-auto px-4 py-5 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl border border-white/30 shadow-sm">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {translations[language].title}
                </h1>
                <p className="text-sm text-white/80">
                  {translations[language].subtitle}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/15 backdrop-blur rounded-full px-3 py-2 border border-white/20 shadow-sm">
                <BookOpen className="h-4 w-4 text-white/90" />
                <select
                  value={simplificationLevel}
                  onChange={(e) => onSimplificationChange(e.target.value as SimplificationLevel)}
                  className="text-sm bg-transparent text-white/90 focus:outline-none"
                >
                  <option className="text-gray-900" value="professional">{levelLabels.professional}</option>
                  <option className="text-gray-900" value="simple">{levelLabels.simple}</option>
                  <option className="text-gray-900" value="eli5">{levelLabels.eli5}</option>
                </select>
              </div>
              <button
                onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur rounded-full transition-colors border border-white/20"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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