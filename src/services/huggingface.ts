
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
