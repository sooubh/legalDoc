import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiLiveService, sendTextMessage } from '../services/geminiService';
import type { ChatMessage } from "../types/types";
import { LiveServerMessage } from '@google/genai';

interface ChatPanelProps {
  document: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ document }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveUserTranscription, setLiveUserTranscription] = useState('');
  const [liveAITranscription, setLiveAITranscription] = useState('');

  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: "Hello! I'm your context-aware assistant. Ask me anything about the provided document, or start a voice conversation.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      geminiServiceRef.current?.stopSession();
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setInput('');
    setIsLoading(true);

    // Add user message and loading message in one update
    setMessages((prev) => [
      ...prev, 
      userMessage, 
      { role: 'model', content: '', inProgress: true }
    ]);

    try {
        const fullHistory = [...messages, userMessage];
        const responseText = await sendTextMessage(fullHistory, document);

        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model' && lastMessage.inProgress) {
                lastMessage.content = responseText;
                lastMessage.inProgress = false;
            } else {
                // Check for duplicate before adding
                const isDuplicate = newMessages.some(msg => 
                    msg.role === 'model' && msg.content === responseText
                );
                if (!isDuplicate) {
                    newMessages.push({ role: 'model', content: responseText });
                }
            }
            return newMessages;
        });
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model' && lastMessage.inProgress) {
                lastMessage.content = "Sorry, I encountered an error. Please try again.";
                lastMessage.inProgress = false;
            }
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading, messages, document]);

  const onOpen = useCallback(() => {
    console.log("Live session opened.");
    setIsListening(true);
    setIsLoading(false);
    setLiveUserTranscription('');
    setLiveAITranscription('');
    setMessages(prev => [...prev, { role: 'model', content: "I'm listening..." }]);
  }, []);

  const onError = useCallback((error: ErrorEvent) => {
    console.error("Live session error:", error);
    setIsListening(false);
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', content: "An error occurred with the voice session. It has been closed." }]);
  }, []);

  const onClose = useCallback((event: CloseEvent) => {
    console.log("Live session closed.", event);
    setIsListening(false);
    setIsLoading(false);
    setLiveUserTranscription('');
    setLiveAITranscription('');
  }, []);

  const onMessage = useCallback(async (message: LiveServerMessage) => {
    console.log("Received message:", message);
    console.log("Server content:", message.serverContent);
    const serverContent = message.serverContent as any;
    
    // Handle input transcription - show live updates
    if (serverContent?.inputTranscription?.text) {
        const newText = serverContent.inputTranscription.text;
        currentInputTranscriptionRef.current += newText;
        setLiveUserTranscription(currentInputTranscriptionRef.current);
        console.log("Input transcription:", newText);
    }
    
    // Handle output transcription - show live updates  
    if (serverContent?.outputTranscription?.text) {
        const newText = serverContent.outputTranscription.text;
        currentOutputTranscriptionRef.current += newText;
        setLiveAITranscription(currentOutputTranscriptionRef.current);
        console.log("Output transcription:", newText);
    }

    // Handle audio playback
    if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
        try {
            const audioData = serverContent.modelTurn.parts[0].inlineData.data;
            await geminiServiceRef.current?.playAudio(audioData);
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    }

    // Handle turn completion - only add to messages when turn is complete
    if (serverContent?.turnComplete) {
        const userInput = currentInputTranscriptionRef.current.trim();
        const modelOutput = currentOutputTranscriptionRef.current.trim();

        console.log("Turn complete - User input:", userInput, "Model output:", modelOutput);

        // Only add to messages if we have content and clear live transcriptions first
        setLiveUserTranscription('');
        setLiveAITranscription('');

        if (userInput || modelOutput) {
            setMessages(prev => {
                let newMessages = [...prev];
                // Remove "I'm listening..." message if it exists
                if(newMessages.length > 0 && newMessages[newMessages.length - 1].content === "I'm listening...") {
                    newMessages = newMessages.slice(0, -1);
                }
                
                // Add user input if present and not duplicate
                if (userInput) {
                    const isDuplicate = newMessages.some(msg => 
                        msg.role === 'user' && msg.content === userInput
                    );
                    if (!isDuplicate) {
                        newMessages.push({ role: 'user', content: userInput });
                    }
                }
                
                // Add model output if present and not duplicate
                if (modelOutput) {
                    const isDuplicate = newMessages.some(msg => 
                        msg.role === 'model' && msg.content === modelOutput
                    );
                    if (!isDuplicate) {
                        newMessages.push({ role: 'model', content: modelOutput });
                    }
                }
                
                return newMessages;
            });
        }
        
        // Reset transcription buffers
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
    }
  }, []);

  const handleToggleVoice = useCallback(async () => {
    if (isListening) {
        geminiServiceRef.current?.stopSession();
    } else {
        setIsLoading(true);
        if (!geminiServiceRef.current) {
            geminiServiceRef.current = new GeminiLiveService();
        }
        
        const systemInstruction = document 
            ? `You are a helpful assistant. Please answer the user's questions based on the following context. If the answer is not found in the context, say so.\n\nCONTEXT:\n"""${document}"""`
            : "You are a helpful assistant.";

        try {
            await geminiServiceRef.current.startSession(systemInstruction, {
                onOpen,
                onMessage,
                onError,
                onClose,
            });
        } catch (error) {
            console.error("Failed to start voice session:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "Sorry, I couldn't start the voice session. Please check microphone permissions and try again." 
            }]);
            setIsLoading(false);
            setIsListening(false);
        }
    }
  }, [isListening, document, onOpen, onMessage, onError, onClose]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
            )}
            <div className={`max-w-xs rounded-xl px-4 py-2.5 text-sm sm:max-w-sm md:max-w-md ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.inProgress ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Live User Transcription */}
        {liveUserTranscription && (
          <div className="flex items-start gap-3 justify-end">
            <div className="max-w-xs rounded-xl px-4 py-2.5 text-sm sm:max-w-sm md:max-w-md bg-blue-500 text-white opacity-80 border-2 border-blue-400 animate-pulse">
              <p className="whitespace-pre-wrap">{liveUserTranscription}</p>
              <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <span>Speaking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Live AI Transcription */}
        {liveAITranscription && (
          <div className="flex items-start gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="max-w-xs rounded-xl px-4 py-2.5 text-sm sm:max-w-sm md:max-w-md bg-gray-200 text-gray-800 opacity-80 border-2 border-gray-300 animate-pulse">
              <p className="whitespace-pre-wrap">{liveAITranscription}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span>Responding...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={isLoading && !isListening}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isLoading && !isListening ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={isLoading || isListening}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isListening}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;

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
  
  const Mic: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
  
  const MicOff: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 .44 1.56" />
      <path d="M10.43 5.37A2.99 2.99 0 0 1 12 5a3 3 0 0 1 3 3v2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
  
  const Loader2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
  
  const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );