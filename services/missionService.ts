import type { Mission, UserMission } from '../types';

export const ALL_MISSIONS: Mission[] = [
    {
        id: 'daily_mint_1',
        title: 'Daily Creation Ritual',
        description: 'Bring a new MeeBot to life.',
        cadence: 'daily',
        actionType: 'mint',
        target: 1,
        reward: { xp: 50 },
    },
    {
        id: 'daily_analysis_1',
        title: 'Daily Insight',
        description: 'Analyze one proposal with your MeeBot.',
        cadence: 'daily',
        actionType: 'analyze',
        target: 1,
        reward: { xp: 25 },
    },
     {
        id: 'persona_architect_mission',
        title: 'Architect of Identity',
        description: 'Create your first custom Persona.',
        cadence: 'daily', // Effectively a one-time mission that shows up daily until done
        actionType: 'create_persona',
        target: 1,
        reward: { xp: 75, badgeId: 'persona-architect' },
    },
    {
        id: 'weekly_analysis_3',
        title: 'Weekly Strategist',
        description: 'Analyze three proposals within a week.',
        cadence: 'weekly',
        actionType: 'analyze',
        target: 3,
        reward: { xp: 100 },
    },
];

/**
 * Checks if a mission is still valid based on its cadence.
 * @param userMission The user's progress on a mission.
 * @param missionDef The mission definition.
 * @returns True if the mission should be reset for the user.
 */
export function shouldResetMission(userMission: UserMission, missionDef: Mission): boolean {
    const now = new Date();
    const lastUpdate = new Date(userMission.lastUpdatedAt);
    
    if (missionDef.cadence === 'daily') {
        // Reset if last update was before today
        return lastUpdate.setHours(0,0,0,0) < now.setHours(0,0,0,0);
    }
    
    if (missionDef.cadence === 'weekly') {
        // Reset if last update was before the start of the current week (assuming Monday is start)
        const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0,0,0,0);
        return lastUpdate < startOfWeek;
    }

    return false;
}
