import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { OpenAI } from "openai";

config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

app.post("/api/mermaid", async (req, res) => {
  const { prompt } = req.body;
  console.log("[Hugging Face API] Received prompt:", prompt);

  if (!prompt) {
    console.error("[Hugging Face API] Missing prompt");
    return res.status(400).json({ error: "Missing prompt" });
  }

  const systemPrompt = `You are an assistant that generates visualizations from text using Mermaid.js syntax.\n- If the input describes a process, generate a flowchart.\n- If the input describes chronological events, generate a timeline.\n- Always respond ONLY with valid Mermaid.js code inside a Markdown code block (\u0060\u0060\u0060mermaid ... \u0060\u0060\u0060).\n- Do not add explanations or extra text outside the code block.\n- Use clear labels and arrows for processes, and proper date ordering for timelines.\n- Keep diagrams clean, readable, and minimal unless complexity is explicitly required.`;

  try {
    console.log(
      "[Hugging Face API] Calling API with system prompt and user prompt"
    );

    const chatCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:fireworks-ai",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    console.log("[Hugging Face API] Raw API response:", chatCompletion);

    const message = chatCompletion.choices?.[0]?.message?.content?.trim() ?? "";
    console.log("[Hugging Face API] Extracted message:", message);

    res.json({ mermaid: message });
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate diagram",
      details: err?.message || err,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Hugging Face Mermaid API listening on port ${PORT}`);
});
