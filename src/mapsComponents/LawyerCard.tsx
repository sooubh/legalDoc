import React from 'react';
import { Lawyer } from '../types/mapsTypes';
import { LocationMarkerIcon, ExternalLinkIcon, PhoneIcon, StarIcon } from './Icons';

interface LawyerCardProps {
  lawyer: Lawyer;
  onSelect: (lawyer: Lawyer) => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onSelect }) => {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-border">
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-center">
                <div className="uppercase tracking-wide text-sm text-primary font-semibold">{lawyer.specialty || 'Legal Services'}</div>
                {lawyer.rating !== undefined && (
                    <div className="flex items-center">
                        <span className="text-muted-foreground font-bold mr-1">{lawyer.rating.toFixed(1)}</span>
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                )}
            </div>
            <h3 className="block mt-1 text-lg leading-tight font-bold text-card-foreground">{lawyer.name}</h3>
            
            <div className="mt-4 space-y-2 text-muted-foreground">
                {lawyer.address && (
                    <div className="flex items-start">
                        <LocationMarkerIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                        <p>{lawyer.address}</p>
                    </div>
                )}
                {lawyer.phone && (
                    <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0 text-muted-foreground/70" />
                        <a href={`tel:${lawyer.phone}`} className="hover:text-primary transition-colors">{lawyer.phone}</a>
                    </div>
                )}
            </div>

            <p className="mt-4 text-muted-foreground text-sm line-clamp-3">{lawyer.summary || 'No summary available.'}</p>
        </div>
        <div className="p-6 bg-muted/30 border-t border-border flex flex-wrap gap-y-2 gap-x-4 items-center justify-between">
            <button
                onClick={() => onSelect(lawyer)}
                className="text-primary hover:text-primary/80 font-semibold transition-colors text-sm"
            >
                View Details & Contact
            </button>
            <div className="flex items-center gap-4">
                {lawyer.website && (
                    <a
                        href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Website <ExternalLinkIcon className="h-4 w-4 ml-1.5" />
                    </a>
                )}
                {lawyer.source?.uri && (
                    <a
                        href={lawyer.source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Map <ExternalLinkIcon className="h-4 w-4 ml-1.5" />
                    </a>
                )}
            </div>
        </div>
    </div>
  );
};

export default LawyerCard;