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
    <div className="bg-card p-6 rounded-xl shadow-lg mb-8 border border-border">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Enter specialty (e.g., 'personal injury')"
                    className="w-full pl-10 pr-4 py-3 bg-background text-foreground border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-shadow placeholder:text-muted-foreground"
                    disabled={loading || !!locationError}
                />
            </div>
            <button
                type="submit"
                disabled={loading || !!locationError || !query.trim()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Searching...' : 'Find Lawyers'}
            </button>
        </form>
         {locationError && (
             <p className="text-sm text-destructive mt-2 text-center sm:text-left">{locationError}</p>
         )}
    </div>
  );
};

export default LawyerSearch;