import React, { useState, useRef, useCallback, useEffect } from "react";
import { PdfPreview } from "../pdfDownlode/PdfPreview";
import { Loader } from "../pdfDownlode/Loader";
import { generateExplanation } from "../services/geminiPdfService";
import { downloadPdf } from "../services/pdfService";
import {
  DownloadIcon,
  RefreshIcon,
  SparklesIcon,
} from "../pdfDownlode/icons";

const SESSION_STORAGE_KEY = "latestLegalData";

const mockLegalData = {
  documentId: "DOC-2024-Q3-XYZ",
  documentType: "Non-Disclosure Agreement",
  parties: [
    { name: "Innovate Corp.", role: "Disclosing Party" },
    { name: "Venture Partners LLC", role: "Receiving Party" },
  ],
  analysis: {
    summary:
      "A standard mutual non-disclosure agreement. Key clauses include a 5-year confidentiality term and jurisdiction set to the State of Delaware.",
    riskAssessment: "Low",
    clauses: [
      { name: "Confidentiality Term", duration: "5 years", risk: "Low" },
      { name: "Jurisdiction", location: "State of Delaware", risk: "Low" },
      { name: "Non-Compete", present: false, risk: "N/A" },
    ],
  },
};

const MorePage: React.FC = () => {
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(mockLegalData, null, 2)
      );
    }
  }, []);

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setJsonData(null);

    try {
      const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedData) {
        throw new Error(
          "No legal data found in session. Please refresh the page."
        );
      }
      const data = JSON.parse(storedData);
      setJsonData(data);
      const htmlExplanation = await generateExplanation(data);
      setExplanation(htmlExplanation);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          `Failed to process data: ${err.message}. Please ensure session data is valid JSON.`
        );
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!pdfContentRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      await downloadPdf(pdfContentRef.current);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while generating the PDF.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setJsonData(null);
    setExplanation(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
            AI Legal Document Analyzer
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Generate a summarized, professional PDF from your legal data.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl ring-1 ring-slate-900/5 p-4 sm:p-8 transition-all duration-300">
          {isLoading && <Loader />}

          {error && (
            <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-semibold">An Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !explanation && (
            <div className="text-center p-12">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Ready to Analyze Your Document?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Click below to fetch legal data from session and generate an
                AI-powered summary.
              </p>
              <button
                onClick={handleStartAnalysis}
                disabled={isLoading}
                className="inline-flex items-center gap-3 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon />
                Start Analysis
              </button>
            </div>
          )}

          {explanation && (
            <div>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Analysis Preview
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
                  >
                    <RefreshIcon />
                    Analyze Another
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadIcon />
                    {isLoading ? "Generating..." : "Download PDF"}
                  </button>
                </div>
              </div>
              <PdfPreview ref={pdfContentRef} content={explanation} />
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} LegalDoc Analyzer Pro. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MorePage;
