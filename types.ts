// FIX: Add import for React to resolve namespace error for React.ComponentType.
import type { ComponentType } from 'react';

export type Persona = {
  id: string;
  name: string;
  description: string;
  stylePrompts: string[];
};

export type MiningGift = {
  program: string;
  boost: string;
  duration: string;
  activatedAt: number;
};

export type Attribute = {
  trait_type: string;
  value: string | number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  unlockedAt: number;
};

export type Proposal = {
    id: string;
    title: string;
    status: 'Analyzed';
    analysisSummary: string;
    analyzedAt: number;
};

export type Mission = {
    id: string;
    title: string;
    description: string;
    cadence: 'daily' | 'weekly';
    reward: {
        xp?: number;
        badgeId?: string;
    };
    actionType: 'mint' | 'analyze' | 'create_persona';
    target: number;
};

export type UserMission = {
    missionId: string;
    progress: number;
    status: 'in_progress' | 'completed';
    lastUpdatedAt: number;
};


export type MemoryEvent = {
  type: "Mint" | "MiningGift" | "Badge" | "Proposal" | "EmotionShift" | "Migration" | "Mission" | "Gift" | "Chat";
  message: string;
  timestamp: number;
  // Fields to support multi-chain finality simulation
  status: 'staged' | 'confirmed';
  chainName?: string;
  chainId?: number;
};

// The new comprehensive metadata structure for a MeeBot NFT
export type MeeBotMetadata = {
  id: string; // Internal unique ID
  name: string; // Public name, e.g., "MeeBot #9234"
  description: string; // The soul prompt, used for the NFT description
  image: string; // base64 data URL for display
  attributes: Attribute[];
  creator: string; // Wallet address
  createdAt: number;
  language: string;
  soul_prompt: string;
  memory: MemoryEvent[];
  voice_message: string;
  external_url: string;
  
  // Keep persona and emotion easily accessible for app logic
  persona: string;
  emotion: string;
  
  // Attached functional gift
  miningGift?: MiningGift;

  // Simulated on-chain data
  txHash?: string;
  tokenURI?: string; // ipfs://...
  chainName: string;
  chainId: number;
};


export type NavigationItem = {
  path: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
};

export type GovernanceProposal = {
  id: string;
  title: string;
  description: string;
  relatedMeeBotIds: string[];
  status: 'approved' | 'pending' | 'rejected';
  createdAt: number;
};

export type OnChainProposal = {
  id: string;
  title: string;
  description: string;
  proposer: string;
  createdAt: number;
  voteYes: number;
  voteNo: number;
  executed: boolean;
  chainName: string;
  txHash: string;
  relatedMeeBotIds: string[];
};