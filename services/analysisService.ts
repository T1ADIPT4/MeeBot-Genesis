
import { GoogleGenAI } from "@google/genai";
import { applyMeeBotInstructions } from './instructionService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Detects the primary language of a given text string.
 * @param text The text to analyze.
 * @returns An object containing the language code and its full name.
 */
export function detectLanguage(text: string): { lang: string; name: string } {
  if (/[\u0E00-\u0E7F]/.test(text)) return { lang: 'th', name: 'Thai' };
  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(text)) return { lang: 'ja', name: 'Japanese' };
  if (/[\uAC00-\uD7AF]/.test(text)) return { lang: 'ko', name: 'Korean' };
  // Add more language detections here if needed
  return { lang: 'en', name: 'English' }; // Default fallback
}

/**
 * Analyzes a proposal using the Gemini API.
 * @param proposal The proposal text.
 * @param languageName The name of the language the proposal is written in.
 * @param customInstructions Optional user-defined instructions for the AI's behavior.
 * @returns A promise that resolves to the summarized analysis as a string.
 */
export async function analyzeProposal(proposal: string, languageName: string, customInstructions?: string): Promise<string> {
  const model = 'gemini-2.5-flash';
  
  const behaviorConfig = applyMeeBotInstructions(customInstructions || '');
  const defaultSummaryStyle = behaviorConfig.summaryStyle === 'bullet'
      ? 'Structure your summary with 3-5 bullet points, highlighting the key objectives, methods, and potential outcomes.'
      : 'Summarize the proposal in a single, comprehensive paragraph.';

  const instructionBlock = customInstructions
    ? `\n**IMPORTANT: Follow these user-defined instructions for your response style and format:**\n${customInstructions}\n`
    : defaultSummaryStyle;


  const prompt = `You are an expert analyst. Your task is to provide a clear, concise, and insightful summary of the following proposal.
The proposal is written in ${languageName}.
Your summary MUST be in ${languageName} as well.
${instructionBlock}

Proposal:
---
${proposal}
---
`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing proposal with Gemini:", error);
    throw new Error("The AI model failed to process the request.");
  }
}
