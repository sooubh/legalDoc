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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{lawyer.specialty || 'Legal Professional'}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{lawyer.name}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <XIcon className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-6 space-y-3 text-slate-600 border-b pb-6">
              {lawyer.address && (
                  <div className="flex items-center">
                      <LocationMarkerIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>{lawyer.address}</span>
                      {lawyer.source?.uri && (
                          <a href={lawyer.source.uri} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center text-sm text-indigo-600 hover:underline">
                              View on Map <ExternalLinkIcon className="h-4 w-4 ml-1" />
                          </a>
                      )}
                  </div>
              )}
              {lawyer.phone && (
                  <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={`tel:${lawyer.phone}`} className="hover:text-indigo-600">{lawyer.phone}</a>
                  </div>
              )}
               {lawyer.email && (
                  <div className="flex items-center">
                      <MailIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={`mailto:${lawyer.email}`} className="text-indigo-600 hover:underline">
                          {lawyer.email}
                      </a>
                  </div>
              )}
              {lawyer.website && (
                  <div className="flex items-center">
                      <ExternalLinkIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          Visit Website
                      </a>
                  </div>
              )}
          </div>
          
          <p className="mt-6 text-slate-700 leading-relaxed">{lawyer.summary || 'Detailed information not available.'}</p>

          {(lawyer.rating !== undefined || lawyer.review) && (
              <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Rating & Review</h3>
                  {lawyer.rating !== undefined && (
                      <div className="flex items-center mb-4">
                          <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                      key={i} 
                                      className={`h-6 w-6 ${i < Math.round(lawyer.rating!) ? 'text-yellow-400' : 'text-slate-300'}`} 
                                  />
                              ))}
                          </div>
                          <span className="ml-3 text-xl font-bold text-slate-700">{lawyer.rating.toFixed(1)}</span>
                      </div>
                  )}
                  {lawyer.review && (
                      <blockquote className="p-4 bg-slate-50 border-l-4 border-slate-300">
                          <p className="text-slate-600 italic">"{lawyer.review}"</p>
                      </blockquote>
                  )}
              </div>
          )}


          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact & Schedule</h3>
            {bookingStatus === 'idle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleBookAppointment} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      <CalendarIcon className="h-5 w-5 mr-2" /> Book Appointment
                  </button>
                  <button onClick={handleRequestVideoCall} className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                      <VideoCameraIcon className="h-5 w-5 mr-2" /> Request Video Call
                  </button>
              </div>
            )}
            {bookingStatus === 'booked' && (
              <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
                Appointment request sent! You will receive a confirmation email shortly.
              </div>
            )}
            {bookingStatus === 'video_requested' && (
              <div className="text-center p-4 bg-blue-100 text-blue-800 rounded-lg">
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