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
    Generate a comprehensive, professional, and informative explanation of the data. The output must be a single block of clean, well-structured HTML formatted for a formal A4 report.

    Use Tailwind CSS classes for styling. The HTML should be self-contained within a <div>.
    - Use headings (h1, h2, h3), paragraphs (p), lists (ul, li), and tables (table, th, td) where appropriate.
    - Style tables with classes like 'w-full', 'border-collapse'. Style headers with 'bg-slate-100', 'p-2', 'text-left', 'border'. Style cells with 'p-2', 'border'.
    - Use typography classes for readability (e.g., 'text-lg', 'font-semibold', 'mt-4', 'mb-2').
    - Do not include <html>, <head>, or <body> tags.
    - Ensure the content is structured logically with a clear hierarchy. Start with a title and a brief summary.
    - Make the explanation beautiful and easy to read.

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
