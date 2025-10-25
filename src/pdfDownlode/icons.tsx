import React from 'react';

export const SparklesIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9.913 2.649a.5.5 0 0 1 .174 0l1.294.345a.5.5 0 0 0 .445-.112l.99-.99a.5.5 0 0 1 .707 0l.283.283a.5.5 0 0 1 0 .707l-.99.99a.5.5 0 0 0-.112.445l.345 1.294a.5.5 0 0 1 0 .174l-.345 1.294a.5.5 0 0 0 .112.445l.99.99a.5.5 0 0 1 0 .707l-.283.283a.5.5 0 0 1-.707 0l-.99-.99a.5.5 0 0 0-.445-.112l-1.294.345a.5.5 0 0 1-.174 0l-1.294-.345a.5.5 0 0 0-.445.112l-.99.99a.5.5 0 0 1-.707 0l-.283-.283a.5.5 0 0 1 0-.707l.99-.99a.5.5 0 0 0 .112-.445l-.345-1.294a.5.5 0 0 1 0-.174l.345-1.294a.5.5 0 0 0-.112-.445l-.99-.99a.5.5 0 0 1 0-.707l.283-.283a.5.5 0 0 1 .707 0l.99.99a.5.5 0 0 0 .445.112zM3 9.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM18 14.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
    </svg>
);


export const DownloadIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

export const RefreshIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>
    </svg>
);

// fix: Add missing UploadCloudIcon component.
export const UploadCloudIcon: React.FC = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400 dark:text-slate-500"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
