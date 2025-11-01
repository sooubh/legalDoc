"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";

interface PrivacyPolicyPageProps {
  onNavigate: (route: string) => void;
  language: "en" | "hi";
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ 
  onNavigate, 
  language 
}) => {
  const privacyContent = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 2024",
      sections: [
        {
          title: "1. Introduction",
          content: "LegalEase AI ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service."
        },
        {
          title: "2. Information We Collect",
          content: "We collect information that you provide directly to us, including: account information (email, password), document content you upload for analysis, usage data (how you interact with our service), and device information (browser type, IP address)."
        },
        {
          title: "3. How We Use Your Information",
          content: "We use the information we collect to: provide and improve our services, process and analyze legal documents, communicate with you about your account and our services, send you technical notices and updates, respond to your comments and questions, and monitor and analyze usage patterns."
        },
        {
          title: "4. Data Storage and Security",
          content: "We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely using encryption and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security."
        },
        {
          title: "5. Information Sharing",
          content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances: with your consent, to comply with legal obligations, to protect our rights and safety, or with service providers who assist us in operating our service (under strict confidentiality agreements)."
        },
        {
          title: "6. Cookies and Tracking Technologies",
          content: "We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
        },
        {
          title: "7. Your Rights",
          content: "You have the right to: access your personal information, correct inaccurate information, request deletion of your data, object to processing of your data, and data portability. To exercise these rights, please contact us."
        },
        {
          title: "8. Children's Privacy",
          content: "Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13."
        },
        {
          title: "9. Changes to This Privacy Policy",
          content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date."
        },
        {
          title: "10. Contact Us",
          content: "If you have any questions about this Privacy Policy, please contact us through our support channels."
        }
      ]
    },
    hi: {
      title: "गोपनीयता नीति",
      lastUpdated: "अंतिम अपडेट: जनवरी 2024",
      sections: [
        {
          title: "1. परिचय",
          content: "LegalEase AI ('हम', 'हमारा', या 'हमें') आपकी गोपनीयता की सुरक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि जब आप हमारी सेवा का उपयोग करते हैं तो हम आपकी जानकारी को कैसे एकत्र, उपयोग, खुलासा और सुरक्षित करते हैं।"
        },
        {
          title: "2. जानकारी जो हम एकत्र करते हैं",
          content: "हम वह जानकारी एकत्र करते हैं जो आप सीधे हमें प्रदान करते हैं, जिसमें शामिल हैं: खाता जानकारी (ईमेल, पासवर्ड), दस्तावेज़ सामग्री जो आप विश्लेषण के लिए अपलोड करते हैं, उपयोग डेटा (आप हमारी सेवा के साथ कैसे बातचीत करते हैं), और डिवाइस जानकारी (ब्राउज़र प्रकार, IP पता)।"
        },
        {
          title: "3. हम आपकी जानकारी का उपयोग कैसे करते हैं",
          content: "हम एकत्र की गई जानकारी का उपयोग करते हैं: हमारी सेवाएं प्रदान करने और सुधारने के लिए, कानूनी दस्तावेजों को संसाधित और विश्लेषण करने के लिए, आपके खाते और हमारी सेवाओं के बारे में आपके साथ संवाद करने के लिए, आपको तकनीकी सूचनाएं और अपडेट भेजने के लिए, आपकी टिप्पणियों और प्रश्नों का जवाब देने के लिए, और उपयोग पैटर्न की निगरानी और विश्लेषण करने के लिए।"
        },
        {
          title: "4. डेटा भंडारण और सुरक्षा",
          content: "हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित तकनीकी और संगठनात्मक उपाय लागू करते हैं। आपका डेटा एन्क्रिप्शन और पहुंच नियंत्रण का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है। हालाँकि, इंटरनेट पर संचरण की कोई भी विधि 100% सुरक्षित नहीं है, और हम पूर्ण सुरक्षा की गारंटी नहीं दे सकते।"
        },
        {
          title: "5. जानकारी साझा करना",
          content: "हम आपकी व्यक्तिगत जानकारी को तीसरे पक्षों को नहीं बेचते, व्यापार नहीं करते, या किराए पर नहीं देते। हम आपकी जानकारी केवल निम्नलिखित परिस्थितियों में साझा कर सकते हैं: आपकी सहमति से, कानूनी दायित्वों का पालन करने के लिए, हमारे अधिकारों और सुरक्षा की रक्षा के लिए, या सेवा प्रदाताओं के साथ जो हमारी सेवा चलाने में हमारी सहायता करते हैं (सख्त गोपनीयता समझौतों के तहत)।"
        },
        {
          title: "6. कुकीज़ और ट्रैकिंग प्रौद्योगिकियां",
          content: "हम हमारी सेवा पर गतिविधि को ट्रैक करने और कुछ जानकारी संग्रहीत करने के लिए कुकीज़ और समान ट्रैकिंग प्रौद्योगिकियों का उपयोग करते हैं। आप अपने ब्राउज़र को सभी कुकीज़ को अस्वीकार करने या यह इंगित करने के लिए निर्देश दे सकते हैं कि कुकी कब भेजी जा रही है।"
        },
        {
          title: "7. आपके अधिकार",
          content: "आपको अधिकार है: अपनी व्यक्तिगत जानकारी तक पहुंचने का, गलत जानकारी को सही करने का, अपने डेटा के विलोपन का अनुरोध करने का, अपने डेटा के प्रसंस्करण पर आपत्ति करने का, और डेटा पोर्टेबिलिटी का। इन अधिकारों का उपयोग करने के लिए, कृपया हमसे संपर्क करें।"
        },
        {
          title: "8. बच्चों की गोपनीयता",
          content: "हमारी सेवा 13 वर्ष से कम उम्र के बच्चों के लिए नहीं है। हम जानबूझकर 13 से कम उम्र के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।"
        },
        {
          title: "9. इस गोपनीयता नीति में परिवर्तन",
          content: "हम समय-समय पर हमारी गोपनीयता नीति को अपडेट कर सकते हैं। हम इस पृष्ठ पर नई गोपनीयता नीति पोस्ट करके और 'अंतिम अपडेट' तिथि अपडेट करके किसी भी परिवर्तन के बारे में आपको सूचित करेंगे।"
        },
        {
          title: "10. हमसे संपर्क करें",
          content: "यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया हमारे सपोर्ट चैनलों के माध्यम से हमसे संपर्क करें।"
        }
      ]
    }
  };

  const content = privacyContent[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate("settings")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === "hi" ? "वापस" : "Back"}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {content.lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {content.sections.map((section, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === "hi" 
                ? "यदि आपके पास इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें।" 
                : "If you have any questions about this Privacy Policy, please contact us."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

