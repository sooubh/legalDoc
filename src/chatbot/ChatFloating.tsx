import React, { useEffect, useState } from "react";
import { MessageCircle, X, ChevronUp, ChevronDown } from "lucide-react";
import ChatPanel from "./ChatPanel";

interface ChatFloatingProps {
  isOpen: boolean;
  onToggle: () => void;
  document: string;
  language: "en" | "hi";
}

const ChatFloating: React.FC<ChatFloatingProps> = ({
  isOpen,
  onToggle,
  document,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [initialInput, setInitialInput] = useState("");

  const handleClose = () => {
    onToggle();
    setIsExpanded(false);
    setHasStartedChat(false);
    setInitialInput("");
  };

  const handleToggleExpanded = () => setIsExpanded((prev) => !prev);

  const handleStartChat = () => {
    if (initialInput.trim() === "") return;
    setHasStartedChat(true);
  };

  // Escape key closes chat
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div
            className={`relative bg-white rounded-t-3xl shadow-2xl transition-all duration-500 ease-out flex flex-col overflow-hidden ${
              isExpanded ? "h-[85vh]" : "h-[60vh]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {language === "hi" ? "कानूनी सहायक" : "Legal Assistant"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === "hi" ? "ऑनलाइन" : "Online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleExpanded}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 relative p-6 overflow-hidden">
              {!hasStartedChat ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-500">
                  <h2 className="text-gray-900 font-semibold text-xl">
                    {language === "hi"
                      ? "नमस्ते! मैं आपका कानूनी सहायक हूं।"
                      : "Hello! I'm your Legal Assistant."}
                  </h2>
                  <p className="text-gray-600 max-w-xs">
                    {language === "hi"
                      ? "आप अपने दस्तावेज़ के बारे में कोई भी प्रश्न पूछ सकते हैं। यहाँ टाइप करें और चैट शुरू करें।"
                      : "You can ask me anything about your document. Type your question below to start the chat."}
                  </p>
                  <input
                    type="text"
                    value={initialInput}
                    onChange={(e) => setInitialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStartChat();
                    }}
                    placeholder={
                      language === "hi"
                        ? "अपना प्रश्न टाइप करें..."
                        : "Type your question..."
                    }
                    className="px-4 py-2 border rounded-2xl w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    onClick={handleStartChat}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                  >
                    {language === "hi" ? "चैट शुरू करें" : "Start Chat"}
                  </button>
                  <p className="text-gray-400 text-xs max-w-xs">
                    {language === "hi"
                      ? "सभी प्रश्न गोपनीय और सुरक्षित हैं।"
                      : "All questions are private and secure."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full transition-all duration-500">
                  <ChatPanel
                    document={document}
                    language={language}
                    isBusy={false}
                    initialMessage={initialInput}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-[70px] md:bottom-6 right-6 z-40 md:w-16 md:h-16 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label={language === "hi" ? "चैट खोलें" : "Open chat"}
      >
        <MessageCircle className="h-10 w-10 md:m-3 m-2" />
      </button>
    </>
  );
};

export default ChatFloating;
