import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFPageProxy,
} from "pdfjs-dist";

// Configure worker (vite-friendly)
if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
}
interface PdfViewerProps {
  url: string;
  height?: number | string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.2);

  useEffect(() => {
    let cancelled = false;
    let currentPdf: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const loadingTask = getDocument(url);
        const doc = await loadingTask.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        currentPdf = doc;
        setPdf(doc);
        setNumPages(doc.numPages);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[PdfViewer] Failed to load PDF", { url, error: e });
      }
    })();

    return () => {
      cancelled = true;
      if (currentPdf) {
        currentPdf.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    let currentPage: PDFPageProxy | null = null;
    let renderTask: any = null;

    (async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page: PDFPageProxy = await pdf.getPage(pageNumber);
        currentPage = page;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          // eslint-disable-next-line no-console
          console.error("[PdfViewer] Canvas 2D context not available", {
            pageNumber,
            scale,
          });
          return;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[PdfViewer] Failed to render PDF page", {
          pageNumber,
          scale,
          error: e,
        });
      }
    })();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      if (currentPage) {
        currentPage.cleanup();
      }
    };
  }, [pdf, pageNumber, scale]);

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.2));
  const fitWidth = () => {
    if (!containerRef.current || !pdf) return;
    pdf
      .getPage(pageNumber)
      .then((page) => {
        try {
          const viewport = page.getViewport({ scale: 1 });
          const containerWidth = containerRef.current!.clientWidth - 16; // account for padding/scrollbar
          const newScale = Math.max(0.6, Math.min(3, containerWidth / viewport.width));
          setScale(newScale);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[PdfViewer] fitWidth failed", {
            pageNumber,
            error: e,
          });
        }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("[PdfViewer] fitWidth: failed to get page", {
          pageNumber,
          error: e,
        });
      });
  };

  // Observe container width to keep PDF fit-to-width responsively
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => {
      fitWidth();
    });
    ro.observe(containerRef.current);

    // Initial fit
    fitWidth();

    return () => ro.disconnect();
    // We intentionally exclude dependencies so this sets up once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, pageNumber]);

  const containerHeight = typeof height === "number" ? `${height}px` : height || "70vh";

  return (
    <div className="relative w-full bg-white flex flex-col" style={{ height: containerHeight }}>
      <div className="sticky top-0 flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 border-b border-gray-200 bg-white z-10 text-[13px] md:text-sm">
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={goPrev}
            disabled={pageNumber <= 1}
            className="px-1.5 md:px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <span className="text-gray-700">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={goNext}
            disabled={pageNumber >= numPages}
            className="px-1.5 md:px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={zoomOut}
            className="px-1.5 md:px-2 py-1 rounded border border-gray-300 text-gray-700"
          >
            <ZoomOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button
            onClick={zoomIn}
            className="px-1.5 md:px-2 py-1 rounded border border-gray-300 text-gray-700"
          >
            <ZoomIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button
            onClick={fitWidth}
            className="px-1.5 md:px-2 py-1 rounded border border-gray-300 text-gray-700"
          >
            <Maximize className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto">
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
    </div>
  );
};

export default PdfViewer;
