import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Send, MessageSquare, Loader2, Mic, MicOff } from "lucide-react";
import type { ChatMessage as CM } from "../types/chat";
import { chatWithGemini } from "../services/gemini";
import type { ChatRequest } from "../types/chat";
import { GeminiLiveService } from "../services/geminiService";

interface TranscriptEntry {
  text: string;
  isFinal: boolean;
}

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
  // Text chat state
  const [input, setInput] = useState(initialMessage || "");
  const [messages, setMessages] = useState<CM[]>([]);
  const [isSending, setIsSending] = useState(false);
  const initialSentRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Voice assistant state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [liveInput, setLiveInput] = useState<string>("");
  const [liveOutput, setLiveOutput] = useState<string>("");

  // Gemini Live Service
  const geminiLiveServiceRef = useRef<GeminiLiveService | null>(null);
  const liveSessionRef = useRef<any>(null);

  // Track live transcriptions
  const currentInputTranscription = useRef<string>("");
  const currentOutputTranscription = useRef<string>("");

  // Handle initial message once
  useEffect(() => {
    if (!initialMessage || initialSentRef.current) return;
    initialSentRef.current = true;

    (async () => {
      setIsSending(true);
      try {
        const userEntry: CM = { role: "user", content: initialMessage };
        setMessages([userEntry]);

        const req: ChatRequest = {
          document: doc || "",
          language,
          history: [{ role: "user", content: initialMessage }],
          message: initialMessage,
        };
        const reply = await chatWithGemini(req);
        setMessages((prev) => [
          ...prev,
          { role: reply.role as any, content: reply.content },
        ]);
      } catch (e) {
        console.error("[ChatPanel] initial chatWithGemini failed", e);
        setMessages([{ role: "model", content: "(AI failed to respond)" }]);
      } finally {
        setIsSending(false);
      }
    })();
  }, [initialMessage, doc, language]);

  // Auto-scroll messages
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isBusy, transcript, aiResponse, liveInput, liveOutput]);

  const placeholder = useMemo(
    () =>
      language === "hi"
        ? "अपना प्रश्न यहाँ टाइप करें..."
        : "Type your question here...",
    [language]
  );

  // Handle Live API messages (voice and AI real-time)
  const handleLiveMessage = useCallback(
    async (message: any) => {
      try {
        // User live transcription
        if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          currentInputTranscription.current += text;
          setLiveInput(currentInputTranscription.current);
        }

        // AI live transcription
        if (message.serverContent?.outputTranscription) {
          const text = message.serverContent.outputTranscription.text;
          currentOutputTranscription.current += text;
          setLiveOutput(currentOutputTranscription.current);
        }

        // Turn complete: push final user and AI text to messages
        if (message.serverContent?.turnComplete) {
          const fullInput = currentInputTranscription.current.trim();
          const fullOutput = currentOutputTranscription.current.trim();

          setMessages((prev) => {
            const newMsgs = [...prev];
            if (fullInput) newMsgs.push({ role: "user", content: fullInput });
            if (fullOutput) newMsgs.push({ role: "model", content: fullOutput });
            return newMsgs;
          });

          currentInputTranscription.current = "";
          currentOutputTranscription.current = "";
          setLiveInput("");
          setLiveOutput("");
        }

        // Play AI audio if exists
        const base64Audio =
          message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio) await geminiLiveServiceRef.current?.playAudio(base64Audio);

        // Voice session status
        if (message.setupComplete || message.serverContent?.turnComplete) {
          setVoiceStatus(language === "hi" ? "सुन रहा है..." : "Listening...");
        }

      } catch (error) {
        console.error("[Voice] Error handling message:", error);
      }
    },
    [language]
  );

  // Start voice session
  const startVoiceSession = useCallback(async () => {
    try {
      setVoiceStatus(language === "hi" ? "माइक्रोफ़ोन शुरू हो रहा है..." : "Starting microphone...");

      if (!geminiLiveServiceRef.current) geminiLiveServiceRef.current = new GeminiLiveService();
      const service = geminiLiveServiceRef.current;

      let systemInstruction = language === "hi"
        ? "आप एक सहायक कानूनी सहायक हैं। उपयोगकर्ता के प्रश्नों का स्पष्ट और संक्षिप्त उत्तर दें।"
        : "You are a helpful legal assistant. Answer questions clearly and concisely in English.";

      if (doc) {
        const docPreview = doc.substring(0, 2000);
        systemInstruction += language === "hi"
          ? ` उपयोगकर्ता ने एक दस्तावेज़ अपलोड किया है। दस्तावेज़ सामग्री: ${docPreview}...`
          : ` The user has uploaded a document. Document content: ${docPreview}...`;
      }

      const session = await service.startSession(systemInstruction, {
        onOpen: () => {
          setIsVoiceActive(true);
          setVoiceStatus(language === "hi" ? "कनेक्ट किया गया - बोलें" : "Connected - Speak now");
        },
        onMessage: handleLiveMessage,
        onError: (e: ErrorEvent) => {
          console.error("[Voice] Live session error:", e);
          setVoiceStatus(language === "hi" ? "त्रुटि: " + e.message : "Error: " + e.message);
          setTimeout(() => stopVoiceSession(), 2000);
        },
        onClose: () => stopVoiceSession(),
      });

      liveSessionRef.current = session;
      setTranscript([]);
      setAiResponse("");
      setLiveInput("");
      setLiveOutput("");

    } catch (err: any) {
      console.error("[Voice] ❌ Error starting voice session:", err);
      const errorMsg = err?.message || "Unknown error";
      setVoiceStatus(language === "hi" ? "त्रुटि: " + errorMsg : "Error: " + errorMsg);
      setTimeout(() => stopVoiceSession(), 3000);
    }
  }, [doc, language, handleLiveMessage]);

  // Stop voice session
  const stopVoiceSession = useCallback(() => {
    if (geminiLiveServiceRef.current) geminiLiveServiceRef.current.stopSession();
    liveSessionRef.current = null;
    setIsVoiceActive(false);
    setVoiceStatus("");
    setTranscript([]);
    setAiResponse("");
    setLiveInput("");
    setLiveOutput("");
  }, []);

  // Toggle voice assistant
  const toggleVoiceAssistant = useCallback(() => {
    if (isVoiceActive) stopVoiceSession();
    else startVoiceSession();
  }, [isVoiceActive, startVoiceSession, stopVoiceSession]);

  // Cleanup on unmount
  useEffect(() => () => { geminiLiveServiceRef.current?.stopSession(); }, []);

  // Handle text message submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy || isSending) return;
    setInput("");
    setIsSending(true);

    try {
      const userEntry: CM = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userEntry]);

      const req: ChatRequest = {
        document: doc || "",
        language,
        history: [...messages, userEntry].map((m) => ({ role: m.role as any, content: m.content })) as any,
        message: trimmed,
      };

      try {
        const reply = await chatWithGemini(req);
        setMessages((prev) => [...prev, { role: reply.role as any, content: reply.content }]);
      } catch {
        setMessages((prev) => [...prev, { role: "model", content: "(AI failed to respond)" }]);
      }
    } finally { setIsSending(false); }
  };

  const emptyState = (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div>
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-gray-900 font-semibold mb-1">{language === "hi" ? "चैट शुरू करें" : "Start chatting"}</h4>
        <p className="text-gray-600 text-sm">{language === "hi" ? "दस्तावेज़ के बारे में कोई भी प्रश्न पूछें। AI संदर्भ याद रखेगा।" : "Ask anything about the document. The AI will remember context."}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="font-semibold text-gray-900">{language === "hi" ? "AI चैटबॉट" : "AI Chatbot"}</div>
        <div className="text-xs text-gray-600 flex items-center gap-2">
          {isVoiceActive && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>{language === "hi" ? "आवाज़ सक्रिय" : "Voice active"}</span>}
          <span>{language === "hi" ? "संदर्भ: अपलोड किया गया दस्तावेज़" : "Context: Uploaded document"}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 p-4 space-y-4 overflow-auto transition-all duration-300">
        {messages.length === 0 ? emptyState : (
          <>
            {/* Live user text */}
            {liveInput && <div className="text-sm italic text-blue-600 mb-1">You (speaking): {liveInput}</div>}
            {/* Live AI text */}
            {liveOutput && <div className="text-sm italic text-cyan-600 mb-1">AI (speaking): {liveOutput}</div>}

            {messages.map((m, idx) => {
              const isActiveUserVoice = isVoiceActive && m.role === "user" && idx === messages.length - 1 && transcript.length > 0;
              const isActiveAIVoice = isVoiceActive && m.role === "model" && idx === messages.length - 1 && aiResponse;

              return (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-6 border ${m.role === "user" ? "bg-blue-600 text-white border-blue-700 rounded-br-sm" : "bg-gray-50 text-gray-900 border-gray-200 rounded-bl-sm"} ${(isActiveUserVoice || isActiveAIVoice) ? "animate-pulse" : ""}`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {(isBusy || isSending) && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-1.5 rounded-xl text-sm border bg-gray-50 text-gray-700 border-gray-200 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === "hi" ? "सोच रहा है…" : "Thinking…"}
            </div>
          </div>
        )}

        {/* Voice status indicator */}
        {voiceStatus && (
          <div className="flex justify-center">
            <div className="px-3 py-1.5 rounded-xl text-xs bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              {voiceStatus}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white/70">
        <div className="flex items-end gap-2">
          {/* Voice button */}
          <button type="button" onClick={toggleVoiceAssistant} disabled={isBusy || isSending} className={`inline-flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all ${isVoiceActive ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50" : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {isVoiceActive ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder={placeholder}
            rows={1}
            disabled={isVoiceActive}
            className="flex-1 resize-none rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button type="button" onClick={handleSubmit} disabled={!input.trim() || isBusy || isSending || isVoiceActive} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Send className="h-4 w-4" />
            {language === "hi" ? "भेजें" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
