
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">AI is analyzing your document...</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">This may take a few moments.</p>
    </div>
  );
};
