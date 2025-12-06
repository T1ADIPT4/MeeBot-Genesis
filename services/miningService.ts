
import type { MeeBotMetadata, MiningGift, MemoryEvent, LeaderboardEntry } from '../types';
import { 
    db, 
    isFirebaseInitialized, 
    collection, 
    query, 
    orderBy, 
    limit, 
    onSnapshot, 
    doc, 
    setDoc,
    getDoc
} from './firebase';

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

// --- Mock Data for Fallback ---

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
    }
];

/**
 * Starts the mock simulation for fallback scenarios.
 */
function startMockSimulation(callback: (data: LeaderboardEntry[]) => void, currentUserAddress?: string): () => void {
    const updateAndCallback = () => {
         const processedData = mockLeaderboardData.map(entry => ({
            ...entry,
            isUser: currentUserAddress ? entry.minerAddress === currentUserAddress : entry.isUser
        }));
        callback(processedData);
    };

    // Initial call
    updateAndCallback();

    const intervalId = setInterval(() => {
        // Pick a random bot to gain points
        const randomIndex = Math.floor(Math.random() * mockLeaderboardData.length);
        const bot = mockLeaderboardData[randomIndex];
        // Don't update the user entry in simulation loop, that comes from local state/action
        if (bot.minerAddress !== currentUserAddress) {
            bot.points += Math.floor(Math.random() * 50);
            bot.level = Math.floor(bot.points / 10);
        }
        
        // Re-sort and re-rank
        mockLeaderboardData.sort((a, b) => b.points - a.points);
        mockLeaderboardData = mockLeaderboardData.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
        
        updateAndCallback();
    }, 2000);
    return () => clearInterval(intervalId);
}

/**
 * Subscribes to the leaderboard updates.
 * Uses Firestore onSnapshot if available, otherwise falls back to mock simulation.
 * Handles permission-denied errors gracefully.
 * @param callback Function to call when data updates.
 * @param currentUserAddress The address of the current user to highlight in the leaderboard.
 * @returns Unsubscribe function.
 */
export function subscribeToLeaderboard(callback: (data: LeaderboardEntry[]) => void, currentUserAddress?: string): () => void {
    let unsubscribeFirestore: (() => void) | undefined;
    let stopSimulation: (() => void) | null = null;
    let isUnsubscribed = false;

    const safeCallback = (data: LeaderboardEntry[]) => {
        if (!isUnsubscribed) callback(data);
    };

    if (isFirebaseInitialized() && db) {
        try {
            console.log("Subscribing to Live Leaderboard...");
            const q = query(collection(db, "miners"), orderBy("points", "desc"), limit(50));
            
            unsubscribeFirestore = onSnapshot(q, {
                next: (snapshot) => {
                    const entries: LeaderboardEntry[] = [];
                    let rank = 1;
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        entries.push({
                            rank: rank++,
                            minerAddress: doc.id,
                            minerName: data.minerName || `Miner ${doc.id.substring(0,6)}`,
                            level: Number(data.level) || 0,
                            points: Number(data.points) || 0,
                            avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${doc.id}`,
                            isUser: doc.id === currentUserAddress
                        });
                    });
                    safeCallback(entries);
                },
                error: (error) => {
                     console.warn("Leaderboard sync error (switching to simulation):", error.message);
                     if (!stopSimulation && !isUnsubscribed) {
                         stopSimulation = startMockSimulation(safeCallback, currentUserAddress);
                     }
                }
            });
        } catch (e) {
            console.error("Failed to setup leaderboard subscription:", e);
            if (!stopSimulation) stopSimulation = startMockSimulation(safeCallback, currentUserAddress);
        }
    } else {
        stopSimulation = startMockSimulation(safeCallback, currentUserAddress);
    }
    
    // Return a cleanup function that handles both potential sources
    return () => {
        isUnsubscribed = true;
        if (unsubscribeFirestore) {
            try { unsubscribeFirestore(); } catch(e) { /* ignore */ }
        }
        if (stopSimulation) stopSimulation();
    };
}

/**
 * Subscribes to a specific miner's stats for real-time sync.
 * Handles permission-denied errors gracefully.
 * @param address The wallet address to subscribe to.
 * @param callback Function to call with the latest points, level, and lastMinedAt timestamp.
 * @returns Unsubscribe function.
 */
export function subscribeToMiner(address: string, callback: (data: { points: number, level: number, lastMinedAt: number } | null) => void): () => void {
    let unsubscribeFirestore: (() => void) | undefined;
    let stopMock: (() => void) | null = null;
    let isUnsubscribed = false;

    const safeCallback = (data: { points: number, level: number, lastMinedAt: number } | null) => {
        if (!isUnsubscribed) callback(data);
    };

    const startMock = () => {
         // Poll mock data
         const interval = setInterval(() => {
            if (isUnsubscribed) return;
            const entry = mockLeaderboardData.find(e => e.minerAddress === address);
            if (entry) {
                // For mock data, we approximate lastMinedAt via local time if needed, 
                // but since mockLeaderboard doesn't store timestamps, we just send 0 or current
                safeCallback({ points: entry.points, level: entry.level, lastMinedAt: Date.now() });
            } else {
                safeCallback(null);
            }
        }, 2000);
        
        // Initial check
        const entry = mockLeaderboardData.find(e => e.minerAddress === address);
        if (entry) safeCallback({ points: entry.points, level: entry.level, lastMinedAt: Date.now() });
        else safeCallback(null);

        return () => clearInterval(interval);
    };

    if (isFirebaseInitialized() && db) {
         try {
             const docRef = doc(db, "miners", address);
             unsubscribeFirestore = onSnapshot(docRef, {
                 next: (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        safeCallback({ 
                            points: Number(data.points) || 0, 
                            level: Number(data.level) || 0,
                            lastMinedAt: Number(data.lastMinedAt) || 0 
                        });
                    } else {
                        safeCallback({ points: 0, level: 0, lastMinedAt: 0 });
                    }
                 },
                 error: (error) => {
                     console.warn("Miner sync error (switching to simulation):", error.message);
                     if (!stopMock && !isUnsubscribed) {
                         stopMock = startMock();
                     }
                 }
             });
         } catch (e) {
             console.error("Failed to setup miner subscription:", e);
             if (!stopMock) stopMock = startMock();
         }
    } else {
        stopMock = startMock();
    }

    return () => {
        isUnsubscribed = true;
        if (unsubscribeFirestore) {
            try { unsubscribeFirestore(); } catch (e) { /* ignore */ }
        }
        if (stopMock) stopMock();
    };
}

/**
 * Syncs the current user's score to Firestore (and mock data).
 */
export async function updateMinerScore(address: string, name: string, points: number, level: number, avatar: string, lastMinedAt: number) {
    // 1. Update Firestore if active (Fire and Forget style)
    if (isFirebaseInitialized() && db) {
        // We don't await this to keep UI snappy, but we catch errors to prevent unhandled rejections
        setDoc(doc(db, "miners", address), {
            minerName: name,
            points,
            level,
            avatar,
            lastMinedAt: lastMinedAt,
            lastActive: new Date().toISOString() // Keep human readable version too
        }, { merge: true }).catch(e => {
            // Silently ignore permission errors here to prevent console spam,
            // as the UI relies on local/mock state for immediate feedback anyway.
        });
    }

    // 2. Update mock data for immediate local feedback.
    const existingIndex = mockLeaderboardData.findIndex(e => e.minerAddress === address);
    const userEntry: LeaderboardEntry = {
        rank: 0, // Rank will be recalculated by the loop or next fetch
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
    
    // Re-sort mock immediately
    mockLeaderboardData.sort((a, b) => b.points - a.points);
    mockLeaderboardData = mockLeaderboardData.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
