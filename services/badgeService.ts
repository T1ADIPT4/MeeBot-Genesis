import { Award, Bot, FileText, Palette } from 'lucide-react';
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
];

export type Progress = {
    meebotCount: number;
    proposalsAnalyzed: number;
    personasCreated: number;
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

    return newlyUnlocked;
}