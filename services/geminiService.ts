
import { GoogleGenAI } from "@google/genai";
import { applyMeeBotInstructions } from './instructionService';

// FIX: Initialize GoogleGenAI directly with process.env.API_KEY and remove manual key checks
// to align with the provided coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3;

export async function generateMeeBotImage(
  options: {
    personaName: string;
    description: string;
    mood: string;
    stylePrompt: string;
  },
  signal?: AbortSignal,
  customInstructions?: string
): Promise<string> {
  let lastError: unknown;
  const { personaName, description, mood, stylePrompt } = options;

  // Generate dynamic keywords to guide the AI towards a more detailed result.
  const keywords = `${personaName}, ${mood}, intricate details, high resolution, concept art, cinematic lighting`;
  
  // Dynamically set composition based on persona for more varied results.
  let composition = 'Full-body character portrait, dynamic pose, centered, on a complementary abstract background that enhances the character\'s theme.';
  switch (personaName.toLowerCase()) {
      case 'guardian protector':
          composition = 'Full-body character portrait, powerful and defensive stance, centered, against a dramatic backdrop that emphasizes its strength and resilience.';
          break;
      case 'creative soul':
          composition = 'Dynamic action shot, artistic and expressive pose, slightly off-center for visual interest, on a vibrant abstract background that reflects creative energy.';
          break;
      case 'data wizard':
          composition = 'Three-quarter view portrait, contemplative and wise pose, surrounded by floating holographic data streams and arcane symbols, on a dark, high-tech background.';
          break;
      case 'energetic spark':
          composition = 'Full-body action shot, captured mid-movement with crackling energy and motion blur effects, on a minimalist background to emphasize its speed.';
          break;
      case 'nature synth':
          composition = 'Character portrait integrated within a lush, natural environment. Harmonious pose, blending with the surroundings, cinematic lighting filtering through leaves.';
          break;
  }

  // Dynamically set negative prompts based on mood.
  const baseNegatives = 'blurry, low-quality, dull colors, static pose, simple background, disproportional, bad anatomy';
  let negativePrompt = `Avoid: ${baseNegatives}.`;
   switch (mood.toLowerCase()) {
      case 'joyful':
      case 'energetic':
      case 'excited':
          negativePrompt = `Avoid: ${baseNegatives}, sad expression, crying, frowning, dark moody lighting.`;
          break;
      case 'serene':
      case 'contemplative':
      case 'calm':
          negativePrompt = `Avoid: ${baseNegatives}, angry expression, chaotic scene, overly bright or jarring colors.`;
          break;
      case 'stoic':
      case 'guardian':
      case 'protective':
          negativePrompt = `Avoid: ${baseNegatives}, smiling, laughing, goofy expression, frivolous background.`;
          break;
  }
  
  // Apply behavior config from custom instructions
  const behaviorConfig = applyMeeBotInstructions(customInstructions || '');
  const finalStylePrompt = behaviorConfig.imageStyle === 'pixel' ? `pixel art style, ${stylePrompt}` : stylePrompt;

  // Construct a more detailed, structured prompt for higher quality and more consistent results.
  const structuredPrompt = `
**Primary Subject:** A single, highly-detailed MeeBot character.

**Core Concept:** A "${personaName}" MeeBot.
**Visual Description:** ${description}.
**Mood & Emotion:** The character should clearly express a mood of "${mood}".

**Artistic Style:** ${finalStylePrompt}.

**Composition & Framing:** ${composition}

**Branding:** Subtly integrate the text "MEECHAIN" into the image. It should be stylish, legible, and placed in a lower corner, like a signature or watermark.

**Keywords for Emphasis:** ${keywords}

**Negative Prompt (What to Avoid):** ${negativePrompt}
  `.trim();

  const finalPrompt = customInstructions 
    ? `${structuredPrompt}\n\n**User's Custom Instructions (apply these styles and behaviors):**\n${customInstructions}`
    : structuredPrompt;


  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (signal?.aborted) {
        throw new Error("Request aborted by user.");
      }
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
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
