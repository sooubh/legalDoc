import React from 'react';

const LawyerCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-start">
            <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded mr-2 mt-0.5"></div>
            <div className="flex-1">
              <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded mr-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-t flex flex-wrap gap-y-2 gap-x-4 items-center justify-between">
        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded"></div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LawyerCardSkeleton;

