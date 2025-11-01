"use client";
import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Mail, FileText, MessageSquare, MapPin } from "lucide-react";

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

const VideoShowcasePage: React.FC = () => {
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

  const currentVideo = videoSlides[currentSlide];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Document Analysis":
        return <FileText className="h-4 w-4" />;
      case "Visualizations":
        return <Mail className="h-4 w-4" />;
      case "AI Assistant":
        return <MessageSquare className="h-4 w-4" />;
      case "Lawyer Locator":
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Modal Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="relative bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Video Showcase
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Watch how LegalEase AI simplifies legal document analysis
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/upload';
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Video Showcase Section */}
          <div className="p-6 sm:p-8">
            {/* Video Player Container */}
            <div className="relative mb-6">
              <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-xl overflow-hidden shadow-lg">
                {currentVideo.thumbnailUrl && (
                  <img
                    src={currentVideo.thumbnailUrl}
                    alt={currentVideo.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                )}
                
                {/* Play Button Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 bg-white/90 dark:bg-slate-700/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-xl hover:scale-110"
                      aria-label="Play video"
                    >
                      <Play className="h-10 w-10 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
                    </button>
                  </div>
                )}

                {/* Video Player (placeholder - replace with actual video URL) */}
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white p-6">
                      <p className="text-lg font-semibold mb-2">Video Coming Soon</p>
                      <p className="text-sm opacity-90">
                        Add a video URL to showcase your project demo
                      </p>
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-700/90 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:scale-110"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-700/90 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:scale-110"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
              </div>

              {/* Video Info */}
              <div className="mt-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentVideo.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {currentVideo.subtitle}
                </p>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {videoSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-blue-600 dark:bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Video Description */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentVideo.description}
              </p>
            </div>

            {/* Category Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videoSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === currentSlide
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-blue-600 dark:text-blue-400">
                      {getCategoryIcon(slide.category)}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      {slide.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {slide.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to get started?
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Try LegalEase AI Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoShowcasePage;

