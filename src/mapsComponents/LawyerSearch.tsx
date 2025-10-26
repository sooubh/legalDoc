import React from 'react';
import { SearchIcon } from './Icons';

interface LawyerSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
  locationError: string | null;
}

const LawyerSearch: React.FC<LawyerSearchProps> = ({ query, onQueryChange, onSearch, loading, locationError }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Enter specialty (e.g., 'personal injury')"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    disabled={loading || !!locationError}
                />
            </div>
            <button
                type="submit"
                disabled={loading || !!locationError || !query.trim()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Searching...' : 'Find Lawyers'}
            </button>
        </form>
         {locationError && (
             <p className="text-sm text-red-600 mt-2 text-center sm:text-left">{locationError}</p>
         )}
    </div>
  );
};

export default LawyerSearch;