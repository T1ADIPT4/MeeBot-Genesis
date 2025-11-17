
export type MeeBotBehaviorConfig = {
  useEmojis: boolean;
  avoidGradients: boolean;
  voiceStyle: "CalmFemale" | "Default";
  summaryStyle: "bullet" | "paragraph";
  imageStyle: "pixel" | "default";
};

/**
 * Parses a string of custom instructions into a structured configuration object.
 * This allows specific behaviors to be controlled programmatically.
 * @param instructions The raw string of instructions from the user.
 * @returns A MeeBotBehaviorConfig object.
 */
export function applyMeeBotInstructions(instructions: string): MeeBotBehaviorConfig {
  const lowerInstructions = instructions.toLowerCase();
  
  const config: MeeBotBehaviorConfig = {
    useEmojis: lowerInstructions.includes("use emojis"),
    avoidGradients: lowerInstructions.includes("avoid using gradients"),
    voiceStyle: lowerInstructions.includes("calm female voice") ? "CalmFemale" : "Default",
    summaryStyle: lowerInstructions.includes("bullet point") ? "bullet" : "paragraph",
    imageStyle: lowerInstructions.includes("pixel art") ? "pixel" : "default",
  };
  
  return config;
}
