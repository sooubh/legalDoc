import React from 'react';
import PdfViewer from './PdfViewer';

interface OriginalContentProps {
  content: string;
  pdfUrl?: string;
  height?: number | string; // optional container height for sticky layouts
}

const OriginalContent: React.FC<OriginalContentProps> = ({ content, pdfUrl, height }) => {
  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" style={containerHeight ? { height: containerHeight } : undefined}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Original Document</h3>
        <p className="text-gray-600 text-sm">Uploaded / pasted content</p>
      </div>
      {pdfUrl ? (
        <div className="p-0 flex-1 min-h-0">
          <PdfViewer url={pdfUrl} height={containerHeight ? '100%' : 650} />
        </div>
      ) : (
        <div className="p-6 max-h-[75vh] overflow-auto">
          <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm leading-6">{content}</pre>
        </div>
      )}
    </div>
  );
};

export default OriginalContent;


