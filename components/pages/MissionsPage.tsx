import React from 'react';
import { Target, CheckCircle, Award } from 'lucide-react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { ALL_MISSIONS } from '../../services/missionService';
import type { Mission } from '../../types';
import { ALL_BADGES } from '../../services/badgeService';

const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => {
    const { userMissions } = useMeeBots();
    const userMission = userMissions.find(um => um.missionId === mission.id);
    const progress = userMission?.progress || 0;
    const isCompleted = userMission?.status === 'completed';

    const getRewardText = () => {
        const rewards = [];
        if (mission.reward.xp) {
            rewards.push(`${mission.reward.xp} XP`);
        }
        if (mission.reward.badgeId) {
            const badge = ALL_BADGES.find(b => b.id === mission.reward.badgeId);
            if (badge) {
                rewards.push(`Badge: ${badge.name}`);
            }
        }
        if (rewards.length === 0) return "Glory!";
        return rewards.join(' • ');
    };

    return (
        <div className={`p-6 rounded-lg border transition-all duration-300 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-meebot-surface border-meebot-border'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white">{mission.title}</h3>
                    <p className="text-sm text-meebot-text-secondary mt-1">{mission.description}</p>
                </div>
                {isCompleted ? (
                    <div className="flex items-center text-green-400 font-semibold text-sm bg-green-500/20 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-2"/>
                        Completed
                    </div>
                ) : (
                    <span className="text-xs font-semibold uppercase text-meebot-text-secondary bg-meebot-bg px-2 py-1 rounded-full">{mission.cadence}</span>
                )}
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between items-center text-sm text-meebot-text-secondary mb-1">
                    <span>Progress</span>
                    <span>{Math.min(progress, mission.target)} / {mission.target}</span>
                </div>
                <div className="w-full bg-meebot-bg rounded-full h-2.5">
                    <div className="bg-meebot-primary h-2.5 rounded-full" style={{ width: `${Math.min((progress / mission.target) * 100, 100)}%` }}></div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-meebot-border/50 flex items-center text-yellow-400">
                <Award className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">{getRewardText()}</span>
            </div>
        </div>
    );
};

export const MissionsPage: React.FC = () => {
    const dailyMissions = ALL_MISSIONS.filter(m => m.cadence === 'daily');
    const weeklyMissions = ALL_MISSIONS.filter(m => m.cadence === 'weekly');
    
    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex items-center mb-8">
                <Target className="w-10 h-10 text-meebot-primary mr-4" />
                <div>
                    <h1 className="text-4xl font-bold text-white">Missions</h1>
                    <p className="text-meebot-text-secondary mt-1">
                        Complete tasks to earn rewards and grow with your MeeBot.
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-meebot-accent mb-4">Daily Missions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dailyMissions.map(mission => <MissionCard key={mission.id} mission={mission} />)}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-meebot-accent mb-4">Weekly Missions</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {weeklyMissions.map(mission => <MissionCard key={mission.id} mission={mission} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};
