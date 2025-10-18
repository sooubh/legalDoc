import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

interface ChatPanelProps {
  document: string;
  isBusy?: boolean;
  language: 'en' | 'hi';
}

const ChatPanel: React.FC<ChatPanelProps> = ({ document: _document, isBusy = false, language }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data() as ChatMessage);
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ChatPanel] Failed to auto-scroll messages', { error: e });
    }
  }, [messages.length, isBusy]);

  const placeholder = useMemo(() => (
    language === 'hi' ? 'दस्तावेज़ के बारे में अपना प्रश्न लिखें...' : 'Ask a question about the document...'
  ), [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    setInput('');
    try {
      await addDoc(collection(db, "messages"), {
        role: 'user', 
        content: trimmed, 
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ChatPanel] onSend failed', { input: trimmed, error: err });
    }
  };

  const emptyState = (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div>
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-gray-900 font-semibold mb-1">
          {language === 'hi' ? 'चैट शुरू करें' : 'Start chatting'}
        </h4>
        <p className="text-gray-600 text-sm">
          {language === 'hi'
            ? 'दस्तावेज़ के बारे में कोई भी प्रश्न पूछें। AI संदर्भ याद रखेगा।'
            : 'Ask anything about the document. The AI will remember context.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="font-semibold text-gray-900">
          {language === 'hi' ? 'AI चैटबॉट' : 'AI Chatbot'}
        </div>
        <div className="text-xs text-gray-600">
          {language === 'hi' ? 'संदर्भ: अपलोड किया गया दस्तावेज़' : 'Context: Uploaded document'}
        </div>
      </div>

      <div ref={listRef} className="p-4 space-y-4 max-h-[55vh] overflow-auto">
        {messages.length === 0 ? (
          emptyState
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-6 border ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white border-blue-700 rounded-br-sm'
                  : 'bg-gray-50 text-gray-900 border-gray-200 rounded-bl-sm'
              }`}>
                {m.role === 'user' ? (
                  <span>{m.content}</span>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-p:my-2 prose-li:my-0 whitespace-pre-wrap">
                    {m.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isBusy && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-1.5 rounded-xl text-sm border bg-gray-50 text-gray-700 border-gray-200 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'hi' ? 'सोच रहा है…' : 'Thinking…'}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/70">
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
            disabled={!input.trim() || isBusy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {language === 'hi' ? 'भेजें' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
