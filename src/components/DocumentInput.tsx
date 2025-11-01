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
        id: "service-agreement",
        label: "Service Agreement",
        text: `MASTER SERVICE AGREEMENT\n\n

This MASTER SERVICE AGREEMENT (the “Agreement”) is entered into as of October 28, 2025 (the “Effective Date”), by and between:\n\n

Polaris Nimbus Solutions Pvt. Ltd., a company incorporated under the laws of India with its principal place of business at 12/8 Sapphire Towers, Sector 14, Pune, Maharashtra 411001, India (“Provider”), and\n\n

Aurora Meridian Technologies LLC, a limited liability company organized under the laws of Delaware, United States, with its principal place of business at 4527 Cypress Park Drive, Wilmington, DE 19801, USA (“Customer”).\n\n

Each of Provider and Customer may be referred to herein as a “Party” and collectively as the “Parties.”\n\n

1. BACKGROUND / PURPOSE\n\n
Provider is engaged in the business of providing software-as-a-service, professional services, maintenance, support, and other related technology services. Customer desires to engage Provider to perform certain services and deliverables described in one or more Statements of Work (each defined below) under the terms and conditions of this Agreement. Provider agrees to provide such services under the terms set forth herein.\n\n

2. DEFINITIONS\n\n
For purposes of this Agreement, the following terms will have the meanings set forth below:\n\n
“Agreement” means this Master Service Agreement and all Statements of Work, Schedules, Exhibits and amendments hereto.\n\n
“Confidential Information” means non-public, proprietary or confidential information disclosed by a Party to the other Party, whether orally or in writing, including but not limited to business strategies, plans, customer lists, price lists, technical information, source code, designs, trade secrets, and all information reasonably understood to be confidential.\n\n
“Deliverables” means any tangible or intangible work product, documentation, code, reports, designs, drawings, data, or other items delivered by Provider to Customer under a Statement of Work.\n\n
“Documentation” means the user manuals, technical manuals and other written materials provided to Customer that describe the functionality, operation and use of the Services and Deliverables.\n\n
“Fees” means amounts payable by Customer to Provider as described in the applicable Statement of Work and any invoices.\n\n
“Intellectual Property Rights” means patents, copyrights, moral rights, trademarks, trade secrets, domain names, know-how, database rights, and any other intellectual or industrial property rights.\n\n
“Services” means the services to be performed by Provider as specified in a Statement of Work.\n\n
“Statement of Work” or “SOW” means a written document signed by authorized representatives of both Parties that describes Services, Deliverables, Fees, timelines and other applicable terms and conditions and which references this Agreement.\n\n
“Third Party” means any person or entity other than Provider or Customer.\n\n
“SLA” means service level agreement terms, if any, attached to or referenced in a Statement of Work.\n\n

3. SCOPE OF SERVICES\n\n
3.1 Services and Deliverables. Provider shall perform the Services and deliver the Deliverables set forth in one or more Statements of Work in accordance with the schedules, specifications, performance standards, and acceptance criteria set forth in the applicable SOW.\n\n
3.2 Change Orders. Any change to scope, timeline, deliverables or fees shall be implemented only by a written Change Order signed by authorized representatives of both Parties. Provider shall not be required to commence work under any requested change prior to mutual written approval.\n\n
3.3 Customer Responsibilities. Customer shall provide timely access to personnel, facilities, systems, data, approvals and other resources reasonably required by Provider to perform the Services. Customer shall be responsible for the accuracy and completeness of data and other information provided to Provider.\n\n
3.4 Subcontracting. Provider may subcontract performance of Services to affiliates or third parties; provided that Provider remains responsible for the acts and omissions of its subcontractors, and such subcontracting will not relieve Provider of any obligations under this Agreement.\n\n

4. STATEMENT OF WORKS; ORDER OF PRECEDENCE\n\n
4.1 Each SOW shall describe: (a) Services and Deliverables; (b) personnel assigned; (c) fees and payment schedule; (d) acceptance criteria; (e) timeline and milestones; (f) SLAs (if any); and (g) any specific assumptions.\n\n
4.2 In the event of a conflict between a Statement of Work and this Agreement, the order of precedence shall be: (a) amendment to the SOW signed by both Parties; (b) the SOW; (c) this Agreement. Any inconsistency in an SOW shall be resolved in favor of the SOW unless the Provision of this Agreement expressly supersedes.\n\n

5. TERM AND TERMINATION\n\n
5.1 Term. The term of this Agreement begins on the Effective Date and continues for three (3) years, unless earlier terminated in accordance with Section 5. This Agreement shall automatically renew for successive one (1) year periods unless either Party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.\n\n
5.2 Termination for Convenience. Either Party may terminate this Agreement or any SOW for convenience upon sixty (60) days’ prior written notice to the other Party. In the event of termination for convenience by Customer, Customer shall pay Provider for all Services performed and expenses incurred through the effective date of termination, plus reasonable wind-down costs.\n\n
5.3 Termination for Cause. Either Party may terminate this Agreement or any SOW upon thirty (30) days’ written notice if the other Party materially breaches this Agreement and the breach remains uncured after thirty (30) days following receipt of written notice describing the breach. For non-payment by Customer, Provider may suspend Services after ten (10) days’ written notice.\n\n
5.4 Immediate Termination. Either Party may terminate immediately upon written notice: (a) if the other Party becomes insolvent, files for bankruptcy, or has a receiver appointed; (b) if the other Party materially breaches confidentiality or data protection obligations; or (c) if required by law.\n\n
5.5 Effect of Termination. Upon termination, Customer shall (a) pay all undisputed Fees for Services performed and Deliverables accepted through the effective date; (b) return or destroy Confidential Information as directed; and (c) receive any Deliverables completed and accepted. Provider shall deliver to Customer all work-in-progress and any materials purchased for Customer and may invoice for any non-cancellable commitments.\n\n

... (continues in full as your text)\n\n

SIGNATURES\n\n
IN WITNESS WHEREOF, the Parties hereto have executed this Master Service Agreement as of the Effective Date.\n\n
Provider: Polaris Nimbus Solutions Pvt. Ltd.\n
By: _______________________________\n
Name: Arjun S. Mehta\n
Title: Chief Operating Officer\n
Date: October 28, 2025\n\n
Customer: Aurora Meridian Technologies LLC\n
By: _______________________________\n
Name: Lillian R. Foster\n
Title: VP, Global Operations\n
Date: October 28, 2025\n\n
`,
      },
      {
        id: "nda",
        label: "Mutual NDA",
        text: `MUTUAL NON-DISCLOSURE AGREEMENT\n\n

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of October 28, 2025 ("Effective Date"), by and between:\n\n

Party A: AlphaVision Technologies Pvt. Ltd., a corporation organized under the laws of India, having its principal place of business at 23, Orion Tech Park, Nashik, Maharashtra 422005 ("Party A"), and\n\n

Party B: QuantumEdge Systems Inc., a company duly incorporated under the laws of Delaware, USA, having its registered office at 497 Silicon Street, San Jose, California 95134 ("Party B").\n\n

Party A and Party B shall be collectively referred to as the "Parties" and individually as a "Party".\n\n

WHEREAS, the Parties desire to engage in discussions and business collaboration relating to artificial intelligence research, data-driven product development, and software deployment ("Purpose"); and\n\n

WHEREAS, in connection with such Purpose, each Party may disclose or make available to the other Party certain confidential, proprietary, or trade secret information.\n\n

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the Parties agree as follows:\n\n

1. DEFINITION OF CONFIDENTIAL INFORMATION\n\n
1.1 "Confidential Information" means all non-public information, whether oral, written, digital, visual, or in any other form, disclosed by one Party (“Disclosing Party”) to the other Party (“Receiving Party”), including but not limited to business plans, technical data, software code, algorithms, marketing strategies, research data, product specifications, designs, trade secrets, pricing information, and customer lists.\n\n
1.2 Confidential Information shall also include any copies, reproductions, analyses, or summaries made by the Receiving Party.\n\n
1.3 Information shall not be deemed Confidential Information if it:\n
(a) is or becomes publicly available through no fault of the Receiving Party;\n
(b) was rightfully in the Receiving Party’s possession before disclosure;\n
(c) is lawfully obtained by the Receiving Party from a third party without breach of any confidentiality obligation; or\n
(d) is independently developed by the Receiving Party without the use of or reference to the Disclosing Party’s Confidential Information.\n\n

2. OBLIGATIONS OF THE RECEIVING PARTY\n\n
2.1 The Receiving Party agrees to maintain the Confidential Information in strict confidence and to use it solely for the Purpose.\n\n
2.2 The Receiving Party shall restrict disclosure of the Confidential Information to its employees, agents, or contractors who have a “need to know” for the Purpose and who are bound by confidentiality obligations at least as restrictive as those contained herein.\n\n
2.3 The Receiving Party shall not disclose, publish, or otherwise disseminate any Confidential Information to any third party without the prior written consent of the Disclosing Party.\n\n
2.4 The Receiving Party shall exercise at least the same degree of care as it uses to protect its own confidential information but in no event less than reasonable care.\n\n

3. TERM AND TERMINATION\n\n
3.1 This Agreement shall commence on the Effective Date and continue for a period of five (5) years, unless earlier terminated by either Party upon thirty (30) days’ written notice.\n\n
3.2 Notwithstanding termination, all confidentiality and non-use obligations shall survive for an additional three (3) years following termination.\n\n

4. RETURN OR DESTRUCTION OF MATERIALS\n\n
Upon termination or upon written request of the Disclosing Party, the Receiving Party shall promptly return or destroy all documents, notes, and materials containing Confidential Information, and certify such destruction in writing.\n\n

5. NO LICENSE OR WARRANTY\n\n
5.1 Nothing in this Agreement shall be construed as granting any license or ownership rights under any intellectual property of the Disclosing Party.\n\n
5.2 All Confidential Information is provided “AS IS,” without any warranty, express or implied, including fitness for a particular purpose or non-infringement.\n\n

6. REMEDIES\n\n
Each Party acknowledges that unauthorized disclosure or use of Confidential Information may cause irreparable harm to the Disclosing Party, for which monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek injunctive or equitable relief, in addition to any other remedies available at law or in equity.\n\n

7. GOVERNING LAW AND JURISDICTION\n\n
7.1 This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.\n\n
7.2 Any disputes arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra.\n\n

8. MISCELLANEOUS\n\n
8.1 Entire Agreement: This Agreement constitutes the entire understanding between the Parties concerning the subject matter and supersedes all prior agreements, written or oral.\n\n
8.2 Amendments: Any amendment to this Agreement must be made in writing and signed by both Parties.\n\n
8.3 Assignment: Neither Party may assign this Agreement without the prior written consent of the other Party.\n\n
8.4 Severability: If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.\n\n
8.5 Waiver: No failure or delay by either Party in exercising any right shall operate as a waiver thereof.\n\n

9. NOTICES\n\n
All notices under this Agreement shall be in writing and shall be delivered personally, by registered post, or by electronic mail to the following addresses:\n\n
For Party A:\n
Attention: Legal Department\n
AlphaVision Technologies Pvt. Ltd.\n
23, Orion Tech Park, Nashik, Maharashtra 422005\n
Email: legal@alphavision.in\n\n
For Party B:\n
Attention: Legal Counsel\n
QuantumEdge Systems Inc.\n
497 Silicon Street, San Jose, California 95134\n
Email: legal@quantumedge.com\n\n

10. EXECUTION\n\n
This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument.\n\n

IN WITNESS WHEREOF, the Parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.\n\n

----------------------------------------\n
For AlphaVision Technologies Pvt. Ltd.\n
Name: Mr. Rohan Deshmukh\n
Title: Chief Executive Officer\n
Date: October 28, 2025\n\n

----------------------------------------\n
For QuantumEdge Systems Inc.\n
Name: Ms. Emily Carter\n
Title: Director of Strategic Partnerships\n
Date: October 28, 2025\n\n
`,
      },
      {
        id: "residential-lease",
        label: "Residential Lease",
        text: `RESIDENTIAL LEASE AGREEMENT\n\n

This Residential Lease Agreement ("Agreement") is entered into as of October 28, 2025 ("Effective Date"), by and between:\n\n

Landlord: Mr. Rajesh Mehta, residing at 7, Orchid Residency, College Road, Nashik, Maharashtra 422002 ("Landlord")\n\n
and\n\n
Tenant: Ms. Anjali Sharma, residing at 12, Sunrise Apartments, Gangapur Road, Nashik, Maharashtra 422005 ("Tenant").\n\n

Landlord and Tenant shall be collectively referred to as the "Parties" and individually as a "Party".\n\n

WHEREAS, Landlord is the lawful owner of the residential premises described below and desires to lease it to the Tenant under the terms and conditions set forth herein.\n\n

NOW, THEREFORE, in consideration of the mutual covenants and promises contained herein, the Parties agree as follows:\n\n

1. PREMISES\n\n
The Landlord hereby leases to the Tenant, and the Tenant hereby takes on lease from the Landlord, the residential premises located at:\n\n
Flat No. 304, Lotus Heights Apartment, Tilak Nagar, Nashik, Maharashtra 422001 ("Premises"), including the right to use the parking space, common areas, and other facilities associated therewith.\n\n

2. TERM\n\n
2.1 The term of this Lease shall commence on November 1, 2025 ("Commencement Date") and shall continue until October 31, 2026 ("Termination Date"), unless sooner terminated as provided herein.\n\n
2.2 Upon mutual agreement, the Lease may be renewed for an additional term under renegotiated terms.\n\n

3. RENT\n\n
3.1 The Tenant agrees to pay the Landlord a monthly rent of INR 18,000 (Indian Rupees Eighteen Thousand only).\n\n
3.2 The rent shall be due and payable in advance on or before the 5th day of each month.\n\n
3.3 Payments shall be made via bank transfer to the Landlord’s account:\n
Account Name: Rajesh Mehta\n
Bank: HDFC Bank, Nashik Main Branch\n
Account No.: 123456789001\n
IFSC: HDFC0000455\n\n
3.4 Late Payment: If rent is not received within five (5) days after the due date, a late fee of INR 500 per day shall apply until full payment is made.\n\n

4. SECURITY DEPOSIT\n\n
4.1 Tenant shall pay a refundable security deposit of INR 36,000 (equivalent to two months’ rent) prior to moving in.\n\n
4.2 The deposit shall be held by the Landlord as security for any damages, unpaid rent, or other defaults under this Agreement.\n\n
4.3 The deposit shall be refunded within 15 days after the Tenant vacates the Premises, less any lawful deductions.\n\n

5. USE OF PREMISES\n\n
5.1 The Premises shall be used solely for residential purposes and occupied only by the Tenant and immediate family members.\n\n
5.2 The Tenant shall not sublet, assign, or transfer any interest in the Premises without the prior written consent of the Landlord.\n\n
5.3 The Tenant shall not use the Premises for any unlawful or commercial purpose.\n\n

6. MAINTENANCE AND REPAIRS\n\n
6.1 The Tenant shall keep the Premises clean, safe, and sanitary at all times.\n\n
6.2 The Tenant shall promptly notify the Landlord of any damages or maintenance issues.\n\n
6.3 The Landlord shall be responsible for major structural repairs, electrical, and plumbing systems.\n\n
6.4 The Tenant shall be responsible for minor maintenance such as cleaning, replacing bulbs, and maintaining appliances.\n\n

7. UTILITIES AND CHARGES\n\n
The Tenant shall pay all utilities including electricity, water, internet, cooking gas, and cable TV. Maintenance fees and property taxes shall be borne by the Landlord.\n\n

8. RULES AND REGULATIONS\n\n
8.1 The Tenant agrees to comply with all housing society rules and regulations.\n\n
8.2 The Tenant shall not cause nuisance, loud noise, or disturbance to neighbors.\n\n
8.3 Pets are not allowed unless explicitly approved by the Landlord in writing.\n\n

9. ALTERATIONS AND IMPROVEMENTS\n\n
9.1 The Tenant shall not make any structural or decorative alterations without the Landlord’s prior written consent.\n\n
9.2 Any improvements or fixtures installed by the Tenant shall become the property of the Landlord unless otherwise agreed.\n\n

10. ENTRY AND INSPECTION\n\n
The Landlord or authorized agent may enter the Premises upon at least 24 hours' prior notice for inspection, maintenance, or showing the property to prospective tenants or buyers.\n\n

11. DAMAGE OR DESTRUCTION\n\n
If the Premises are rendered uninhabitable due to fire, flood, or natural calamity, either Party may terminate this Agreement with written notice. Rent shall be abated proportionately for the period the Premises are unusable.\n\n

12. DEFAULT\n\n
12.1 In the event of non-payment of rent, breach of terms, or unlawful use, the Landlord may issue a written notice to remedy the breach within seven (7) days.\n\n
12.2 Failure to cure within such period may result in termination and eviction proceedings as per applicable law.\n\n

13. TERMINATION\n\n
13.1 Either Party may terminate this Agreement by providing sixty (60) days' written notice.\n\n
13.2 Upon termination, the Tenant shall vacate the Premises in good condition, reasonable wear and tear excepted.\n\n

14. INDEMNIFICATION\n\n
The Tenant agrees to indemnify and hold harmless the Landlord from any claims, damages, or losses arising out of Tenant’s use of the Premises, except those caused by the Landlord’s negligence or misconduct.\n\n

15. GOVERNING LAW\n\n
This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Nashik, Maharashtra.\n\n

16. NOTICES\n\n
All notices required under this Agreement shall be in writing and delivered personally, via registered post, or by email as follows:\n\n
Landlord: Mr. Rajesh Mehta, Email: rajesh.mehta@orchidresidency.in\n
Tenant: Ms. Anjali Sharma, Email: anjali.sharma92@gmail.com\n\n

17. ENTIRE AGREEMENT\n\n
This document constitutes the entire understanding between the Parties and supersedes all prior discussions or representations.\n\n
No amendment or modification shall be valid unless made in writing and signed by both Parties.\n\n

18. MISCELLANEOUS\n\n
18.1 Waiver: Failure by either Party to enforce any term shall not be deemed a waiver of future enforcement.\n\n
18.2 Severability: If any provision is held invalid, the remainder shall continue in effect.\n\n
18.3 Counterparts: This Agreement may be executed in counterparts, each of which shall be deemed an original.\n\n

IN WITNESS WHEREOF, the Parties have executed this Residential Lease Agreement as of the Effective Date.\n\n

-------------------------------------------\n
Landlord: Rajesh Mehta\n
Signature: ___________________________\n
Date: October 28, 2025\n\n

-------------------------------------------\n
Tenant: Anjali Sharma\n
Signature: ___________________________\n
Date: October 28, 2025\n\n

Witnesses:\n
1. Name: Sandeep Patil | Address: 55, Shivaji Nagar, Nashik | Signature: ___________\n
2. Name: Ritu Kaur | Address: 91, Greenfield Colony, Nashik | Signature: ___________\n\n
`,
      },
    ],
    hi: [
      {
        id: "service-agreement",
        label: "सेवा अनुबंध",
        text: `सेवा अनुबंध (Service Agreement)\n\nयह अनुबंध क्लाइंटको एलएलसी ("क्लाइंट") और प्रोवाइडर इंक. ("प्रोवाइडर") के बीच किया गया है।\n\n1. सेवाओं का दायरा. प्रोवाइडर स्टेटमेंट ऑफ वर्क #1 में वर्णित फीचर्स का डिजाइन, विकास, परीक्षण और डिलीवरी करेगा; साप्ताहिक डेमो, दस्तावेज़ीकरण और हैंडओवर शामिल होंगे।\n\n2. अवधि और नवीनीकरण. प्रारंभिक अवधि छह (6) माह; इसके बाद स्वतः मासिक नवीनीकरण जब तक कि कोई पक्ष 30 दिन पूर्व लिखित सूचना न दे।\n\n3. शुल्क एवं व्यय. (क) मासिक रिटेनर: USD 10,000 (इनवॉइस अग्रिम, नेट-30)। (ख) पूर्व-स्वीकृत बाह्य व्यय लागत पर प्रतिपूर्ति। विलंब पर 1.5% मासिक ब्याज।\n\n4. परिवर्तन प्रबंधन. कार्य-क्षेत्र में महत्वपूर्ण परिवर्तन हेतु लिखित परिवर्तन आदेश आवश्यक होगा।\n\n5. बौद्धिक संपदा. (क) क्लाइंट आईपी: क्लाइंट के लिए विशेष रूप से बनाए गए डिलीवेरेबल्स का स्वामित्व पूर्ण भुगतान पर क्लाइंट को। (ख) प्रोवाइडर पृष्ठभूमि आईपी: प्रोवाइडर अपने पूर्व-विद्यमान/पुन: उपयोग योग्य टूल का स्वामी रहेगा; डिलीवेरेबल्स में निहित रूप में क्लाइंट को उनका स्थायी, विश्वव्यापी, रॉयल्टी-मुक्त लाइसेंस मिलेगा।\n\n6. गोपनीयता. पक्ष गोपनीय जानकारी की उचित सुरक्षा करेंगे और केवल अनुबंध निष्पादन हेतु उपयोग करेंगे।\n\n7. डेटा सुरक्षा. प्रोवाइडर उचित तकनीकी/संगठनात्मक सुरक्षा उपाय लागू करेगा और सुरक्षा घटना होने पर शीघ्र सूचित करेगा।\n\n8. वारंटी एवं अस्वीकरण. प्रोवाइडर सेवाएँ व्यावसायिक एवं कार्यकुशल तरीके से प्रदान करने की वारंटी देता है; अन्य सभी वारंटियाँ अस्वीकारित हैं।\n\n9. क्षतिपूर्ति. डिलीवेरेबल्स से उत्पन्न तृतीय-पक्ष आईपी उल्लंघन दावों के विरुद्ध प्रोवाइडर रक्षा/क्षतिपूर्ति करेगा (क्लाइंट सामग्री/अनधिकृत परिवर्तनों को छोड़कर)।\n\n10. दायित्व सीमा. किसी भी पक्ष की अप्रत्यक्ष/विशेष/परिणामी हानि हेतु कोई उत्तरदायित्व नहीं; कुल उत्तरदायित्व पिछले तीन (3) माह की फीस से अधिक नहीं।\n\n11. समाप्ति. भौतिक उल्लंघन पर 15 दिन में उपचार न होने पर पक्ष अनुबंध समाप्त कर सकता है; समाप्ति तिथि तक देय शुल्क देय होंगे।\n\n12. प्रभार्य विधि; क्षेत्राधिकार. यह अनुबंध डेलावेयर, यूएसए के कानूनों द्वारा शासित होगा; विशेष क्षेत्राधिकार न्यू कैसल काउंटी की अदालतें।\n\nप्रभावी तिथि: 2024-01-15\nहस्ताक्षर: ______________________`,
      },
      {
        id: "nda",
        label: "परस्पर गोपनीयता समझौता (NDA)",
        text: `परस्पर गैर-प्रकटीकरण समझौता (Mutual NDA)\n\nयह समझौता अल्फा कॉर्प ("पक्ष अ") और बीटा लिमिटेड ("पक्ष ब") के बीच है।\n\n1. उद्देश्य. संभावित व्यावसायिक सहयोग का मूल्यांकन करने हेतु पक्ष गोपनीय जानकारी साझा कर सकते हैं।\n\n2. परिभाषा. "गोपनीय जानकारी" गैर-सार्वजनिक जानकारी है जो गोपनीय चिह्नित हो या उचित रूप से गोपनीय समझी जाए, जैसे रोडमैप, कोड, डिज़ाइन, ग्राहक डेटा, मूल्य निर्धारण।\n\n3. दायित्व. प्राप्तकर्ता (क) गोपनीय जानकारी का उपयोग केवल उद्देश्य हेतु करेगा, (ख) तृतीय पक्ष को प्रकटीकरण नहीं करेगा सिवाय उन कर्मचारियों/ठेकेदारों के जो समान दायित्वों से बँधे हैं, और (ग) उचित सावधानी से सुरक्षा करेगा।\n\n4. अपवाद. सार्वजनिक, पूर्व-ज्ञात, स्वतंत्र विकसित, या वैध तृतीय पक्ष से प्राप्त जानकारी गोपनीय नहीं मानी जाएगी।\n\n5. आवश्यक प्रकटीकरण. क़ानूनन आवश्यक प्रकटीकरण की स्थिति में यथासंभव अग्रिम सूचना और संरक्षण के उपायों में सहयोग।\n\n6. अवधि. प्रकटीकरण अवधि एक (1) वर्ष; गोपनीयता दायित्व तीन (3) वर्ष तक प्रभावी रहेंगे; व्यापार-गोपनीयियाँ क़ानून अनुसार संरक्षित रहेंगी।\n\n7. लाइसेंस नहीं. इस समझौते के अंतर्गत कोई लाइसेंस प्रदान नहीं किया जाता जब तक स्पष्ट रूप से न कहा गया हो।\n\n8. वापसी/नष्ट करना. अनुरोध पर प्राप्तकर्ता गोपनीय जानकारी वापस करेगा या नष्ट करेगा और प्रमाणित करेगा।\n\n9. उपचार. उल्लंघन से अपूरणीय क्षति हो सकती है; प्रकटीकरणकर्ता को निषेधाज्ञा सहित उपाय प्राप्त होंगे।\n\n10. विविध. यह समझौता किसी आगे के अनुबंध का दायित्व उत्पन्न नहीं करता।\n\nप्रभावी तिथि: 2024-03-10\nहस्ताक्षर: ______________________`,
      },
      {
        id: "residential-lease",
        label: "आवासीय पट्टा (Residential Lease)",
        text: `आवासीय पट्टा अनुबंध\n\nभू-स्वामी: ग्रीन प्रॉपर्टीज एलएलसी ("भू-स्वामी")\nकिरायेदार: जॉन डो ("किरायेदार")\nपरिसर: 123 मेपल स्ट्रीट, यूनिट 4B, स्प्रिंगफील्ड, ST 00000\n\n1. अवधि. 1 मई 2024 से 30 अप्रैल 2025 तक बारह (12) माह।\n\n2. किराया. मासिक किराया USD 1,800; प्रत्येक माह की 1 तारीख को देय; 5 तारीख के बाद भुगतान पर USD 75 विलंब शुल्क।\n\n3. सुरक्षा जमा. USD 1,800 हस्ताक्षर पर देय; सामान्य घिसावट से परे क्षति/बकाया किराये के समायोजन के बाद 30 दिनों में वापसी (आइटमाइज्ड कटौतियाँ लागू)।\n\n4. उपयोगिताएँ. किरायेदार: बिजली, इंटरनेट; भू-स्वामी: पानी, कचरा।\n\n5. उपयोग. केवल आवासीय उपयोग; अवैध गतिविधि वर्जित; अधिकतम दो (2) वयस्क।\n\n6. रखरखाव. परिसर की सफाई/रखरखाव और समस्याओं की शीघ्र सूचना; भू-स्वामी संरचना/प्लंबिंग/विद्युत मरम्मत उचित समय में करेगा।\n\n7. परिवर्तन. लिखित पूर्व-सहमति के बिना भौतिक परिवर्तन नहीं।\n\n8. पालतू पशु. पूर्व स्वीकृति और USD 300 गैर-वापसी योग्य शुल्क के साथ एक (1) पालतू अनुमत; क्षति के लिए किरायेदार उत्तरदायी।\n\n9. प्रवेश. निरीक्षण/रख-रखाव/दिखाने हेतु 24 घंटे पूर्व सूचना पर प्रवेश; आपातकाल में तुरंत।\n\n10. बीमा. किरायेदार को रेंटर बीमा रखने की सलाह।\n\n11. डिफ़ॉल्ट/उपाय. भुगतान न होना या भौतिक उल्लंघन पर विधि अनुसार नोटिस और उपाय।\n\n12. प्रभार्य विधि. परिसर के राज्य का क़ानून लागू होगा।\n\nहस्ताक्षर: ______________________`,
      },
    ],
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
