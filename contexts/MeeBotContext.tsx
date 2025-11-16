import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MeeBotMetadata, MemoryEvent, Badge, Proposal } from '../types';
import { mockMeeBots } from '../data/mockMeeBots';
import { activateMiningGift, logMintEvent, logMiningGiftEvent } from '../services/miningService';
import { checkNewBadges } from '../services/badgeService';
import { speak } from '../services/ttsService';

// --- LocalStorage Keys ---
const MEEBOT_BOTS_KEY = 'meebot-collection';
const MEEBOT_TIMELINE_KEY = 'meebot-timeline';
const MEEBOT_BADGES_KEY = 'meebot-unlocked-badges';
const MEEBOT_PROPOSALS_KEY = 'meebot-proposals';
const MEEBOT_PROGRESS_KEY = 'meebot-progress';

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
  mintMeeBot: (data: { persona: string, prompt: string, emotion: string, image: string }) => MeeBotMetadata;
  addProposalAnalysis: (proposalText: string, summary: string) => void;
  notifyPersonaCreated: () => void;
  migrateMeeBot: (botId: string, toChainName: string) => Promise<void>;
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
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => loadFromStorage(MEEBOT_BADGES_KEY, []));
  const [proposals, setProposals] = useState<Proposal[]>(() => loadFromStorage(MEEBOT_PROPOSALS_KEY, []));
  const [progress, setProgress] = useState<{ proposalsAnalyzed: number; personasCreated: number; }>(() => loadFromStorage(MEEBOT_PROGRESS_KEY, { proposalsAnalyzed: 0, personasCreated: 0 }));
  const [currentBadgeNotification, setCurrentBadgeNotification] = useState<Badge | null>(null);

  // --- Effects to sync state with localStorage ---
  useEffect(() => { window.localStorage.setItem(MEEBOT_BOTS_KEY, JSON.stringify(meebots)); }, [meebots]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_TIMELINE_KEY, JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_BADGES_KEY, JSON.stringify(unlockedBadges)); }, [unlockedBadges]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_PROPOSALS_KEY, JSON.stringify(proposals)); }, [proposals]);
  useEffect(() => { window.localStorage.setItem(MEEBOT_PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);
  
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
          setUnlockedBadges(prev => [...prev, ...newlyUnlocked]);
          const randomChain = getRandomChain();
          
          const badgeEvents: MemoryEvent[] = newlyUnlocked.map(badge => ({
              type: 'Badge',
              message: `Unlocked the "${badge.name}" badge!`,
              timestamp: badge.unlockedAt,
              status: 'staged',
              chainName: randomChain.name,
              chainId: randomChain.chainId,
          }));
          setTimeline(prev => [...prev, ...badgeEvents].sort((a,b) => b.timestamp - a.timestamp));

          // Show notification for the first unlocked badge
          setCurrentBadgeNotification(newlyUnlocked[0]);
      }
  }, []);
  
  const checkAllBadges = useCallback((currentProgress: { proposalsAnalyzed: number; personasCreated: number; }, meebotCount: number) => {
    const progressData = { ...currentProgress, meebotCount };
    const existingBadgeIds = new Set(unlockedBadges.map(b => b.id));
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
    
    // Add status and chain info to events
    const mintEvent = { ...logMintEvent(newMeeBot), status: 'staged' as const, chainName: randomChain.name, chainId: randomChain.chainId };
    const giftEvent = { ...logMiningGiftEvent(newMeeBot), status: 'staged' as const, chainName: randomChain.name, chainId: randomChain.chainId };
    newMeeBot.memory = [mintEvent, giftEvent].sort((a,b) => b.timestamp - a.timestamp);
    
    setMeebots(prev => {
        const newBotList = [newMeeBot, ...prev];
        checkAllBadges(progress, newBotList.length); // Check badges after count is updated
        return newBotList;
    });
    setTimeline(prev => [...newMeeBot.memory, ...prev].sort((a,b) => b.timestamp - a.timestamp));

    return newMeeBot;
  }, [progress, checkAllBadges]);

  const migrateMeeBot = useCallback(async (botId: string, toChainName: string) => {
    const fromBot = meebots.find(b => b.id === botId);
    const toChain = CHAINS_MAP.get(toChainName);

    if (!fromBot || !toChain) {
        throw new Error("Invalid bot or destination chain.");
    }
    
    // Simulate migration delay
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

      setProposals(prev => [newProposal, ...prev].slice(0, 10)); // Keep last 10
      
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
          checkAllBadges(updatedProgress, meebots.length);
          return updatedProgress;
      });
  }, [meebots.length, checkAllBadges]);
  
  const notifyPersonaCreated = useCallback(() => {
    setProgress(prev => {
        const updatedProgress = { ...prev, personasCreated: prev.personasCreated + 1 };
        checkAllBadges(updatedProgress, meebots.length);
        return updatedProgress;
    });
  }, [meebots.length, checkAllBadges]);

  const dismissBadgeNotification = () => {
      setCurrentBadgeNotification(null);
  };
  
  return (
    <MeeBotContext.Provider value={{ meebots, timeline, unlockedBadges, proposals, progress, mintMeeBot, addProposalAnalysis, notifyPersonaCreated, migrateMeeBot, currentBadgeNotification, dismissBadgeNotification }}>
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