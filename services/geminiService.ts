import { GoogleGenAI } from "@google/genai";

// FIX: Initialize GoogleGenAI directly with process.env.API_KEY and remove manual key checks
// to align with the provided coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3;

export async function generateMeeBotImage(prompt: string, signal?: AbortSignal): Promise<string> {
  let lastError: unknown;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (signal?.aborted) {
        throw new Error("Request aborted by user.");
      }
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;

      if (!base64ImageBytes) {
        throw new Error("API response did not contain image data.");
      }

      return `data:image/png;base64,${base64ImageBytes}`;

    } catch (err) {
      lastError = err;
      if (i < MAX_RETRIES - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate image after retries.");
}