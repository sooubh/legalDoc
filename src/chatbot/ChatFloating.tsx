import React, { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel';

interface ChatFloatingProps {
  isOpen: boolean;
  onToggle: () => void;
  document: string;
}

const ChatFloating: React.FC<ChatFloatingProps> = ({ isOpen, onToggle, document }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Close and reset expansion when toggling the main visibility
  const handleClose = () => {
    onToggle();
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Modal and Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div
            className={`relative flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out rounded-t-2xl
              w-full max-w-md
              ${isExpanded ? 'h-[95vh] sm:h-[90vh]' : 'h-[75vh] sm:h-[70vh]'}`}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-md">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </span>
                     <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleExpanded}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="relative flex-1 overflow-hidden">
              <ChatPanel document={document} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onToggle}
        className={`fixed md:bottom-8 bottom-14 mb-5  right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </button>
    </>
  );
};

export default ChatFloating;

// --- INLINED ICON COMPONENTS ---

const MessageCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
);
  
const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
);
  
const ChevronUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
);
  
const ChevronDown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
);
