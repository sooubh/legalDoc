import React, { useMemo, useState } from 'react';
import type { VisualizationBundle, ProcessFlow } from '../types/legal';
import MermaidDiagram from './MermaidDiagram';

interface VisualizationsProps {
  visuals: VisualizationBundle | null;
  isLoading?: boolean;
}

const Visualizations: React.FC<VisualizationsProps> = ({ visuals, isLoading = false }) => {
  const [isFlowFullscreen, setIsFlowFullscreen] = useState(false);
  const [isTimelineFullscreen, setIsTimelineFullscreen] = useState(false);

  // Selectable flow index
  const [flowIndex, setFlowIndex] = useState(0);
  const mermaidFlow = useMemo(() => {
    try {
      if (!visuals || !visuals.flows || visuals.flows.length === 0) return '';
      const safeIndex = Math.min(flowIndex, Math.max(visuals.flows.length - 1, 0));
      const flow: ProcessFlow = visuals.flows[safeIndex];
      const nodeLines = flow.nodes
        .map((n) => {
          const shape = n.type === 'start' ? '(( ': n.type === 'end' ? ') ' : n.type === 'decision' ? '{ ' : '[ ';
          const close = n.type === 'start' ? ' ))' : n.type === 'end' ? ' )' : n.type === 'decision' ? ' }' : ' ]';
          return `${n.id}${shape}${n.label}${close}`;
        })
        .join('\n');
      const edgeLines = flow.edges
        .map((e) => `${e.from} -->${e.label ? `|${e.label}|` : ''} ${e.to}`)
        .join('\n');
      return `flowchart TD\n${nodeLines}\n${edgeLines}`;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Visualizations] Failed to build mermaid flow', { flowIndex, error: e, visuals });
      return '';
    }
  }, [visuals, flowIndex]);

  const mermaidTimeline = useMemo(() => {
    try {
      const firstTimeline = visuals?.timelines?.[0];
      if (!firstTimeline) return '';
      const lines: string[] = ['timeline', `  title: ${firstTimeline.label || 'Timeline'}`, `  section Events`];
      for (const m of firstTimeline.milestones) {
        lines.push(`  ${m.title}: ${m.when}`);
      }
      return lines.join('\n');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Visualizations] Failed to build mermaid timeline', e);
      return '';
    }
  }, [visuals]);

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200">
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Visualizations</h3>
          <p className="text-gray-700">Generating timelines and flows…</p>
        </div>
      </div>
    );
  }

  if (!visuals) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200">
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Visualizations</h3>
          <p className="text-gray-700">No visualization data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200">
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Visualizations</h3>
          <p className="text-gray-700">{visuals.textSummary || 'Automatically extracted timelines and process flows.'}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 rounded-lg p-2 min-h-[520px]">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-sm font-semibold text-gray-900">Flowchart</div>
              <button
                onClick={() => setIsFlowFullscreen(true)}
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Fullscreen
              </button>
            </div>
            {visuals?.flows?.length > 1 && (
              <div className="px-2 pb-2 flex items-center gap-2 text-xs text-gray-700">
                <span>Process:</span>
                <select
                  className="border border-gray-300 rounded px-1 py-0.5"
                  value={flowIndex}
                  onChange={(e) => setFlowIndex(Number(e.target.value))}
                >
                  {visuals.flows.map((f, i) => (
                    <option key={f.id} value={i}>{f.label || `Flow ${i+1}`}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="h-[480px]">
              {mermaidFlow ? (
                <MermaidDiagram code={mermaidFlow} className="h-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No flow data</div>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-2 min-h-[520px]">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-sm font-semibold text-gray-900">Timeline</div>
              <button
                onClick={() => setIsTimelineFullscreen(true)}
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Fullscreen
              </button>
            </div>
            {mermaidTimeline ? (
              <MermaidDiagram code={mermaidTimeline} className="h-[480px]" />
            ) : (
              <div className="h-[480px] flex items-center justify-center text-gray-500 text-sm">No timeline data</div>
            )}
          </div>
        </div>

        {visuals.responsibilities && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">{visuals.responsibilities.label}</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="py-2 pr-4">Topic</th>
                    <th className="py-2 pr-4">{visuals.responsibilities.partyALabel}</th>
                    <th className="py-2 pr-4">{visuals.responsibilities.partyBLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {visuals.responsibilities.items.map((it, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="py-2 pr-4 font-medium text-gray-900">{it.topic}</td>
                      <td className="py-2 pr-4 text-gray-800">{it.partyA}</td>
                      <td className="py-2 pr-4 text-gray-800">{it.partyB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Flow Fullscreen Modal */}
      {isFlowFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[95vw] h-[90vh] p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">Flowchart (Fullscreen)</div>
              <button onClick={() => setIsFlowFullscreen(false)} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Close</button>
            </div>
            <div className="flex-1">
              {mermaidFlow ? (
                <MermaidDiagram code={mermaidFlow} className="h-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No flow data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Fullscreen Modal */}
      {isTimelineFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[95vw] h-[90vh] p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">Timeline (Fullscreen)</div>
              <button onClick={() => setIsTimelineFullscreen(false)} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Close</button>
            </div>
            <div className="flex-1">
              {mermaidTimeline ? (
                <MermaidDiagram code={mermaidTimeline} className="h-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No timeline data</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizations;


