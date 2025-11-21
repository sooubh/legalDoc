"use client";
import React from "react";
import { ArrowLeft, User, Bell, Shield, FileText } from "lucide-react";

interface SettingsPageProps {
  onNavigate: (route: string) => void;
  onLanguageChange: (lang: "en" | "hi") => void;
  language: "en" | "hi";
  currentTheme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

import { getGeminiApiKey, setGeminiApiKey, validateGeminiApiKey, removeGeminiApiKey } from "../utils/apiKey";
import { Eye, EyeOff, Check, AlertTriangle, Save, Key } from "lucide-react";
import { useState, useEffect } from "react";

// ... (keep existing interface)

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onNavigate, 
  onLanguageChange, 
  language,
  currentTheme,
  onThemeChange 
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isUsingEnv, setIsUsingEnv] = useState(false);

  useEffect(() => {
    const key = getGeminiApiKey();
    if (key) {
        setApiKey(key);
        if (import.meta.env.VITE_GEMINI_API_KEY && key === import.meta.env.VITE_GEMINI_API_KEY) {
            setIsUsingEnv(true);
        }
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
        removeGeminiApiKey();
        alert(language === "hi" ? "API कुंजी हटा दी गई" : "API Key removed");
        return;
    }
    setGeminiApiKey(apiKey);
    setValidationStatus("idle");
    alert(language === "hi" ? "API कुंजी सहेजी गई" : "API Key saved");
  };

  const handleValidateApiKey = async () => {
    if (!apiKey) return;
    setIsValidating(true);
    const isValid = await validateGeminiApiKey(apiKey);
    setValidationStatus(isValid ? "valid" : "invalid");
    setIsValidating(false);
  };

  const settingsSections = [
    // ... (keep existing sections)
    {
      title: language === "hi" ? "खाता सेटिंग्स" : "Account Settings",
      icon: <User className="h-5 w-5" />,
      items: [
        {
          label: language === "hi" ? "प्रोफ़ाइल देखें" : "View Profile",
          action: () => onNavigate("profile"),
        },
      ],
    },
    {
      title: language === "hi" ? "प्राथमिकताएं" : "Preferences",
      icon: <Bell className="h-5 w-5" />,
      items: [
        {
          label: language === "hi" ? "भाषा" : "Language",
          value: language === "hi" ? "हिंदी" : "English",
          action: () => {
            onLanguageChange(language === "en" ? "hi" : "en");
          },
        },
        {
          label: language === "hi" ? "थीम" : "Theme",
          value: currentTheme === "dark" ? (language === "hi" ? "डार्क" : "Dark") : (language === "hi" ? "लाइट" : "Light"),
          action: () => {
            onThemeChange(currentTheme === "dark" ? "light" : "dark");
          },
        },
      ],
    },
    {
      title: language === "hi" ? "कानूनी दस्तावेज" : "Legal Documents",
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          label: language === "hi" ? "नियम और शर्तें" : "Terms and Conditions",
          action: () => onNavigate("terms"),
        },
        {
          label: language === "hi" ? "गोपनीयता नीति" : "Privacy Policy",
          action: () => onNavigate("privacy"),
        },
      ],
    },
    {
      title: language === "hi" ? "सुरक्षा" : "Security",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          label: language === "hi" ? "पासवर्ड बदलें" : "Change Password",
          action: () => {
            // TODO: Implement password change
            alert(language === "hi" ? "जल्द ही उपलब्ध" : "Coming soon");
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate("upload")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === "hi" ? "वापस" : "Back"}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === "hi" ? "सेटिंग्स" : "Settings"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {language === "hi" 
              ? "अपनी खाता सेटिंग्स और प्राथमिकताएं प्रबंधित करें" 
              : "Manage your account settings and preferences"}
          </p>
        </div>

        {/* API Key Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400"><Key className="h-5 w-5" /></div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {language === "hi" ? "API कुंजी कॉन्फ़िगरेशन" : "API Key Configuration"}
                    </h2>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "hi" 
                        ? "Gemini AI सेवाओं का उपयोग करने के लिए अपनी API कुंजी दर्ज करें।" 
                        : "Enter your Gemini API key to enable AI services."}
                    {isUsingEnv && (
                        <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                            {language === "hi" ? "डिफ़ॉल्ट (.env) का उपयोग कर रहा है" : "Using default (.env)"}
                        </span>
                    )}
                </p>
                
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationStatus("idle");
                                setIsUsingEnv(false);
                            }}
                            placeholder={language === "hi" ? "अपनी API कुंजी यहाँ पेस्ट करें" : "Paste your API key here"}
                            className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSaveApiKey}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        {language === "hi" ? "सहेजें" : "Save"}
                    </button>
                    <button
                        onClick={handleValidateApiKey}
                        disabled={isValidating || !apiKey}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                            validationStatus === "valid" 
                                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                : validationStatus === "invalid"
                                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                    >
                        {isValidating ? (
                            <span className="animate-spin">⌛</span>
                        ) : validationStatus === "valid" ? (
                            <Check className="h-4 w-4" />
                        ) : validationStatus === "invalid" ? (
                            <AlertTriangle className="h-4 w-4" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        {isValidating 
                            ? (language === "hi" ? "जाँच रहा है..." : "Validating...") 
                            : validationStatus === "valid" 
                                ? (language === "hi" ? "वैध" : "Valid") 
                                : validationStatus === "invalid" 
                                    ? (language === "hi" ? "अमान्य" : "Invalid") 
                                    : (language === "hi" ? "वैध करें" : "Validate")}
                    </button>
                </div>
                
                {validationStatus === "invalid" && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {language === "hi" 
                            ? "त्रुटि: अमान्य API कुंजी। कृपया जाँचें और पुनः प्रयास करें।" 
                            : "Error: Invalid API key. Please check and try again."}
                    </p>
                )}
            </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">{section.icon}</div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {"value" in item && item.value && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.value}
                        </span>
                      )}
                      <span className="text-gray-400 dark:text-gray-500">›</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* App Version */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {language === "hi" 
            ? "LegalEase AI v1.0.0" 
            : "LegalEase AI v1.0.0"}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

