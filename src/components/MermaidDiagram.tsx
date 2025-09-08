import React, { memo, useEffect, useId, useMemo, useRef, useState } from 'react';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

const MermaidDiagramComponent: React.FC<MermaidDiagramProps> = ({ code, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, '-');

  const sanitized = useMemo(() => code?.trim() || '', [code]);

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current || !sanitized) return;
    setError(null);
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
        const renderId = `mmd-${uniqueId}`;
        const { svg } = await mermaid.render(renderId, sanitized);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e: any) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[MermaidDiagram] render failed', e);
        setError(e?.message || 'Failed to render diagram');
      }
    })();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [sanitized, uniqueId]);

  if (!sanitized) return null;

  return (
    <div className={className}>
      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <div ref={containerRef} className="overflow-auto" />
      )}
    </div>
  );
};

const MermaidDiagram = memo(MermaidDiagramComponent);
export default MermaidDiagram;


