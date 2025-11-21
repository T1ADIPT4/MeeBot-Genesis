
import type { MeeBotMetadata, MiningGift, MemoryEvent, LeaderboardEntry } from '../types';
import { mockMeeBots } from '../data/mockMeeBots';

/**
 * Generates a MiningGift based on the persona.
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

// --- Simulated Live Leaderboard Data ---

let mockLeaderboardData: LeaderboardEntry[] = [
    {
        rank: 1,
        minerAddress: "0x71C...9A21",
        minerName: "AlphaPrime",
        level: 120,
        points: 12045,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alpha"
    },
    {
        rank: 2,
        minerAddress: "0xA4B...221C",
        minerName: "CyberKong",
        level: 98,
        points: 9842,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kong"
    },
    {
        rank: 3,
        minerAddress: "0x99D...F120",
        minerName: "EtherWhale",
        level: 85,
        points: 8510,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Whale"
    },
    {
        rank: 4,
        minerAddress: "0x33E...1102",
        minerName: "NodeMaster",
        level: 72,
        points: 7230,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Node"
    },
    {
        rank: 5,
        minerAddress: "0x11A...8899",
        minerName: "BlockSmith",
        level: 64,
        points: 6455,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Smith"
    },
    {
        rank: 6,
        minerAddress: "0x88B...11CC",
        minerName: "PixelPioneer",
        level: 45,
        points: 4520,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Pixel"
    },
    {
        rank: 7,
        minerAddress: "0x44D...99EE",
        minerName: "CryptoKnight",
        level: 30,
        points: 3015,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Knight"
    }
];

/**
 * Simulates a live subscription to the leaderboard (like Firestore onSnapshot).
 * @param callback Function to call when data updates.
 * @returns Unsubscribe function.
 */
export function subscribeToLeaderboard(callback: (data: LeaderboardEntry[]) => void): () => void {
    // Initial call
    callback([...mockLeaderboardData]);

    // Simulate other miners gaining points frequently to show activity
    const intervalId = setInterval(() => {
        // Pick a random bot (excluding the user, hypothetically) to gain points
        const randomIndex = Math.floor(Math.random() * mockLeaderboardData.length);
        const bot = mockLeaderboardData[randomIndex];
        
        if (!bot.isUser) {
            bot.points += Math.floor(Math.random() * 50); // Random points gain
            bot.level = Math.floor(bot.points / 100); // Update level
        }

        // Re-sort based on points
        mockLeaderboardData.sort((a, b) => b.points - a.points);
        
        // Re-assign ranks
        mockLeaderboardData = mockLeaderboardData.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        callback([...mockLeaderboardData]);
    }, 1500); // Update every 1.5 seconds for dynamic feel

    return () => clearInterval(intervalId);
}

/**
 * Syncs the current user's score to the simulated leaderboard.
 * In a real app, this would be a Firestore `set` or `update` call.
 */
export function updateMinerScore(address: string, name: string, points: number, level: number, avatar: string) {
    const existingIndex = mockLeaderboardData.findIndex(e => e.isUser);
    
    const userEntry: LeaderboardEntry = {
        rank: 0, // Calculated later
        minerAddress: address,
        minerName: name,
        points,
        level,
        avatar,
        isUser: true
    };

    if (existingIndex >= 0) {
        mockLeaderboardData[existingIndex] = userEntry;
    } else {
        mockLeaderboardData.push(userEntry);
    }

    // Re-sort and rank
    mockLeaderboardData.sort((a, b) => b.points - a.points);
    mockLeaderboardData = mockLeaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
}

/**
 * Fetches the mining leaderboard (Single shot).
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockLeaderboardData];
}
