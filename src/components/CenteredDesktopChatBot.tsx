import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { chatWithGemini } from "../services/gemini";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const CenteredDesktopChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your legal document assistant. I can help you understand complex legal documents, explain terms, and answer questions about your analysis. How can I assist you today?",
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
    inputRef.current?.focus();
  }, []);

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
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I understand you're asking about "${userMessage.text}". This is a simulated response. In a real implementation, this would connect to your AI service to provide legal document analysis and assistance. I can help you understand legal terms, explain document sections, and provide insights about your uploaded documents.`,
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

  const quickQuestions = [
    "What does this document mean?",
    "Explain the key terms",
    "What are the risks?",
    "Summarize the main points",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col centered-chatbot rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Legal Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online • Ready to help with your legal documents
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            Quick Questions:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 quick-question-card bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            } chat-message-enter`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser
                    ? "bg-blue-500"
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}
              >
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "chat-message-bubble text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
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
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-message-bubble rounded-2xl px-4 py-3 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 dark:border-slate-700 chat-input-container">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your legal document..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 dark:placeholder-slate-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-12 h-12 gradient-button disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shadow-lg"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default CenteredDesktopChatBot;
