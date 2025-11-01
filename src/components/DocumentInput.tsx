import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { Upload, Loader2, Send, CheckCircle2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js/dist/tesseract.esm.min.js";

interface DocumentInputProps {
  onSubmit: (
    content: string,
    fileMeta?: { pdfUrl?: string; mime?: string }
  ) => void;
  isAnalyzing: boolean;
  language: "en" | "hi";
}

const DocumentInput: React.FC<DocumentInputProps> = ({
  onSubmit,
  isAnalyzing,
  language,
}) => {
  const [documentText, setDocumentText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileType, setUploadedFileType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Upload Your Legal Document",
      subtitle:
        "Get instant plain-language analysis of contracts, agreements, and legal documents",
      dragText: "Drag and drop your PDF here, or click to browse",
      orText: "OR",
      pasteText: "Paste your document text directly",
      placeholder: "Paste your legal document text here...",
      analyze: "Analyze Document",
      analyzing: "Analyzing Document...",
      sampleText: "Try Sample Contract",
    },
    hi: {
      title: "अपना कानूनी दस्तावेज़ अपलोड करें",
      subtitle:
        "अनुबंध, समझौते और कानूनी दस्तावेजों का तुरंत सरल भाषा में विश्लेषण प्राप्त करें",
      dragText:
        "अपनी PDF यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
      orText: "अथवा",
      pasteText: "अपने दस्तावेज़ का टेक्स्ट सीधे पेस्ट करें",
      placeholder: "अपने कानूनी दस्तावेज़ का टेक्स्ट यहाँ पेस्ट करें...",
      analyze: "दस्तावेज़ का विश्लेषण करें",
      analyzing: "दस्तावेज़ का विश्लेषण हो रहा है...",
      sampleText: "नमूना अनुबंध आज़माएं",
    },
  };

  type Sample = { id: string; label: string; text: string };
  const sampleContracts: Record<"en" | "hi", Sample[]> = {
 
    
      en: [
        {
          id: "income-tax-notice",
          label: "Income Tax Notice",
          text: `INCOME TAX DEPARTMENT — NOTICE\n\n
    Reference No.: ITD/ASMT/2025-26/0931\n
    Date: November 1, 2025\n\n
    To:\n
    Mr. Vikram S. Patel\n
    14B, Pearl Residency, Baner Road\n
    Pune, Maharashtra 411045\n\n
    Subject: Notice under Section 143(2) of the Income-tax Act, 1961 — Scrutiny of Return for AY 2025-26\n\n
    1. NOTICE\n
    Your Income Tax Return for Assessment Year 2025-26 has been selected for scrutiny under Section 143(2) of the Income-tax Act, 1961. The Assessing Officer requires clarification and supporting documents for certain items reported in your return for Financial Year 2024-25.\n\n
    2. DOCUMENTS / INFORMATION REQUIRED (to be submitted within 30 days)\n
    • Audited / unaudited financial statements for FY 2024-25 (if applicable).\\n
    • Bank statements for all operative accounts for the period 01-Apr-2024 to 31-Mar-2025.\\n
    • Salary slips and Form 16 / Form 16A (if applicable).\\n
    • Invoices/receipts supporting business income or professional fees declared.\\n
    • Proof of investments / deductions claimed under Chapter VI-A (tax-saving deposits, insurance, ELSS, etc.).\\n
    • Documentary explanation and supporting evidence for any high-value or one-time transactions (sales, capital gains, large deposits or transfers).\n\n
    3. MODE OF SUBMISSION\n
    Documents should be uploaded via the Income Tax e-filing portal under your registered account (e-Assessment -> Upload Documents) or submitted physically to the Assessing Officer's office (address below) during office hours (Mon–Fri, 10:00–17:00).\n\n
    4. CONSEQUENCES OF NON-COMPLIANCE\n
    If you fail to furnish the requested information within the prescribed period, the assessment may be completed on the basis of available records and evidence, and penalties may be levied as per the provisions of the Income-tax Act.\n\n
    5. CONTACT / OFFICE DETAILS\n
    Assessing Officer: Smt. Meera K. Desai\n
    Income Tax Office (Ward — Pune Central)\n
    Giri Building, Fergusson College Road, Pune — 411004\n
    Phone: +91-20-26123456 | Email: ao.pune.central@incometax.gov.in\n\n
    6. APPEAL\n
    If you disagree with any outcome of the assessment, you may avail statutory appeal remedies provided under the Income-tax Act (first appeal to the Commissioner (Appeals), subsequent appeals to Income Tax Appellate Tribunal, etc.).\n\n
    This notice is issued without prejudice to any other action that the Department may be entitled to take under law.\n\n
    By order of the Assessing Officer\n
    Income Tax Department — Pune Central\n
    Signature: _______________________\n
    Name: Meera K. Desai\n
    Designation: Assessing Officer\n
    Date: November 1, 2025\n`
        },
    
        {
          id: "municipal-notice",
          label: "Municipal Council Notice",
          text: `PUNE MUNICIPAL CORPORATION — NOTICE FOR REMOVAL OF UNAUTHORISED STALL(S)\n\n
    Ref.: PMC/ENC/2025/214\n
    Date: November 1, 2025\n\n
    To:\n
    Mr. Sanjay B. Raut (Occupier)\n
    Stall No.: M-23, Lane 5, Shastri Market, Ward No. 12\n
    Camp Area, Pune — 411001\n\n
    Subject: Notice to Remove Unauthorised Stall / Encroachment — Immediate Compliance Required\n\n
    1. NOTICE\n
    It has been observed during routine enforcement that an unauthorised stall/structure is being operated at the above-referenced location on public footpath/municipal land, in contravention of the Pune Municipal Corporation (Pavement & Encroachment) Regulations, 2019.\n\n
    2. DIRECTIONS\n
    You are hereby directed to remove the unauthorised stall, goods, signage and associated fixtures and clear the public area within 7 (seven) days from the date of this notice and restore the area to its original condition.\n\n
    3. FAILURE TO COMPLY\n
    If the stall/materials are not removed within the specified period, the Municipal Corporation will execute removal and clearance operations without further notice. All costs of removal, storage charges and applicable penalties will be recoverable from you under municipal by-laws.\n\n
    4. PENALTY & STORAGE\n
    • A penalty under the relevant municipal by-laws may be imposed.\\n
    • Items removed will be stored at the Corporation's temporary depot for a period of 30 days. If not claimed within that period and storage/handling charges not paid, the goods may be disposed of in accordance with municipal procedure.\n\n
    5. APPEAL / REPRESENTATION\n
    If you believe this notice has been issued in error or you possess a valid permit, submit a written representation with documentary proof to the Office of the Municipal Commissioner, Pune, within 7 days from the date of this notice. Representations will be considered but do not stay removal unless an authorized order directs otherwise.\n\n
    Contact:\n
    Office of the Municipal Commissioner\n
    Pune Municipal Corporation\n
    Municipal Building, Shivaji Nagar, Pune — 411005\n
    Phone: +91-20-25501234 | Email: enforcement@punecorporation.gov.in\n\n
    By order of the Municipal Commissioner\n
    Pune Municipal Corporation\n
    Signature: _______________________\n
    Name: Ajay R. Kulkarni\n
    Designation: Executive Engineer (Enforcement)\n
    Date: November 1, 2025\n`
        },
    
        {
          id: "legal-rent-agreement",
          label: "Legal Rent Agreement",
          text: `SHORT FORM RENTAL AGREEMENT\n\n
    This RENTAL AGREEMENT is made on this 1st day of November, 2025 between:\n\n
    Landlord: Ms. Kavita R. Sharma, residing at 9, Maple Grove, North Avenue, Pune — 411016 (hereinafter "Landlord"); and\n
    Tenant: Mr. Rohan K. Mehra, S/o. K. Mehra, currently residing at 21C, Lakeview Apartments, Kothrud, Pune — 411038 (hereinafter "Tenant").\n\n
    1. PREMISES\n
    Landlord agrees to let and Tenant agrees to take on rent the residential premises described as Flat No. 7A, Horizon Towers, Model Colony, Pune — 411016 (the "Premises"), including one covered parking slot (No. P-12) as per inventory attached.\n\n
    2. TERM\n
    The term of this Agreement shall commence on 1 November, 2025 and shall continue for a fixed period of 12 (twelve) months to 31 October, 2026, unless earlier terminated in accordance with this Agreement.\n\n
    3. RENT & DEPOSIT\n
    Monthly Rent: INR 25,000 (Rupees Twenty-Five Thousand only) payable in advance on or before the 5th day of each calendar month by bank transfer to the Landlord's account (Account No. 9876543210, HDFC Bank, IFSC: HDFC0001234).\n
    Security Deposit: INR 50,000 (equivalent to two months' rent) payable on or before the Commencement Date. The Deposit shall be refundable within 15 days of vacation subject to lawful deductions for damages, unpaid rent or other liabilities.\n\n
    4. USE, OCCUPANCY & MAINTENANCE\n
    4.1 The Premises shall be used solely for residential purposes by the Tenant and immediate family members. Subletting or assignment is prohibited without the Landlord's prior written consent.\n
    4.2 Tenant shall keep the Premises clean and shall be responsible for minor repairs and routine maintenance (e.g., light bulbs, minor plumbing fixtures). Landlord shall be responsible for major structural, electrical and plumbing repairs.\n\n
    5. UTILITIES & OUTGOINGS\n
    The Tenant shall be responsible for payment of electricity, water (if separately metered), internet, cooking gas and cable/OTT subscriptions. Society maintenance charges shall be borne by the Tenant if invoiced to the Premises; property taxes remain the Landlord's responsibility unless otherwise agreed.\n\n
    6. ALTERATIONS\n
    Tenant shall not make structural alterations or major modifications without Landlord's prior written consent. Tenant-installed fixtures that are removable shall remain Tenant's property if removed and the Premises restored to original condition.\n\n
    7. ENTRY & INSPECTION\n
    Landlord may enter the Premises on 24 hours' prior notice for inspection, repairs or to show to prospective purchasers/tenants. Immediate entry is permitted in case of emergency.\n\n
    8. DEFAULT & TERMINATION\n
    8.1 If Tenant fails to pay rent within seven (7) days of due date or breaches any material term, Landlord may issue a written notice to remedy. Failure to remedy within seven (7) days entitles Landlord to terminate the Agreement and seek eviction as permitted by law.\n
    8.2 Either Party may terminate this Agreement by providing sixty (60) days' prior written notice to the other Party.\n\n
    9. INDEMNITY\n
    Tenant agrees to indemnify and hold harmless Landlord from claims, losses or liabilities arising from Tenant's negligent or unlawful use of the Premises, except to the extent caused by Landlord's negligence.\n\n
    10. GOVERNING LAW\n
    This Agreement shall be governed by and construed in accordance with the laws of India. Disputes will be subject to the jurisdiction of courts in Pune, Maharashtra.\n\n
    11. MISCELLANEOUS\n
    This Agreement constitutes the entire understanding between the Parties. Amendments must be in writing and signed by both Parties. Electronic signatures shall be effective if agreed in writing.\n\n
    IN WITNESS WHEREOF the Parties have executed this Agreement as of the date first above written.\n\n
    Landlord: ___________________________\n
    Name: Kavita R. Sharma\n
    Date: November 1, 2025\n\n
    Tenant: _____________________________\n
    Name: Rohan K. Mehra\n
    Date: November 1, 2025\n`
        }
      ],
    
      hi: [
        {
          id: "income-tax-notice",
          label: "इनकम टैक्स नोटिस",
          text: `आयकर विभाग — सूचना / नोटिस\n\n
    संदर्भ संख्या: ITD/ASMT/2025-26/0931\n
    तिथि: 1 नवम्बर, 2025\n\n
    प्रति:\n
    श्री विक्रम एस. पटेल\n
    14B, पर्ल रेज़िडेंसी, बानेर रोड\n
    पुणे, महाराष्ट्र — 411045\n\n
    विषय: आयकर अधिनियम, 1961 की धारा 143(2) के तहत — आकलन वर्ष 2025-26 की जाँच हेतु नोटिस\n\n
    1. नोटिस\n
    आपका आयकर रिटर्न आकलन वर्ष 2025-26 के लिए धारा 143(2) के तहत जाँच हेतु चुना गया है। वित्तीय वर्ष 2024-25 में दाखिल कुछ प्रविष्टियों के सम्बन्ध में आकलन अधिकारी स्पष्टीकरण व सहायक दस्तावेज़ माँगते हैं।\n\n
    2. आवश्यक दस्तावेज / जानकारी (30 दिनों के भीतर प्रस्तुत करें)\n
    • वित्तीय वर्ष 2024-25 के ऑडिटेड/अनऑडिटेड खातों की प्रतियाँ।\\n
    • 01-04-2024 से 31-03-2025 तक सभी बैंक खातों के स्टेटमेंट्स।\\n
    • वेतन पर्चियाँ और Form 16 / Form 16A (यदि लागू)।\\n
    • व्यावसायिक आय या पेशेवर शुल्क के समर्थन में चालान / रसीदें।\\n
    • अध्याय VI-A के अंतर्गत दावा किये गए निवेश/कटौतियों के प्रमाण।\\n
    • किसी भी उच्च-मूल्य या एक-बार लेन-देन का दस्तावेजी विवरण।\n\n
    3. प्रस्तुत करने का तरीका\n
    दस्तावेज आयकर ई-फाइलिंग पोर्टल के माध्यम से अपलोड करें या कार्यालय पर कार्यदिवसों में (सोम–शुक्र, 10:00–17:00) भौतिक रूप से प्रस्तुत कर सकते हैं।\n\n
    4. अनुपालन विफलता के परिणाम\n
    नियत अवधि में अनुपालन न किए जाने पर आकलन उपलब्ध अभिलेखों के आधार पर पूर्ण किया जा सकता है तथा आयकर अधिनियम के अंतर्गत दंड/अन्य कार्रवाई लागू हो सकती है।\n\n
    5. संपर्क / कार्यालय विवरण\n
    आकलन अधिकारी: श्रीमती मीरा के. देसाई\n
    आयकर कार्यालय (वॉर्ड — पुणे सेंट्रल)\n
    गिरी बिल्डिंग, फर्ग्युसन कॉलेज रोड, पुणे — 411004\n
    फोन: +91-20-26123456 | ईमेल: ao.pune.central@incometax.gov.in\n\n
    यह नोटिस किसी अन्य वैधानिक कार्रवाई के अधिकार को प्रभावित किए बिना जारी किया जाता है।\n\n
    आदेश द्वारा\n
    आकलन अधिकारी\n
    हस्ताक्षर: _______________________\n
    नाम: मीरा के. देसाई\n
    पद: आकलन अधिकारी\n
    तिथि: 1 नवम्बर, 2025\n`
        },
    
        {
          id: "municipal-notice",
          label: "नगर पालिका नोटिस",
          text: `पुणे नगरपालिकाः — अनधिकृत स्टॉल हटाने का नोटिस\n\n
    संदर्भ: PMC/ENC/2025/214\n
    तिथि: 1 नवम्बर, 2025\n\n
    प्रति:\n
    श्री संजय बी. राऊत (संचालक)\n
    स्टॉल नं.: M-23, लेन 5, शास्त्री मार्केट, वार्ड नं. 12\n
    कैंप एरिया, पुणे — 411001\n\n
    विषय: सार्वजनिक स्थान पर अनधिकृत स्टॉल/अतिक्रमण — हटाने हेतु निर्देश\n\n
    1. सूचना\n
    निरीक्षण में पाया गया है कि उपर्युक्त स्थान पर सार्वजनिक फुटपाथ/नगरिक भूमि पर अनधिकृत स्टॉल स्थापित किया गया है, जो पुणे नगरपालिकाके नियमों का उल्लंघन है।\n\n
    2. निर्देश\n
    आपको निर्देश दिया जाता है कि इस नोटिस की तिथि से 7 (सात) दिनों के भीतर अनधिकृत स्टॉल, माल और संबंधित फिटिंग्स हटाकर स्थान को पूर्ववत् स्थिति में पुनर्स्थापित करें।\n\n
    3. अनुपालन विफलता\n
    निर्दिष्ट अवधि में अनुपालन नहीं होने पर नगर निगम द्वारा हटाने व सफाई कार्य कराया जाएगा तथा हटाने, भंडारण व दंड सम्बन्धी सभी शुल्क आपसे वसूल किये जायेंगे।\n\n
    4. दंड एवं भंडारण\n
    • लागू नगर नियमों के अनुसार दंड लगाए जा सकते हैं।\\n
    • हटाई गई वस्तुएँ 30 दिनों तक निगम डिपो में संग्रहित रहेंगी; यदि वह अवधि उपरांत दावे/शुल्क न भरे जाएँ तो निपटान कर दिया जाएगा।\n\n
    5. आपत्ति / संपर्क\n
    यदि आप मानते हैं कि यह नोटिस त्रुटिपूर्ण है या आपके पास वैध परमिट है, तो 7 दिनों के भीतर नगर आयुक्त कार्यालय में लिखित आपत्ति प्रस्तुत करें। आपत्ति प्राप्त होने पर विचार किया जाएगा पर हटाने पर रोक तभी लगेगी जब सक्षम प्राधिकारी ने लिखित आदेश दिया हो।\n\n
    संपर्क:\n
    कार्यालय — नगर आयुक्त\n
    पुणे नगरपालिका\n
    नगर भवन, शिवाजी नगर, पुणे — 411005\n
    फोन: +91-20-25501234 | ईमेल: enforcement@punecorporation.gov.in\n\n
    आदेशानुसार\n
    नगर आयुक्त\n
    हस्ताक्षर: _______________________\n
    नाम: अजय रा. कुलकर्णी\n
    पद: कार्यकारी अभियंता (प्रवर्तन)\n
    तिथि: 1 नवम्बर, 2025\n`
        },
    
        {
          id: "legal-rent-agreement",
          label: "किराये का विधिक अनुबंध",
          text: `किराये का संक्षिप्त अनुबंध (RENTAL AGREEMENT)\n\n
    यह अनुबंध दिनांक 1 नवम्बर, 2025 को बनाया गया है:\n\n
    भू-स्वामी: सुश्री कविता आर. शर्मा, पता: 9, मेपल ग्रोव, नॉर्थ एवेन्यू, पुणे — 411016 (\"भू-स्वामी\"); और\n
    किरायेदार: श्री रोहन के. मेहरा, पता: 21C, लेकव्यू अपार्टमेंट्स, कोथरूड, पुणे — 411038 (\"किरायेदार\").\n\n
    1. परिसर\n
    फ्लैट नं. 7A, हरीज़न टावर्स, मॉडल कॉलोनी, पुणे — 411016 (\"परिसर\"), जिसमें एक कवर पार्किंग स्लॉट (P-12) शामिल है।\n\n
    2. अवधि\n
    पट्टा 1 नवम्बर, 2025 से 31 अक्तूबर, 2026 तक (12 माह) प्रभावी रहेगा; नवीनीकरण पारस्परिक लिखित सहमति पर होगा।\n\n
    3. किराया व सुरक्षा जमा\n
    मासिक किराया: ₹25,000, हर माह की 5 तारीख तक अग्रिम बैंक हस्तांतरण द्वारा भुगतान।\n
    सुरक्षा जमा: ₹50,000 (दो माह) — प्रारम्भिक जमा तिथि पर देय। जमा वैधानिक कटौतियों के बाद 15 दिनों में प्रत्यावर्तनीय होगा।\n\n
    4. उपयोग व मरम्मत\n
    परिसर केवल आवासीय प्रयोजन हेतु उपयोग किया जाएगा। किरायेदार सामान्य सफाई व छोटे-मोटे मरम्मत के लिए उत्तरदायी होगा; संरचनात्मक व प्रमुख मरम्मत भू-स्वामी करेगा।\n\n
    5. उपयोगिताएँ\n
    बिजली, पानी (यदि पृथक मीटर), इंटरनेट, रसोई गैस एवं केबल/ओटीटी शुल्क किरायेदार द्वारा भुगतान किये जायेंगे।\n\n
    6. परिवर्तन\n
    किसी भी संरचनात्मक परिवर्तन हेतु पूर्व लिखित अनुमति आवश्यक है। किरायेदार द्वारा बिना अनुमति किए गए इंस्टॉलेशन को हटाने पर उसके व्यय किरायेदार को वहन करना होगा।\n\n
    7. डिफ़ॉल्ट/समाप्ति\n
    किरायेदार द्वारा किराया निर्धारित समय पर नहीं देने पर 7 दिन सुधार अवधि दी जाएगी; 60 दिन पूर्व लिखित सूचना द्वारा किसी भी पक्ष द्वारा अनुबंध समाप्त किया जा सकता है।\n\n
    8. लागू कानून\n
    यह अनुबंध भारत के कानूनों के अधीन होगा; वाद-प्रतिवाद पुणे के न्यायालयों के अधिकार क्षेत्र में होंगे।\n\n
    हस्ताक्षर:\n\n
    भू-स्वामी: _______________________\n
    नाम: कविता आर. शर्मा\n
    तिथि: 1 नवम्बर, 2025\n\n
    किरायेदार: _______________________\n
    नाम: रोहन के. मेहरा\n
    तिथि: 1 नवम्बर, 2025\n`
        }
      ]
   
    
    
  };

  // Ensure the input reflects the latest pasted text or extracted file content

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    setUploadedFileType(file.type || file.name.split(".").pop() || "file");
    setIsUploading(true);
    setUploadProgress(10);

    if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      try {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DocumentInput] Failed to create object URL for PDF", {
          fileName: file.name,
          error: err,
        });
      }
      extractTextFromPdf(file, (percent) =>
        setUploadProgress(Math.min(99, Math.max(10, Math.floor(percent))))
      )
        .then(async (text) => {
          let finalText = text?.trim() || "";
          // If regular extraction yields very little, attempt OCR
          if (finalText.length < 40) {
            try {
              const ocrText = await ocrExtractTextFromPdf(file, language, (p) =>
                setUploadProgress(Math.min(99, Math.max(10, Math.floor(p))))
              );
              if (ocrText.trim().length > finalText.length) {
                finalText = ocrText.trim();
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("[DocumentInput] OCR fallback failed", {
                fileName: file.name,
                error: err,
              });
            }
          }
          setDocumentText(finalText);
          setUploadProgress(100);
          setTimeout(() => setIsUploading(false), 600);
        })
        .catch((err) => {
          setUploadProgress(0);
          setIsUploading(false);
          setDocumentText("");
          setPdfUrl(null);
          // eslint-disable-next-line no-console
          console.error("[DocumentInput] PDF text extraction failed", {
            fileName: file.name,
            error: err,
          });
          // eslint-disable-next-line no-alert
          alert("Could not extract text from PDF. Please try another file.");
        });
      return;
    }

    const isTextLike =
      file.type.startsWith("text/") || /\.txt$/i.test(file.name);
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(Math.max(10, Math.min(99, percent)));
      }
    };
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDocumentText(result);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 600);
    };
    reader.onerror = (e) => {
      setUploadProgress(0);
      setIsUploading(false);
      setDocumentText("");
      setPdfUrl(null);
      // eslint-disable-next-line no-console
      console.error("[DocumentInput] File read failed", {
        fileName: file.name,
        error: e,
      });
      // eslint-disable-next-line no-alert
      alert(
        "Could not read the selected file. Please try another file or paste text."
      );
    };
    if (isTextLike) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (documentText.trim()) {
      onSubmit(documentText, {
        pdfUrl: pdfUrl || undefined,
        mime: uploadedFileType,
      });
    }
  };

  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    () => sampleContracts[language][0]?.id || ""
  );

  // Sync selected sample when language changes so the id exists in the new list
  React.useEffect(() => {
    const first = sampleContracts[language][0]?.id || "";
    setSelectedSampleId(first);
  }, [language]);

  const loadSample = () => {
    const list = sampleContracts[language];
    const chosen = list.find((s) => s.id === selectedSampleId) || list[0];
    const sample = chosen?.text || "";
    setPdfUrl(null);
    setUploadedFileName("");
    setUploadedFileType("");
    setDocumentText(sample);
    onSubmit(sample);
  };

  // PDF text extraction using pdf.js
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

  async function extractTextFromPdf(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(20);
    const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
    let pdf: any;
    try {
      pdf = await loadingTask.promise;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[DocumentInput] Failed to load PDF for extraction", {
        fileName: file.name,
        error: err,
      });
      throw err;
    }
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items
          .map((it: any) => ("str" in it ? it.str : ""))
          .filter(Boolean);
        pageTexts.push(strings.join(" "));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DocumentInput] Failed to extract text on page", {
          fileName: file.name,
          page: i,
          error: err,
        });
        pageTexts.push("");
      } finally {
        const base = 30;
        const span = 40; // reserve remaining for OCR if needed
        onProgress?.(base + Math.round((i / numPages) * span));
      }
    }

    return pageTexts.join("\n\n");
  }

  function mapOcrLang(lang: "en" | "hi"): string {
    return lang === "hi" ? "hin" : "eng";
  }

  async function ocrExtractTextFromPdf(
    file: File,
    lang: "en" | "hi",
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    let pdf: any;
    try {
      pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[DocumentInput] Failed to load PDF for OCR", {
        fileName: file.name,
        error: err,
      });
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
        console.error("[DocumentInput] Failed to get page for OCR", {
          fileName: file.name,
          page: i,
          error: err,
        });
        texts.push("");
        continue;
      }
      const viewport = page.getViewport({ scale: 2 }); // higher scale for better OCR
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (!context) {
        // eslint-disable-next-line no-console
        console.error("[DocumentInput] Canvas 2D context unavailable for OCR", {
          fileName: file.name,
          page: i,
        });
        texts.push("");
        continue;
      }
      try {
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DocumentInput] Failed to render page for OCR", {
          fileName: file.name,
          page: i,
          error: err,
        });
        texts.push("");
        continue;
      }

      // Tesseract recognition
      try {
        const { data } = await Tesseract.recognize(canvas, tessLang, {
          logger: (m: { status?: string; progress?: number }) => {
            if (
              m.status === "recognizing text" &&
              typeof m.progress === "number"
            ) {
              const base = 70; // continue from where extractTextFromPdf left off
              const perPage = (100 - base) / numPages;
              const pageProgress = base + perPage * (i - 1 + m.progress);
              onProgress?.(Math.min(99, Math.floor(pageProgress)));
            }
          },
        });
        texts.push(data.text || "");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DocumentInput] OCR recognition failed on page", {
          fileName: file.name,
          page: i,
          lang: tessLang,
          error: err,
        });
        texts.push("");
      }
    }

    return texts.join("\n\n");
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
                  style={{
                    width: `${uploadProgress}%`,
                    transition: "width 200ms ease",
                  }}
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
              className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
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
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                  {uploadedFileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {uploadedFileType}
                </p>
              </div>
              <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">
                {uploadProgress}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* File Upload */}
        <div
          className={`relative rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-800 shadow-inner"
              : "border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800"
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
            onChange={(e) =>
              e.target.files?.[0] && handleFileUpload(e.target.files[0])
            }
            className="hidden"
          />
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4 drop-shadow-sm" />
          </motion.div>
          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
            {translations[language].dragText}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            PDF, DOC, DOCX, TXT
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>
          <span className="px-4 text-gray-500 dark:text-slate-400 font-medium">
            {translations[language].orText}
          </span>
          <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>
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
              <label className="text-sm text-gray-600 dark:text-slate-300">
                Sample:
              </label>
              <select
                className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 rounded px-2 py-1 text-sm w-20 "
                value={selectedSampleId}
                onChange={(e) => setSelectedSampleId(e.target.value)}
              >
                {sampleContracts[language].map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
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
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:shadow-blue-400/50 hover:shadow-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{translations[language].analyzing}</span>
                </>
              ) : (
                <>
                  <motion.span
                    initial={false}
                    animate={{ rotate: isUploading ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
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
