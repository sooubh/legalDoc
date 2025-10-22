import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import type { ChatMessage as CM } from "../types/chat";
import { chatWithGemini } from "../services/gemini";
import type { ChatRequest } from "../types/chat";

interface ChatPanelProps {
  isBusy?: boolean;
  language: "en" | "hi";
  document?: string;
  initialMessage?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isBusy = false,
  language,
  document: doc,
  initialMessage,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<CM[]>([]);
  const [isSending, setIsSending] = useState(false);
  const initialSentRef = React.useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Handle initial message when component mounts
  // Send initial message once when provided (e.g., from ChatFloating). Avoid duplicates with a ref.
  useEffect(() => {
    if (!initialMessage) return;
    if (initialSentRef.current) return;
    if (messages.length > 0) return; // only send when chat is empty

    initialSentRef.current = true;

    (async () => {
      setIsSending(true);
      try {
        let historyForReq: { role: string; content: string }[] = [];
        const userEntry = { role: "user", content: initialMessage } as CM;
        // use functional updater to synchronously get previous messages and set new state
        setMessages((prev) => {
          historyForReq = [...prev, userEntry].map((h) => ({
            role: h.role as any,
            content: h.content,
          }));
          return [...prev, userEntry];
        });

        const req: ChatRequest = {
          document: doc || "",
          language,
          history: historyForReq as unknown as any,
          message: initialMessage,
        };
        const reply = await chatWithGemini(req);
        setMessages((m) => [
          ...m,
          { role: reply.role as any, content: reply.content },
        ]);
      } catch (e) {
        console.error("[ChatPanel] initial chatWithGemini failed", e);
        setMessages((m) => [
          ...m,
          { role: "model", content: "(AI failed to respond)" },
        ]);
      } finally {
        setIsSending(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  useEffect(() => {
    try {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    } catch (e) {
      console.error("[ChatPanel] Failed to auto-scroll messages", { error: e });
    }
  }, [messages.length, isBusy]);

  const placeholder = useMemo(
    () =>
      language === "hi"
        ? "दस्तावेज़ के बारे में अपना प्रश्न लिखें..."
        : "Ask a question about the document...",
    [language]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy || isSending) return;
    setInput("");
    setIsSending(true);

    try {
      let historyForReq: { role: string; content: string }[] = [];
      const userEntry = { role: "user", content: trimmed } as CM;
      setMessages((prev) => {
        historyForReq = [...prev, userEntry].map((h) => ({
          role: h.role as any,
          content: h.content,
        }));
        return [...prev, userEntry];
      });

      const req: ChatRequest = {
        document: doc || "",
        language,
        history: historyForReq as unknown as any,
        message: trimmed,
      };
      try {
        const reply = await chatWithGemini(req);
        setMessages((m) => [
          ...m,
          { role: reply.role as any, content: reply.content },
        ]);
      } catch (aiErr) {
        console.error("[ChatPanel] chatWithGemini failed", { error: aiErr });
        setMessages((m) => [
          ...m,
          { role: "model", content: "(AI failed to respond)" },
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const emptyState = (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div>
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-gray-900 font-semibold mb-1">
          {language === "hi" ? "चैट शुरू करें" : "Start chatting"}
        </h4>
        <p className="text-gray-600 text-sm">
          {language === "hi"
            ? "दस्तावेज़ के बारे में कोई भी प्रश्न पूछें। AI संदर्भ याद रखेगा।"
            : "Ask anything about the document. The AI will remember context."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="font-semibold text-gray-900">
          {language === "hi" ? "AI चैटबॉट" : "AI Chatbot"}
        </div>
        <div className="text-xs text-gray-600">
          {language === "hi"
            ? "संदर्भ: अपलोड किया गया दस्तावेज़"
            : "Context: Uploaded document"}
        </div>
      </div>

      <div ref={listRef} className="p-4 space-y-4 max-h-[55vh] overflow-auto">
        {messages.length === 0
          ? emptyState
          : messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-6 border ${
                    m.role === "user"
                      ? "bg-blue-600 text-white border-blue-700 rounded-br-sm"
                      : "bg-gray-50 text-gray-900 border-gray-200 rounded-bl-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    <span>{m.content}</span>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-p:my-2 prose-li:my-0 whitespace-pre-wrap">
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

        {(isBusy || isSending) && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-1.5 rounded-xl text-sm border bg-gray-50 text-gray-700 border-gray-200 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === "hi" ? "सोच रहा है…" : "Thinking…"}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 bg-white/70 bottom-0"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isBusy || isSending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {language === "hi" ? "भेजें" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
