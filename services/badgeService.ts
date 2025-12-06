
import { Award, Bot, FileText, Palette, Pickaxe, Gem, Trophy, Crown, Zap, Globe, Flag, Vote, Megaphone, Rocket, FlaskConical, ShoppingBag, Ticket, Star } from 'lucide-react';
import type { Badge } from '../types';

export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
    // Onboarding & Identity
    {
        id: 'welcome-explorer',
        name: 'Welcome Explorer',
        description: 'Connected wallet for the first time. Welcome to the MeeChain ecosystem!',
        icon: Flag,
        tier: 'Bronze',
        benefits: [
            { id: 'ben_welcome_1', title: 'Newbie Boost', description: '2x Mining speed for 1 hour', cost: 0, type: 'digital' }
        ]
    },
    {
        id: 'genesis-creator',
        name: 'Genesis Creator',
        description: 'Awarded for minting your very first MeeBot.',
        icon: Bot,
        tier: 'Bronze',
        benefits: [
            { id: 'ben_gen_1', title: 'Free Persona Slot', description: 'Unlock an additional persona save slot', cost: 50, type: 'access' }
        ]
    },
    {
        id: 'mee-crafter',
        name: 'MeeCrafter',
        description: 'Minted 5 MeeBots. You are a master creator.',
        icon: Palette,
        tier: 'Silver',
        benefits: [
             { id: 'ben_craft_1', title: 'Artist Airdrop', description: 'Receive a random cosmetic NFT', cost: 100, type: 'digital' }
        ]
    },
    {
        id: 'persona-architect',
        name: 'Persona Architect',
        description: 'Created a custom persona definition.',
        icon: FileText,
        tier: 'Silver',
        benefits: [
             { id: 'ben_arch_1', title: 'Prompt Engineer Badge', description: 'Display "Prompt Engineer" on your profile', cost: 20, type: 'access' }
        ]
    },
    
    // Governance
    {
        id: 'proposal-pioneer',
        name: 'Proposal Pioneer',
        description: 'Created your first governance proposal. Your voice matters!',
        icon: Megaphone,
        tier: 'Gold',
        benefits: [
            { id: 'ben_gov_1', title: 'Priority Voting', description: 'Your votes are processed instantly during congestion', cost: 200, type: 'access' }
        ]
    },
    {
        id: 'mee-mover',
        name: 'MeeMover',
        description: 'Cast 3 votes in governance. You are moving the chain forward.',
        icon: Vote,
        tier: 'Silver',
        benefits: [
             { id: 'ben_vote_1', title: 'Governance NFT', description: 'Mint a commemorative "I Voted" NFT', cost: 50, type: 'digital' }
        ]
    },

    // Mining
    {
        id: 'bronze-miner',
        name: 'Bronze Miner',
        description: 'Reached Mining Level 1.',
        icon: Pickaxe,
        tier: 'Bronze',
        benefits: [
            { id: 'ben_mine_b1', title: '5% Merch Discount', description: 'Discount code for MeeChain shop', cost: 10, type: 'discount' }
        ]
    },
    {
        id: 'silver-miner',
        name: 'Silver Miner',
        description: 'Reached Mining Level 5.',
        icon: Gem,
        tier: 'Silver',
        benefits: [
            { id: 'ben_mine_s1', title: '10% Merch Discount', description: 'Discount code for MeeChain shop', cost: 25, type: 'discount' }
        ]
    },
    {
        id: 'gold-miner',
        name: 'Gold Miner',
        description: 'Reached Mining Level 10.',
        icon: Trophy,
        tier: 'Gold',
        benefits: [
            { id: 'ben_mine_g1', title: '20% Merch Discount', description: 'Discount code for MeeChain shop', cost: 50, type: 'discount' },
            { id: 'ben_mine_g2', title: 'VIP Discord Role', description: 'Access to private mining channels', cost: 0, type: 'access' }
        ]
    },
    {
        id: 'legend-miner',
        name: 'Legend Miner',
        description: 'Reached Mining Level 20.',
        icon: Crown,
        tier: 'Legend',
        benefits: [
            { id: 'ben_mine_l1', title: 'Physical MeeBot Figurine', description: 'Claim a 3D printed figurine of your main bot', cost: 5000, type: 'physical' },
            { id: 'ben_mine_l2', title: 'Early Access Gen 2', description: 'Whitelist for Generation 2 mint', cost: 0, type: 'access' }
        ]
    },

    // Chain Specific
    {
        id: 'testnet-explorer',
        name: 'Testnet Explorer',
        description: 'Interacted with the Sepolia Testnet.',
        icon: FlaskConical,
        tier: 'Bronze',
        benefits: []
    },
    {
        id: 'mainnet-pioneer',
        name: 'Mainnet Pioneer',
        description: 'Interacted with the Fuse Mainnet.',
        icon: Rocket,
        tier: 'Gold',
        benefits: [
             { id: 'ben_fuse_1', title: 'Gas Rebate', description: 'Rebate on next 5 transactions', cost: 100, type: 'digital' }
        ]
    },
    {
        id: 'cross-chain-voyager',
        name: 'Cross-chain Voyager',
        description: 'Interacted with the BNB Chain.',
        icon: Globe,
        tier: 'Silver',
        benefits: [
            { id: 'ben_bnb_1', title: 'Bridge Fee Waiver', description: 'Free bridge transfer (1x)', cost: 50, type: 'digital' }
        ]
    }
];

export type ProgressStats = {
    proposalsAnalyzed: number;
    personasCreated: number;
    meebotCount: number;
    miningLevel: number;
    votesCast: number;
    governanceProposalsCreated: number;
    hasConnectedWallet: boolean;
};

export function checkNewBadges(
    progress: ProgressStats,
    existingBadgeIds: Set<string>,
    currentActionChain?: string
): Omit<Badge, 'unlockedAt'>[] {
    const newBadges: Omit<Badge, 'unlockedAt'>[] = [];
    
    const tryAdd = (id: string) => {
        if (!existingBadgeIds.has(id)) {
            const badgeDef = ALL_BADGES.find(b => b.id === id);
            if (badgeDef) {
                newBadges.push(badgeDef);
            }
        }
    };

    // Onboarding
    if (progress.hasConnectedWallet) tryAdd('welcome-explorer');

    // Creation
    if (progress.meebotCount >= 1) tryAdd('genesis-creator');
    if (progress.meebotCount >= 5) tryAdd('mee-crafter');
    if (progress.personasCreated >= 1) tryAdd('persona-architect');
    
    // Governance
    if (progress.governanceProposalsCreated >= 1) tryAdd('proposal-pioneer');
    if (progress.votesCast >= 3) tryAdd('mee-mover');

    // Mining
    if (progress.miningLevel >= 1) tryAdd('bronze-miner');
    if (progress.miningLevel >= 5) tryAdd('silver-miner');
    if (progress.miningLevel >= 10) tryAdd('gold-miner');
    if (progress.miningLevel >= 20) tryAdd('legend-miner');

    // Chain Awareness
    if (currentActionChain === 'Sepolia') tryAdd('testnet-explorer');
    if (currentActionChain === 'Fuse') tryAdd('mainnet-pioneer');
    if (currentActionChain === 'BNB') tryAdd('cross-chain-voyager');

    return newBadges;
}