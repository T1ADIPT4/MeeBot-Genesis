
import React, { useState, useEffect } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { subscribeToLeaderboard } from '../services/miningService';
import { USER_WALLET_ADDRESS } from '../contexts/MeeBotContext';
import type { LeaderboardEntry, MeeBotMetadata } from '../types';
import { Skeleton } from './Skeleton';

interface LeaderboardProps {
  className?: string;
  currentUserPoints?: number;
  currentUserLevel?: number;
  currentUserBot?: MeeBotMetadata | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  className = "",
  currentUserPoints = 0,
  currentUserLevel = 0,
  currentUserBot
}) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to the "Live" leaderboard (Simulates Firestore onSnapshot)
    useEffect(() => {
        setLoading(true);
        // Pass USER_WALLET_ADDRESS to properly identify and highlight the current user in the returned entries
        const unsubscribe = subscribeToLeaderboard((data) => {
            setEntries(data);
            setLoading(false);
        }, USER_WALLET_ADDRESS);
        return () => unsubscribe();
    }, []);

    // Helper to render rank icon with flair
    const renderRank = (rank: number) => {
        if (rank === 1) return <div className="relative"><Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" /><div className="absolute inset-0 blur-sm bg-yellow-400/50 rounded-full opacity-20"></div></div>;
        if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300 fill-gray-300" />;
        if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400 fill-orange-400" />;
        return <span className="font-bold text-meebot-text-secondary font-mono">#{rank}</span>;
    };

    const getRowStyle = (rank: number, isUser?: boolean) => {
        if (isUser) return "bg-meebot-primary/20 border-meebot-primary shadow-[0_0_10px_rgba(0,207,232,0.1)] scale-[1.01] z-10";
        if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30";
        if (rank === 2) return "bg-gray-400/10 border-gray-400/30";
        if (rank === 3) return "bg-orange-500/10 border-orange-500/30";
        return "bg-meebot-bg/40 border-transparent hover:border-meebot-border/50";
    };

    // Determine if the user is in the top list being displayed
    const userInTopList = entries.some(e => e.isUser);

    return (
        <div className={`bg-meebot-surface border border-meebot-border rounded-xl p-6 flex flex-col h-full relative overflow-hidden ${className}`}>
             {/* Background Pulse for Live Status */}
             <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                 <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">LIVE FEED</span>
             </div>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                    Top Miners
                </h3>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col">
                 {/* Table Header */}
                 <div className="grid grid-cols-12 text-[10px] font-bold text-meebot-text-secondary uppercase tracking-wider pb-3 border-b border-meebot-border/50 mb-2 px-2">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-6 pl-2">Miner</div>
                    <div className="col-span-2 text-center">Lvl</div>
                    <div className="col-span-2 text-right">Pts</div>
                 </div>
                 
                 {/* List */}
                 <div className="overflow-y-auto space-y-2 pr-1 flex-grow custom-scrollbar">
                    {loading ? (
                         <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-12 items-center p-2 rounded-lg border border-transparent bg-meebot-bg/40">
                                    <div className="col-span-2 flex justify-center"><Skeleton className="w-6 h-6 rounded-full" /></div>
                                    <div className="col-span-6 flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="flex flex-col gap-1 w-full">
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-2 w-1/3" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex justify-center"><Skeleton className="h-4 w-8" /></div>
                                    <div className="col-span-2 flex justify-end"><Skeleton className="h-4 w-12" /></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={`${entry.rank}-${entry.minerName}`} className={`grid grid-cols-12 items-center p-2 rounded-lg border transition-all duration-300 ${getRowStyle(entry.rank, entry.isUser)}`}>
                                <div className="col-span-2 flex justify-center">{renderRank(entry.rank)}</div>
                                <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                                    <img src={entry.avatar} alt={entry.minerName} className="w-8 h-8 rounded-full bg-meebot-surface border border-meebot-border shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm truncate ${entry.isUser ? 'text-meebot-primary' : 'text-white'}`}>
                                            {entry.isUser ? 'YOU' : entry.minerName}
                                        </span>
                                        <span className="text-[10px] text-meebot-text-secondary font-mono truncate">{entry.minerAddress}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-xs font-mono bg-meebot-surface px-1.5 py-0.5 rounded text-meebot-text-secondary">{entry.level}</span>
                                </div>
                                <div className="col-span-2 text-right font-mono text-sm font-bold text-meebot-primary">
                                    {entry.points.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                 </div>

                 {/* Current User Row (Only show if not already in the top list) */}
                 {!userInTopList && currentUserBot && !loading && (
                     <div className="mt-4 pt-4 border-t border-meebot-border relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-meebot-surface px-2 text-[10px] text-meebot-text-secondary">YOUR RANK</div>
                        <div className="grid grid-cols-12 items-center p-2 rounded-lg bg-meebot-primary/10 border border-meebot-primary/30 shadow-[0_0_15px_rgba(0,207,232,0.15)]">
                            <div className="col-span-2 flex justify-center text-xs font-bold text-meebot-text-secondary">--</div>
                            <div className="col-span-6 flex items-center gap-3">
                                <img src={currentUserBot.image} alt="You" className="w-8 h-8 rounded-full bg-meebot-surface border border-meebot-primary" />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-white truncate">{currentUserBot.name}</span>
                                    <span className="text-[10px] text-meebot-text-secondary font-mono truncate">{USER_WALLET_ADDRESS}</span>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-xs font-mono bg-meebot-surface px-1.5 py-0.5 rounded text-meebot-text-secondary">{currentUserLevel}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono text-sm font-bold text-meebot-primary">
                                {currentUserPoints.toLocaleString()}
                            </div>
                        </div>
                     </div>
                 )}
            </div>
        </div>
    )
};
