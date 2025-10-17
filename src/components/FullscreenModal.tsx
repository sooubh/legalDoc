import React from 'react';

interface FullscreenModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-[96vw] h-[94vh] p-3 flex flex-col border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="font-semibold text-gray-900 dark:text-slate-100">{title}</div>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200">Close</button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto rounded bg-white dark:bg-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;


