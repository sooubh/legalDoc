"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  ArrowLeft,
  Save,
} from "lucide-react";
import { DocumentAnalysis, SimplificationLevel } from "../types/legal";

interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
  language: "en" | "hi";
  simplificationLevel: SimplificationLevel;
  onNewAnalysis: () => void;
  onSave: () => void;
  isSaved: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  language,
  simplificationLevel,
  onNewAnalysis,
  onSave,
  isSaved,
}) => {
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set()
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // PDF generation handler
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Dynamically import utility and service
      const { generatePdfHtmlFromAnalysis } = await import(
        "../pdfDownlode/generatePdfFromAnalysis"
      );
      const { downloadPdf } = await import("../services/pdfService");

      // Generate HTML from analysis
      const htmlContent = await generatePdfHtmlFromAnalysis(analysis);

      // Create a temporary container for rendering HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // Download PDF
      await downloadPdf(tempDiv);

      document.body.removeChild(tempDiv);
    } catch (err) {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const translations = {
    en: {
      newDocument: "Analyze New Document",
      save: "Save",
      saved: "Saved",
      plainSummary: "Plain Summary",
      clauseLens: "Clause Lens",
      riskRadar: "Risk Radar",
      actionPoints: "Action Points",
      citations: "Legal Citations",
      documentType: "Document Type",
      riskLevels: {
        low: "Low Risk",
        medium: "Medium Risk",
        high: "High Risk",
      },
      severity: {
        low: "Low",
        medium: "Medium",
        high: "High",
      },
      recommendation: "Recommendation",
      authenticityTab: "Authenticity & Safety",
      authenticityCheck: "Authenticity & Safety Check",
      authScore: "Authenticity Score",
      safeScore: "Safety Score",
      suspicious: "Suspicious",
      genuine: "Genuine",
      risky: "Risky",
      safe: "Safe",
      complianceStatus: "Compliance Status",
      compliant: "Compliant",
      potentialIssues: "Potential Issues",
      evaluatedAgainst: "Evaluated against",
      fakeIndication: "Fake/Scam Indication",
      fakeProb: "probability of being fake",
      redFlags: "Red Flags Detected",
      noRedFlags: "No major red flags detected.",
      aiRec: "AI Recommendation",
      runningAuth: "Running authenticity check...",
      originalText: "Original Text",
      plainEnglish: "Plain English",
      analysis: "Analysis",
      roleViews: "Role-specific views",
      obligations: "Obligations",
      risks: "Risks",
      viewSource: "View Source",
    },
    hi: {
      newDocument: "नया दस्तावेज़ विश्लेषण",
      save: "सहेजें",
      saved: "सहेजा गया",
      plainSummary: "सरल सारांश",
      clauseLens: "क्लॉज़ लेंस",
      riskRadar: "जोखिम रडार",
      actionPoints: "कार्य बिंदु",
      citations: "कानूनी उद्धरण",
      documentType: "दस्तावेज़ प्रकार",
      riskLevels: {
        low: "कम जोखिम",
        medium: "मध्यम जोखिम",
        high: "उच्च जोखिम",
      },
      severity: {
        low: "कम",
        medium: "मध्यम",
        high: "उच्च",
      },
      recommendation: "सिफारिश",
      authenticityTab: "प्रामाणिकता और सुरक्षा",
      authenticityCheck: "प्रामाणिकता और सुरक्षा जांच",
      authScore: "प्रामाणिकता स्कोर",
      safeScore: "सुरक्षा स्कोर",
      suspicious: "संदिग्ध",
      genuine: "असली",
      risky: "जोखिम भरा",
      safe: "सुरक्षित",
      complianceStatus: "अनुपालन स्थिति",
      compliant: "अनुपालन",
      potentialIssues: "संभावित मुद्दे",
      evaluatedAgainst: "मूल्यांकन किया गया",
      fakeIndication: "नकली/घोटाला संकेत",
      fakeProb: "नकली होने की संभावना",
      redFlags: "लाल झंडे (खतरे) मिले",
      noRedFlags: "कोई बड़े खतरे नहीं मिले।",
      aiRec: "एआई सिफारिश",
      runningAuth: "प्रामाणिकता जांच चल रही है...",
      originalText: "मूल पाठ",
      plainEnglish: "सरल अंग्रेजी",
      analysis: "विश्लेषण",
      roleViews: "भूमिका-विशिष्ट विचार",
      obligations: "दायित्व",
      risks: "जोखिम",
      viewSource: "स्रोत देखें",
    },
  };

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "medium":
        return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
      case "high":
        return "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    }
  };

  const getRiskIcon = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const sections = [
    { id: "summary", label: translations[language].plainSummary },
    { id: "clauses", label: translations[language].clauseLens },
    { id: "risks", label: translations[language].riskRadar },
    { id: "actions", label: translations[language].actionPoints },
    { id: "citations", label: translations[language].citations },
    { id: "authenticity", label: translations[language].authenticityTab },
  ];

  const levelLabelMap: Record<SimplificationLevel, string> = {
    professional: "Professional",
    simple: "Simple",
    eli5: "ELI5",
  };

  const DownloadButtonStyles = `
  .download-label:has(.input:checked) {
    width: 57px;
    animation: installed 0.4s ease 3.5s forwards;
  }
  .download-label:has(.input:checked)::before {
    animation: rotate 3s ease-in-out 0.4s forwards;
  }
  .download-label .input:checked + .circle {
    animation: pulse 1s forwards, circleDelete 0.2s ease 3.5s forwards;
    transform: rotate(180deg);
  }
  .download-label .input:checked + .circle::before {
    animation: installing 3s ease-in-out forwards;
  }
  .download-label .input:checked ~ .title:last-child {
    animation: showInstalledMessage 0.4s ease 3.5s forwards;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(91, 91, 240, 0.7); }
    70% { box-shadow: 0 0 0 16px rgba(91, 91, 240, 0); }
    100% { box-shadow: 0 0 0 0 rgba(91, 91, 240, 0); }
  }
  @keyframes installing {
    from { height: 0; }
    to { height: 100%; }
  }
  @keyframes rotate {
    0% { transform: rotate(-90deg) translate(27px) rotate(0); opacity: 1; }
    99% { transform: rotate(270deg) translate(27px) rotate(270deg); opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes installed {
    100% { width: 180px; border-color: #22c55e; } /* green-500 */
  }
  @keyframes circleDelete {
    100% { opacity: 0; visibility: hidden; }
  }
  @keyframes showInstalledMessage {
    100% { opacity: 1; visibility: visible; right: 35px; color: #22c55e; } /* green-500 */
  }
`;

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* ... (Styles and Header remain the same) ... */}
      <style>{DownloadButtonStyles}</style>

      <div className="flex flex-row items-center space-x-4">
        {/* ... (Download and Save buttons remain the same) ... */}
        <div 
          onClick={!isGeneratingPdf ? handleGeneratePdf : undefined} 
          className="container"
        >
          <label 
            className="download-label relative flex h-[55px] w-[180px] cursor-pointer items-center rounded-full border-2 border-blue-600 dark:border-blue-500 p-[5px] transition-all duration-400 ease-in-out"
          >
            <input
              type="checkbox"
              className="input hidden"
              checked={isGeneratingPdf}
              readOnly
            />
            <span className="circle relative flex h-[45px] w-[45px] items-center justify-center overflow-hidden rounded-full bg-blue-600 shadow-none transition-all duration-400 ease-in-out">
              <div className="absolute left-0 top-0 h-0 w-full bg-blue-900 transition-all duration-400 ease-in-out before:content-['']"></div>
              <svg
                className={`icon absolute text-white transition-all duration-400 ease-in-out ${isGeneratingPdf ? 'opacity-0' : 'opacity-100'}`}
                width="30"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19V5m0 14-4-4m4 4-4" />
              </svg>
              <div className={`square absolute aspect-square w-[15px] rounded-sm bg-white dark:bg-slate-200 transition-all duration-400 ease-in-out ${isGeneratingPdf ? 'opacity-100' : 'opacity-0'}`}></div>
            </span>
            <p className={`title absolute text-center font-medium text-gray-700 dark:text-slate-200 transition-all duration-400 ease-in-out ${isGeneratingPdf ? 'opacity-0' : 'opacity-100'}`} style={{ right: '22px' }}>
              Download
            </p>
            <p className="title absolute text-center font-medium text-gray-700 dark:text-slate-200 opacity-0 transition-all duration-400 ease-in-out" style={{ right: '22px' }}>
              Downloading...
            </p>
          </label>
        </div>

        <button
          onClick={onSave}
          disabled={isSaved}
          className="group relative flex h-[55px] w-[180px] cursor-pointer items-center justify-start overflow-hidden rounded-full border-2 border-gray-600 dark:border-gray-500 bg-gray-50 dark:bg-slate-800 p-[5px] transition-transform duration-300 active:scale-95 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-700"
        >
          <span className="z-10 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-green-500 transition-all duration-300 group-hover:w-[168px] disabled:bg-gray-400 dark:disabled:bg-gray-600">
            <Save className="h-6 w-6 text-white" />
          </span>
          <span className="z-0 flex h-full w-[100px] items-center justify-center text-base font-medium text-gray-700 dark:text-slate-200 transition-all duration-300 group-hover:w-0 group-hover:translate-x-3 group-hover:text-[0px] disabled:text-gray-400 dark:disabled:text-gray-500">
             {isSaved ? translations[language].saved : translations[language].save}
          </span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-5">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {analysis.documentType}
              </h2>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {levelLabelMap[simplificationLevel]}
              </span>
            </div>
            <p className="text-gray-600 dark:text-slate-400">
              {translations[language].documentType}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onNewAnalysis}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{translations[language].newDocument}</span>
          </button>
        </div>
      </div>

      {/* Modern Segmented Tab Navigation */}
      <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-2 -mx-4 px-4 md:static md:bg-transparent md:p-0 md:mx-0">
        <div className="flex md:justify-center overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl md:w-fit min-w-full md:min-w-0 shadow-inner">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    activeSection === section.id
                      ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400 scale-[1.02]"
                      : "text-gray-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        {activeSection === "summary" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              {translations[language].plainSummary}
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-lg">
                {analysis.plainSummary}
              </p>
            </div>
          </div>
        )}

        {activeSection === "clauses" && (
          <div className="p-8 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {translations[language].clauseLens}
            </h3>
            {analysis.clauses.map((clause) => (
              <div
                key={clause.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg"
              >
                <button
                  onClick={() => toggleClause(clause.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(
                        clause.riskLevel
                      )}`}
                    >
                      {getRiskIcon(clause.riskLevel)}
                      <span className="ml-1">
                        {translations[language].riskLevels[clause.riskLevel]}
                      </span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {clause.title}
                    </span>
                  </div>
                  {expandedClauses.has(clause.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                  )}
                </button>

                {expandedClauses.has(clause.id) && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        Original Text:
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-slate-300 italic">
                        {clause.originalText}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        {translations[language].plainEnglish}:
                      </h4>
                      <p className="text-gray-700 dark:text-slate-300">{clause.simplifiedText}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        {translations[language].analysis}:
                      </h4>
                      <p className="text-gray-700 dark:text-slate-300">{clause.explanation}</p>
                    </div>

                    {clause.rolePerspectives &&
                      clause.rolePerspectives.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">
                            {translations[language].roleViews}:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {clause.rolePerspectives.map((rp, idx) => (
                              <div
                                key={idx}
                                className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-800"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                    {rp.role}
                                  </span>
                                </div>
                                {rp.interpretation && (
                                  <div className="mb-3">
                                    <p className="text-sm text-gray-800 dark:text-slate-300">
                                      {rp.interpretation}
                                    </p>
                                  </div>
                                )}
                                {rp.obligations &&
                                  rp.obligations.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                                        {translations[language].obligations}:
                                      </p>
                                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 dark:text-slate-300">
                                        {rp.obligations.map((ob, i) => (
                                          <li key={i}>{ob}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                {rp.risks && rp.risks.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                                      {translations[language].risks}:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 dark:text-slate-300">
                                      {rp.risks.map((rk, i) => (
                                        <li key={i}>{rk}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSection === "risks" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {translations[language].riskRadar}
            </h3>
            <div className="space-y-4">
              {analysis.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        risk.severity === 'high' ? 'bg-red-50 text-red-700' : risk.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {getRiskIcon(risk.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-slate-100">
                          {risk.clause}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            risk.severity === 'high' ? 'bg-red-50 text-red-700' : risk.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {translations[language].severity[risk.severity]}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 mb-3">{risk.description}</p>
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                          {translations[language].recommendation}:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "actions" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {translations[language].actionPoints}
            </h3>
            <div className="space-y-3">
              {analysis.actionPoints.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 dark:text-slate-300">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "citations" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {translations[language].citations}
            </h3>
            <div className="space-y-4">
              {analysis.citations.map((citation, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-slate-100 mb-2">
                        {citation.title}
                      </h4>
                      <p className="text-gray-700 dark:text-slate-300 mb-3">
                        {citation.description}
                      </p>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        {translations[language].viewSource} →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "authenticity" && analysis.authenticity && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {translations[language].authenticityCheck}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Authenticity Score */}
              <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100">{translations[language].authScore}</h4>
                  <span className={`text-2xl font-bold ${analysis.authenticity.authenticityScore >= 80 ? 'text-green-600' : analysis.authenticity.authenticityScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {analysis.authenticity.authenticityScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 ${getScoreColor(analysis.authenticity.authenticityScore)}`}
                    style={{ width: `${analysis.authenticity.authenticityScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                  <span>{translations[language].suspicious}</span>
                  <span>{translations[language].genuine}</span>
                </div>
              </div>

              {/* Safety Score */}
              <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100">{translations[language].safeScore}</h4>
                  <span className={`text-2xl font-bold ${analysis.authenticity.safetyScore >= 80 ? 'text-green-600' : analysis.authenticity.safetyScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {analysis.authenticity.safetyScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 ${getScoreColor(analysis.authenticity.safetyScore)}`}
                    style={{ width: `${analysis.authenticity.safetyScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                  <span>{translations[language].risky}</span>
                  <span>{translations[language].safe}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compliance & Fake Indication */}
              <div className="space-y-6">
                 <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-500" />
                        {translations[language].complianceStatus}
                    </h4>
                    <div className="flex items-center space-x-3 mb-2">
                        {analysis.authenticity.isCompliant ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        )}
                        <span className="text-lg font-medium text-gray-800 dark:text-slate-200">
                            {analysis.authenticity.isCompliant ? translations[language].compliant : translations[language].potentialIssues}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                        {translations[language].evaluatedAgainst}: <span className="font-medium">{analysis.authenticity.compliantWith}</span>
                    </p>
                 </div>

                 <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                        {translations[language].fakeIndication}
                    </h4>
                    <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
                            analysis.authenticity.fakeIndication === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                            analysis.authenticity.fakeIndication === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-green-100 text-green-700 border-green-200'
                        }`}>
                            {analysis.authenticity.fakeIndication}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-slate-400">
                            {translations[language].fakeProb}
                        </span>
                    </div>
                 </div>
              </div>

              {/* Red Flags */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {translations[language].redFlags}
                </h4>
                {analysis.authenticity.redFlags.length > 0 ? (
                    <ul className="space-y-2">
                        {analysis.authenticity.redFlags.map((flag, i) => (
                            <li key={i} className="flex items-start text-red-700 dark:text-red-200 text-sm">
                                <span className="mr-2">•</span>
                                {flag}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {translations[language].noRedFlags}
                    </p>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    {translations[language].aiRec}
                </h4>
                <p className="text-blue-700 dark:text-blue-200">
                    {analysis.authenticity.recommendation}
                </p>
            </div>
          </div>
        )}

        {activeSection === "authenticity" && !analysis.authenticity && (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-slate-400">{translations[language].runningAuth}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
