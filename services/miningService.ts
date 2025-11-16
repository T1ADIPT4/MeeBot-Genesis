import type { MeeBotMetadata, MiningGift, MemoryEvent } from '../types';

/**
 * Generates a MiningGift based on the MeeBot's persona.
 * @param persona The persona name of the MeeBot.
 * @returns A MiningGift object.
 */
export function activateMiningGift(persona: string): MiningGift {
  const now = Date.now();
  switch (persona) {
    case "Energetic Spark":
      return { program: "SpeedMiner v1.0", boost: "+20% speed", duration: "7 days", activatedAt: now };
    case "Guardian Protector":
      return { program: "SafeMine Shield", boost: "Security + Audit", duration: "14 days", activatedAt: now };
    case "Creative Soul":
      return { program: "DreamMiner", boost: "NFT + Mining synergy", duration: "10 days", activatedAt: now };
    case "Data Wizard":
      return { program: "InsightMiner", boost: "Auto yield optimization", duration: "30 days", activatedAt: now };
    case "Nature Synth":
      return { program: "EcoMiner", boost: "Energy saving + XP", duration: "14 days", activatedAt: now };
    default:
      return { program: "BasicMiner", boost: "Standard mining", duration: "7 days", activatedAt: now };
  }
}


/**
 * Creates a timeline event for when a MeeBot gives a Mining Gift.
 * @param meebot The MeeBot that is giving the gift.
 * @returns A MemoryEvent object for the gift event.
 */
export function logMiningGiftEvent(meebot: MeeBotMetadata): MemoryEvent {
  return {
    type: "MiningGift",
    message: `${meebot.name} granted the "${meebot.miningGift?.program}" gift.`,
    timestamp: meebot.miningGift?.activatedAt ?? Date.now(),
    status: 'staged',
  };
}

/**
 * Creates a timeline event for when a MeeBot is minted.
 * @param meebot The MeeBot that has been minted.
 * @returns A MemoryEvent object for the mint event.
 */
export function logMintEvent(meebot: MeeBotMetadata): MemoryEvent {
    return {
        type: 'Mint',
        message: `A new ${meebot.persona} MeeBot, ${meebot.name}, was born.`,
        timestamp: meebot.createdAt,
        status: 'staged',
    };
}
