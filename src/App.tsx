import React, { useState } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle, Clock, Globe, Search, Download } from 'lucide-react';
import Header from './components/Header';
import DocumentInput from './components/DocumentInput';
import AnalysisResults from './components/AnalysisResults';
import Footer from './components/Footer';
import { DocumentAnalysis, SimplificationLevel } from './types/legal';

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [simplificationLevel, setSimplificationLevel] = useState<SimplificationLevel>('simple');

  const handleDocumentSubmit = async (content: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    const mockAnalysis: DocumentAnalysis = {
      id: Date.now().toString(),
      documentType: 'Service Agreement',
      plainSummary: 'This is a service agreement between a client and service provider. The provider agrees to deliver specific services for payment. Key obligations include meeting deadlines, maintaining confidentiality, and following termination procedures. Payment terms require net-30 payment with late fees. Both parties can terminate with 30 days notice.',
      clauses: [
        {
          id: '1',
          title: 'Service Delivery',
          originalText: 'The Service Provider shall deliver all agreed services within the timeframes specified in Schedule A, failing which penalties as outlined in Section 12 shall apply.',
          simplifiedText: 'You must complete all work by the deadlines listed in Schedule A. If you\'re late, you\'ll pay penalties.',
          riskLevel: 'medium',
          explanation: 'This clause puts pressure on timely delivery but includes penalty clauses that could be costly if deadlines are missed.'
        },
        {
          id: '2',
          title: 'Payment Terms',
          originalText: 'Payment shall be made within thirty (30) days of invoice receipt. Late payments shall incur interest at 1.5% per month on outstanding amounts.',
          simplifiedText: 'You have 30 days to pay after getting an invoice. Late payments cost extra 1.5% per month.',
          riskLevel: 'low',
          explanation: 'Standard payment terms with reasonable late fee structure.'
        },
        {
          id: '3',
          title: 'Intellectual Property',
          originalText: 'All intellectual property created during the performance of services shall become the exclusive property of the Client, including all derivative works and modifications.',
          simplifiedText: 'Anything you create while working belongs entirely to the client, including any changes or improvements.',
          riskLevel: 'high',
          explanation: 'This clause assigns all IP rights to the client, which means you lose ownership of your work and any innovations.'
        },
        {
          id: '4',
          title: 'Termination',
          originalText: 'Either party may terminate this agreement with thirty (30) days written notice. Upon termination, all deliverables completed to date shall be transferred to Client.',
          simplifiedText: 'Either side can end this contract with 30 days notice. You must hand over all completed work when it ends.',
          riskLevel: 'low',
          explanation: 'Fair termination clause that gives both parties flexibility to exit the relationship.'
        }
      ],
      risks: [
        {
          id: '1',
          clause: 'Intellectual Property',
          description: 'Complete loss of IP rights',
          severity: 'high',
          recommendation: 'Negotiate to retain rights to pre-existing IP and general methodologies'
        },
        {
          id: '2',
          clause: 'Service Delivery',
          description: 'Penalty exposure for delays',
          severity: 'medium',
          recommendation: 'Request force majeure clause and reasonable penalty caps'
        }
      ],
      actionPoints: [
        'Review Schedule A deadlines carefully before signing',
        'Negotiate IP clause to protect your pre-existing work',
        'Clarify penalty calculation method in Section 12',
        'Ensure you have adequate insurance for potential penalties',
        'Set up invoicing system for 30-day payment terms'
      ],
      citations: [
        {
          title: 'Indian Contract Act, 1872 - Section 73',
          url: 'https://www.bareacts.in/indian-contract-act-1872/section-73',
          description: 'Compensation for loss or damage caused by breach of contract'
        },
        {
          title: 'Copyright Act, 1957 - Section 17',
          url: 'https://www.bareacts.in/copyright-act-1957/section-17',
          description: 'First owner of copyright in works for hire'
        }
      ]
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        language={language} 
        onLanguageChange={setLanguage}
        simplificationLevel={simplificationLevel}
        onSimplificationChange={setSimplificationLevel}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!analysis ? (
          <DocumentInput 
            onSubmit={handleDocumentSubmit} 
            isAnalyzing={isAnalyzing}
            language={language}
          />
        ) : (
          <AnalysisResults 
            analysis={analysis} 
            language={language}
            simplificationLevel={simplificationLevel}
            onNewAnalysis={() => setAnalysis(null)}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;