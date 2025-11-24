import { HfInference } from '@huggingface/inference';

// Initialize with a public token or user provided token if available
// For now we will try without a token or use a placeholder if needed.
// Note: Client-side usage without a proxy exposes keys if hardcoded. 
// We will check if there is a VITE_HF_API_KEY.
const getHfToken = () => import.meta.env.VITE_HF_API_KEY;

export async function generateRealImage(prompt: string): Promise<Blob> {
    const token = getHfToken();
    // If no token, we might hit rate limits, but let's try.
    // We can use a free model like stabilityai/stable-diffusion-2 or similar.
    const hf = new HfInference(token);

    try {
        const blob = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-2',
            inputs: `legal concept, ${prompt}, professional, photorealistic, 4k, high quality, cinematic lighting`,
            parameters: {
                negative_prompt: 'blurry, ugly, distorted, text, watermark, low quality, cartoon, sketch',
            }
        });
        return blob;
    } catch (error) {
        console.error('HuggingFace Image Generation Error:', error);
        throw new Error('Failed to generate image. Please ensure you have a valid HuggingFace API Key configured or try again later.');
    }
}
