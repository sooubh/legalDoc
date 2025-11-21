import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
} from "lucide-react";
import type { AnalysisHistoryItem } from "../types/history.ts";

interface AnalysisHistorySidebarProps {
  items: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  selectedId?: string;
  onFetch?: () => void;
  onDelete?: (id: string) => void;
  language?: "en" | "hi";
}

const AnalysisHistorySidebar: React.FC<AnalysisHistorySidebarProps> = ({
  items,
  onSelect,
  selectedId,
  onFetch,
  onDelete,
  language = "en",
}) => {
  const [expanded, setExpanded] = React.useState<{ [key: string]: boolean }>({});

  const translations = {
    en: {
      history: "History",
      untitled: "Untitled Analysis",
      items: "items",
      highRisk: "High Risk",
    },
    hi: {
      history: "इतिहास",
      untitled: "शीर्षकहीन विश्लेषण",
      items: "आइटम",
      highRisk: "उच्च जोखिम",
    },
  };

  const t = translations[language];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Convert Firestore Timestamp or JS Date → JS Date
  const toJsDate = (ts: any): Date => {
    if (ts && typeof ts.toDate === "function") return ts.toDate();
    if (ts instanceof Date) return ts;
    const parsed = new Date(ts);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const formatDate = (timestamp: AnalysisHistoryItem["timestamp"]) => {
    const date = toJsDate(timestamp as any);
    return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: AnalysisHistoryItem["timestamp"]) => {
    const date = toJsDate(timestamp as any);
    return date.toLocaleTimeString(language === "hi" ? "hi-IN" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Group items by analysis name (title)
  const groupedItems = items.reduce((acc, item) => {
    const name = item.title || t.untitled;
    if (!acc[name]) acc[name] = [];
    acc[name].push(item);
    return acc;
  }, {} as Record<string, AnalysisHistoryItem[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          {t.history}
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        {Object.entries(groupedItems).map(([name, nameItems]) => (
          <div
            key={name}
            className="border-b border-gray-100 dark:border-slate-800"
          >
            <button
              onClick={() => toggleExpand(name)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2">
                {expanded[name] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="truncate">{name}</span>
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {nameItems.length} {t.items}
              </span>
            </button>

            {expanded[name] && (
              <div className="pb-2">
                {nameItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`w-full px-6 py-2 flex flex-col text-left hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      selectedId === item.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    } group relative pr-10`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <div className="ml-6 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.timestamp)}
                      </span>
                      {item.analysis.overallRiskLevel === "high" && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          {t.highRisk}
                        </span>
                      )}
                    </div>
                    
                    {/* Delete Button - Only visible on hover/group hover */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(item.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistorySidebar;
