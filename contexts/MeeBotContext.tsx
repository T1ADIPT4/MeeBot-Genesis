
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MeeBotMetadata, MemoryEvent, Badge, Proposal, UserMission, MiningState } from '../types';
import { mockMeeBots } from '../data/mockMeeBots';
import { activateMiningGift, logMintEvent, logMiningGiftEvent, updateMinerScore } from '../services/miningService';
import { ALL_BADGES, checkNewBadges } from '../services/badgeService';
import { speak } from '../services/ttsService';
import { ALL_MISSIONS, shouldResetMission } from '../services/missionService';
import { Award } from 'lucide-react';


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

interface MeeBotContextType {
  meebots: MeeBotMetadata[];
  timeline: MemoryEvent[];
  unlockedBadges: Badge[];
  proposals: Proposal[];
  progress: { proposalsAnalyzed: number; personasCreated: number; };
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
}

const MeeBotContext = createContext<MeeBotContextType | undefined>(undefined);

// Helper to safely parse JSON from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// A version of the Badge type that can be stored in JSON.
// Functions like the icon component cannot be serialized.
type StorableBadge = Omit<Badge, 'icon'>;


// Helper to detect language from prompt
function detectLanguage(text: string): { code: string; name: string } {
  if (/[\u0E00-\u0E7F]/.test(text)) return { code: 'th', name: 'Thai' };
  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(text)) return { code: 'ja', name: 'Japanese' };
  return { code: 'en', name: 'English' };
}


export const MeeBotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meebots, setMeebots] = useState<MeeBotMetadata[]>(() => loadFromStorage(MEEBOT_BOTS_KEY, mockMeeBots));
  const [timeline, setTimeline] = useState<MemoryEvent[]>(() => {
      const storedTimeline = loadFromStorage<MemoryEvent[]>(MEEBOT_TIMELINE_KEY, []);
      if (storedTimeline.length > 0) {
          // If timeline exists, ensure it has the new fields
          return storedTimeline.map(event => ({
              ...event,
              status: event.status || 'confirmed', // Backwards compatibility
              chainName: event.chainName || 'Sepolia'
          }));
      }
      // If no timeline, create from mock bots
      return mockMeeBots.flatMap(bot => bot.memory.map(event => ({ ...event, status: 'confirmed' as const, chainName: 'Sepolia' }))).sort((a,b) => b.timestamp - a.timestamp);
  });
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => {
    const stored = loadFromStorage<StorableBadge[]>(MEEBOT_BADGES_KEY, []);
    // Re-hydrate the full badge object, including the icon component, from the master list.
    return stored.map(storableBadge => {
      const fullBadge = ALL_BADGES.find(b => b.id === storableBadge.id);
      return {
        ...storableBadge,
        icon: fullBadge?.icon || Award, // Use a fallback icon if not found
      };
    });
  });
  const [proposals, setProposals] = useState<Proposal[]>(() => loadFromStorage(MEEBOT_PROPOSALS_KEY, []));
  const [progress, setProgress] = useState<{ proposalsAnalyzed: number; personasCreated: number; }>(() => loadFromStorage(MEEBOT_PROGRESS_KEY, { proposalsAnalyzed: 0, personasCreated: 0 }));
  const [userMissions, setUserMissions] = useState<UserMission[]>(() => loadFromStorage(MEEBOT_MISSIONS_KEY, []));
  const [miningState, setMiningState] = useState<MiningState>(() => loadFromStorage(MEEBOT_MINING_KEY, { points: 0, level: 0, isMining: false, lastMinedAt: 0 }));
  const [currentBadgeNotification, setCurrentBadgeNotification] = useState<Badge | null>(null);

  // --- Effects to sync state with localStorage ---
  useEffect(() => { window.localStorage.setItem(MEEBOT_BOTS_KEY, JSON.stringify(meebots)); }, [meebots]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_TIMELINE_KEY, JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => {
    // When saving badges, strip out the non-serializable 'icon' property.
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
        }, 3500); // 3.5 second confirmation delay

        return () => clearTimeout(timer);
    }
  }, [timeline]);
  
  const awardBadges = useCallback((newlyUnlocked: Badge[]) => {
      if (newlyUnlocked.length > 0) {
          const uniqueNewBadges = newlyUnlocked.filter(newBadge => 
              !unlockedBadges.some(existing => existing.id === newBadge.id)
          );

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

          // Show notification for the first unlocked badge
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
            
            // Reset if cadence has passed
            if (userMission && shouldResetMission(userMission, missionDef)) {
                updatedMissions = updatedMissions.filter(um => um.missionId !== missionDef.id);
                userMission = undefined; // Treat as new
            }

            // Don't update completed missions unless they have been reset
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
                
                // Add to timeline
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

                // Handle rewards
                if (missionDef.reward.badgeId) {
                    const badgeToAward = ALL_BADGES.find(b => b.id === missionDef.reward.badgeId);
                    if (badgeToAward) {
                        awardBadges([{...badgeToAward, unlockedAt: now}]);
                    }
                }
            }
        }
        
        return updatedMissions;
    });
  }, [awardBadges]);
  
  const checkAllBadges = useCallback((currentProgress: { proposalsAnalyzed: number; personasCreated: number; }, meebotCount: number, currentMiningLevel: number) => {
    const progressData = { ...currentProgress, meebotCount, miningLevel: currentMiningLevel };
    const existingBadgeIds = new Set<string>(unlockedBadges.map(b => b.id));
    const newlyUnlocked = checkNewBadges(progressData, existingBadgeIds);
    awardBadges(newlyUnlocked);
  }, [unlockedBadges, awardBadges]);
  
  const mintMeeBot = useCallback((data: { persona: string, prompt: string, emotion: string, image: string }): MeeBotMetadata => {
    const now = Date.now();
    const idNum = Math.floor(Math.random() * 9000) + 1000;
    const newId = `mb-${idNum}`;
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const miningGift = activateMiningGift(data.persona);
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
      language: lang.code,
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
        checkAllBadges(progress, newBotList.length, miningState.level);
        return newBotList;
    });
    setTimeline(prev => [...newMeeBot.memory, ...prev].sort((a,b) => b.timestamp - a.timestamp));

    updateMissionsOnAction('mint');
    return newMeeBot;
  }, [progress, checkAllBadges, updateMissionsOnAction, miningState.level]);

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
  }, [meebots]);
  
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
      const fromAddress = "your wallet"; 

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

  // --- Mining Functionality ---
  const executeMining = useCallback(async () => {
      if (miningState.isMining) return;

      const now = Date.now();
      // Simple rate limiting: Prevent mining if less than 2 seconds have passed
      if (now - miningState.lastMinedAt < 2000) {
          console.warn("Mining too fast. Cooldown active.");
          return;
      }

      setMiningState(prev => ({ ...prev, isMining: true }));
      
      // Simulate Smart Contract Latency & Logic
      // In a real app, this would call the Firebase function /api/mine
      await new Promise(resolve => setTimeout(resolve, 2500));

      const randomChain = getRandomChain();

      setMiningState(prev => {
          const newPoints = prev.points + 1;
          // Smart Contract Logic: Level up every 10 points
          const newLevel = Math.floor(newPoints / 10); 
          const levelUp = newLevel > prev.level;
          
          // Update timeline
          const miningEvent: MemoryEvent = {
              type: 'Mining',
              message: `Mined 1 Point on ${randomChain.name}.${levelUp ? ` Leveled up to ${newLevel}!` : ''}`,
              timestamp: now,
              status: 'staged',
              chainName: randomChain.name,
              chainId: randomChain.chainId,
          };
          setTimeline(old => [miningEvent, ...old].sort((a,b) => b.timestamp - a.timestamp));
          
          // Check for new badges triggered by the new level
          if (levelUp) {
               // We need to use the *new* level for checking badges
               checkAllBadges(progress, meebots.length, newLevel);
               speak(`Level Up! You have reached Mining Level ${newLevel}.`, 'energetic');
          } else {
               // 10% chance to speak a mining phrase
               if (Math.random() > 0.9) {
                   speak("Mining sequence complete. Points accrued.", "stoic");
               }
          }

          // --- NEW: SYNC TO LEADERBOARD ---
          const activeBot = meebots[0];
          if (activeBot) {
             updateMinerScore(
                '0xUser...Wallet', // Placeholder for user wallet
                activeBot.name,
                newPoints,
                newLevel,
                activeBot.image
             );
          }

          return {
              points: newPoints,
              level: newLevel,
              isMining: false,
              lastMinedAt: now
          };
      });
  }, [progress, meebots, checkAllBadges, miningState.isMining, miningState.lastMinedAt]);


  const dismissBadgeNotification = () => {
      setCurrentBadgeNotification(null);
  };
  
  return (
    <MeeBotContext.Provider value={{ meebots, timeline, unlockedBadges, proposals, progress, userMissions, miningState, mintMeeBot, addProposalAnalysis, notifyPersonaCreated, migrateMeeBot, giftMeeBot, logChatMemory, executeMining, currentBadgeNotification, dismissBadgeNotification }}>
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
