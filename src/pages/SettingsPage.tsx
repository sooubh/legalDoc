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

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onNavigate, 
  onLanguageChange, 
  language,
  currentTheme,
  onThemeChange 
}) => {
  const settingsSections = [
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

