import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Upload, Loader2, Send, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentInputProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
  language: 'en' | 'hi';
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onSubmit, isAnalyzing, language }) => {
  const [documentText, setDocumentText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      title: 'Upload Your Legal Document',
      subtitle: 'Get instant plain-language analysis of contracts, agreements, and legal documents',
      dragText: 'Drag and drop your PDF here, or click to browse',
      orText: 'OR',
      pasteText: 'Paste your document text directly',
      placeholder: 'Paste your legal document text here...',
      analyze: 'Analyze Document',
      analyzing: 'Analyzing Document...',
      sampleText: 'Try Sample Contract'
    },
    hi: {
      title: 'अपना कानूनी दस्तावेज़ अपलोड करें',
      subtitle: 'अनुबंध, समझौते और कानूनी दस्तावेजों का तुरंत सरल भाषा में विश्लेषण प्राप्त करें',
      dragText: 'अपनी PDF यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      orText: 'अथवा',
      pasteText: 'अपने दस्तावेज़ का टेक्स्ट सीधे पेस्ट करें',
      placeholder: 'अपने कानूनी दस्तावेज़ का टेक्स्ट यहाँ पेस्ट करें...',
      analyze: 'दस्तावेज़ का विश्लेषण करें',
      analyzing: 'दस्तावेज़ का विश्लेषण हो रहा है...',
      sampleText: 'नमूना अनुबंध आज़माएं'
    }
  };

  // Ensure the input reflects the latest pasted text or extracted file content

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileType(file.type || file.name.split('.').pop() || 'file');
    setIsUploading(true);
    setUploadProgress(10);

    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      extractTextFromPdf(file, (percent) => setUploadProgress(Math.min(99, Math.max(10, Math.floor(percent)))))
        .then((text) => {
          setDocumentText(text);
          setUploadProgress(100);
          setTimeout(() => setIsUploading(false), 600);
        })
        .catch(() => {
          setUploadProgress(0);
          setIsUploading(false);
          setDocumentText('');
          // eslint-disable-next-line no-alert
          alert('Could not extract text from PDF. Please try another file.');
        });
      return;
    }

    const isTextLike = file.type.startsWith('text/') || /\.txt$/i.test(file.name);
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(Math.max(10, Math.min(99, percent)));
      }
    };
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setDocumentText(result);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 600);
    };
    reader.onerror = () => {
      setUploadProgress(0);
      setIsUploading(false);
      setDocumentText('');
      // eslint-disable-next-line no-alert
      alert('Could not read the selected file. Please try another file or paste text.');
    };
    if (isTextLike) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (documentText.trim()) {
      onSubmit(documentText);
    }
  };

  const loadSample = () => {
    // Keep button behavior minimal or remove in future if not needed
    setDocumentText('');
  };

  // PDF text extraction using pdf.js
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

  async function extractTextFromPdf(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(20);
    const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it: any) => ('str' in it ? it.str : '')).filter(Boolean);
      pageTexts.push(strings.join(' '));
      const base = 30;
      const span = 70;
      onProgress?.(base + Math.round((i / numPages) * span));
    }

    return pageTexts.join('\n\n');
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          {translations[language].title}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {translations[language].subtitle}
        </p>
      </div>

      {/* Input Section */}
      <div className="relative rounded-2xl p-6 space-y-6 bg-white/80 backdrop-blur shadow-[0_10px_30px_rgba(2,6,23,0.06)] border border-slate-200 max-w-xl mx-auto">
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/60" />

        {/* Upload progress bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              key="progress-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 top-0 px-4 pt-4"
            >
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-sky-500"
                  style={{ width: `${uploadProgress}%`, transition: 'width 200ms ease' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File card */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              key="file-card"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  {uploadProgress >= 100 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{uploadedFileName}</p>
                <p className="text-xs text-gray-500 truncate">{uploadedFileType}</p>
              </div>
              <div className="text-xs text-gray-600 font-medium">{uploadProgress}%</div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* File Upload */}
        <div
          className={`relative rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 shadow-inner' 
              : 'border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4 drop-shadow-sm" />
          </motion.div>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {translations[language].dragText}
          </p>
          <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT</p>
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 font-medium">
            {translations[language].orText}
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            {translations[language].pasteText}
          </label>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder={translations[language].placeholder}
            className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-inner bg-white/70"
          />
          
          <div className="flex justify-between items-center">
            <button
              onClick={loadSample}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              {translations[language].sampleText}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!documentText.trim() || isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:shadow-blue-400/50 hover:shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{translations[language].analyzing}</span>
                </>
              ) : (
                <>
                  <motion.span initial={false} animate={{ rotate: isUploading ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <Send className="h-4 w-4" />
                  </motion.span>
                  <span>{translations[language].analyze}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentInput;