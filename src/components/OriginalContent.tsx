import React from 'react';

interface OriginalContentProps {
  content: string;
}

const OriginalContent: React.FC<OriginalContentProps> = ({ content }) => {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Original Document</h3>
        <p className="text-gray-600 text-sm">Uploaded / pasted content</p>
      </div>
      <div className="p-6 max-h-[70vh] overflow-auto">
        <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm leading-6">{content}</pre>
      </div>
    </div>
  );
};

export default OriginalContent;


