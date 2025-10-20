import React from 'react';
import { Bot } from 'lucide-react';

interface DesktopChatTriggerProps {
  onOpenChat: () => void;
  isActive?: boolean;
}

const DesktopChatTrigger: React.FC<DesktopChatTriggerProps> = ({ onOpenChat, isActive = false }) => {
  return (
    <button
      onClick={onOpenChat}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium desktop-chat-trigger ${
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      }`}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <span className="truncate">Legal Assistant</span>
      <div className="ml-auto">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </button>
  );
};

export default DesktopChatTrigger;
