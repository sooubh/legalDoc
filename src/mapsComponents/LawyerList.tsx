
import React from 'react';
import { Lawyer } from '../types/mapsTypes';
import LawyerCard from './LawyerCard';
import LawyerCardSkeleton from './LawyerCardSkeleton';

interface LawyerListProps {
  lawyers: Lawyer[];
  onSelectLawyer: (lawyer: Lawyer) => void;
  isLoading?: boolean;
  remainingCount?: number;
}

const LawyerList: React.FC<LawyerListProps> = ({ 
  lawyers, 
  onSelectLawyer, 
  isLoading = false,
  remainingCount = 0 
}) => {
  if (lawyers.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer, index) => (
          <div
            key={`${lawyer.name}-${index}`}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <LawyerCard lawyer={lawyer} onSelect={onSelectLawyer} />
          </div>
        ))}
        
        {isLoading && remainingCount > 0 && (
          <>
            {Array.from({ length: Math.min(remainingCount, 3) }).map((_, i) => (
              <LawyerCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>
      
      {isLoading && remainingCount > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
            Loading {remainingCount} more {remainingCount === 1 ? 'result' : 'results'}...
          </p>
        </div>
      )}
    </div>
  );
};

export default LawyerList;
