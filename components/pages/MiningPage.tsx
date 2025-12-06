
import React, { useState, useEffect } from 'react';
import { Pickaxe, Server, Activity, Box, Bot, Radio, Wallet, Binary, Hash, Cpu, Shield, ChevronRight, Star, Lock, CheckCircle, LoaderCircle, Gem, Trophy, Crown, Zap, Clock } from 'lucide-react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { Leaderboard } from '../Leaderboard';
import { useLanguage } from '../../contexts/LanguageContext';
import { Confetti } from '../Confetti';

const POINTS_PER_LEVEL = 10;

// --- Animations & Visual Effects ---

const ServerLights: React.FC<{ isMining: boolean }> = ({ isMining }) => (
    <div className="flex gap-1.5 items-center">
        {/* Main Status Light */}
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isMining ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500/50'}`}></div>
        
        {/* Activity Lights */}
        {isMining && [100, 300, 600].map((delay) => (
            <div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
                style={{ 
                    animationDuration: '800ms', 
                    animationDelay: `${delay}ms`,
                    boxShadow: '0 0 5px rgba(96, 165, 250, 0.8)' 
                }}
            />
        ))}
    </div>
);

const EnergyScanEffect: React.FC<{ isMining: boolean }> = ({ isMining }) => {
    if (!isMining) return null;
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-0">
             <style>{`
                @keyframes scan-line {
                    0% { transform: translateY(-100%); opacity: 0; }
                    10% { opacity: 0.5; }
                    90% { opacity: 0.5; }
                    100% { transform: translateY(400%); opacity: 0; }
                }
             `}</style>
             <div 
                className="w-full h-24 bg-gradient-to-b from-transparent via-meebot-primary/10 to-transparent absolute top-0 left-0"
                style={{ animation: 'scan-line 3s linear infinite' }}
             ></div>
        </div>
    );
};

// --- Confetti & Celebration Component ---

const CelebrationOverlay: React.FC<{ level: number, onComplete: () => void }> = ({ level, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Confetti */}
            <Confetti />

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
    const { t } = useLanguage();

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
                 <h1 className="text-4xl font-bold text-white mb-3">{t('mining.title')}</h1>
                 <p className="text-meebot-text-secondary max-w-md mx-auto text-lg">
                    {t('mining.init_node')}
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
                        {t('mining.connecting')}
                    </>
                ) : (
                    <>
                        <Wallet className="w-6 h-6 mr-3" />
                        {t('mining.connect_wallet')}
                    </>
                )}
             </button>
             <p className="text-xs text-meebot-text-secondary/50 font-mono mt-4">
                 v1.0.4-beta • Secure Connection • 256-bit Encryption
             </p>
        </div>
    );
}

const CircularProgress: React.FC<{ points: number; nextLevelPoints: number; isMining: boolean }> = ({ points, nextLevelPoints, isMining }) => {
    const currentLevelPoints = nextLevelPoints - POINTS_PER_LEVEL;
    const progress = ((points - currentLevelPoints) / POINTS_PER_LEVEL) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
             {isMining && (
                <div className="absolute inset-0 bg-meebot-primary/20 rounded-full blur-xl animate-pulse"></div>
            )}
            <svg className="w-48 h-48 transform -rotate-90 relative z-10" viewBox="0 0 140 140">
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
                    stroke={isMining ? "#00CFE8" : "#33315C"}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${isMining ? 'drop-shadow-[0_0_8px_rgba(0,207,232,0.6)]' : ''}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className={`text-5xl font-bold text-white transition-all ${isMining ? 'drop-shadow-[0_0_15px_rgba(0,207,232,0.8)]' : ''}`}>{points}</span>
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
    const { t } = useLanguage();

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
                <p className="text-sm">{t('mining.no_active')}</p>
                <p className="text-xs">{t('mining.mint_hint')}</p>
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
                        <p className="text-xs text-meebot-text-secondary uppercase tracking-wide">{t('mining.operator')}</p>
                        <p className="font-bold text-white truncate text-lg">{activeBot.name}</p>
                    </div>
                    
                    {/* Visual Status / Result Symbols */}
                    <div className="h-6 flex items-center relative mt-1">
                        {isMining ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-meebot-primary animate-pulse">{t('mining.hashing')}</span>
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
                    <span className="ml-3">{isMining ? t('mining.active') : t('mining.idle')}</span>
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


export const MiningPage: React.FC = () => {
    const { miningState, executeMining, meebots, connectWallet, progress } = useMeeBots();
    const { points, level, isMining, lastMinedAt } = miningState;
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        if (level > prevLevel) {
            setShowCelebration(true);
            setPrevLevel(level);
        }
    }, [level, prevLevel]);

    useEffect(() => {
        const checkCooldown = () => {
            const now = Date.now();
            const diff = now - lastMinedAt;
            // 30 seconds cooldown
            if (diff < 30000) {
                setCooldownRemaining(Math.ceil((30000 - diff) / 1000));
            } else {
                setCooldownRemaining(0);
            }
        };

        checkCooldown(); // Immediate check
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, [lastMinedAt]);

    const isCooldown = cooldownRemaining > 0;
    const nextLevelPoints = (Math.floor(points / POINTS_PER_LEVEL) + 1) * POINTS_PER_LEVEL;
    const activeMiner = meebots.length > 0 ? meebots[0] : null;

    if (!progress.hasConnectedWallet) {
        return <ConnectWalletView onConnect={connectWallet} />;
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col overflow-y-auto relative">
            {showCelebration && <CelebrationOverlay level={level} onComplete={() => setShowCelebration(false)} />}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shrink-0 gap-4">
                <div className="flex items-center">
                    <Server className="w-10 h-10 text-meebot-primary mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">{t('mining.title')}</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            {t('mining.subtitle')}
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
                            {/* Scanning Line Animation */}
                            <EnergyScanEffect isMining={isMining} />
                            
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-meebot-primary to-transparent opacity-50"></div>
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-meebot-primary/10 rounded-full blur-3xl transition-opacity duration-500 ${isMining ? 'opacity-100' : 'opacity-50'}`}></div>

                            <h2 className="text-xl font-bold text-white mb-6 z-10 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Box className={`w-5 h-5 ${isMining ? 'text-meebot-primary animate-spin' : 'text-meebot-accent'}`} style={{ animationDuration: '3s' }} /> 
                                    {t('mining.node_status')}
                                </div>
                                <ServerLights isMining={isMining} />
                            </h2>
                            
                            <div className="w-full mb-6 relative z-10">
                                <ActiveMinerDisplay activeBot={activeMiner} isMining={isMining} />
                            </div>
                            
                            <CircularProgress points={points} nextLevelPoints={nextLevelPoints} isMining={isMining} />
                            
                            <div className="w-full mt-8 space-y-4 z-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-meebot-text-secondary">{t('mining.current_level')}</span>
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
                                    <span>{t('mining.next_level')} {level + 1}</span>
                                </div>
                            </div>

                            <div className="w-full mt-8 z-10">
                                <button
                                    onClick={executeMining}
                                    disabled={isMining || isCooldown}
                                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-lg group relative overflow-hidden ${
                                        isMining || isCooldown
                                        ? 'bg-meebot-surface text-meebot-text-secondary cursor-not-allowed border border-meebot-border' 
                                        : 'bg-meebot-primary text-meebot-bg hover:bg-white hover:scale-[1.02]'
                                    }`}
                                >
                                    {/* Button Glow Effect */}
                                    {!isMining && !isCooldown && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                                    
                                    {isMining ? (
                                        <>
                                            <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                                            {t('mining.validating')}
                                        </>
                                    ) : isCooldown ? (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 animate-pulse" />
                                            <span>Cooldown: {cooldownRemaining}s</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Pickaxe className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                                            {t('mining.start')}
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
                            <p className="text-xs text-meebot-text-secondary">{t('mining.hashrate')}</p>
                            <p className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                24 MH/s 
                                {isMining && <Zap className="w-3 h-3 text-yellow-400 animate-pulse"/>}
                            </p>
                         </div>
                         <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 text-center">
                            <p className="text-xs text-meebot-text-secondary">{t('mining.uptime')}</p>
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
                                    {t('mining.evolution_rack')}
                                </h3>
                                <p className="text-xs text-meebot-text-secondary mt-1">{t('mining.powered_by_nft')} (0xe7f1...0512)</p>
                            </div>
                            <span className="text-xs bg-meebot-primary/20 text-meebot-primary px-2 py-1 rounded">
                                {t('mining.erc1155')}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <NFTBadgeCard 
                                title="Bronze Miner" 
                                description="Proof of Work. The foundation of the network." 
                                requiredLevel={1} 
                                currentLevel={level} 
                                icon={Pickaxe}
                                colorClass="orange-400" 
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
                        <Leaderboard 
                            currentUserPoints={points} 
                            currentUserLevel={level} 
                            currentUserBot={activeMiner} 
                            className="h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
