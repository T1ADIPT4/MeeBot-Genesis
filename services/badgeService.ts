import { Award, Bot, FileText, Palette, Pickaxe, Gem, Trophy, Crown } from 'lucide-react';
import type { Badge } from '../types';

// Using Omit here to define the static part of the badge,
// as `unlockedAt` will be dynamically added when the user earns it.
export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
    {
        id: 'genesis-creator',
        name: 'Genesis Creator',
        description: 'Awarded for minting your very first MeeBot.',
        icon: Bot,
    },
    {
        id: 'insightful-analyst',
        name: 'Insightful Analyst',
        description: 'Awarded for analyzing 5 project proposals.',
        icon: FileText,
    },
    {
        id: 'persona-architect',
        name: 'Persona Architect',
        description: 'Awarded for creating a new custom persona.',
        icon: Palette,
    },
    // Mining Badges - These correspond to the NFT evolutions in the smart contract
    {
        id: 'miner-bronze',
        name: 'Bronze Miner',
        description: 'Reached Mining Level 1 (10 Points). A solid start.',
        icon: Pickaxe,
    },
    {
        id: 'miner-silver',
        name: 'Silver Miner',
        description: 'Reached Mining Level 5 (50 Points). Serious dedication.',
        icon: Gem,
    },
    {
        id: 'miner-gold',
        name: 'Gold Miner',
        description: 'Reached Mining Level 10 (100 Points). A master of the craft.',
        icon: Trophy,
    },
    {
        id: 'miner-legend',
        name: 'Legend Miner',
        description: 'Reached Mining Level 20. One of the ancients.',
        icon: Crown,
    },
];

export type Progress = {
    meebotCount: number;
    proposalsAnalyzed: number;
    personasCreated: number;
    miningLevel: number; // Added for mining checks
}

/**
 * Checks the user's progress against the criteria for all badges.
 * @param progress The user's current progress metrics.
 * @param existingBadgeIds A Set of badge IDs the user has already unlocked.
 * @returns An array of Badge objects that the user has newly unlocked.
 */
export function checkNewBadges(progress: Progress, existingBadgeIds: Set<string>): Badge[] {
    const newlyUnlocked: Badge[] = [];
    const now = Date.now();

    const findBadge = (id: string) => ALL_BADGES.find(b => b.id === id)!;

    // Genesis Creator
    if (progress.meebotCount >= 1 && !existingBadgeIds.has('genesis-creator')) {
        newlyUnlocked.push({ ...findBadge('genesis-creator'), unlockedAt: now });
    }

    // Insightful Analyst
    if (progress.proposalsAnalyzed >= 5 && !existingBadgeIds.has('insightful-analyst')) {
        newlyUnlocked.push({ ...findBadge('insightful-analyst'), unlockedAt: now });
    }
    
    // Persona Architect
    if (progress.personasCreated >= 1 && !existingBadgeIds.has('persona-architect')) {
        newlyUnlocked.push({ ...findBadge('persona-architect'), unlockedAt: now });
    }

    // Mining Milestones
    if (progress.miningLevel >= 1 && !existingBadgeIds.has('miner-bronze')) {
        newlyUnlocked.push({ ...findBadge('miner-bronze'), unlockedAt: now });
    }
    if (progress.miningLevel >= 5 && !existingBadgeIds.has('miner-silver')) {
        newlyUnlocked.push({ ...findBadge('miner-silver'), unlockedAt: now });
    }
    if (progress.miningLevel >= 10 && !existingBadgeIds.has('miner-gold')) {
        newlyUnlocked.push({ ...findBadge('miner-gold'), unlockedAt: now });
    }
    if (progress.miningLevel >= 20 && !existingBadgeIds.has('miner-legend')) {
        newlyUnlocked.push({ ...findBadge('miner-legend'), unlockedAt: now });
    }

    return newlyUnlocked;
}