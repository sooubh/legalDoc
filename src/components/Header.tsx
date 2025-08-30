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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {translations[language].title}
              </h1>
              <p className="text-sm text-gray-600">
                {translations[language].subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Simplification Level Selector */}
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <select
                value={simplificationLevel}
                onChange={(e) => onSimplificationChange(e.target.value as SimplificationLevel)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">{levelLabels.professional}</option>
                <option value="simple">{levelLabels.simple}</option>
                <option value="eli5">{levelLabels.eli5}</option>
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            {translations[language].disclaimer}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;