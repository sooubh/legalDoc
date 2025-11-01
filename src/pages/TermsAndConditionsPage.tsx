"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";

interface TermsAndConditionsPageProps {
  onNavigate: (route: string) => void;
  language: "en" | "hi";
}

const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ 
  onNavigate, 
  language 
}) => {
  const termsContent = {
    en: {
      title: "Terms and Conditions",
      lastUpdated: "Last Updated: January 2024",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: "By accessing and using LegalEase AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          title: "2. Description of Service",
          content: "LegalEase AI is an AI-powered platform designed to help users analyze legal documents, generate summaries, create visualizations, and locate legal professionals. The service uses artificial intelligence to process and analyze legal content."
        },
        {
          title: "3. User Responsibilities",
          content: "Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. Users must not use the service for any illegal purposes or to violate any laws."
        },
        {
          title: "4. Intellectual Property",
          content: "All content, features, and functionality of the LegalEase AI service, including but not limited to text, graphics, logos, and software, are the property of LegalEase AI and are protected by international copyright, trademark, and other intellectual property laws."
        },
        {
          title: "5. Privacy",
          content: "Your use of LegalEase AI is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information."
        },
        {
          title: "6. Limitation of Liability",
          content: "LegalEase AI provides information and analysis tools but does not provide legal advice. The service is provided 'as is' without warranties of any kind. We are not responsible for any decisions made based on the information provided by our service."
        },
        {
          title: "7. Modifications",
          content: "LegalEase AI reserves the right to modify these terms at any time. We will notify users of any significant changes. Continued use of the service after such modifications constitutes acceptance of the updated terms."
        },
        {
          title: "8. Termination",
          content: "We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties."
        }
      ]
    },
    hi: {
      title: "नियम और शर्तें",
      lastUpdated: "अंतिम अपडेट: जनवरी 2024",
      sections: [
        {
          title: "1. शर्तों की स्वीकृति",
          content: "LegalEase AI तक पहुंचने और उपयोग करने से, आप इस समझौते की शर्तों और प्रावधानों से बाध्य होने के लिए सहमत होते हैं। यदि आप उपरोक्त का पालन करने के लिए सहमत नहीं हैं, तो कृपया इस सेवा का उपयोग न करें।"
        },
        {
          title: "2. सेवा का विवरण",
          content: "LegalEase AI एक AI-संचालित प्लेटफॉर्म है जो उपयोगकर्ताओं को कानूनी दस्तावेजों का विश्लेषण करने, सारांश बनाने, दृश्य बनाने और कानूनी पेशेवरों को खोजने में मदद करने के लिए डिज़ाइन किया गया है।"
        },
        {
          title: "3. उपयोगकर्ता जिम्मेदारियां",
          content: "उपयोगकर्ता अपने खाता क्रेडेंशियल की गोपनीयता बनाए रखने और अपने खाते के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदार हैं। उपयोगकर्ताओं को किसी भी अवैध उद्देश्य के लिए या किसी भी कानून का उल्लंघन करने के लिए सेवा का उपयोग नहीं करना चाहिए।"
        },
        {
          title: "4. बौद्धिक संपदा",
          content: "LegalEase AI सेवा की सभी सामग्री, सुविधाएं और कार्यक्षमता, जिसमें लेकिन इन्हीं तक सीमित नहीं है, पाठ, ग्राफिक्स, लोगो और सॉफ़्टवेयर, LegalEase AI की संपत्ति हैं और अंतर्राष्ट्रीय कॉपीराइट, ट्रेडमार्क और अन्य बौद्धिक संपदा कानूनों द्वारा संरक्षित हैं।"
        },
        {
          title: "5. गोपनीयता",
          content: "LegalEase AI का आपका उपयोग हमारी गोपनीयता नीति द्वारा भी शासित है। कृपया आपकी व्यक्तिगत जानकारी के संग्रह और उपयोग के संबंध में हमारी प्रथाओं को समझने के लिए हमारी गोपनीयता नीति की समीक्षा करें।"
        },
        {
          title: "6. देयता की सीमा",
          content: "LegalEase AI सूचना और विश्लेषण उपकरण प्रदान करता है लेकिन कानूनी सलाह प्रदान नहीं करता है। सेवा 'जैसी है' किसी भी प्रकार की गारंटी के बिना प्रदान की जाती है। हम अपनी सेवा द्वारा प्रदान की गई जानकारी के आधार पर किए गए किसी भी निर्णय के लिए जिम्मेदार नहीं हैं।"
        },
        {
          title: "7. संशोधन",
          content: "LegalEase AI किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखता है। हम किसी भी महत्वपूर्ण परिवर्तन के लिए उपयोगकर्ताओं को सूचित करेंगे। ऐसे संशोधनों के बाद सेवा का निरंतर उपयोग अद्यतन शर्तों की स्वीकृति है।"
        },
        {
          title: "8. समाप्ति",
          content: "हम अपनी सेवा तक पहुंच को तुरंत समाप्त करने या निलंबित करने का अधिकार सुरक्षित रखते हैं, बिना पूर्व सूचना के, उस आचरण के लिए जिसे हम मानते हैं कि ये शर्तें उल्लंघन करता है या अन्य उपयोगकर्ताओं, हमारे या तीसरे पक्षों के लिए हानिकारक है।"
        }
      ]
    }
  };

  const content = termsContent[language];

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
                ? "यदि आपके पास इन नियमों और शर्तों के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें।" 
                : "If you have any questions about these Terms and Conditions, please contact us."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;

