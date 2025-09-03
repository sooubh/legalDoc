import React, { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatPanel from './ChatPanel';
import type { ChatMessage } from '../types/chat';

interface ChatFloatingProps {
  isOpen: boolean;
  onToggle: () => void;
  document: string;
  messages: ChatMessage[];
  onSend: (msg: string) => Promise<void> | void;
  isBusy?: boolean;
  language: 'en' | 'hi';
}

const ChatFloating: React.FC<ChatFloatingProps> = ({ isOpen, onToggle, document, messages, onSend, isBusy = false, language }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onToggle();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label={language === 'hi' ? 'चैट खोलें' : 'Open chat'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Panel */}
      <div className={`fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,420px)] transition-transform ${isOpen ? 'translate-y-0' : 'translate-y-[120%]'} `}>
        <div className="relative">
          <div className="absolute -top-3 -right-3">
            <button
              onClick={onToggle}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 shadow hover:bg-gray-50"
              aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChatPanel
            document={document}
            messages={messages}
            onSend={onSend}
            isBusy={isBusy}
            language={language}
          />
        </div>
      </div>
    </>
  );
};

export default ChatFloating;


