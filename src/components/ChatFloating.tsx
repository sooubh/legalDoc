import React, { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatPanel from './ChatPanel';

interface ChatFloatingProps {
  isOpen: boolean;
  onToggle: () => void;
  document: string;
  language: 'en' | 'hi';
}


const ChatFloating: React.FC<ChatFloatingProps> = ({ isOpen, onToggle, document, language }) => {
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

      {/* Backdrop + Fullscreen Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onToggle} />
          <div className="relative z-10 m-4 w[calc(100vw-2rem)] h-[calc(100vh-2rem)] grid grid-cols-1 grid-rows-[1fr_1.2fr] gap-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-2 flex items-center justify-between border-b border-gray-200">
                <div className="font-semibold text-gray-900">{language === 'hi' ? 'अपलोड किया गया दस्तावेज़' : 'Uploaded Document'}</div>
                <button onClick={onToggle} className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200">
                  <X className="h-4 w-4 mr-1" /> {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
              <div className="p-4 h-[calc(100%-48px)] overflow-auto text-sm text-gray-800 whitespace-pre-wrap">
                {document || (language === 'hi' ? 'कोई दस्तावेज़ नहीं' : 'No document')}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <ChatPanel
                document={document}
                language={language}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatFloating;
