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
  return (
    <div className="space-y-6">
      {/* Injecting the styles into the document head */}
      <style>{DownloadButtonStyles}</style>

      <div className="flex flex-row items-center space-x-4">
        
        {/* === Download PDF Button (Hybrid CSS + Tailwind) === */}
        <div 
          onClick={!isGeneratingPdf ? handleGeneratePdf : undefined} 
          className="container"
        >
          <label 
            className="download-label relative flex h-[55px] w-[180px] cursor-pointer items-center rounded-full border-2 border-blue-600 dark:border-blue-500 p-[5px] transition-all duration-400 ease-in-out"
          >
            {/* Hidden checkbox to drive the CSS animation */}
            <input
              type="checkbox"
              className="input hidden"
              checked={isGeneratingPdf}
              readOnly
            />
            
            {/* The animated circle */}
            <span className="circle relative flex h-[45px] w-[45px] items-center justify-center overflow-hidden rounded-full bg-blue-600 shadow-none transition-all duration-400 ease-in-out">
              {/* Blue progress fill */}
              <div className="absolute left-0 top-0 h-0 w-full bg-blue-900 transition-all duration-400 ease-in-out before:content-['']"></div>
              
              {/* Download Icon */}
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
              
              {/* Square that appears during animation */}
              <div className={`square absolute aspect-square w-[15px] rounded-sm bg-white dark:bg-slate-200 transition-all duration-400 ease-in-out ${isGeneratingPdf ? 'opacity-100' : 'opacity-0'}`}></div>
            </span>
            
            {/* Text labels */}
            <p className={`title absolute text-center font-medium text-gray-700 dark:text-slate-200 transition-all duration-400 ease-in-out ${isGeneratingPdf ? 'opacity-0' : 'opacity-100'}`} style={{ right: '22px' }}>
              Download
            </p>
            <p className="title absolute text-center font-medium text-gray-700 dark:text-slate-200 opacity-0 transition-all duration-400 ease-in-out" style={{ right: '22px' }}>
              Downloading...
            </p>
          </label>
        </div>

        {/* === Save Button (Pure Tailwind) === */}
        <button
          onClick={onSave}
          disabled={isSaved}
          className="group relative flex h-[55px] w-[180px] cursor-pointer items-center justify-start overflow-hidden rounded-full border-2 border-gray-600 dark:border-gray-500 bg-gray-50 dark:bg-slate-800 p-[5px] transition-transform duration-300 active:scale-95 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-700"
        >
          {/* Icon Container */}
          <span className="z-10 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-green-500 transition-all duration-300 group-hover:w-[168px] disabled:bg-gray-400 dark:disabled:bg-gray-600">
            <Save className="h-6 w-6 text-white" />
          </span>

          {/* Text */}
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
      <div className="flex justify-center my-4">
        <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg md:w-fit w-full shadow-inner overlay">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                data-[active=true]:bg-white data-[active=true]:dark:bg-slate-700 data-[active=true]:shadow data-[active=true]:text-purple-600 data-[active=true]:dark:text-purple-400
                ${
                  activeSection === section.id
                    ? "bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow"
                }`}
              data-active={activeSection === section.id}
            >
              {section.label}
            </button>
          ))}
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
                        Plain English:
                      </h4>
                      <p className="text-gray-700 dark:text-slate-300">{clause.simplifiedText}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        Analysis:
                      </h4>
                      <p className="text-gray-700 dark:text-slate-300">{clause.explanation}</p>
                    </div>

                    {clause.rolePerspectives &&
                      clause.rolePerspectives.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">
                            Role-specific views:
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
                                        Obligations:
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
                                      Risks:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 dark:text-slate-300">
                                      {rp.risks.map((rk, i) => (
                                        <li key={i}>{rk}</li>
                                      ))}
                                      '''
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
                      className={`p-2 rounded-lg ${getRiskColor(
                        risk.severity
                      )}`}
                    >
                      {getRiskIcon(risk.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-slate-100">
                          {risk.clause}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                            risk.severity
                          )}`}
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
                        View Source →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
