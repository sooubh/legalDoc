import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = "user_gemini_api_key";

export function getGeminiApiKey(): string | null {
  // 1. Try .env
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;

  // 2. Try localStorage
  if (typeof window !== "undefined") {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) return storedKey;
  }

  return null;
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, key);
  }
}

export function removeGeminiApiKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function validateGeminiApiKey(key: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Simple prompt to test connectivity
    await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
        generationConfig: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}
