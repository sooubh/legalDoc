
import React from 'react';
import { Lawyer } from '../types/mapsTypes';
import LawyerCard from './LawyerCard';

interface LawyerListProps {
  lawyers: Lawyer[];
  onSelectLawyer: (lawyer: Lawyer) => void;
}

const LawyerList: React.FC<LawyerListProps> = ({ lawyers, onSelectLawyer }) => {
  if (lawyers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lawyers.map((lawyer, index) => (
        <LawyerCard key={`${lawyer.name}-${index}`} lawyer={lawyer} onSelect={onSelectLawyer} />
      ))}
    </div>
  );
};

export default LawyerList;
