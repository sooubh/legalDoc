import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Send } from 'lucide-react';

interface DocumentInputProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
  language: 'en' | 'hi';
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onSubmit, isAnalyzing, language }) => {
  const [documentText, setDocumentText] = useState('');
  const [dragActive, setDragActive] = useState(false);
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

  const sampleContract = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [Date] between [Client Name], a [State] corporation ("Client") and [Service Provider Name] ("Provider").

1. SERVICES
Provider agrees to perform the services described in Schedule A attached hereto and incorporated by reference ("Services").

2. PAYMENT TERMS
Client shall pay Provider the fees set forth in Schedule A. Payment shall be made within thirty (30) days of invoice receipt. Late payments shall incur interest at 1.5% per month on outstanding amounts.

3. INTELLECTUAL PROPERTY
All intellectual property created during the performance of services shall become the exclusive property of the Client, including all derivative works and modifications.

4. CONFIDENTIALITY
Provider acknowledges that it may receive confidential information and agrees to maintain strict confidentiality for a period of five (5) years after termination.

5. TERMINATION
Either party may terminate this agreement with thirty (30) days written notice. Upon termination, all deliverables completed to date shall be transferred to Client.

6. LIABILITY
Provider's liability shall be limited to the amount of fees paid under this agreement. Provider shall not be liable for consequential or indirect damages.

7. GOVERNING LAW
This Agreement shall be governed by the laws of [State] without regard to conflict of law principles.`;

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
    // Simulate PDF text extraction
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentText(sampleContract); // In a real app, this would extract text from PDF
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (documentText.trim()) {
      onSubmit(documentText);
    }
  };

  const loadSample = () => {
    setDocumentText(sampleContract);
  };

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
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* File Upload */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
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
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
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
            className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
          
          <div className="flex justify-between items-center">
            <button
              onClick={loadSample}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {translations[language].sampleText}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!documentText.trim() || isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{translations[language].analyzing}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
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