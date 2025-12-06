
import React, { useState } from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Award, ShoppingBag, Coins, QrCode, CheckCircle, Ticket, LoaderCircle, Shield, X } from 'lucide-react';
import type { Badge, Benefit } from '../../types';
import { Confetti } from '../Confetti';

// --- Components ---

const BadgeCard: React.FC<{ 
    badge: Badge; 
    onSelect: () => void;
}> = ({ badge, onSelect }) => {
    
    let tierColor = 'text-gray-300 border-gray-500';
    if (badge.tier === 'Gold') tierColor = 'text-yellow-400 border-yellow-400';
    if (badge.tier === 'Bronze') tierColor = 'text-orange-400 border-orange-400';
    
    return (
        <button 
            onClick={onSelect}
            className="flex flex-col items-center p-4 bg-meebot-surface border border-meebot-border rounded-xl hover:border-meebot-primary hover:scale-[1.02] transition-all group relative overflow-hidden"
        >
            <div className={`p-4 rounded-full border-2 mb-3 bg-meebot-bg ${tierColor} group-hover:shadow-[0_0_15px_currentColor]`}>
                <badge.icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-center mb-1">{badge.name}</h3>
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-black/30 ${tierColor}`}>
                {badge.tier} Tier
            </span>
             {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white font-bold bg-meebot-primary px-3 py-1.5 rounded-full">
                    <QrCode className="w-4 h-4" /> Scan to Use
                </div>
            </div>
        </button>
    );
};

const BenefitRow: React.FC<{ 
    benefit: Benefit; 
    canAfford: boolean; 
    onRedeem: () => void; 
    isProcessing: boolean;
}> = ({ benefit, canAfford, onRedeem, isProcessing }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-meebot-bg border border-meebot-border rounded-lg group hover:border-meebot-primary/50 transition-colors">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-meebot-surface rounded-lg text-meebot-accent group-hover:text-white transition-colors">
                    {benefit.type === 'discount' && <ShoppingBag className="w-5 h-5"/>}
                    {benefit.type === 'access' && <Shield className="w-5 h-5"/>}
                    {benefit.type === 'physical' && <Award className="w-5 h-5"/>}
                    {benefit.type === 'digital' && <Ticket className="w-5 h-5"/>}
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">{benefit.title}</h4>
                    <p className="text-xs text-meebot-text-secondary">{benefit.description}</p>
                </div>
            </div>
            
            <button
                onClick={onRedeem}
                disabled={!canAfford || isProcessing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    canAfford 
                    ? 'bg-meebot-primary text-meebot-bg hover:bg-white' 
                    : 'bg-meebot-surface text-meebot-text-secondary cursor-not-allowed opacity-50'
                }`}
            >
                {isProcessing ? (
                     <LoaderCircle className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        {benefit.cost > 0 ? (
                            <><Coins className="w-3 h-3"/> {benefit.cost}</>
                        ) : (
                            "Free"
                        )}
                    </>
                )}
            </button>
        </div>
    );
};

const RedemptionModal: React.FC<{ 
    badge: Badge; 
    balance: number;
    onClose: () => void;
    onRedeem: (benefit: Benefit) => Promise<void>;
}> = ({ badge, balance, onClose, onRedeem }) => {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleRedeem = async (benefit: Benefit) => {
        setProcessingId(benefit.id);
        await onRedeem(benefit);
        setProcessingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-meebot-surface p-6 rounded-xl w-full max-w-lg border border-meebot-border shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-meebot-bg border border-meebot-border rounded-lg">
                            <badge.icon className="w-8 h-8 text-meebot-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{badge.name}</h2>
                            <p className="text-sm text-meebot-text-secondary">{badge.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-meebot-text-secondary hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                
                <div className="mb-4 flex items-center justify-between p-3 bg-meebot-bg rounded-lg border border-meebot-border/50">
                     <span className="text-sm text-meebot-text-secondary">Your Balance</span>
                     <span className="text-lg font-bold text-meebot-accent flex items-center gap-2">
                        <Coins className="w-5 h-5"/> {balance} Coins
                     </span>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                    <h3 className="text-sm font-bold text-meebot-text-secondary uppercase tracking-wider mb-2">Available Benefits</h3>
                    {badge.benefits.length > 0 ? (
                        badge.benefits.map(benefit => (
                            <BenefitRow 
                                key={benefit.id} 
                                benefit={benefit} 
                                canAfford={balance >= benefit.cost} 
                                onRedeem={() => handleRedeem(benefit)}
                                isProcessing={processingId === benefit.id}
                            />
                        ))
                    ) : (
                        <p className="text-center text-meebot-text-secondary py-4 italic">No specific perks available for this badge yet.</p>
                    )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-meebot-border flex justify-center">
                     <div className="flex items-center gap-2 text-xs text-meebot-text-secondary">
                        <QrCode className="w-4 h-4"/> 
                        <span>Scan verification active via MeeChain Protocol</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const RedemptionPage: React.FC = () => {
    const { unlockedBadges, miningState, redeemBenefit } = useMeeBots();
    const { t } = useLanguage();
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleRedeem = async (benefit: Benefit) => {
        const success = await redeemBenefit(selectedBadge!.id, benefit);
        if (success) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            // In a real app we might close modal here, but keeping it open to show state change is also fine.
        } else {
            alert("Redemption failed. Insufficient coins.");
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in h-full overflow-y-auto">
            {showConfetti && <Confetti />}
            {selectedBadge && (
                <RedemptionModal 
                    badge={selectedBadge} 
                    balance={miningState.coins} 
                    onClose={() => setSelectedBadge(null)}
                    onRedeem={handleRedeem}
                />
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <Ticket className="w-10 h-10 text-meebot-primary mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">{t('nav.perks')}</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            Use your hard-earned badges and coins to claim exclusive rewards.
                        </p>
                    </div>
                </div>
                
                <div className="bg-meebot-surface border border-meebot-border rounded-xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="text-right">
                        <p className="text-xs text-meebot-text-secondary uppercase font-bold">Wallet Balance</p>
                        <p className="text-2xl font-bold text-white flex items-center justify-end gap-2">
                             {miningState.coins} <Coins className="w-5 h-5 text-meebot-accent"/>
                        </p>
                    </div>
                </div>
            </div>

            {/* Owned Badges Grid */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-meebot-primary"/> Your Badge Collection
            </h2>
            
            {unlockedBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {unlockedBadges.map(badge => (
                        <BadgeCard 
                            key={badge.id} 
                            badge={badge} 
                            onSelect={() => setSelectedBadge(badge)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-meebot-surface border border-dashed border-meebot-border rounded-lg text-meebot-text-secondary">
                    <p>You haven't earned any badges yet.</p>
                    <p>Interact with the MeeChain ecosystem to unlock perks!</p>
                </div>
            )}
        </div>
    );
};