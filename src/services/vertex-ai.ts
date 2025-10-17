import { VertexAI } from '@google-cloud/vertexai';

// Types for Vertex AI Configuration
interface VertexAIConfig {
  project: string;
  location: string;
  modelName: string;
}

// Types for Vertex AI Response
interface VertexAIResponse {
  text: string;
  safetyAttributes?: {
    categories: string[];
    scores: number[];
  };
}

// Vertex AI Configuration
const config: VertexAIConfig = {
  project: process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  modelName: process.env.VERTEX_AI_MODEL || 'text-bison',
};

// Initialize Vertex AI Client
const vertexai = new VertexAI({
  project: config.project,
  location: config.location,
});

// Get the text model
const model = vertexai.preview.getModel(config.modelName);

// Text generation parameters
interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export async function generateText(
  prompt: string,
  params: GenerationConfig = {}
): Promise<VertexAIResponse> {
  try {
    const request = {
      prompt: {
        text: prompt,
      },
      parameters: {
        temperature: params.temperature || 0.7,
        topK: params.topK || 40,
        topP: params.topP || 0.95,
        maxOutputTokens: params.maxOutputTokens || 1024,
      },
    };

    const response = await model.generateText(request);
    return {
      text: response.text,
      safetyAttributes: response.safetyAttributes,
    };
  } catch (error) {
    console.error('Error generating text with Vertex AI:', error);
    throw error;
  }
}
