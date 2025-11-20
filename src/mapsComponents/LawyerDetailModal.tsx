import React, { useState } from 'react';
import { Lawyer } from '../types/mapsTypes';
import { LocationMarkerIcon, PhoneIcon, VideoCameraIcon, CalendarIcon, XIcon, ExternalLinkIcon, MailIcon, StarIcon } from './Icons';

interface LawyerDetailModalProps {
  lawyer: Lawyer;
  onClose: () => void;
}

const LawyerDetailModal: React.FC<LawyerDetailModalProps> = ({ lawyer, onClose }) => {
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booked' | 'video_requested'>('idle');

  const handleBookAppointment = () => {
    setBookingStatus('booked');
    setTimeout(() => setBookingStatus('idle'), 3000);
  };
  
  const handleRequestVideoCall = () => {
    setBookingStatus('video_requested');
    setTimeout(() => setBookingStatus('idle'), 3000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase tracking-wide text-sm text-primary font-semibold">{lawyer.specialty || 'Legal Professional'}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mt-1">{lawyer.name}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <XIcon className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-6 space-y-3 text-muted-foreground border-b border-border pb-6">
              {lawyer.address && (
                  <div className="flex items-center">
                      <LocationMarkerIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>{lawyer.address}</span>
                      {lawyer.source?.uri && (
                          <a href={lawyer.source.uri} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center text-sm text-primary hover:underline">
                              View on Map <ExternalLinkIcon className="h-4 w-4 ml-1" />
                          </a>
                      )}
                  </div>
              )}
              {lawyer.phone && (
                  <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={`tel:${lawyer.phone}`} className="hover:text-primary">{lawyer.phone}</a>
                  </div>
              )}
               {lawyer.email && (
                  <div className="flex items-center">
                      <MailIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={`mailto:${lawyer.email}`} className="text-primary hover:underline">
                          {lawyer.email}
                      </a>
                  </div>
              )}
              {lawyer.website && (
                  <div className="flex items-center">
                      <ExternalLinkIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Visit Website
                      </a>
                  </div>
              )}
          </div>
          
          <p className="mt-6 text-muted-foreground leading-relaxed">{lawyer.summary || 'Detailed information not available.'}</p>

          {(lawyer.rating !== undefined || lawyer.review) && (
              <div className="mt-6 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">Rating & Review</h3>
                  {lawyer.rating !== undefined && (
                      <div className="flex items-center mb-4">
                          <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                      key={i} 
                                      className={`h-6 w-6 ${i < Math.round(lawyer.rating!) ? 'text-yellow-400' : 'text-muted'}`} 
                                  />
                              ))}
                          </div>
                          <span className="ml-3 text-xl font-bold text-card-foreground">{lawyer.rating.toFixed(1)}</span>
                      </div>
                  )}
                  {lawyer.review && (
                      <blockquote className="p-4 bg-muted/30 border-l-4 border-primary/50">
                          <p className="text-muted-foreground italic">"{lawyer.review}"</p>
                      </blockquote>
                  )}
              </div>
          )}


          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Contact & Schedule</h3>
            {bookingStatus === 'idle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleBookAppointment} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                      <CalendarIcon className="h-5 w-5 mr-2" /> Book Appointment
                  </button>
                  <button onClick={handleRequestVideoCall} className="w-full flex items-center justify-center px-4 py-3 border border-input text-base font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors">
                      <VideoCameraIcon className="h-5 w-5 mr-2" /> Request Video Call
                  </button>
              </div>
            )}
            {bookingStatus === 'booked' && (
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
                Appointment request sent! You will receive a confirmation email shortly.
              </div>
            )}
            {bookingStatus === 'video_requested' && (
              <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                Video call request sent! A link will be emailed to you.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetailModal;