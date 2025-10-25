
import React, { forwardRef } from 'react';

interface PdfPreviewProps {
  content: string;
}

export const PdfPreview = forwardRef<HTMLDivElement, PdfPreviewProps>(({ content }, ref) => {
  return (
    <div className="bg-slate-200 dark:bg-slate-900 p-4 sm:p-8 rounded-lg overflow-y-auto max-h-[70vh]">
      <div
        ref={ref}
        id="pdf-content"
        className="bg-white text-black p-8 sm:p-12 shadow-lg mx-auto"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
});
