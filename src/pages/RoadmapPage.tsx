"use client";
import React from "react";
import { 
  FileText, 
  Brain, 
  BarChart3, 
  MessageSquare, 
  MapPin, 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  Target,
  ChevronLeft
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "in-progress" | "planned";
}

interface FeatureCategory {
  name: string;
  icon: React.ReactNode;
  features: Feature[];
  color: string;
}

const RoadmapPage: React.FC = () => {
  const categories: FeatureCategory[] = [
    {
      name: "Document Analysis",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-blue-500",
      features: [
        {
          title: "AI-Powered Document Parsing",
          description: "Extract and analyze key information from legal documents using advanced AI models",
          icon: <Brain className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Plain Language Summaries",
          description: "Convert complex legal jargon into easy-to-understand explanations",
          icon: <FileText className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Risk Assessment",
          description: "Identify potential risks and clauses that need attention",
          icon: <Shield className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Multi-language Support",
          description: "Generate analyses in English and Hindi languages",
          icon: <Zap className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Document Comparison",
          description: "Compare multiple versions of documents to track changes",
          icon: <BarChart3 className="h-6 w-6" />,
          status: "planned"
        }
      ]
    },
    {
      name: "Visualizations",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-purple-500",
      features: [
        {
          title: "Process Flow Diagrams",
          description: "Visual representation of legal processes and workflows",
          icon: <BarChart3 className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Responsibility Matrix",
          description: "Clear view of who is responsible for what in agreements",
          icon: <Target className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Timeline Visualizations",
          description: "Interactive timelines showing key dates and milestones",
          icon: <Clock className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Interactive Charts",
          description: "Dynamic charts for contract analysis and metrics",
          icon: <BarChart3 className="h-6 w-6" />,
          status: "in-progress"
        }
      ]
    },
    {
      name: "AI Assistant",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-green-500",
      features: [
        {
          title: "Context-Aware Chat",
          description: "Ask questions about your document and get instant answers",
          icon: <MessageSquare className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Voice Interactions",
          description: "Talk to the AI assistant using voice commands",
          icon: <Zap className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Smart Suggestions",
          description: "Get recommendations for document improvements and alternatives",
          icon: <Brain className="h-6 w-6" />,
          status: "in-progress"
        },
        {
          title: "Multi-turn Conversations",
          description: "Engage in detailed conversations about your legal documents",
          icon: <MessageSquare className="h-6 w-6" />,
          status: "completed"
        }
      ]
    },
    {
      name: "Lawyer Locator",
      icon: <MapPin className="h-5 w-5" />,
      color: "bg-orange-500",
      features: [
        {
          title: "AI-Powered Lawyer Search",
          description: "Find qualified lawyers near you based on specialty and location",
          icon: <MapPin className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Location-Based Matching",
          description: "Get recommendations based on your geographical location",
          icon: <MapPin className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Specialty Recommendations",
          description: "AI suggests the right type of lawyer for your legal needs",
          icon: <Brain className="h-6 w-6" />,
          status: "completed"
        },
        {
          title: "Lawyer Profiles & Reviews",
          description: "View detailed profiles with ratings and reviews",
          icon: <FileText className="h-6 w-6" />,
          status: "completed"
        }
      ]
    }
  ];

  const getStatusBadge = (status: Feature["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "planned":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <Target className="h-3 w-3" />
            Planned
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            LegalEase AI Roadmap
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore all the powerful features we've built and what's coming next
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`${category.color} p-2 rounded-lg text-white`}>
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${category.color} p-3 rounded-lg text-white`}>
                        {feature.icon}
                      </div>
                      {getStatusBadge(feature.status)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Have a Feature Request?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're always looking to improve. Share your ideas with us!
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">
            Share Your Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

