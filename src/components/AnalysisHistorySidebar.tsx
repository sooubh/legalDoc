import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { AnalysisHistoryItem } from "../types/history";

interface AnalysisHistorySidebarProps {
  items: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  selectedId?: string;
}

const AnalysisHistorySidebar: React.FC<AnalysisHistorySidebarProps> = ({
  items,
  onSelect,
  selectedId,
}) => {
  const [expanded, setExpanded] = React.useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = formatDate(item.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as { [key: string]: AnalysisHistoryItem[] });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Analysis History
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Previous document analyses
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {Object.entries(groupedItems).map(([date, dateItems]) => (
          <div
            key={date}
            className="border-b border-gray-100 dark:border-slate-800"
          >
            <button
              onClick={() => toggleExpand(date)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2">
                {expanded[date] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {date}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {dateItems.length} items
              </span>
            </button>

            {expanded[date] && (
              <div className="pb-2">
                {dateItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`w-full px-6 py-2 flex flex-col text-left hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      selectedId === item.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="ml-6 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.timestamp)}
                      </span>
                      {item.analysis.riskLevel === "high" && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          High Risk
                        </span>
                      )}
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
