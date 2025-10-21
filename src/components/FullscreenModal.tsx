import React from 'react';

interface FullscreenModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full h-full max-w-none max-h-none flex flex-col border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="font-semibold text-gray-900 dark:text-slate-100">{title}</div>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200">Close</button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;


