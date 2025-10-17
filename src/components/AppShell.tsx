import React, { useEffect, useState } from "react";
import { User, Sun, Moon, MoreHorizontal } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface RecentChatItem { id: string; title: string; timestamp: number }

interface AppShellProps {
  current: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
  recentChats?: RecentChatItem[];
  onSelectChat?: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: "upload", label: "Upload" },
  { id: "results", label: "Results" },
  { id: "visuals", label: "Visuals" },
  { id: "chat", label: "Chat" },
];

const AppShell: React.FC<AppShellProps> = ({ current, onNavigate, children, recentChats = [], onSelectChat }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'light');

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="w-screen h-screen grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] md:grid-cols-[260px_1fr] bg-slate-50 dark:bg-slate-900">
      {/* Top bar */}
      <div className="col-span-2 h-16 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">L</div>
          <div className="leading-tight">
            <div className="text-gray-900 dark:text-slate-100 font-semibold">LegalEase AI</div>
            <div className="text-[10px] text-gray-500 dark:text-slate-400 tracking-wide">Demystifying Legal Docs</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>This is not legal advice. Consult a lawyer for decisions.</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="row-start-2 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="h-full flex flex-col">
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border
                ${
                  current === item.id
                    ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-transparent dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-4 mx-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
          <div className="font-semibold mb-1">Quick tips</div>
          <ul className="list-disc ml-4 space-y-1">
            <li>Upload a PDF or paste text</li>
            <li>Review risks and actions</li>
            <li>Explore flows and timeline</li>
          </ul>
        </div>
        {!!recentChats.length && (
          <div className="mt-4 mx-3 p-3 rounded-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Recent chats</div>
            <div className="space-y-1">
              {recentChats.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelectChat && onSelectChat(c.id); onNavigate('chat'); }}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs border hover:bg-gray-50 dark:hover:bg-slate-800 ${current === 'chat' ? 'border-blue-200 dark:border-blue-900' : 'border-transparent'}`}
                  title={new Date(c.timestamp).toLocaleString()}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto p-3 border-t border-gray-200 dark:border-slate-700">
          <div className="space-y-2">
            <button onClick={() => onNavigate('profile')} className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button onClick={toggleTheme} className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button onClick={() => onNavigate('more')} className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800">
              <MoreHorizontal className="h-4 w-4" />
              <span>More</span>
            </button>
          </div>
        </div>
        </div>
      </aside>

      {/* Content */}
      <main className="row-start-2 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;


