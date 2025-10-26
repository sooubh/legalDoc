import { GoogleGenAI } from "@google/genai";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function generateExplanation(inputData: object | string): Promise<string> {
  let jsonData: any;

  // Convert inputData to JSON object if it's a string
  if (typeof inputData === "string") {
    try {
      jsonData = JSON.parse(inputData);
    } catch (err) {
      throw new Error("Invalid JSON string provided");
    }
  } else {
    jsonData = inputData;
  }

  const model = "gemini-2.5-pro";

  const prompt = `
    You are an expert legal analyst AI. Your task is to analyze the following JSON data, which represents the output of a legal document analyzer.

Generate a comprehensive, professional, and visually appealing HTML report, designed for a formal A4 report. The output should be self-contained within a single <div>, using Tailwind CSS classes to enhance readability, structure, and visual appeal.

Report Requirements
1. Overall Structure

Begin with a clear, prominent title (h1) summarizing the report.

Include an executive summary (p) highlighting key findings, risks, and insights.

Organize content using logical sections and subsections with headings (h2 for sections, h3 for subsections).

Include paragraphs to explain findings, analysis, and legal implications.

Use lists (ul, li) to emphasize important points, clauses, risks, or observations.

Use tables to present structured or numeric data clearly:

Table: w-full border-collapse

Header cells: bg-slate-100 p-2 text-left border

Data cells: p-2 border

Ensure all elements are well-spaced, easy to read, and visually organized.

2. Styling and Typography

Headings: Use text-2xl font-bold mt-6 mb-4 for main headings (h1), text-xl font-semibold mt-4 mb-2 for subheadings (h2), and text-lg font-semibold mt-3 mb-1 for smaller headings (h3).

Paragraphs: Use text-base leading-relaxed mt-2 mb-2 for clarity and readability.

Lists: Use list-disc list-inside mt-2 mb-2 for bullet points.

Tables: Use w-full border-collapse mt-4 mb-4 with header cells styled bg-slate-100 p-2 text-left border and data cells p-2 border.

Highlights or key points: Use font-semibold text-indigo-600 to make important notes or findings stand out.

3. Content Guidelines

Analyze the JSON carefully, interpreting legal clauses, risks, and obligations.

Provide insights, recommendations, or risk alerts where relevant.

Include visual markers (like bold text, headings, or subtle colors) to improve readability.

Keep explanations concise, clear, and professional, suitable for legal executives.

Avoid jargon where possible, but maintain formal legal tone.

4. Output Constraints

The output must be a single <div> block.

Do not include <html>, <head>, or <body> tags.

The HTML must be fully self-contained, clean, and renderable directly.

Ensure accessibility and readability, using spacing, typography, and table structures effectively.

Optional Enhancements for Extra Readability

Use colored section headers: e.g., text-slate-800 for main headings, text-slate-700 for subheadings.

Include horizontal separators (<hr class="my-4 border-slate-300" />) between sections for clarity.

Highlight critical risks or clauses in a subtle background: bg-yellow-50 p-2 rounded-md border-l-4 border-yellow-400.

Include summary tables for quick reference of key findings, dates, parties, obligations, or risks.

    Here is the JSON data:

    \`\`\`json
    ${JSON.stringify(jsonData, null, 2)}
    \`\`\`
  `;

  try {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  // Safely access response.text
  let htmlContent = response?.text?.trim() ?? "";

  if (htmlContent.startsWith("```html")) {
    htmlContent = htmlContent.substring(7);
  }
  if (htmlContent.endsWith("```")) {
    htmlContent = htmlContent.slice(0, -3);
  }

  return htmlContent.trim();
} catch (error) {
  console.error("Error generating explanation with Gemini:", error);
  throw new Error("Failed to get analysis from AI. Please check the API configuration and input data.");
}}
