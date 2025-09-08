import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, tasks } = req.body;

    // Use a more powerful model for complex visualization tasks
    const model = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // or your preferred model

    // Create a comprehensive prompt that handles all visualization needs
    const prompt = `
    Analyze the following legal document and generate visualizations as requested.
    Document content: ${content}
    
    Please generate the following in a structured JSON format:
    ${
      tasks.includes("process_flow")
        ? "- Process flows showing the document workflow and decision points"
        : ""
    }
    ${
      tasks.includes("timeline")
        ? "- Timeline of important dates and deadlines"
        : ""
    }
    ${
      tasks.includes("relationships")
        ? "- Relationship diagram showing connections between parties"
        : ""
    }
    
    Format the response as a JSON object with the following structure:
    {
      "flows": [{ "nodes": [], "edges": [] }],
      "timeline": { "events": [] },
      "relationships": { "entities": [], "connections": [] }
    }
    `;

    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.3,
        return_full_text: false,
      },
    });

    let visualizations;
    try {
      visualizations = JSON.parse(response.generated_text);
    } catch (e) {
      console.error("Failed to parse model response:", e);
      throw new Error("Invalid visualization format returned from model");
    }

    return res.status(200).json({ visualizations });
  } catch (error) {
    console.error("Visualization generation error:", error);
    return res.status(500).json({ error: "Failed to generate visualizations" });
  }
}
