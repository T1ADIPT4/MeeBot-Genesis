
import React, { useState, useEffect } from 'react';
import { Pickaxe, Zap, Lock, CheckCircle, LoaderCircle, Gem, Trophy, Crown, Server, Activity, Box, Bot, Radio, Wallet, Binary, Hash, Cpu, Shield, ChevronRight, Star } from 'lucide-react';
import { useMeeBots, USER_WALLET_ADDRESS } from '../../contexts/MeeBotContext';
import { subscribeToLeaderboard } from '../../services/miningService';
import type { LeaderboardEntry } from '../../types';
import { Skeleton } from '../Skeleton';

const POINTS_PER_LEVEL = 10;

// --- Confetti & Celebration Component ---
const CONFETTI_COUNT = 100;
const COLORS = ['#00CFE8', '#FF1B93', '#FFD700', '#FFFFFF'];

const CelebrationOverlay: React.FC<{ level: number, onComplete: () => void }> = ({ level, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Confetti */}
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
                    const style = {
                        left: `${Math.random() * 100}vw`,
                        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                        animation: `confetti-fall ${Math.random() * 3 + 2}s ${Math.random() * 2}s linear forwards`,
                        width: `${Math.floor(Math.random() * 10) + 8}px`,
                        height: `${Math.floor(Math.random() * 6) + 5}px`,
                        opacity: Math.random() + 0.5,
                    };
                    return <div key={i} className="absolute top-[-10vh] rounded-sm" style={style} />;
                })}
            </div>

            {/* Level Up Text Animation */}
            <div className="relative z-50 flex flex-col items-center animate-bounce">
                <div className="relative">
                    <Star className="w-32 h-32 text-yellow-400 fill-yellow-400 animate-[spin_3s_linear_infinite] opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 blur-xl" />
                    <Trophy className="w-32 h-32 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                </div>
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] stroke-white tracking-wider transform -rotate-6 mt-4">
                    LEVEL UP!
                </h1>
                <div className="mt-4 bg-black/80 backdrop-blur-md px-8 py-4 rounded-full border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    <p className="text-2xl font-bold text-white">You reached Level {level}</p>
                </div>
            </div>
        </div>
    );
};

const ConnectWalletView: React.FC<{ onConnect: () => void }> = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate network delay
        setTimeout(() => {
            onConnect();
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
             <div className="relative">
                <div className="absolute inset-0 bg-meebot-primary/20 blur-3xl rounded-full"></div>
                <Server className="w-24 h-24 text-meebot-primary relative z-10 animate-pulse-slow" />
             </div>
             <div>
                 <h1 className="text-4xl font-bold text-white mb-3">MeeChain Mining Rig</h1>
                 <p className="text-meebot-text-secondary max-w-md mx-auto text-lg">
                    Initialize your node and synchronize with the neural network to begin your contribution.
                 </p>
             </div>
             <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-8 py-4 bg-meebot-primary text-meebot-bg font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(0,207,232,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,207,232,0.6)] transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isConnecting ? (
                    <>
                        <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                        Connecting to Sepolia...
                    </>
                ) : (
                    <>
                        <Wallet className="w-6 h-6 mr-3" />
                        Connect Wallet
                    </>
                )}
             </button>
             <p className="text-xs text-meebot-text-secondary/50 font-mono mt-4">
                 v1.0.4-beta • Secure Connection • 256-bit Encryption
             </p>
        </div>
    );
}

const CircularProgress: React.FC<{ points: number; nextLevelPoints: number }> = ({ points, nextLevelPoints }) => {
    const currentLevelPoints = nextLevelPoints - POINTS_PER_LEVEL;
    const progress = ((points - currentLevelPoints) / POINTS_PER_LEVEL) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 140 140">
                {/* Background Track */}
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#1A1833"
                    strokeWidth="12"
                />
                {/* Progress Arc */}
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#00CFE8"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,207,232,0.5)]">{points}</span>
                <span className="text-xs font-semibold text-meebot-text-secondary uppercase tracking-wider mt-1">Total Points</span>
            </div>
        </div>
    );
};

const NFTBadgeCard: React.FC<{ 
    title: string; 
    description: string; 
    requiredLevel: number; 
    currentLevel: number; 
    icon: React.ElementType;
    colorClass: string;
}> = ({ title, description, requiredLevel, currentLevel, icon: Icon, colorClass }) => {
    const isUnlocked = currentLevel >= requiredLevel;
    const isNext = !isUnlocked && currentLevel < requiredLevel && currentLevel >= (requiredLevel - 5); // Show "Next" if close

    return (
        <div className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 group ${
            isUnlocked 
                ? `bg-gradient-to-br from-meebot-surface to-meebot-bg border-${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                : isNext
                    ? 'bg-meebot-surface border-meebot-border opacity-100'
                    : 'bg-meebot-bg border-meebot-border opacity-40 grayscale'
        }`}>
            {isUnlocked && (
                <div className={`absolute top-0 right-0 p-1.5 bg-${colorClass} rounded-bl-xl`}>
                    <CheckCircle className="w-4 h-4 text-meebot-bg" />
                </div>
            )}
            
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full bg-meebot-bg border-2 ${isUnlocked ? `border-${colorClass} shadow-[0_0_10px_currentColor] text-${colorClass}` : 'border-meebot-border text-meebot-text-secondary'}`}>
                    {isUnlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-meebot-text-secondary'}`}>{title}</h3>
                    <p className="text-xs text-meebot-text-secondary mt-1">{description}</p>
                </div>
                <div className="w-full pt-2 border-t border-meebot-border/30 flex justify-between items-center text-xs font-mono">
                    <span className="text-meebot-text-secondary">Req: Lvl {requiredLevel}</span>
                    {isUnlocked && <span className={`text-${colorClass} font-bold`}>UNLOCKED</span>}
                </div>
            </div>
        </div>
    );
};

const ActiveMinerDisplay: React.FC<{ activeBot: any, isMining: boolean }> = ({ activeBot, isMining }) => {
    const [speech, setSpeech] = useState<string | null>(null);

    // Cycle through speech phrases when mining
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isMining && activeBot) {
            const phrases = [
                "Scanning for nonces...",
                "Validating transaction...",
                "Syncing with Sepolia...",
                "Optimizing hash rate...",
                "Finding the next block...",
                "Calculating proof...",
                "Verifying signature..."
            ];
            // Initial phrase
            setSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
            
            interval = setInterval(() => {
                 setSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
            }, 3000);
        } else {
            setSpeech(null);
        }
        return () => clearInterval(interval);
    }, [isMining, activeBot]);

    if (!activeBot) {
        return (
             <div className="flex flex-col items-center justify-center p-6 bg-meebot-bg/50 rounded-lg border border-dashed border-meebot-border text-meebot-text-secondary">
                <Bot className="w-12 h-12 mb-2 opacity-50"/>
                <p className="text-sm">No Active Miner</p>
                <p className="text-xs">Mint a MeeBot to enable avatar.</p>
             </div>
        );
    }
    
    return (
        <div className={`relative flex items-center gap-4 p-4 bg-meebot-bg/50 rounded-lg border overflow-visible mt-8 min-h-[100px] transition-colors duration-500 ${isMining ? 'border-meebot-primary/50' : 'border-meebot-border'}`}>
             
             {/* Speech Bubble */}
             {isMining && speech && (
                 <div className="absolute -top-8 left-8 z-20 animate-fade-in">
                    <div className="bg-white text-meebot-bg text-xs font-bold px-3 py-1.5 rounded-t-lg rounded-br-lg shadow-lg relative border-2 border-meebot-primary whitespace-nowrap">
                        {speech}
                        <div className="absolute bottom-0 left-0 translate-y-full border-8 border-transparent border-l-meebot-primary border-t-meebot-primary w-0 h-0"></div>
                         <div className="absolute bottom-0 left-[2px] translate-y-[calc(100%-3px)] border-[6px] border-transparent border-l-white border-t-white w-0 h-0"></div>
                    </div>
                 </div>
             )}

             {/* Avatar with pulse */}
             <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 shrink-0 z-10 bg-meebot-bg ${isMining ? 'border-meebot-primary shadow-[0_0_20px_rgba(0,207,232,0.6)] scale-105' : 'border-meebot-border'}`}>
                <img src={activeBot.image} alt={activeBot.name} className="w-full h-full object-cover" />
                {isMining && <div className="absolute inset-0 bg-meebot-primary/20 animate-pulse"></div>}
             </div>

             <div className="z-10 min-w-0 flex-grow">
                <div className="flex flex-col justify-center h-full">
                    <div className="flex items-baseline gap-2">
                        <p className="text-xs text-meebot-text-secondary uppercase tracking-wide">Operator</p>
                        <p className="font-bold text-white truncate text-lg">{activeBot.name}</p>
                    </div>
                    
                    {/* Visual Status / Result Symbols */}
                    <div className="h-6 flex items-center relative mt-1">
                        {isMining ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-meebot-primary animate-pulse">HASHING...</span>
                                {/* Flickering / Bouncing Icons representing results/work */}
                                <div className="flex space-x-1">
                                    <Binary className="w-3 h-3 text-meebot-accent animate-bounce" style={{ animationDelay: '0ms', opacity: 0.8 }}/>
                                    <Hash className="w-3 h-3 text-green-400 animate-bounce" style={{ animationDelay: '150ms', opacity: 0.8 }}/>
                                    <Cpu className="w-3 h-3 text-yellow-400 animate-bounce" style={{ animationDelay: '300ms', opacity: 0.8 }}/>
                                </div>
                            </div>
                        ) : (
                             <p className="text-xs text-meebot-accent truncate">{activeBot.persona}</p>
                        )}
                    </div>
                </div>
             </div>
             
             {/* Right Side Status Pill */}
             <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                 <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${isMining ? 'bg-meebot-primary/20 text-meebot-primary border border-meebot-primary/50 shadow-[0_0_10px_rgba(0,207,232,0.2)]' : 'bg-meebot-surface text-meebot-text-secondary border border-meebot-border'}`}>
                    <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-meebot-primary animate-ping' : 'bg-meebot-text-secondary'}`}></div>
                    <div className={`w-2 h-2 rounded-full absolute ${isMining ? 'bg-meebot-primary' : 'bg-meebot-text-secondary'}`}></div>
                    <span className="ml-3">{isMining ? 'ACTIVE' : 'IDLE'}</span>
                 </div>
             </div>

            {/* Background Pulse Effect - Enhanced for "Subtle Energy Pulse" */}
            {isMining && (
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-meebot-primary/10 to-transparent animate-[pulse_2s_ease-in-out_infinite]"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-meebot-primary/20 blur-[40px] animate-pulse rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>
            )}
        </div>
    )
}

const LeaderboardTable: React.FC<{ userPoints: number, userLevel: number, activeBot: any }> = ({ userPoints, userLevel, activeBot }) => {
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
        <div className="bg-meebot-surface border border-meebot-border rounded-xl p-6 flex flex-col h-full relative overflow-hidden">
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
                 {!userInTopList && activeBot && !loading && (
                     <div className="mt-4 pt-4 border-t border-meebot-border relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-meebot-surface px-2 text-[10px] text-meebot-text-secondary">YOUR RANK</div>
                        <div className="grid grid-cols-12 items-center p-2 rounded-lg bg-meebot-primary/10 border border-meebot-primary/30 shadow-[0_0_15px_rgba(0,207,232,0.15)]">
                            <div className="col-span-2 flex justify-center text-xs font-bold text-meebot-text-secondary">--</div>
                            <div className="col-span-6 flex items-center gap-3">
                                <img src={activeBot.image} alt="You" className="w-8 h-8 rounded-full bg-meebot-surface border border-meebot-primary" />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-white truncate">{activeBot.name}</span>
                                    <span className="text-[10px] text-meebot-text-secondary font-mono truncate">{USER_WALLET_ADDRESS}</span>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-xs font-mono bg-meebot-surface px-1.5 py-0.5 rounded text-meebot-text-secondary">{userLevel}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono text-sm font-bold text-meebot-primary">
                                {userPoints.toLocaleString()}
                            </div>
                        </div>
                     </div>
                 )}
            </div>
        </div>
    )
}


export const MiningPage: React.FC = () => {
    const { miningState, executeMining, meebots } = useMeeBots();
    const { points, level, isMining } = miningState;
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    useEffect(() => {
        if (level > prevLevel) {
            setShowCelebration(true);
            setPrevLevel(level);
        }
    }, [level, prevLevel]);


    const nextLevelPoints = (Math.floor(points / POINTS_PER_LEVEL) + 1) * POINTS_PER_LEVEL;
    const activeMiner = meebots.length > 0 ? meebots[0] : null;

    if (!isWalletConnected) {
        return <ConnectWalletView onConnect={() => setIsWalletConnected(true)} />;
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col overflow-y-auto relative">
            {showCelebration && <CelebrationOverlay level={level} onComplete={() => setShowCelebration(false)} />}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shrink-0 gap-4">
                <div className="flex items-center">
                    <Server className="w-10 h-10 text-meebot-primary mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Mining Rig</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            Secure the network, earn points, and evolve your miner status.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a 
                        href="#/transparency"
                        className="flex items-center gap-2 px-4 py-2 bg-meebot-surface rounded-full border border-meebot-border hover:border-meebot-primary hover:text-meebot-primary transition-colors text-meebot-text-secondary group"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-mono">Transparency</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                    </a>
                     <div className="flex items-center gap-2 px-4 py-2 bg-meebot-surface rounded-full border border-meebot-border">
                        <Radio className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-mono text-blue-400">Network: Sepolia</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-meebot-surface rounded-full border border-meebot-border">
                        <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
                        <span className="text-sm font-mono text-yellow-400">Simulated Network</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                
                {/* Left Column: The "Rig" Interface */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={`bg-meebot-surface border rounded-xl p-1 shadow-2xl transition-all duration-500 ${isMining ? 'border-meebot-primary/50 shadow-[0_0_30px_rgba(0,207,232,0.15)]' : 'border-meebot-border'}`}>
                        <div className="bg-meebot-bg rounded-lg p-6 flex flex-col items-center relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-meebot-primary to-transparent opacity-50"></div>
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-meebot-primary/10 rounded-full blur-3xl transition-opacity duration-500 ${isMining ? 'opacity-100' : 'opacity-50'}`}></div>

                            <h2 className="text-xl font-bold text-white mb-6 z-10 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Box className={`w-5 h-5 ${isMining ? 'text-meebot-primary animate-spin' : 'text-meebot-accent'}`} style={{ animationDuration: '3s' }} /> 
                                    Node Status
                                </div>
                                {isMining && (
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-[pulse_0.2s_ease-in-out_infinite]"></div>
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] delay-150"></div>
                                    </div>
                                )}
                            </h2>
                            
                            <div className="w-full mb-6">
                                <ActiveMinerDisplay activeBot={activeMiner} isMining={isMining} />
                            </div>
                            
                            <CircularProgress points={points} nextLevelPoints={nextLevelPoints} />
                            
                            <div className="w-full mt-8 space-y-4 z-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-meebot-text-secondary">Current Level</span>
                                    <span className="text-2xl font-bold text-meebot-accent">Lvl {level}</span>
                                </div>
                                <div className="w-full bg-meebot-surface rounded-full h-2 border border-meebot-border/50 overflow-hidden">
                                    <div 
                                        className="bg-meebot-accent h-full transition-all duration-500" 
                                        style={{ width: `${((points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-meebot-text-secondary font-mono">
                                    <span>{points % POINTS_PER_LEVEL} / {POINTS_PER_LEVEL} XP</span>
                                    <span>Next: Lvl {level + 1}</span>
                                </div>
                            </div>

                            <div className="w-full mt-8">
                                <button
                                    onClick={executeMining}
                                    disabled={isMining}
                                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-lg group relative overflow-hidden ${
                                        isMining 
                                        ? 'bg-meebot-surface text-meebot-text-secondary cursor-not-allowed border border-meebot-border' 
                                        : 'bg-meebot-primary text-meebot-bg hover:bg-white hover:scale-[1.02]'
                                    }`}
                                >
                                    {/* Button Glow Effect */}
                                    {!isMining && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                                    
                                    {isMining ? (
                                        <>
                                            <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                                            Validating Block...
                                        </>
                                    ) : (
                                        <>
                                            <Pickaxe className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                                            START MINING
                                        </>
                                    )}
                                </button>
                                <p className="mt-3 text-center text-[10px] text-meebot-text-secondary/60 uppercase tracking-widest">
                                    Secure Connection • Simulated Latency
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mini Stat Card */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 text-center">
                            <p className="text-xs text-meebot-text-secondary">Hashrate (Sim)</p>
                            <p className="text-xl font-bold text-white">24 MH/s</p>
                         </div>
                         <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 text-center">
                            <p className="text-xs text-meebot-text-secondary">Uptime</p>
                            <p className="text-xl font-bold text-green-400">99.9%</p>
                         </div>
                    </div>
                </div>

                {/* Right Column: NFT Evolution Rack & Leaderboard */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    
                    {/* Evolution Rack */}
                    <div className="bg-meebot-bg border border-meebot-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <Gem className="w-5 h-5 text-meebot-accent mr-2" />
                                    Badge Evolution Rack
                                </h3>
                                <p className="text-xs text-meebot-text-secondary mt-1">Powered by MeeBadgeNFT (0xe7f1...0512)</p>
                            </div>
                            <span className="text-xs bg-meebot-primary/20 text-meebot-primary px-2 py-1 rounded">
                                ERC-1155 Compatible
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <NFTBadgeCard 
                                title="Bronze Miner" 
                                description="Proof of Work. The foundation of the network." 
                                requiredLevel={1} 
                                currentLevel={level} 
                                icon={Pickaxe}
                                colorClass="orange-400" // Tailwind color name approximation
                            />
                            <NFTBadgeCard 
                                title="Silver Miner" 
                                description="Consistent contributor. Network backbone." 
                                requiredLevel={5} 
                                currentLevel={level} 
                                icon={Gem}
                                colorClass="gray-300"
                            />
                            <NFTBadgeCard 
                                title="Gold Miner" 
                                description="Elite validator status. High yield rewards." 
                                requiredLevel={10} 
                                currentLevel={level} 
                                icon={Trophy}
                                colorClass="yellow-400"
                            />
                             <NFTBadgeCard 
                                title="Legend Miner" 
                                description="Historical figure. Governance voting power x2." 
                                requiredLevel={20} 
                                currentLevel={level} 
                                icon={Crown}
                                colorClass="purple-400"
                            />
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="flex-grow">
                        <LeaderboardTable userPoints={points} userLevel={level} activeBot={activeMiner} />
                    </div>
                </div>
            </div>
        </div>
    );
};
