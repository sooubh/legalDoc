import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import ChatPanel from './ChatPanel';

interface ChatFloatingProps {
  isOpen: boolean;
  onToggle: () => void;
  document: string;
  language: 'en' | 'hi';
}

const ChatFloating: React.FC<ChatFloatingProps> = ({ isOpen, onToggle, document, language }) => {
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
        setShowChatPanel(false);
        setInputValue('');
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onToggle]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setShowChatPanel(true);
      setIsExpanded(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    onToggle();
    setShowChatPanel(false);
    setInputValue('');
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile-style Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={handleClose}
          />
          
          {/* Chat Container */}
          <div className={`relative bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out ${
            isExpanded ? 'h-[85vh]' : 'h-[60vh]'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {language === 'hi' ? 'कानूनी सहायक' : 'Legal Assistant'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'hi' ? 'ऑनलाइन' : 'Online'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleExpanded}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </button>
                <button 
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col h-[calc(100%-80px)]">
              {!showChatPanel ? (
                /* Initial Input Section */
                <div className="flex-1 flex flex-col justify-center p-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {language === 'hi' ? 'आपकी कैसे मदद कर सकता हूं?' : 'How can I help you?'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {language === 'hi' 
                        ? 'अपने कानूनी दस्तावेज़ के बारे में कोई भी प्रश्न पूछें' 
                        : 'Ask any question about your legal document'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={language === 'hi' ? 'अपना प्रश्न यहाँ टाइप करें...' : 'Type your question here...'}
                        className="w-full px-4 py-4 pr-14 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        autoFocus
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      {language === 'hi' 
                        ? 'प्रश्न पूछने के बाद चैट शुरू होगा' 
                        : 'Chat will start after asking a question'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Panel */
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <ChatPanel
                      document={document}
                      language={language}
                      initialMessage={inputValue}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button - Bottom Center */}
      <button
  onClick={onToggle}
  className={`fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${
    isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
  }`}
  aria-label={language === 'hi' ? 'चैट खोलें' : 'Open chat'}
>
  <MessageCircle className="h-7 w-7" />
</button>

    </>
  );
};

export default ChatFloating;