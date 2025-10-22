import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Upload, Loader2, Send, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js/dist/tesseract.esm.min.js';

interface DocumentInputProps {
  onSubmit: (content: string, fileMeta?: { pdfUrl?: string; mime?: string }) => void;
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

  type Sample = { id: string; label: string; text: string };
  const sampleContracts: Record<'en' | 'hi', Sample[]> = {
    en: [
      {
        id: 'service-agreement',
        label: 'Service Agreement',
        text: `SERVICE AGREEMENT\n\nThis Service Agreement ("Agreement") is made between ClientCo LLC ("Client") and Provider Inc. ("Provider").\n\n1. Scope of Services. Provider will design, develop, test, and deliver features described in Statement of Work #1, including weekly demos, documentation, and handover. Provider will use commercially reasonable efforts to meet milestones.\n\n2. Term and Renewal. Initial term: six (6) months starting the Effective Date. The Agreement auto-renews month-to-month unless either party gives 30 days' notice before renewal.\n\n3. Fees and Expenses. (a) Monthly retainer: USD 10,000, invoiced in advance, payable net-30. (b) Out-of-pocket expenses (cloud, licenses) pre-approved by Client will be reimbursed at cost. Late payments accrue 1.5% per month.\n\n4. Change Management. Material changes to scope require a written change order specifying impact on timeline and fees.\n\n5. Intellectual Property. (a) Client IP: Client owns Deliverables specifically created for Client upon full payment. (b) Provider Background IP: Provider retains ownership of pre-existing and general reusable tools, granting Client a perpetual, worldwide, royalty-free license to use them as embedded in Deliverables.\n\n6. Confidentiality. Each party agrees to protect Confidential Information with reasonable care and use it solely for performance under this Agreement.\n\n7. Data Protection. Provider will implement reasonable technical and organizational security measures and promptly notify Client of any security incident impacting Client Data.\n\n8. Warranties and Disclaimer. Provider warrants Services will be performed in a professional and workmanlike manner. EXCEPT AS EXPRESSLY PROVIDED, SERVICES AND DELIVERABLES ARE PROVIDED "AS IS".\n\n9. Indemnification. Provider will defend and indemnify Client against third-party IP infringement claims arising from Deliverables, excluding Client-provided materials or unauthorized modifications.\n\n10. Limitation of Liability. Neither party is liable for indirect, incidental, special, or consequential damages. Aggregate liability will not exceed fees paid in the three (3) months preceding the claim.\n\n11. Termination. Either party may terminate for material breach not cured within fifteen (15) days of written notice. Upon termination, Client shall pay fees due through the effective termination date.\n\n12. Governing Law; Venue. This Agreement is governed by the laws of Delaware, USA, with exclusive venue in New Castle County courts.\n\nEffective Date: 2024-01-15\nAuthorized Signatures: ______________________`
      },
      {
        id: 'nda',
        label: 'Mutual NDA',
        text: `MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Mutual NDA ("Agreement") is between Alpha Corp ("Party A") and Beta Ltd ("Party B").\n\n1. Purpose. Parties intend to explore a potential business relationship involving technology collaboration and will share certain Confidential Information for that purpose.\n\n2. Definition. "Confidential Information" means non-public information disclosed by a party that is marked confidential or should reasonably be understood as confidential, including product roadmaps, code, designs, customer data, and pricing.\n\n3. Obligations. Receiving Party will (a) use Confidential Information only for the Purpose, (b) not disclose it to third parties except to employees and contractors bound by similar obligations, and (c) protect it using reasonable care.\n\n4. Exclusions. Confidential Information does not include information that is publicly available, already known without duty of confidentiality, independently developed, or rightfully obtained from a third party without breach.\n\n5. Compelled Disclosure. Receiving Party may disclose Confidential Information when required by law, provided it gives prompt notice (if lawful) and cooperates to seek protective treatment.\n\n6. Term. The disclosure period is one (1) year; confidentiality obligations survive for three (3) years thereafter. Trade secrets remain protected as long as they qualify under applicable law.\n\n7. No License. No licenses are granted by this Agreement other than as expressly set forth.\n\n8. Return/Destruction. Upon request, Receiving Party will promptly return or destroy Confidential Information and certify destruction.\n\n9. Remedies. Breach may cause irreparable harm; disclosing party is entitled to equitable relief in addition to other remedies.\n\n10. Miscellaneous. This Agreement does not create an obligation to enter into any further agreement.\n\nEffective Date: 2024-03-10\nAuthorized Signatures: ______________________`
      },
      {
        id: 'residential-lease',
        label: 'Residential Lease',
        text: `RESIDENTIAL LEASE AGREEMENT\n\nLandlord: Green Properties LLC ("Landlord")\nTenant: John Doe ("Tenant")\nPremises: 123 Maple Street, Unit 4B, Springfield, ST 00000\n\n1. Term. Twelve (12) months beginning May 1, 2024 and ending April 30, 2025.\n\n2. Rent. Monthly rent USD 1,800 due on the 1st of each month. Rent received after the 5th incurs a late fee of USD 75.\n\n3. Security Deposit. USD 1,800 due at signing; may be used for unpaid rent or damages beyond normal wear and tear and will be returned within 30 days subject to itemized deductions.\n\n4. Utilities. Tenant pays electricity and internet. Landlord pays water and trash.\n\n5. Use and Occupancy. Residential use only; no illegal activity; maximum occupancy two (2) adults.\n\n6. Maintenance. Tenant must keep the Premises clean and promptly report issues. Landlord will handle structural, plumbing, and electrical repairs within a reasonable time.\n\n7. Alterations. No material alterations without Landlord's prior written consent.\n\n8. Pets. One (1) cat or small dog permitted with prior consent and a non-refundable USD 300 pet fee; Tenant responsible for pet-related damages.\n\n9. Entry. Landlord may enter with 24 hours' notice for inspection, maintenance, or showing, or immediately in emergencies.\n\n10. Insurance. Tenant encouraged to maintain renter's insurance.\n\n11. Default; Remedies. Non-payment or material breach allows Landlord to give notice and pursue remedies per applicable law.\n\n12. Governing Law. State law of the Premises governs this Lease.\n\nSignatures: ______________________`
      }
    ],
    hi: [
      {
        id: 'service-agreement',
        label: 'सेवा अनुबंध',
        text: `सेवा अनुबंध (Service Agreement)\n\nयह अनुबंध क्लाइंटको एलएलसी ("क्लाइंट") और प्रोवाइडर इंक. ("प्रोवाइडर") के बीच किया गया है।\n\n1. सेवाओं का दायरा. प्रोवाइडर स्टेटमेंट ऑफ वर्क #1 में वर्णित फीचर्स का डिजाइन, विकास, परीक्षण और डिलीवरी करेगा; साप्ताहिक डेमो, दस्तावेज़ीकरण और हैंडओवर शामिल होंगे।\n\n2. अवधि और नवीनीकरण. प्रारंभिक अवधि छह (6) माह; इसके बाद स्वतः मासिक नवीनीकरण जब तक कि कोई पक्ष 30 दिन पूर्व लिखित सूचना न दे।\n\n3. शुल्क एवं व्यय. (क) मासिक रिटेनर: USD 10,000 (इनवॉइस अग्रिम, नेट-30)। (ख) पूर्व-स्वीकृत बाह्य व्यय लागत पर प्रतिपूर्ति। विलंब पर 1.5% मासिक ब्याज।\n\n4. परिवर्तन प्रबंधन. कार्य-क्षेत्र में महत्वपूर्ण परिवर्तन हेतु लिखित परिवर्तन आदेश आवश्यक होगा।\n\n5. बौद्धिक संपदा. (क) क्लाइंट आईपी: क्लाइंट के लिए विशेष रूप से बनाए गए डिलीवेरेबल्स का स्वामित्व पूर्ण भुगतान पर क्लाइंट को। (ख) प्रोवाइडर पृष्ठभूमि आईपी: प्रोवाइडर अपने पूर्व-विद्यमान/पुन: उपयोग योग्य टूल का स्वामी रहेगा; डिलीवेरेबल्स में निहित रूप में क्लाइंट को उनका स्थायी, विश्वव्यापी, रॉयल्टी-मुक्त लाइसेंस मिलेगा।\n\n6. गोपनीयता. पक्ष गोपनीय जानकारी की उचित सुरक्षा करेंगे और केवल अनुबंध निष्पादन हेतु उपयोग करेंगे।\n\n7. डेटा सुरक्षा. प्रोवाइडर उचित तकनीकी/संगठनात्मक सुरक्षा उपाय लागू करेगा और सुरक्षा घटना होने पर शीघ्र सूचित करेगा।\n\n8. वारंटी एवं अस्वीकरण. प्रोवाइडर सेवाएँ व्यावसायिक एवं कार्यकुशल तरीके से प्रदान करने की वारंटी देता है; अन्य सभी वारंटियाँ अस्वीकारित हैं।\n\n9. क्षतिपूर्ति. डिलीवेरेबल्स से उत्पन्न तृतीय-पक्ष आईपी उल्लंघन दावों के विरुद्ध प्रोवाइडर रक्षा/क्षतिपूर्ति करेगा (क्लाइंट सामग्री/अनधिकृत परिवर्तनों को छोड़कर)।\n\n10. दायित्व सीमा. किसी भी पक्ष की अप्रत्यक्ष/विशेष/परिणामी हानि हेतु कोई उत्तरदायित्व नहीं; कुल उत्तरदायित्व पिछले तीन (3) माह की फीस से अधिक नहीं।\n\n11. समाप्ति. भौतिक उल्लंघन पर 15 दिन में उपचार न होने पर पक्ष अनुबंध समाप्त कर सकता है; समाप्ति तिथि तक देय शुल्क देय होंगे।\n\n12. प्रभार्य विधि; क्षेत्राधिकार. यह अनुबंध डेलावेयर, यूएसए के कानूनों द्वारा शासित होगा; विशेष क्षेत्राधिकार न्यू कैसल काउंटी की अदालतें।\n\nप्रभावी तिथि: 2024-01-15\nहस्ताक्षर: ______________________`
      },
      {
        id: 'nda',
        label: 'परस्पर गोपनीयता समझौता (NDA)',
        text: `परस्पर गैर-प्रकटीकरण समझौता (Mutual NDA)\n\nयह समझौता अल्फा कॉर्प ("पक्ष अ") और बीटा लिमिटेड ("पक्ष ब") के बीच है।\n\n1. उद्देश्य. संभावित व्यावसायिक सहयोग का मूल्यांकन करने हेतु पक्ष गोपनीय जानकारी साझा कर सकते हैं।\n\n2. परिभाषा. "गोपनीय जानकारी" गैर-सार्वजनिक जानकारी है जो गोपनीय चिह्नित हो या उचित रूप से गोपनीय समझी जाए, जैसे रोडमैप, कोड, डिज़ाइन, ग्राहक डेटा, मूल्य निर्धारण।\n\n3. दायित्व. प्राप्तकर्ता (क) गोपनीय जानकारी का उपयोग केवल उद्देश्य हेतु करेगा, (ख) तृतीय पक्ष को प्रकटीकरण नहीं करेगा सिवाय उन कर्मचारियों/ठेकेदारों के जो समान दायित्वों से बँधे हैं, और (ग) उचित सावधानी से सुरक्षा करेगा।\n\n4. अपवाद. सार्वजनिक, पूर्व-ज्ञात, स्वतंत्र विकसित, या वैध तृतीय पक्ष से प्राप्त जानकारी गोपनीय नहीं मानी जाएगी।\n\n5. आवश्यक प्रकटीकरण. क़ानूनन आवश्यक प्रकटीकरण की स्थिति में यथासंभव अग्रिम सूचना और संरक्षण के उपायों में सहयोग।\n\n6. अवधि. प्रकटीकरण अवधि एक (1) वर्ष; गोपनीयता दायित्व तीन (3) वर्ष तक प्रभावी रहेंगे; व्यापार-गोपनीयियाँ क़ानून अनुसार संरक्षित रहेंगी।\n\n7. लाइसेंस नहीं. इस समझौते के अंतर्गत कोई लाइसेंस प्रदान नहीं किया जाता जब तक स्पष्ट रूप से न कहा गया हो।\n\n8. वापसी/नष्ट करना. अनुरोध पर प्राप्तकर्ता गोपनीय जानकारी वापस करेगा या नष्ट करेगा और प्रमाणित करेगा।\n\n9. उपचार. उल्लंघन से अपूरणीय क्षति हो सकती है; प्रकटीकरणकर्ता को निषेधाज्ञा सहित उपाय प्राप्त होंगे।\n\n10. विविध. यह समझौता किसी आगे के अनुबंध का दायित्व उत्पन्न नहीं करता।\n\nप्रभावी तिथि: 2024-03-10\nहस्ताक्षर: ______________________`
      },
      {
        id: 'residential-lease',
        label: 'आवासीय पट्टा (Residential Lease)',
        text: `आवासीय पट्टा अनुबंध\n\nभू-स्वामी: ग्रीन प्रॉपर्टीज एलएलसी ("भू-स्वामी")\nकिरायेदार: जॉन डो ("किरायेदार")\nपरिसर: 123 मेपल स्ट्रीट, यूनिट 4B, स्प्रिंगफील्ड, ST 00000\n\n1. अवधि. 1 मई 2024 से 30 अप्रैल 2025 तक बारह (12) माह।\n\n2. किराया. मासिक किराया USD 1,800; प्रत्येक माह की 1 तारीख को देय; 5 तारीख के बाद भुगतान पर USD 75 विलंब शुल्क।\n\n3. सुरक्षा जमा. USD 1,800 हस्ताक्षर पर देय; सामान्य घिसावट से परे क्षति/बकाया किराये के समायोजन के बाद 30 दिनों में वापसी (आइटमाइज्ड कटौतियाँ लागू)।\n\n4. उपयोगिताएँ. किरायेदार: बिजली, इंटरनेट; भू-स्वामी: पानी, कचरा।\n\n5. उपयोग. केवल आवासीय उपयोग; अवैध गतिविधि वर्जित; अधिकतम दो (2) वयस्क।\n\n6. रखरखाव. परिसर की सफाई/रखरखाव और समस्याओं की शीघ्र सूचना; भू-स्वामी संरचना/प्लंबिंग/विद्युत मरम्मत उचित समय में करेगा।\n\n7. परिवर्तन. लिखित पूर्व-सहमति के बिना भौतिक परिवर्तन नहीं।\n\n8. पालतू पशु. पूर्व स्वीकृति और USD 300 गैर-वापसी योग्य शुल्क के साथ एक (1) पालतू अनुमत; क्षति के लिए किरायेदार उत्तरदायी।\n\n9. प्रवेश. निरीक्षण/रख-रखाव/दिखाने हेतु 24 घंटे पूर्व सूचना पर प्रवेश; आपातकाल में तुरंत।\n\n10. बीमा. किरायेदार को रेंटर बीमा रखने की सलाह।\n\n11. डिफ़ॉल्ट/उपाय. भुगतान न होना या भौतिक उल्लंघन पर विधि अनुसार नोटिस और उपाय।\n\n12. प्रभार्य विधि. परिसर के राज्य का क़ानून लागू होगा।\n\nहस्ताक्षर: ______________________`
      }
    ]
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
      try {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] Failed to create object URL for PDF', { fileName: file.name, error: err });
      }
      extractTextFromPdf(file, (percent) => setUploadProgress(Math.min(99, Math.max(10, Math.floor(percent)))))
        .then(async (text) => {
          let finalText = text?.trim() || '';
          // If regular extraction yields very little, attempt OCR
          if (finalText.length < 40) {
            try {
              const ocrText = await ocrExtractTextFromPdf(file, language, (p) => setUploadProgress(Math.min(99, Math.max(10, Math.floor(p)))));
              if (ocrText.trim().length > finalText.length) {
                finalText = ocrText.trim();
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('[DocumentInput] OCR fallback failed', { fileName: file.name, error: err });
            }
          }
          setDocumentText(finalText);
          setUploadProgress(100);
          setTimeout(() => setIsUploading(false), 600);
        })
        .catch((err) => {
          setUploadProgress(0);
          setIsUploading(false);
          setDocumentText('');
          setPdfUrl(null);
          // eslint-disable-next-line no-console
          console.error('[DocumentInput] PDF text extraction failed', { fileName: file.name, error: err });
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
    reader.onerror = (e) => {
      setUploadProgress(0);
      setIsUploading(false);
      setDocumentText('');
      setPdfUrl(null);
      // eslint-disable-next-line no-console
      console.error('[DocumentInput] File read failed', { fileName: file.name, error: e });
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
      onSubmit(documentText, { pdfUrl: pdfUrl || undefined, mime: uploadedFileType });
    }
  };

  const [selectedSampleId, setSelectedSampleId] = useState<string>(() => sampleContracts[language][0]?.id || '');

  // Sync selected sample when language changes so the id exists in the new list
  React.useEffect(() => {
    const first = sampleContracts[language][0]?.id || '';
    setSelectedSampleId(first);
  }, [language]);

  const loadSample = () => {
    const list = sampleContracts[language];
    const chosen = list.find(s => s.id === selectedSampleId) || list[0];
    const sample = chosen?.text || '';
    setPdfUrl(null);
    setUploadedFileName('');
    setUploadedFileType('');
    setDocumentText(sample);
    onSubmit(sample);
  };

  // PDF text extraction using pdf.js
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

  async function extractTextFromPdf(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(20);
    const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
    let pdf: any;
    try {
      pdf = await loadingTask.promise;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[DocumentInput] Failed to load PDF for extraction', { fileName: file.name, error: err });
      throw err;
    }
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it: any) => ('str' in it ? it.str : '')).filter(Boolean);
        pageTexts.push(strings.join(' '));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] Failed to extract text on page', { fileName: file.name, page: i, error: err });
        pageTexts.push('');
      } finally {
        const base = 30;
        const span = 40; // reserve remaining for OCR if needed
        onProgress?.(base + Math.round((i / numPages) * span));
      }
    }

    return pageTexts.join('\n\n');
  }

  function mapOcrLang(lang: 'en' | 'hi'): string {
    return lang === 'hi' ? 'hin' : 'eng';
  }

  async function ocrExtractTextFromPdf(
    file: File,
    lang: 'en' | 'hi',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    let pdf: any;
    try {
      pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[DocumentInput] Failed to load PDF for OCR', { fileName: file.name, error: err });
      throw err;
    }
    const numPages = pdf.numPages as number;

    const texts: string[] = [];
    const tessLang = mapOcrLang(lang);

    for (let i = 1; i <= numPages; i++) {
      let page: any;
      try {
        page = await pdf.getPage(i);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] Failed to get page for OCR', { fileName: file.name, page: i, error: err });
        texts.push('');
        continue;
      }
      const viewport = page.getViewport({ scale: 2 }); // higher scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (!context) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] Canvas 2D context unavailable for OCR', { fileName: file.name, page: i });
        texts.push('');
        continue;
      }
      try {
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] Failed to render page for OCR', { fileName: file.name, page: i, error: err });
        texts.push('');
        continue;
      }

      // Tesseract recognition
      try {
        const { data } = await Tesseract.recognize(canvas, tessLang, {
          logger: (m: { status?: string; progress?: number }) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              const base = 70; // continue from where extractTextFromPdf left off
              const perPage = (100 - base) / numPages;
              const pageProgress = base + perPage * (i - 1 + m.progress);
              onProgress?.(Math.min(99, Math.floor(pageProgress)));
            }
          },
        });
        texts.push(data.text || '');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[DocumentInput] OCR recognition failed on page', { fileName: file.name, page: i, lang: tessLang, error: err });
        texts.push('');
      }
    }

    return texts.join('\n\n');
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
          {translations[language].title}
        </h2>
        <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
          {translations[language].subtitle}
        </p>
      </div>

      {/* Input Section */}
      <div className="relative rounded-2xl p-6 space-y-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-[0_10px_30px_rgba(2,6,23,0.06)] border border-slate-200 dark:border-slate-700 max-w-xl mx-auto">
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
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-200">
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
              ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-800 shadow-inner' 
              : 'border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'
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
          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
            {translations[language].dragText}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">PDF, DOC, DOCX, TXT</p>
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
          <label className="block text-lg font-medium text-gray-700 dark:text-slate-200">
            {translations[language].pasteText}
          </label>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder={translations[language].placeholder}
            className="w-full h-64 p-4 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-inner bg-white/70 dark:bg-slate-900/70 dark:text-slate-100"
          />
          
          <div className="flex justify-between items-center flex-col gap-5">
            <div className="flex items-center gap-5 md:gap-2">
              <label className="text-sm text-gray-600 dark:text-slate-300">Sample:</label>
              <select
                className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 rounded px-2 py-1 text-sm w-20 "
                value={selectedSampleId}
                onChange={(e) => setSelectedSampleId(e.target.value)}
              >
                {sampleContracts[language].map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={loadSample}
                className=" md:ml-5 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 font-medium transition-colors hover:underline"
              >
                {translations[language].sampleText}
              </button>
            </div>
            
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