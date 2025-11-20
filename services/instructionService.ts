
export type EmojiPreference = 'default' | 'enabled' | 'disabled';

export type MeeBotBehaviorConfig = {
  emojiPreference: EmojiPreference;
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
  
  let emojiPreference: EmojiPreference = 'default';
  if (lowerInstructions.includes("use emojis")) {
    emojiPreference = 'enabled';
  } else if (/no emoji|don't use emojis|without emojis|ไม่ใช้ emoji/.test(lowerInstructions)) {
    emojiPreference = 'disabled';
  }

  const config: MeeBotBehaviorConfig = {
    emojiPreference,
    avoidGradients: lowerInstructions.includes("avoid using gradients"),
    voiceStyle: lowerInstructions.includes("calm female voice") || lowerInstructions.includes("เสียงหญิงแบบสงบ") ? "CalmFemale" : "Default",
    summaryStyle: lowerInstructions.includes("bullet point") || lowerInstructions.includes("แบบ bullet point") ? "bullet" : "paragraph",
    imageStyle: lowerInstructions.includes("pixel art") ? "pixel" : "default",
  };
  
  return config;
}
