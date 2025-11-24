import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Network, 
  X, 
  Bot, 
  User, 
  Loader2,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { LawyerRole } from './RoleSelection';
import { chatWithAILawyer, generateMindmapCode } from '../../services/gemini';
import { generateRealImage } from '../../services/imageGeneration';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'image' | 'mindmap';
  imageUrl?: string; // Add URL for real images
  metadata?: any;
  timestamp: Date;
}

interface LawyerChatProps {
  role: LawyerRole;
  onBack: () => void;
}

const LawyerChat: React.FC<LawyerChatProps> = ({ role, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am your ${role.title} AI assistant. ${role.description} How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'image' | 'mindmap'>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'base',
      themeVariables: {
        primaryColor: '#3b82f6', // blue-500
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#2563eb',
        lineColor: '#64748b',
        secondaryColor: '#8b5cf6', // violet-500
        tertiaryColor: '#ec4899', // pink-500
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() && activeTool === 'none') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseContent = '';
      let responseType: 'text' | 'image' | 'mindmap' = 'text';
      let imageUrl = '';
      let metadata = {};

      if (activeTool === 'image') {
        try {
          const imageBlob = await generateRealImage(input);
          imageUrl = URL.createObjectURL(imageBlob);
          responseContent = "Here is the generated image based on your request.";
          responseType = 'image';
        } catch (err) {
          console.error("Image generation failed", err);
          responseContent = "Failed to generate image. Please try again.";
          responseType = 'text';
        }
      } else if (activeTool === 'mindmap') {
        const mermaidCode = await generateMindmapCode(input);
        responseContent = mermaidCode;
        responseType = 'mindmap';
      } else {
        // Standard chat
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        responseContent = await chatWithAILawyer(role, input, history);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseContent,
        type: responseType,
        imageUrl,
        metadata,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setActiveTool('none');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mermaid Component
  const MermaidDiagram = ({ code }: { code: string }) => {
    const [svg, setSvg] = useState('');
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
      mermaid.render(id, code).then(result => {
        setSvg(result.svg);
      }).catch(err => {
        console.error('Mermaid render error:', err);
        setSvg('<div class="text-red-500">Failed to render diagram</div>');
      });
    }, [code, id]);

    const handleDownload = () => {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'legal-mindmap.svg';
      a.click();
    };

    return (
      <div className="space-y-2 w-full">
        <div className="overflow-x-auto p-6 bg-white rounded-xl border border-border min-h-[300px] flex items-center justify-center shadow-sm">
          <div className="w-full h-full min-w-[500px]" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleDownload}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
          >
            <Download className="w-3 h-3" /> Download Mindmap
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-6xl mx-auto bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden m-4">
      {/* Header */}
      <div className={`p-4 border-b border-border/50 flex items-center justify-between ${role.color} bg-opacity-10 backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${role.color} text-white shadow-lg`}>
            {role.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{role.title} Assistant</h3>
            <p className="text-xs text-muted-foreground font-medium">Powered by LegalEase AI</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${role.color} text-white mt-1 shadow-md`}>
                <Bot className="w-6 h-6" />
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 border border-border/50 rounded-tl-none'
            }`}>
              {msg.type === 'image' && msg.imageUrl ? (
                <div className="space-y-3">
                  <div className="bg-white p-2 rounded-xl border border-border/50 shadow-inner overflow-hidden">
                    <img src={msg.imageUrl} alt="Generated Legal Visual" className="w-full h-auto rounded-lg max-h-[400px] object-contain" />
                  </div>
                  <div className="flex justify-end">
                    <a 
                      href={msg.imageUrl} 
                      download="legal-image.png"
                      className="text-xs flex items-center gap-1 text-blue-500 hover:underline font-medium"
                    >
                      <Download className="w-3 h-3" /> Download Image
                    </a>
                  </div>
                </div>
              ) : msg.type === 'mindmap' ? (
                <MermaidDiagram code={msg.content} />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              <div className={`text-[10px] mt-2 opacity-70 font-medium ${msg.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${role.color} text-white shadow-md`}>
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-border/50 rounded-2xl rounded-tl-none p-5 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                {activeTool === 'image' ? 'Generating image...' : 'Analyzing legal context...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-card/80 backdrop-blur border-t border-border/50">
        {activeTool !== 'none' && (
          <div className="mb-3 flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full w-fit border border-primary/20 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            {activeTool === 'image' && <ImageIcon className="w-4 h-4" />}
            {activeTool === 'mindmap' && <Network className="w-4 h-4" />}
            <span className="font-semibold capitalize">Mode: Generate {activeTool}</span>
            <button onClick={() => setActiveTool('none')} className="ml-2 hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-muted/30 hover:bg-muted/50 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-col shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeTool === 'image' ? "Describe the legal image you want to generate..." :
                activeTool === 'mindmap' ? "Enter a legal topic to generate a mindmap for..." :
                "Type your legal question here..."
              }
              className="w-full bg-transparent border-none p-4 min-h-[60px] max-h-[200px] resize-none focus:ring-0 text-base placeholder:text-muted-foreground/70"
              rows={1}
            />
            
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 px-3 border-t border-border/30 bg-white/5">
              <button 
                className="p-2 hover:bg-accent/50 rounded-lg text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                title="Upload Document (Coming Soon)"
                disabled
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-border/50 mx-1" />
              <button 
                onClick={() => setActiveTool(activeTool === 'image' ? 'none' : 'image')}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${activeTool === 'image' ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}`}
                title="Generate Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTool(activeTool === 'mindmap' ? 'none' : 'mindmap')}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${activeTool === 'mindmap' ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}`}
                title="Generate Mindmap"
              >
                <Network className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && activeTool === 'none')}
            className="p-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-3 font-medium opacity-60">
          AI can make mistakes. Please verify important legal information.
        </p>
      </div>
    </div>
  );
};

export default LawyerChat;
