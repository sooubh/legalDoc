import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  MessageCircle,
} from "lucide-react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { chatWithGemini } from "../services/gemini";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface DesktopChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const DesktopChatBot: React.FC<DesktopChatBotProps> = ({
  isOpen,
  onClose,
  isMinimized,
  onToggleMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your legal document assistant. How can I help you analyze your documents today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    try {
      await addDoc(collection(db, "messages"), {
        role: "user",
        content: userMessage.text,
        timestamp: serverTimestamp(),
      });

      try {
        const reply = await chatWithGemini({
          document: "",
          language: "en",
          history: [],
          message: userMessage.text,
        });
        await addDoc(collection(db, "messages"), {
          role: reply.role,
          content: reply.content,
          timestamp: serverTimestamp(),
        });
      } catch (aiErr) {
        await addDoc(collection(db, "messages"), {
          role: "model",
          content: `I understand you're asking about "${userMessage.text}". This is a simulated response.`,
          timestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      // fallback to local simulated response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I understand you're asking about "${userMessage.text}". This is a simulated response. In a real implementation, this would connect to your AI service to provide legal document analysis and assistance.`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 shadow-2xl transition-all duration-300 z-40 ${
        isMinimized ? "w-16 desktop-chatbot-minimized" : "w-96"
      } ${isOpen ? "desktop-chatbot-enter" : "desktop-chatbot-exit"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 h-16">
        {!isMinimized && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                Legal Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Online
              </p>
            </div>
          </div>
        )}

        {isMinimized && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-140px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                } chat-message-enter`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    message.isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser
                        ? "bg-blue-500"
                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                    }`}
                  >
                    {message.isUser ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isUser
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-slate-400"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-indicator"></div>
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-indicator"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-indicator"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your legal document..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DesktopChatBot;
