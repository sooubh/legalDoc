import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface ChatBotInputProps {
  onOpenChat: () => void;
}

const ChatBotInput: React.FC<ChatBotInputProps> = ({ onOpenChat }) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onOpenChat();
      // You could store the input value here to pre-populate the chat
    }
  };

  const handleInputClick = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!inputValue.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 ${
        isExpanded ? 'p-4' : 'p-3'
      }`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={handleInputClick}
              onBlur={handleBlur}
              placeholder={isExpanded ? "Ask me anything about your legal document..." : "Ask your legal assistant..."}
              className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
          {isExpanded && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatBotInput;
