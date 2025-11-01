"use client";
import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, FileText, MessageSquare, MapPin, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoSlide {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  // Example: "https://www.youtube.com/embed/YOUR_VIDEO_ID" or Vimeo embed URL
  description: string;
  category: string;
}

interface VideoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoShowcaseModal: React.FC<VideoShowcaseModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSlides: VideoSlide[] = [
    {
      id: "1",
      title: "Document Analysis & AI Assistant",
      subtitle: "Master Your Legal Documents",
      description: "See how LegalEase AI transforms complex legal documents into easy-to-understand summaries with our AI-powered analysis engine.",
      category: "Document Analysis",
      thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop"
    },
    {
      id: "2",
      title: "Visualization & Process Flows",
      subtitle: "Visualize Legal Processes",
      description: "Explore interactive visualizations including process flow diagrams, responsibility matrices, and timeline views for your legal documents.",
      category: "Visualizations",
      thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop"
    },
    {
      id: "3",
      title: "AI Chat Assistant",
      subtitle: "Intelligent Conversations",
      description: "Watch how our context-aware AI assistant answers questions about your documents using voice and text interactions.",
      category: "AI Assistant",
      thumbnailUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=450&fit=crop"
    },
    {
      id: "4",
      title: "Lawyer Locator AI",
      subtitle: "Find the Right Legal Professional",
      description: "Discover how our AI-powered lawyer search helps you find qualified attorneys near you based on specialty and location.",
      category: "Lawyer Locator",
      thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % videoSlides.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + videoSlides.length) % videoSlides.length);
    setIsPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  const handleClose = () => {
    // Mark as seen in localStorage
    localStorage.setItem("videoShowcaseSeen", "true");
    setIsPlaying(false);
    onClose();
  };

  const currentVideo = videoSlides[currentSlide];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Document Analysis":
        return <FileText className="h-4 w-4" />;
      case "Visualizations":
        return <BarChart3 className="h-4 w-4" />;
      case "AI Assistant":
        return <MessageSquare className="h-4 w-4" />;
      case "Lawyer Locator":
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 lg:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
              {/* Header */}
              <div className="relative bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 sm:p-8 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome to LegalEase AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      Discover how we simplify legal document analysis
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-200"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Video Showcase Section - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {/* Video Player Container */}
                <div className="relative mb-6 max-w-5xl mx-auto">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-xl overflow-hidden shadow-2xl">
                    {currentVideo.thumbnailUrl && !isPlaying && (
                      <img
                        src={currentVideo.thumbnailUrl}
                        alt={currentVideo.title}
                        className="w-full h-full object-cover opacity-70"
                      />
                    )}
                    
                    {/* Play Button Overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <button
                          onClick={() => setIsPlaying(true)}
                          className="w-24 h-24 bg-white/95 dark:bg-slate-700/95 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-2xl hover:scale-110"
                          aria-label="Play video"
                        >
                          <Play className="h-12 w-12 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
                        </button>
                      </div>
                    )}

                    {/* Video Player */}
                    {isPlaying && currentVideo.videoUrl && (
                      <div className="absolute inset-0">
                        <iframe
                          src={currentVideo.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={currentVideo.title}
                        ></iframe>
                      </div>
                    )}

                    {/* Placeholder message when no video URL */}
                    {isPlaying && !currentVideo.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-center text-white p-8 max-w-md">
                          <p className="text-xl font-semibold mb-3">Video Coming Soon</p>
                          <p className="text-sm opacity-90 mb-4">
                            Add a video URL to showcase your project demo. You can add YouTube or Vimeo embed URLs in the VideoShowcaseModal component.
                          </p>
                          <button
                            onClick={() => setIsPlaying(false)}
                            className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                          >
                            Back to Preview
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 dark:bg-slate-700/95 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-200 shadow-xl hover:scale-110 z-10"
                      aria-label="Previous video"
                    >
                      <ChevronLeft className="h-7 w-7 text-gray-700 dark:text-gray-200" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 dark:bg-slate-700/95 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-200 shadow-xl hover:scale-110 z-10"
                      aria-label="Next video"
                    >
                      <ChevronRight className="h-7 w-7 text-gray-700 dark:text-gray-200" />
                    </button>
                  </div>

                  {/* Video Info */}
                  <div className="mt-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentVideo.title}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                      {currentVideo.subtitle}
                    </p>
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    {videoSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? "w-10 bg-blue-600 dark:bg-blue-500"
                            : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Video Description */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6 max-w-5xl mx-auto">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                    {currentVideo.description}
                  </p>
                </div>

                {/* Category Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                  {videoSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => goToSlide(index)}
                      className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                        index === currentSlide
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                          : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-blue-600 dark:text-blue-400">
                          {getCategoryIcon(slide.category)}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {slide.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {slide.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* CTA Section */}
                <div className="mt-8 text-center max-w-2xl mx-auto">
                  <button
                    onClick={handleClose}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    Get Started with LegalEase AI
                  </button>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    You can always watch this demo later from the Video Showcase page
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoShowcaseModal;

