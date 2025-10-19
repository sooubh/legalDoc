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
} from "lucide-react";
import { DocumentAnalysis, SimplificationLevel } from "../types/legal";
import AIGeneratedTimeline from "./AIGeneratedTimeline";

interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
  language: "en" | "hi";
  simplificationLevel: SimplificationLevel;
  onNewAnalysis: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  language,
  simplificationLevel,
  onNewAnalysis,
}) => {
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set()
  );

  const translations = {
    en: {
      newDocument: "Analyze New Document",
      plainSummary: "Plain Summary",
      clauseLens: "Clause Lens",
      riskRadar: "Risk Radar",
      actionPoints: "Action Points",
      citations: "Legal Citations",
      timeline: "Timeline",
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
      plainSummary: "सरल सारांश",
      clauseLens: "क्लॉज़ लेंस",
      riskRadar: "जोखिम रडार",
      actionPoints: "कार्य बिंदु",
      citations: "कानूनी उद्धरण",
      timeline: "समयरेखा",
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
        return "text-green-700 bg-green-50 border-green-200";
      case "medium":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "high":
        return "text-red-700 bg-red-50 border-red-200";
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
    { id: "timeline", label: translations[language].timeline },
  ];

  const levelLabelMap: Record<SimplificationLevel, string> = {
    professional: "Professional",
    simple: "Simple",
    eli5: "ELI5",
  };

  const formattedTimeline = analysis.timeline
  ? analysis.timeline.map((event) => ({
      title: event.date || "Unknown Date",
      cardTitle: event.event || "Untitled Event",
      cardDetailedText: event.summary || "No description available.",
    }))
  : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {analysis.documentType}
              </h2>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {levelLabelMap[simplificationLevel]}
              </span>
            </div>
            <p className="text-gray-600">
              {translations[language].documentType}
            </p>
          </div>
        </div>
        <button
          onClick={onNewAnalysis}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{translations[language].newDocument}</span>
        </button>
      </div>

      {/* Modern Segmented Tab Navigation */}
      <div className="flex justify-center my-4">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit shadow-inner">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                data-[active=true]:bg-white data-[active=true]:shadow data-[active=true]:text-purple-600
                ${
                  activeSection === section.id
                    ? "bg-white shadow text-purple-600"
                    : "text-gray-700 hover:bg-white hover:shadow"
                }`}
              data-active={activeSection === section.id}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200">
        {activeSection === "summary" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {translations[language].plainSummary}
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {analysis.plainSummary}
              </p>
            </div>
          </div>
        )}

        {activeSection === "clauses" && (
          <div className="p-8 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {translations[language].clauseLens}
            </h3>
            {analysis.clauses.map((clause) => (
              <div
                key={clause.id}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  onClick={() => toggleClause(clause.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                    <span className="font-medium text-gray-900">
                      {clause.title}
                    </span>
                  </div>
                  {expandedClauses.has(clause.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedClauses.has(clause.id) && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Original Text:
                      </h4>
                      <p className="text-sm text-gray-700 italic">
                        {clause.originalText}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Plain English:
                      </h4>
                      <p className="text-gray-700">{clause.simplifiedText}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Analysis:
                      </h4>
                      <p className="text-gray-700">{clause.explanation}</p>
                    </div>

                    {clause.rolePerspectives &&
                      clause.rolePerspectives.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Role-specific views:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {clause.rolePerspectives.map((rp, idx) => (
                              <div
                                key={idx}
                                className="border border-gray-200 rounded-lg p-4 bg-white"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {rp.role}
                                  </span>
                                </div>
                                {rp.interpretation && (
                                  <div className="mb-3">
                                    <p className="text-sm text-gray-800">
                                      {rp.interpretation}
                                    </p>
                                  </div>
                                )}
                                {rp.obligations &&
                                  rp.obligations.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-900 mb-1">
                                        Obligations:
                                      </p>
                                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                                        {rp.obligations.map((ob, i) => (
                                          <li key={i}>{ob}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                {rp.risks && rp.risks.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      Risks:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {translations[language].riskRadar}
            </h3>
            <div className="space-y-4">
              {analysis.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="border border-gray-200 rounded-lg p-6"
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
                        <h4 className="font-bold text-gray-900">
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
                      <p className="text-gray-700 mb-3">{risk.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          {translations[language].recommendation}:
                        </p>
                        <p className="text-sm text-blue-800">
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {translations[language].actionPoints}
            </h3>
            <div className="space-y-3">
              {analysis.actionPoints.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-800">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "citations" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {translations[language].citations}
            </h3>
            <div className="space-y-4">
              {analysis.citations.map((citation, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <ExternalLink className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">
                        {citation.title}
                      </h4>
                      <p className="text-gray-700 mb-3">
                        {citation.description}
                      </p>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
        
        {activeSection === "timeline" && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {translations[language].timeline}
            </h3>
            {formattedTimeline.length > 0 ? (
                <AIGeneratedTimeline events={formattedTimeline} />
            ) : (
                <p className="text-gray-500">No timeline data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
