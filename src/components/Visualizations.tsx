import React, { useMemo, useState } from "react";
import type { VisualizationBundle, ProcessFlow } from "../types/legal";
import MermaidDiagram from "./MermaidDiagram";
import SmartTimeline from "./SmartTimeline";
interface VisualizationsProps {
  visuals: VisualizationBundle | null;
  isLoading?: boolean;
}

const Visualizations: React.FC<VisualizationsProps> = ({
  visuals,
  isLoading = false,
}) => {
  const [isFlowFullscreen, setIsFlowFullscreen] = useState(false);
  const [isRespFullscreen, setIsRespFullscreen] = useState(false);
  const [isPOVTimelineFullscreen, setIsPOVTimelineFullscreen] = useState(false);

  // Selectable flow index
  const [flowIndex, setFlowIndex] = useState(0);
  // POV selection for timeline
  const [selectedPOV, setSelectedPOV] = useState<'court' | 'receiver' | 'overall'>('overall');
  const mermaidFlow = useMemo(() => {
    try {
      if (!visuals || !visuals.flows || visuals.flows.length === 0) return "";
      const safeIndex = Math.min(
        flowIndex,
        Math.max(visuals.flows.length - 1, 0)
      );
      const flow: ProcessFlow = visuals.flows[safeIndex];
      const nodeLines = flow.nodes
        .map((n) => {
          const safeLabel = n.label.replace(/[^a-zA-Z0-9\s-_]/g, "");
          let nodeDeclaration = `  ${n.id}`;

          switch (n.type) {
            case "start":
              nodeDeclaration += `([${safeLabel}])`;
              break;
            case "end":
              nodeDeclaration += `((${safeLabel}))`;
              break;
            case "decision":
              nodeDeclaration += `{${safeLabel}}`;
              break;
            default:
              nodeDeclaration += `[${safeLabel}]`;
          }

          return nodeDeclaration;
        })
        .join("\n");
      const edgeLines = flow.edges
        .map((e) => {
          const safeLabel = e.label?.replace(/[^a-zA-Z0-9\s-_]/g, "") || "";
          return safeLabel
            ? `  ${e.from} -->|${safeLabel}| ${e.to}`
            : `  ${e.from} --> ${e.to}`;
        })
        .join("\n");
      const diagram = [
        "graph TD",
        "  %% Nodes",
        nodeLines,
        "  %% Connections",
        edgeLines,
      ].join("\n");
      // console.log("Generated Mermaid Diagram:", diagram); // Uncomment to debug
      return diagram;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[Visualizations] Failed to build mermaid flow", {
        flowIndex,
        error: e,
        visuals,
      });
      return "";
    }
  }, [visuals, flowIndex]);

  if (isLoading) {
    return (
      <div className="bg-card/90 backdrop-blur rounded-2xl shadow-lg border border-border">
        <div className="p-8">
          <h3 className="text-xl font-bold text-card-foreground mb-2">
            Visualizations
          </h3>
          <p className="text-muted-foreground">Generating timelines and flows…</p>
        </div>
      </div>
    );
  }

  if (!visuals) {
    return (
      <div className="bg-card/90 backdrop-blur rounded-2xl shadow-lg border border-border">
        <div className="p-8">
          <h3 className="text-xl font-bold text-card-foreground mb-2">
            Visualizations
          </h3>
          <p className="text-muted-foreground">No visualization data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/90 backdrop-blur rounded-2xl shadow-lg border border-border w-full max-w-6xl mx-auto">
      <div className="p-8 flex flex-col gap-8">
        <div>
          <h3 className="text-2xl font-bold text-card-foreground mb-2">
            Visualizations
          </h3>
          <p className="text-muted-foreground text-base">
            {visuals.textSummary ||
              "Automatically extracted timelines and process flows."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div className="border border-border rounded-lg p-4 flex flex-col min-h-[400px] h-full bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold text-card-foreground">
                Flowchart
              </div>
              <button
                onClick={() => setIsFlowFullscreen(true)}
                className="text-xs px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
              >
                Fullscreen
              </button>
            </div>
            {visuals?.flows?.length > 1 && (
              <div className="pb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Process:</span>
                <select
                  className="border border-input rounded px-2 py-1 w-20 bg-background text-foreground"
                  value={flowIndex}
                  onChange={(e) => setFlowIndex(Number(e.target.value))}
                >
                  {visuals.flows.map((f, i) => (
                    <option key={f.id} value={i}>
                      {f.label || `Flow ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex-1 min-h-[320px] max-h-[480px] overflow-auto rounded border border-border">
              {mermaidFlow ? (
                <MermaidDiagram code={mermaidFlow} className="h-full w-full max-w-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No flow data
                </div>
              )}
            </div>
          </div>
        </div>

        {visuals.responsibilities && (
          <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-semibold text-card-foreground">
                {visuals.responsibilities.label}
              </div>
              <button
                onClick={() => setIsRespFullscreen(true)}
                className="text-xs px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
              >
                Fullscreen
              </button>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2 pr-4">
                    {visuals.responsibilities.partyALabel}
                  </th>
                  <th className="py-2 pr-4">
                    {visuals.responsibilities.partyBLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visuals.responsibilities.items.map((it, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="py-2 pr-4 font-medium text-card-foreground">
                      {it.topic}
                    </td>
                    <td className="py-2 pr-4 text-foreground">{it.partyA}</td>
                    <td className="py-2 pr-4 text-foreground">{it.partyB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Timeline Section */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-semibold text-card-foreground">
              Legal Process Timeline
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPOV}
                onChange={(e) => setSelectedPOV(e.target.value as 'court' | 'receiver' | 'overall')}
                className="text-xs px-3 py-1 rounded border border-input w-20 bg-background text-foreground"
              >
                <option value="overall">Overall Process</option>
                <option value="court">Court Perspective</option>
                <option value="receiver">Receiver Perspective</option>
              </select>
              <button
                onClick={() => setIsPOVTimelineFullscreen(true)}
                className="text-xs px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
              >
                Fullscreen
              </button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-auto">
            <SmartTimeline
              pov={selectedPOV}
              timelineData={visuals?.povTimeline}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Flow Fullscreen Modal */}
      {isFlowFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-card rounded-xl shadow-xl w-full h-full max-w-none max-h-none flex flex-col border border-border">
            <div className="flex items-center justify-between mb-2 p-4 border-b border-border">
              <div className="font-semibold text-card-foreground">
                Flowchart (Fullscreen)
              </div>
              <button
                onClick={() => setIsFlowFullscreen(false)}
                className="text-sm px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 p-4">
              {mermaidFlow ? (
                <MermaidDiagram code={mermaidFlow} className="h-full w-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No flow data
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsibilities Fullscreen Modal */}
      {isRespFullscreen && visuals.responsibilities && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-card rounded-xl shadow-xl w-full h-full max-w-none max-h-none flex flex-col border border-border">
            <div className="flex items-center justify-between mb-2 p-4 border-b border-border">
              <div className="font-semibold text-card-foreground">
                {visuals.responsibilities.label} (Fullscreen)
              </div>
              <button
                onClick={() => setIsRespFullscreen(false)}
                className="text-sm px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Topic</th>
                    <th className="py-2 pr-4">{visuals.responsibilities.partyALabel}</th>
                    <th className="py-2 pr-4">{visuals.responsibilities.partyBLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {visuals.responsibilities.items.map((it, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="py-2 pr-4 font-medium text-card-foreground">{it.topic}</td>
                      <td className="py-2 pr-4 text-foreground">{it.partyA}</td>
                      <td className="py-2 pr-4 text-foreground">{it.partyB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POV Timeline Fullscreen Modal */}
      {isPOVTimelineFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-card rounded-xl shadow-xl w-full h-full max-w-none max-h-none flex flex-col border border-border">
            <div className="flex items-center justify-between mb-4 p-4 border-b border-border">
              <div className="font-semibold text-card-foreground">
                Legal Process Timeline (Fullscreen)
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPOV}
                  onChange={(e) => setSelectedPOV(e.target.value as 'court' | 'receiver' | 'overall')}
                  className="text-sm px-3 py-1 rounded border border-input bg-background text-foreground"
                >
                  <option value="overall">Overall Process</option>
                  <option value="court">Court Perspective</option>
                  <option value="receiver">Receiver Perspective</option>
                </select>
                <button
                  onClick={() => setIsPOVTimelineFullscreen(false)}
                  className="text-sm px-3 py-1 rounded border border-border bg-background hover:bg-accent text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <SmartTimeline
                pov={selectedPOV}
                timelineData={visuals.povTimeline}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizations;

