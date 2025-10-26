import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeolocationCoordinates, Lawyer } from '../types/mapsTypes';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in your .env file");
}

const ai = new GoogleGenAI({ apiKey });

function parseLawyerInfo(response: GenerateContentResponse): Lawyer[] {
    let text = (response.text ?? '').trim();

    // The model might return the JSON wrapped in markdown, so we extract it.
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
    } else {
        // If no markdown block, try to find the first valid JSON array as a fallback
        const arrayMatch = text.match(/(\[[\s\S]*\])/);
        if (arrayMatch && arrayMatch[0]) {
            text = arrayMatch[0];
        }
    }
    
    try {
        const lawyersData = JSON.parse(text);
        if (!Array.isArray(lawyersData)) {
            console.error("Parsed data is not an array:", lawyersData);
            return [];
        }

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
  ?.map((chunk: any) => ({
      uri: chunk.maps?.uri || chunk.web?.uri,
      title: chunk.maps?.title || chunk.web?.title,
      type: chunk.maps ? ("maps" as const) : ("web" as const),
  }))
  .filter(source => source.uri);


        return lawyersData.map((item: any, index: number): Lawyer => ({
            name: item.name || 'N/A',
            specialty: item.specialty,
            address: item.address,
            summary: item.summary,
            phone: item.phone,
            website: item.website,
            email: item.email,
            rating: typeof item.rating === 'number' && item.rating >= 0 && item.rating <= 5 ? item.rating : undefined,
            review: item.review,
            source: sources && sources[index] ? sources[index] : undefined,
        }));
    } catch (e) {
        console.error("Failed to parse lawyer information:", e, "Raw text:", response.text);
        return [];
    }
}

export async function findLawyersNearMe(specialty: string, location: GeolocationCoordinates): Promise<Lawyer[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find up to 10 lawyers specializing in "${specialty}" near latitude ${location.latitude} and longitude ${location.longitude}. For each one, provide their name, specialty, address, a brief 2-3 sentence summary, phone number, website, email, average Google Maps star rating (as a number from 0 to 5), and a short, representative user review from Google Maps. Format the entire output as a single JSON array of objects.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        },
        // responseMimeType and responseSchema are not supported with the googleMaps tool.
      },
    });

    if (!response || !response.text) {
        console.warn("Received empty or invalid response from Gemini API.");
        return [];
    }

    return parseLawyerInfo(response);
  } catch (error) {
    console.error("An error occurred during the findLawyersNearMe API call:", error);
    throw new Error("The AI service failed to process the lawyer search. This may be a temporary issue with the location service or the AI model. Please try again in a moment.");
  }
}

export async function analyzeLegalText(text: string): Promise<{ analysis: string; specialty: string; }> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Analyze the following legal text. Provide a simplified summary, identify key clauses, and explain complex terms in plain English, formatted in Markdown. Also, identify the single most relevant legal specialty for this text (e.g., "Contract Law", "Family Law", "Intellectual Property"). Return a JSON object with two keys: "analysis" (the markdown string) and "specialty" (the string for the legal specialty). Legal Text: "${text}"`,
        config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
                type: 'OBJECT',
                properties: {
                    analysis: { 
                        type: 'STRING',
                        description: "The detailed analysis of the legal text in Markdown format."
                    },
                    specialty: {
                        type: 'STRING',
                        description: "The single most relevant legal specialty."
                    },
                },
                required: ["analysis", "specialty"]
            }
        }
    });
    if (!response || !response.text) {
        console.error("Received empty or invalid response from Gemini API for analysis.");
        throw new Error("The AI service failed to provide a valid response for analysis.");
    }

    try {
        // The response.text should be a JSON string that conforms to the schema.
        const result = JSON.parse(response.text);
        return {
            analysis: result.analysis || "Analysis could not be generated.",
            specialty: result.specialty || "Specialty could not be determined."
        };
    } catch (e) {
        console.error("Failed to parse analysis response:", e);
        throw new Error("Could not parse the analysis from the AI. The response may be malformed.");
    }
}

export async function getRelatedSpecialties(specialty: string): Promise<string[]> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user searched for a lawyer with specialty "${specialty}" and found no results. Provide a JSON array of 3 to 5 related or alternative legal specialties they could search for instead. For example, if they searched for "car crash lawyer", you might suggest ["personal injury attorney", "auto accident lawyer", "traffic law specialist"]. Return only the JSON array.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        suggestions: {
                            type: 'ARRAY',
                            items: { type: 'STRING' }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });

        const result = JSON.parse(response.text);
        return result.suggestions || [];
    } catch (e) {
        console.error("Failed to get related specialties:", e);
        return []; // Return empty array on error to prevent crashes
    }
}
