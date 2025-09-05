import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualizationBundle, ProcessFlow } from '../types/legal';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import 'vis-timeline/dist/vis-timeline-graph2d.min.css';

interface VisualizationsProps {
  visuals: VisualizationBundle | null;
  isLoading?: boolean;
}

const Visualizations: React.FC<VisualizationsProps> = ({ visuals, isLoading = false }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineModalRef = useRef<HTMLDivElement>(null);
  const [isFlowFullscreen, setIsFlowFullscreen] = useState(false);
  const [isTimelineFullscreen, setIsTimelineFullscreen] = useState(false);

  // Selectable flow index
  const [flowIndex, setFlowIndex] = useState(0);
  const { nodes, edges } = useMemo(() => {
    try {
      if (!visuals || !visuals.flows || visuals.flows.length === 0) {
        return { nodes: [], edges: [] };
      }
      const safeIndex = Math.min(flowIndex, Math.max(visuals.flows.length - 1, 0));
      const flow: ProcessFlow = visuals.flows[safeIndex];
      // Simple auto-layout grid: place decisions in their own column for readability
      const rfNodes: Node[] = flow.nodes.map((n, idx) => ({
        id: n.id,
        data: { label: n.label },
        position: { x: 80 + (n.type === 'decision' ? 300 : (idx % 3) * 180), y: 60 + Math.floor(idx / 3) * 140 },
        type: n.type === 'decision' ? 'input' : undefined,
      }));
      const rfEdges: Edge[] = flow.edges.map((e, idx) => ({
        id: `${e.from}-${e.to}-${idx}`,
        source: e.from,
        target: e.to,
        label: e.label,
        animated: !!e.label,
      }));
      return { nodes: rfNodes, edges: rfEdges };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Visualizations] Failed to build flow nodes/edges', { flowIndex, error: e, visuals });
      return { nodes: [], edges: [] };
    }
  }, [visuals, flowIndex]);

  useEffect(() => {
    // Render timeline using vis-timeline via dynamic import (ESM-safe)
    if (!visuals || !timelineRef.current) return;
    const firstTimeline = visuals.timelines?.[0];
    if (!firstTimeline) return;
    let timeline: any;
    (async () => {
      try {
        const vis = await import('vis-timeline/standalone');
        const items = new vis.DataSet(
          firstTimeline.milestones.map((m) => ({ id: m.id, content: m.title, start: m.when }))
        );
        timeline = new vis.Timeline(timelineRef.current!, items, {});
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Visualizations] Failed to init vis-timeline', { error: e, timeline: firstTimeline });
      }
    })();
    return () => {
      try {
        if (timeline && timeline.destroy) timeline.destroy();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Visualizations] Failed to destroy timeline', { error: e });
      }
    };
  }, [visuals]);

  useEffect(() => {
    // Initialize fullscreen timeline when modal opens
    if (!isTimelineFullscreen) return;
    if (!visuals || !timelineModalRef.current) return;
    const firstTimeline = visuals.timelines?.[0];
    if (!firstTimeline) return;
    let modalTimeline: any;
    (async () => {
      try {
        const vis = await import('vis-timeline/standalone');
        const items = new vis.DataSet(
          firstTimeline.milestones.map((m) => ({ id: m.id, content: m.title, start: m.when }))
        );
        modalTimeline = new vis.Timeline(timelineModalRef.current!, items, {});
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Visualizations] Failed to init vis-timeline (modal)', { error: e, timeline: firstTimeline });
      }
    })();
    return () => {
      try {
        if (modalTimeline && modalTimeline.destroy) modalTimeline.destroy();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Visualizations] Failed to destroy modal timeline', { error: e });
      }
    };
  }, [isTimelineFullscreen, visuals]);

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
              {nodes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No flow data</div>
              ) : (
                <ReactFlow nodes={nodes} edges={edges} fitView>
                  <MiniMap />
                  <Controls />
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
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
            {visuals.timelines?.length ? (
              <div ref={timelineRef} className="h-[480px]" />
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
              {nodes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No flow data</div>
              ) : (
                <ReactFlow nodes={nodes} edges={edges} fitView>
                  <MiniMap />
                  <Controls />
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
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
              {visuals.timelines?.length ? (
                <div ref={timelineModalRef} className="h-full" />
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


