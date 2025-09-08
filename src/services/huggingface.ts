
import type { VisualizationBundle, ProcessFlow } from '../types/legal';

export async function generateMermaidDiagram(prompt: string): Promise<string> {
  console.log('[Hugging Face Service] Sending prompt:', prompt);
  
  const res = await fetch("/api/mermaid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  
  if (!res.ok) {
    console.error('[Hugging Face Service] API Error:', res.status, res.statusText);
    throw new Error("Failed to generate diagram");
  }
  
  const data = await res.json();
  console.log('[Hugging Face Service] API Response:', data);
  return data.mermaid || "";
}

export async function generateVisualizations(content: string): Promise<VisualizationBundle> {
  console.log('[Hugging Face Service] Generating visualizations for content');
  
  const res = await fetch("/api/visualize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      content,
      tasks: ["process_flow", "timeline", "relationships"]
    }),
  });
  
  if (!res.ok) {
    console.error('[Hugging Face Service] Visualization Error:', res.status, res.statusText);
    throw new Error("Failed to generate visualizations");
  }
  
  const data = await res.json();
  console.log('[Hugging Face Service] Visualization Response:', data);
  return data.visualizations;
}
