import React from 'react';

const MorePage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">More</h2>
      <div className="space-y-3 text-gray-700 dark:text-slate-300 text-sm">
        <p>Settings, help, and about sections can live here.</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>App settings</li>
          <li>Help & documentation</li>
          <li>About LegalEase AI</li>
        </ul>
      </div>
    </div>
  );
};

export default MorePage;


