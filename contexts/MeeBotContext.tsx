
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MeeBotMetadata, MemoryEvent, Badge, Proposal, UserMission, MiningState, Benefit } from '../types';
import { mockMeeBots } from '../data/mockMeeBots';
import { activateMiningGift, logMintEvent, logMiningGiftEvent, updateMinerScore, subscribeToMiner } from '../services/miningService';
import { ALL_BADGES, checkNewBadges, ProgressStats } from '../services/badgeService';
import { speak } from '../services/ttsService';
import { ALL_MISSIONS, shouldResetMission } from '../services/missionService';
import { Award } from 'lucide-react';
import { detectLanguage } from '../services/analysisService';


// --- LocalStorage Keys ---
const MEEBOT_BOTS_KEY = 'meebot-collection';
const MEEBOT_TIMELINE_KEY = 'meebot-timeline';
const MEEBOT_BADGES_KEY = 'meebot-unlocked-badges';
const MEEBOT_PROPOSALS_KEY = 'meebot-proposals';
const MEEBOT_PROGRESS_KEY = 'meebot-progress';
const MEEBOT_MISSIONS_KEY = 'meebot-user-missions';
const MEEBOT_MINING_KEY = 'meebot-mining-state';


// --- Multi-chain Simulation ---
const CHAINS = [
    { chainId: 11155111, name: 'Sepolia' },
    { chainId: 122, name: 'Fuse' },
    { chainId: 56, name: 'BNB' },
];
const CHAINS_MAP = new Map(CHAINS.map(c => [c.name, c]));

const getRandomChain = () => CHAINS[Math.floor(Math.random() * CHAINS.length)];

// Constant for the current user's wallet address simulation
export const USER_WALLET_ADDRESS = "0xUser...Wallet";

// Extended progress state to track gamification metrics
interface ProgressState {
  proposalsAnalyzed: number;
  personasCreated: number;
  votesCast: number;
  governanceProposalsCreated: number;
  hasConnectedWallet: boolean;
}

const DEFAULT_PROGRESS: ProgressState = {
    proposalsAnalyzed: 0,
    personasCreated: 0,
    votesCast: 0,
    governanceProposalsCreated: 0,
    hasConnectedWallet: false,
};

interface MeeBotContextType {
  meebots: MeeBotMetadata[];
  timeline: MemoryEvent[];
  unlockedBadges: Badge[];
  proposals: Proposal[];
  progress: ProgressState;
  userMissions: UserMission[];
  miningState: MiningState;
  mintMeeBot: (data: { persona: string, prompt: string, emotion: string, image: string }) => MeeBotMetadata;
  addProposalAnalysis: (proposalText: string, summary: string) => void;
  notifyPersonaCreated: () => void;
  migrateMeeBot: (botId: string, toChainName: string) => Promise<void>;
  giftMeeBot: (botId: string, recipientAddress: string, message: string) => Promise<void>;
  logChatMemory: (botId: string, lastUserMessage: string) => void;
  executeMining: () => Promise<void>;
  currentBadgeNotification: Badge | null;
  dismissBadgeNotification: () => void;
  // New actions for gamification
  connectWallet: () => void;
  castVote: () => void;
  createGovernanceProposal: () => void;
  redeemBenefit: (badgeId: string, benefit: Benefit) => Promise<boolean>;
}

const MeeBotContext = createContext<MeeBotContextType | undefined>(undefined);

// Helper to safely parse JSON from localStorage with strict type checking
function safeLoadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
        const parsed = JSON.parse(item);
        
        // Critical Fix: Explicitly check for arrays to prevent "map is not a function" errors
        // caused by corrupted localStorage where arrays were saved as objects.
        if (Array.isArray(defaultValue)) {
             return Array.isArray(parsed) ? (parsed as T) : defaultValue;
        }
        
        // For standard objects, we merge with default to ensure new fields are present.
        // We explicitly check that 'parsed' is not an array here to avoid spreading an array into an object.
        if (typeof defaultValue === 'object' && defaultValue !== null && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
             return { ...defaultValue, ...parsed };
        }
        
        return parsed as T;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// A version of the Badge type that can be stored in JSON.
type StorableBadge = Omit<Badge, 'icon'>;


export const MeeBotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meebots, setMeebots] = useState<MeeBotMetadata[]>(() => {
    const loadedBots = safeLoadFromStorage(MEEBOT_BOTS_KEY, mockMeeBots);
    return Array.isArray(loadedBots) ? loadedBots : mockMeeBots;
  });
  
  const [timeline, setTimeline] = useState<MemoryEvent[]>(() => {
      const loadedTimeline = safeLoadFromStorage<MemoryEvent[]>(MEEBOT_TIMELINE_KEY, []);
      // Ensure we have an array before attempting to map
      const safeTimeline = Array.isArray(loadedTimeline) ? loadedTimeline : [];
      
      if (safeTimeline.length > 0) {
          return safeTimeline.map(event => ({
              ...event,
              status: event.status || 'confirmed',
              chainName: event.chainName || 'Sepolia'
          }));
      }
      return mockMeeBots.flatMap(bot => bot.memory.map(event => ({ ...event, status: 'confirmed' as const, chainName: 'Sepolia' }))).sort((a,b) => b.timestamp - a.timestamp);
  });
  
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => {
    const loadedBadges = safeLoadFromStorage<StorableBadge[]>(MEEBOT_BADGES_KEY, []);
    // Guard against potential corruption in local storage
    const safeStoredBadges = Array.isArray(loadedBadges) ? loadedBadges : [];
    
    return safeStoredBadges.map(storableBadge => {
      const fullBadge = ALL_BADGES.find(b => b.id === storableBadge.id);
      return {
        ...storableBadge,
        icon: fullBadge?.icon || Award,
        tier: fullBadge?.tier || 'Bronze',
        benefits: fullBadge?.benefits || []
      };
    });
  });
  
  const [proposals, setProposals] = useState<Proposal[]>(() => {
      const loadedProposals = safeLoadFromStorage(MEEBOT_PROPOSALS_KEY, []);
      return Array.isArray(loadedProposals) ? loadedProposals : [];
  });
  
  const [progress, setProgress] = useState<ProgressState>(() => safeLoadFromStorage(MEEBOT_PROGRESS_KEY, DEFAULT_PROGRESS));
  
  const [userMissions, setUserMissions] = useState<UserMission[]>(() => {
      const loadedMissions = safeLoadFromStorage(MEEBOT_MISSIONS_KEY, []);
      return Array.isArray(loadedMissions) ? loadedMissions : [];
  });
  
  const [miningState, setMiningState] = useState<MiningState>(() => safeLoadFromStorage(MEEBOT_MINING_KEY, { points: 0, coins: 0, level: 0, isMining: false, lastMinedAt: 0 }));
  const [currentBadgeNotification, setCurrentBadgeNotification] = useState<Badge | null>(null);

  // --- Real-time Mining State Sync ---
  useEffect(() => {
    const unsubscribe = subscribeToMiner(USER_WALLET_ADDRESS, (remoteData) => {
        if (remoteData) {
            setMiningState(prev => {
                // Only sync metrics that come from backend (points/level), preserve local coins if not synced yet (mock scenario)
                if (remoteData.lastMinedAt > prev.lastMinedAt || remoteData.points !== prev.points) {
                    return {
                        ...prev,
                        points: remoteData.points,
                        level: remoteData.level,
                        lastMinedAt: remoteData.lastMinedAt
                    };
                }
                return prev;
            });
        }
    });
    return () => unsubscribe();
  }, []);

  // --- Effects to sync state with localStorage ---
  useEffect(() => { window.localStorage.setItem(MEEBOT_BOTS_KEY, JSON.stringify(meebots)); }, [meebots]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_TIMELINE_KEY, JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => {
    const storableBadges: StorableBadge[] = unlockedBadges.map(({ icon, ...rest }) => rest);
    window.localStorage.setItem(MEEBOT_BADGES_KEY, JSON.stringify(storableBadges));
  }, [unlockedBadges]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_PROPOSALS_KEY, JSON.stringify(proposals)); }, [proposals]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_MISSIONS_KEY, JSON.stringify(userMissions)); }, [userMissions]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_MINING_KEY, JSON.stringify(miningState)); }, [miningState]);
  
  // --- Effect to simulate event confirmation ---
  useEffect(() => {
    const hasStagedEvents = timeline.some(e => e.status === 'staged');
    if (hasStagedEvents) {
        const timer = setTimeout(() => {
            setTimeline(prevTimeline => 
                prevTimeline.map(event => 
                    event.status === 'staged' ? { ...event, status: 'confirmed' } : event
                )
            );
        }, 3500); 

        return () => clearTimeout(timer);
    }
  }, [timeline]);
  
  const awardBadges = useCallback((newlyUnlocked: Omit<Badge, 'unlockedAt'>[]) => {
      if (newlyUnlocked.length > 0) {
          const uniqueNewBadges: Badge[] = newlyUnlocked.filter(newBadge => 
              !unlockedBadges.some(existing => existing.id === newBadge.id)
          ).map(b => ({ ...b, unlockedAt: Date.now() }));

          if (uniqueNewBadges.length === 0) return;

          setUnlockedBadges(prev => [...prev, ...uniqueNewBadges]);
          const randomChain = getRandomChain();
          
          const badgeEvents: MemoryEvent[] = uniqueNewBadges.map(badge => ({
              type: 'Badge',
              message: `Unlocked the "${badge.name}" badge!`,
              timestamp: badge.unlockedAt,
              status: 'staged',
              chainName: randomChain.name,
              chainId: randomChain.chainId,
          }));
          setTimeline(prev => [...prev, ...badgeEvents].sort((a,b) => b.timestamp - a.timestamp));

          setCurrentBadgeNotification(uniqueNewBadges[0]);
      }
  }, [unlockedBadges]);
  
  const updateMissionsOnAction = useCallback((actionType: 'mint' | 'analyze' | 'create_persona') => {
    setUserMissions(prevUserMissions => {
        const now = Date.now();
        const missionsForAction = ALL_MISSIONS.filter(m => m.actionType === actionType);
        let updatedMissions = [...prevUserMissions];
        
        for (const missionDef of missionsForAction) {
            let userMission = updatedMissions.find(um => um.missionId === missionDef.id);
            
            if (userMission && shouldResetMission(userMission, missionDef)) {
                updatedMissions = updatedMissions.filter(um => um.missionId !== missionDef.id);
                userMission = undefined; 
            }

            if (userMission?.status === 'completed') {
                continue;
            }

            if (!userMission) {
                userMission = { missionId: missionDef.id, progress: 0, status: 'in_progress', lastUpdatedAt: now };
                updatedMissions.push(userMission);
            }
            
            userMission.progress += 1;
            userMission.lastUpdatedAt = now;

            if (userMission.progress >= missionDef.target) {
                userMission.status = 'completed';
                
                const randomChain = getRandomChain();
                const missionEvent: MemoryEvent = {
                    type: "Mission",
                    message: `Completed mission: "${missionDef.title}"`,
                    timestamp: now,
                    status: 'staged',
                    chainName: randomChain.name,
                    chainId: randomChain.chainId,
                };
                setTimeline(prev => [missionEvent, ...prev].sort((a,b) => b.timestamp - a.timestamp));

                if (missionDef.reward.badgeId) {
                    const badgeToAward = ALL_BADGES.find(b => b.id === missionDef.reward.badgeId);
                    if (badgeToAward) {
                        awardBadges([badgeToAward]);
                    }
                }
            }
        }
        return updatedMissions;
    });
  }, [awardBadges]);
  
  const checkAllBadges = useCallback((currentProgress: ProgressState, meebotCount: number, currentMiningLevel: number, actionChain?: string) => {
    const stats: ProgressStats = { ...currentProgress, meebotCount, miningLevel: currentMiningLevel };
    const existingBadgeIds = new Set<string>(unlockedBadges.map(b => b.id));
    const newlyUnlocked = checkNewBadges(stats, existingBadgeIds, actionChain);
    awardBadges(newlyUnlocked);
  }, [unlockedBadges, awardBadges]);
  
  // --- Actions & Reactions ---

  const connectWallet = useCallback(() => {
    setProgress(prev => {
        if (prev.hasConnectedWallet) return prev;
        const updated = { ...prev, hasConnectedWallet: true };
        checkAllBadges(updated, meebots.length, miningState.level);
        return updated;
    });
    // Magical UX: First time voice reaction
    if (!progress.hasConnectedWallet) {
         speak("Welcome to MeeChain! Your neural link is established.", "joyful");
    }
  }, [meebots.length, miningState.level, checkAllBadges, progress.hasConnectedWallet]);

  const castVote = useCallback(() => {
    setProgress(prev => {
        const updated = { ...prev, votesCast: prev.votesCast + 1 };
        checkAllBadges(updated, meebots.length, miningState.level);
        return updated;
    });
    if (progress.votesCast === 0) {
        speak("Your voice has been recorded. Thank you for shaping the future.", "stoic");
    }
  }, [meebots.length, miningState.level, checkAllBadges, progress.votesCast]);

  const createGovernanceProposal = useCallback(() => {
    setProgress(prev => {
        const updated = { ...prev, governanceProposalsCreated: prev.governanceProposalsCreated + 1 };
        checkAllBadges(updated, meebots.length, miningState.level);
        return updated;
    });
    if (progress.governanceProposalsCreated === 0) {
        speak("A bold move! You are the first to propose a new path.", "energetic");
    }
  }, [meebots.length, miningState.level, checkAllBadges, progress.governanceProposalsCreated]);

  const mintMeeBot = useCallback((data: { persona: string, prompt: string, emotion: string, image: string }): MeeBotMetadata => {
    const now = Date.now();
    const idNum = Math.floor(Math.random() * 9000) + 1000;
    const newId = `mb-${idNum}`;
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const miningGift = activateMiningGift(data.persona);
    // Use centralized detection
    const lang = detectLanguage(data.prompt);
    const randomChain = getRandomChain();

    const newMeeBot: MeeBotMetadata = {
      id: newId,
      name: `MeeBot #${idNum}`,
      persona: data.persona,
      emotion: data.emotion,
      soul_prompt: data.prompt,
      description: data.prompt,
      image: data.image,
      createdAt: now,
      creator: '0xYou...Now',
      language: lang.lang,
      voice_message: `I am ${data.persona}, born of your inspiration.`,
      external_url: `https://meechain.app/meebot/${idNum}`,
      miningGift: miningGift,
      tokenURI: `ipfs://bafy...${idNum}`,
      txHash,
      chainName: randomChain.name,
      chainId: randomChain.chainId,
      attributes: [
        { trait_type: "Persona", value: data.persona },
        { trait_type: "Emotion", value: data.emotion },
        { trait_type: "VoiceStyle", value: "Calm" }
      ],
      memory: []
    };
    
    const mintEvent = { ...logMintEvent(newMeeBot), status: 'staged' as const, chainName: randomChain.name, chainId: randomChain.chainId };
    const giftEvent = { ...logMiningGiftEvent(newMeeBot), status: 'staged' as const, chainName: randomChain.name, chainId: randomChain.chainId };
    newMeeBot.memory = [mintEvent, giftEvent].sort((a,b) => b.timestamp - a.timestamp);
    
    setMeebots(prev => {
        const newBotList = [newMeeBot, ...prev];
        // Pass chain info to check for chain-specific badges
        checkAllBadges(progress, newBotList.length, miningState.level, randomChain.name);
        return newBotList;
    });
    setTimeline(prev => [...newMeeBot.memory, ...prev].sort((a,b) => b.timestamp - a.timestamp));

    updateMissionsOnAction('mint');
    
    // First Mint Reaction
    if (meebots.length === 0) {
        speak(`Welcome to the world, ${newMeeBot.name}. You are the first of many.`, "joyful");
    }

    return newMeeBot;
  }, [progress, checkAllBadges, updateMissionsOnAction, miningState.level, meebots.length]);

  const migrateMeeBot = useCallback(async (botId: string, toChainName: string) => {
    const fromBot = meebots.find(b => b.id === botId);
    const toChain = CHAINS_MAP.get(toChainName);

    if (!fromBot || !toChain) {
        throw new Error("Invalid bot or destination chain.");
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const now = Date.now();
    
    const updatedBot: MeeBotMetadata = {
        ...fromBot,
        chainName: toChain.name,
        chainId: toChain.chainId,
    };
    
    const migrationEvent: MemoryEvent = {
        type: "Migration",
        message: `Migrated ${fromBot.name} from ${fromBot.chainName} to ${toChain.name}.`,
        timestamp: now,
        status: 'staged',
        chainName: toChain.name,
        chainId: toChain.chainId,
    };
    
    setMeebots(prev => prev.map(bot => bot.id === botId ? updatedBot : bot));
    setTimeline(prev => [migrationEvent, ...prev].sort((a,b) => b.timestamp - a.timestamp));

    speak(`Migration complete. Your MeeBot has arrived on the ${toChain.name} network.`, 'joyful');
    // Check for Chain Badges on migration too
    checkAllBadges(progress, meebots.length, miningState.level, toChainName);
  }, [meebots, progress, miningState.level, checkAllBadges]);
  
  const addProposalAnalysis = useCallback((proposalText: string, summary: string) => {
      const now = Date.now();
      const newProposal: Proposal = {
          id: `prop-${now}`,
          title: proposalText.substring(0, 50) + (proposalText.length > 50 ? '...' : ''),
          status: 'Analyzed',
          analysisSummary: summary,
          analyzedAt: now,
      };

      setProposals(prev => [newProposal, ...prev].slice(0, 10)); 
      
      const randomChain = getRandomChain();
      const proposalEvent: MemoryEvent = {
        type: "Proposal",
        message: `Analyzed a new proposal: "${newProposal.title}"`,
        timestamp: now,
        status: 'staged',
        chainName: randomChain.name,
        chainId: randomChain.chainId,
      };
      setTimeline(prev => [proposalEvent, ...prev].sort((a,b) => b.timestamp - a.timestamp));

      setProgress(prev => {
          const updatedProgress = { ...prev, proposalsAnalyzed: prev.proposalsAnalyzed + 1 };
          checkAllBadges(updatedProgress, meebots.length, miningState.level);
          return updatedProgress;
      });
      updateMissionsOnAction('analyze');
  }, [meebots.length, checkAllBadges, updateMissionsOnAction, miningState.level]);
  
  const notifyPersonaCreated = useCallback(() => {
    updateMissionsOnAction('create_persona');

    setProgress(prev => {
        const updatedProgress = { ...prev, personasCreated: prev.personasCreated + 1 };
        checkAllBadges(updatedProgress, meebots.length, miningState.level);
        return updatedProgress;
    });
  }, [meebots.length, checkAllBadges, updateMissionsOnAction, miningState.level]);

  const giftMeeBot = useCallback(async (botId: string, recipientAddress: string, message: string) => {
      const botToGift = meebots.find(b => b.id === botId);
      if (!botToGift) {
          throw new Error("MeeBot not found.");
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = Date.now();
      
      const giftEvent: MemoryEvent = {
          type: "Gift",
          message: `${botToGift.name} was gifted to ${recipientAddress.substring(0,10)}... with message: "${message}"`,
          timestamp: now,
          status: 'staged',
          chainName: botToGift.chainName,
          chainId: botToGift.chainId,
      };
      
      setTimeline(prev => [giftEvent, ...prev].sort((a, b) => b.timestamp - a.timestamp));
      setMeebots(prev => prev.filter(b => b.id !== botId));
      
      speak(`I have been gifted to a new friend, ${recipientAddress}. Thank you for our journey together.`, 'serene');
  }, [meebots]);

  const logChatMemory = useCallback((botId: string, lastUserMessage: string) => {
    const bot = meebots.find(b => b.id === botId);
    if (!bot) return;

    const now = Date.now();
    const chatEvent: MemoryEvent = {
        type: 'Chat',
        message: `Chatted with ${bot.name}. User said: "${lastUserMessage.slice(0, 40)}..."`,
        timestamp: now,
        status: 'staged',
        chainName: bot.chainName,
        chainId: bot.chainId,
    };
    
    setTimeline(prev => [chatEvent, ...prev].sort((a,b) => b.timestamp - a.timestamp));
  }, [meebots]);

  const executeMining = useCallback(async () => {
      if (miningState.isMining) return;

      const now = Date.now();
      // Increase cooldown to 30s to prevent rapid mining and simulate network confirmations
      if (now - miningState.lastMinedAt < 30000) {
          console.warn("Mining too fast. Cooldown active.");
          return;
      }

      setMiningState(prev => ({ ...prev, isMining: true }));
      
      await new Promise(resolve => setTimeout(resolve, 2500));

      const randomChain = getRandomChain();

      setMiningState(prev => {
          const newPoints = prev.points + 1;
          const newCoins = (prev.coins || 0) + 1; // Award 1 MeeCoin per mine
          const newLevel = Math.floor(newPoints / 10); 
          const levelUp = newLevel > prev.level;
          const minedAt = Date.now();
          
          const miningEvent: MemoryEvent = {
              type: 'Mining',
              message: `Mined 1 Point & 1 MeeCoin on ${randomChain.name}.${levelUp ? ` Leveled up to ${newLevel}!` : ''}`,
              timestamp: minedAt,
              status: 'staged',
              chainName: randomChain.name,
              chainId: randomChain.chainId,
          };
          setTimeline(old => [miningEvent, ...old].sort((a,b) => b.timestamp - a.timestamp));
          
          if (levelUp) {
               checkAllBadges(progress, meebots.length, newLevel);
               speak(`Level Up! You have reached Mining Level ${newLevel}.`, 'energetic');
          } else {
               if (Math.random() > 0.9) {
                   speak("Mining sequence complete. Points accrued.", "stoic");
               }
          }

          const activeBot = meebots[0];
          if (activeBot) {
             updateMinerScore(
                USER_WALLET_ADDRESS,
                activeBot.name,
                newPoints,
                newLevel,
                activeBot.image,
                minedAt
             );
          }

          return {
              points: newPoints,
              coins: newCoins,
              level: newLevel,
              isMining: false,
              lastMinedAt: minedAt
          };
      });
  }, [progress, meebots, checkAllBadges, miningState.isMining, miningState.lastMinedAt]);


  const dismissBadgeNotification = () => {
      setCurrentBadgeNotification(null);
  };
  
  const redeemBenefit = useCallback(async (badgeId: string, benefit: Benefit): Promise<boolean> => {
      // Check Balance
      if (miningState.coins < benefit.cost) {
          return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate tx delay

      setMiningState(prev => ({ ...prev, coins: prev.coins - benefit.cost }));
      
      const randomChain = getRandomChain();
      const redemptionEvent: MemoryEvent = {
          type: 'Redemption',
          message: `Redeemed benefit: "${benefit.title}" for ${benefit.cost} Coins.`,
          timestamp: Date.now(),
          status: 'staged',
          chainName: randomChain.name,
          chainId: randomChain.chainId,
      };
      
      setTimeline(prev => [redemptionEvent, ...prev].sort((a,b) => b.timestamp - a.timestamp));
      
      speak(`Perk redeemed! You are now utilizing your ecosystem benefits.`, 'joyful');
      return true;
  }, [miningState.coins]);
  
  return (
    <MeeBotContext.Provider value={{ 
        meebots, 
        timeline, 
        unlockedBadges, 
        proposals, 
        progress, 
        userMissions, 
        miningState, 
        mintMeeBot, 
        addProposalAnalysis, 
        notifyPersonaCreated, 
        migrateMeeBot, 
        giftMeeBot, 
        logChatMemory, 
        executeMining, 
        currentBadgeNotification, 
        dismissBadgeNotification, 
        connectWallet,
        castVote,
        createGovernanceProposal,
        redeemBenefit
    }}>
      {children}
    </MeeBotContext.Provider>
  );
};

export const useMeeBots = (): MeeBotContextType => {
  const context = useContext(MeeBotContext);
  if (context === undefined) {
    throw new Error('useMeeBots must be used within a MeeBotProvider');
  }
  return context;
};
