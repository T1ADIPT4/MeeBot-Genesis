import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import type { MeeBotMetadata, MemoryEvent } from '../../types';
import { speak } from '../../services/ttsService';
import { Sparkles, BookOpen, Gift, Award, FileText, Heart, Hash, ArrowRightLeft, Bot, Target, MessageSquare, Volume2, X, Dna, Server, Clock, Fingerprint, FileJson, CheckCircle, XCircle, FileArchive, LoaderCircle, ThumbsUp, ThumbsDown, Hammer, BrainCircuit, ExternalLink } from 'lucide-react';
import { fetchProposalsForMeeBot as fetchUnifiedProposals, UnifiedProposal } from '../../services/unifiedProposalService';
import * as onChainService from '../../services/onChainProposalService';
import { Skeleton } from '../Skeleton';

export const TimelineIcon: React.FC<{ type: MemoryEvent['type'] }> = ({ type }) => {
    switch(type) {
        case 'Mint': return <Sparkles className="w-4 h-4 text-meebot-accent" />;
        case 'MiningGift': return <Gift className="w-4 h-4 text-green-400" />;
        case 'Badge': return <Award className="w-4 h-4 text-yellow-400" />;
        case 'Proposal': return <FileText className="w-4 h-4 text-blue-400" />;
        case 'EmotionShift': return <Heart className="w-4 h-4 text-pink-400" />;
        case 'Migration': return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
        case 'Mission': return <Target className="w-4 h-4 text-yellow-400" />;
        case 'Gift': return <Gift className="w-4 h-4 text-pink-400" />;
        case 'Chat': return <MessageSquare className="w-4 h-4 text-teal-400" />;
        default: return <BookOpen className="w-4 h-4 text-meebot-text-secondary" />;
    }
};

const getChainTagStyle = (chainName?: string) => {
    switch (chainName) {
        case 'Sepolia': return 'bg-blue-500/20 text-blue-300';
        case 'Fuse': return 'bg-green-500/20 text-green-300';
        case 'BNB': return 'bg-yellow-500/20 text-yellow-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

const resolveIPFS = (ipfsUrl: string): string => {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl; // Return original url if not an IPFS url or is empty
  }
  const cid = ipfsUrl.substring(7);
  return `https://ipfs.io/ipfs/${cid}`;
};

const getExplorerLink = (proposal: Extract<UnifiedProposal, { source: 'onchain' }>): { url: string; name: string } => {
  const tx = proposal.txHash;
  switch (proposal.chainName) {
    case 'Sepolia': return { url: `https://sepolia.etherscan.io/tx/${tx}`, name: 'Etherscan' };
    case 'Fuse': return { url: `https://explorer.fuse.io/tx/${tx}`, name: 'Fuse Explorer' };
    case 'BNB': return { url: `https://bscscan.com/tx/${tx}`, name: 'BscScan' };
    default: return { url: '#', name: 'Explorer' };
  }
};

const getFirestoreLink = (proposalId: string): string => {
  // Using a placeholder project ID as per the prompt's example
  return `https://console.firebase.google.com/project/meechainmeebot-v1-218162-261fc/firestore/data/~2Fproposals~2F${proposalId}`;
};

const DNAViewer: React.FC<{ bot: MeeBotMetadata, onClose: () => void }> = ({ bot, onClose }) => {
    const [relatedProposals, setRelatedProposals] = useState<UnifiedProposal[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const loadProposals = useCallback(async () => {
        if (!bot) return;
        setIsLoadingProposals(true);
        try {
            const proposals = await fetchUnifiedProposals(bot.id);
            setRelatedProposals(proposals);
        } catch (error) {
            console.error("Failed to fetch proposals:", error);
            setRelatedProposals([]);
        } finally {
            setIsLoadingProposals(false);
        }
    }, [bot]);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);
    
    const handleVote = useCallback(async (proposalId: string, support: boolean) => {
        setProcessingIds(prev => new Set(prev).add(proposalId));
        try {
            await onChainService.voteOnProposal(proposalId, support);
            speak(`Vote submitted for proposal.`, 'stoic');
            await loadProposals(); // Refresh proposals to show new vote count
        } catch (e) {
            console.error("Vote failed", e);
            alert((e as Error).message);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(proposalId);
                return newSet;
            });
        }
    }, [loadProposals]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-meebot-surface w-full max-w-4xl h-[90vh] rounded-lg border border-meebot-border shadow-2xl shadow-meebot-primary/20 flex flex-col overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-meebot-border">
                    <div className="flex items-center gap-3">
                        <Dna className="w-6 h-6 text-meebot-primary"/>
                        <h2 className="text-2xl font-bold text-white">MeeBot DNA: {bot.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-meebot-bg text-meebot-text-secondary hover:text-white">
                        <X className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="flex-grow p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
                    {/* Left Column */}
                    <div className="md:w-1/3 flex flex-col gap-4">
                        <img src={resolveIPFS(bot.image)} alt={bot.soul_prompt} className="w-full rounded-lg border-2 border-meebot-border object-cover"/>
                        <div className="p-4 bg-meebot-bg rounded-lg">
                            <h4 className="font-bold text-meebot-accent mb-2">First Words</h4>
                            <p className="text-sm italic text-meebot-text-secondary mb-3">"{bot.voice_message}"</p>
                            <button 
                                onClick={() => speak(bot.voice_message, bot.emotion)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-meebot-accent/20 text-meebot-accent rounded-md hover:bg-meebot-accent/40 transition-colors"
                            >
                                <Volume2 className="w-4 h-4"/>
                                Play Voice
                            </button>
                        </div>
                         <div className="p-4 bg-meebot-bg rounded-lg">
                            <h4 className="font-bold text-meebot-primary mb-3">Core Data</h4>
                            <ul className="text-sm space-y-2 text-meebot-text-secondary">
                                <li className="flex items-center gap-2"><Server className="w-4 h-4 text-meebot-primary/70"/>Chain: <span className="font-mono text-meebot-text-primary">{bot.chainName}</span></li>
                                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-meebot-primary/70"/>Created: <span className="font-mono text-meebot-text-primary">{new Date(bot.createdAt).toLocaleString()}</span></li>
                                <li className="flex items-center gap-2 truncate"><Fingerprint className="w-4 h-4 text-meebot-primary/70 shrink-0"/>TX Hash: <span className="font-mono text-meebot-text-primary truncate">{bot.txHash}</span></li>
                                <li className="flex items-center gap-2 truncate"><FileJson className="w-4 h-4 text-meebot-primary/70 shrink-0"/>Token URI: <span className="font-mono text-meebot-text-primary truncate">{bot.tokenURI}</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:w-2/3 flex flex-col gap-4">
                        <div className="p-4 bg-meebot-bg rounded-lg">
                             <h4 className="font-bold text-meebot-primary mb-3">Attributes</h4>
                             <div className="grid grid-cols-2 gap-3">
                                {bot.attributes.map(attr => (
                                    <div key={attr.trait_type} className="p-2 border border-meebot-border rounded-md">
                                        <p className="text-xs text-meebot-text-secondary">{attr.trait_type}</p>
                                        <p className="font-semibold text-white capitalize">{attr.value}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                         <div className="p-4 bg-meebot-bg rounded-lg">
                            <h4 className="font-bold text-meebot-primary mb-3 flex items-center gap-2">
                                <FileArchive className="w-5 h-5"/>
                                Related Governance Proposals
                            </h4>
                            {isLoadingProposals ? (
                                <ul className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                         <li key={i} className="p-3 bg-meebot-surface border border-meebot-border rounded-md">
                                             <div className="flex justify-between mb-2">
                                                 <Skeleton className="h-4 w-1/2" />
                                                 <Skeleton className="h-4 w-16 rounded-full" />
                                             </div>
                                             <Skeleton className="h-3 w-full mb-1" />
                                             <Skeleton className="h-3 w-3/4 mb-3" />
                                             <div className="flex gap-2">
                                                 <Skeleton className="h-8 w-full rounded" />
                                                 <Skeleton className="h-8 w-full rounded" />
                                             </div>
                                         </li>
                                    ))}
                                </ul>
                            ) : relatedProposals.length === 0 ? (
                                <p className="text-sm text-meebot-text-secondary text-center py-4">No proposals are directly related to this MeeBot.</p>
                            ) : (
                                <ul className="space-y-3">
                                {relatedProposals.map(p => {
                                    const isProcessing = processingIds.has(p.id);
                                    return (
                                        <li key={p.id} className="p-3 bg-meebot-surface border border-meebot-border rounded-md relative overflow-hidden">
                                            {isProcessing && <div className="absolute inset-0 bg-meebot-surface/80 flex items-center justify-center"><LoaderCircle className="w-6 h-6 animate-spin text-meebot-primary"/></div>}
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-semibold text-white pr-4">{p.title}</h5>
                                                {p.source === 'onchain' ? (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getChainTagStyle(p.chainName)}`}>{p.chainName}</span>
                                                ) : (
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize bg-gray-500/10 text-gray-300`}>{p.status}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-meebot-text-secondary mt-1 mb-3">{p.description}</p>
                                            
                                            {p.source === 'onchain' ? (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2 text-center">
                                                        <div className="bg-meebot-bg p-1 rounded-md">
                                                            <p className="text-xs text-green-400">Yes</p>
                                                            <p className="text-lg font-bold text-white">{p.voteYes}</p>
                                                        </div>
                                                        <div className="bg-meebot-bg p-1 rounded-md">
                                                            <p className="text-xs text-red-400">No</p>
                                                            <p className="text-lg font-bold text-white">{p.voteNo}</p>
                                                        </div>
                                                    </div>
                                                    {!p.executed && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleVote(p.id, true)} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-50 transition-colors">
                                                                <ThumbsUp className="w-4 h-4" /> Yes
                                                            </button>
                                                            <button onClick={() => handleVote(p.id, false)} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50 transition-colors">
                                                                <ThumbsDown className="w-4 h-4" /> No
                                                            </button>
                                                        </div>
                                                    )}
                                                     {p.executed && <div className="text-center text-sm font-semibold text-green-400 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4"/>Executed</div>}
                                                    <div className="flex justify-between items-center text-xs text-meebot-text-secondary pt-2 border-t border-meebot-border/50">
                                                        <div className="flex items-center gap-1">
                                                            <Server className="w-3 h-3 text-meebot-primary"/> On-Chain
                                                        </div>
                                                        <a href={getExplorerLink(p).url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-meebot-primary transition-colors">
                                                           View on {getExplorerLink(p).name} <ExternalLink className="w-3 h-3"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center text-xs text-meebot-text-secondary pt-2 border-t border-meebot-border/50">
                                                    <div className="flex items-center gap-1">
                                                       <BrainCircuit className="w-3 h-3 text-meebot-accent"/> Off-Chain
                                                    </div>
                                                    <a href={getFirestoreLink(p.id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-meebot-primary transition-colors">
                                                        View in Firestore <ExternalLink className="w-3 h-3"/>
                                                    </a>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                                </ul>
                            )}
                        </div>
                        <div className="p-4 bg-meebot-bg rounded-lg flex-grow flex flex-col">
                             <h4 className="font-bold text-meebot-primary mb-3">Memory Log</h4>
                             <ul className="space-y-3 flex-grow overflow-y-auto pr-2">
                                {bot.memory.map(event => (
                                    <li key={`${event.timestamp}-${event.message}`} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-meebot-surface rounded-full flex items-center justify-center mt-1">
                                            <TimelineIcon type={event.type} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-meebot-text-primary">{event.message}</p>
                                            <p className="text-xs text-meebot-text-secondary">{new Date(event.timestamp).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MeeBotCard: React.FC<{ bot: MeeBotMetadata, onViewDNA: () => void }> = ({ bot, onViewDNA }) => {
  const handleViewTx = () => {
    alert(`Viewing transaction on a simulated block explorer:\n\nChain: ${bot.chainName}\nTransaction Hash: ${bot.txHash}\nToken URI: ${bot.tokenURI}`);
  };
  
  const emotionAttribute = bot.attributes.find(a => a.trait_type === 'Emotion');

  return (
    <div className="bg-meebot-surface border border-meebot-border rounded-lg overflow-hidden transition-all duration-300 hover:border-meebot-primary hover:shadow-2xl hover:shadow-meebot-primary/20 animate-fade-in flex flex-col">
      <img
        src={resolveIPFS(bot.image)}
        alt={`Visualization of ${bot.soul_prompt}`}
        className="w-full h-48 object-cover bg-black/20"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2 gap-2">
            <span className="inline-block bg-meebot-accent/90 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
              {bot.persona}
            </span>
             <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded-full font-semibold">Sandbox Soul</span>
            </div>
        </div>

        <div className="flex justify-between items-center mb-2">
             <p className="font-bold text-lg text-white">{bot.name}</p>
             <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getChainTagStyle(bot.chainName)}`}>
                  {bot.chainName}
              </span>
        </div>
        
        <p className="text-sm text-meebot-text-secondary leading-tight flex-grow mb-3 italic">"{bot.soul_prompt}"</p>
        
        {emotionAttribute && (
            <div className="mb-4 text-xs text-meebot-text-secondary">
                Feeling: <strong className="capitalize text-meebot-text-primary">{emotionAttribute.value}</strong>
            </div>
        )}
        
        {bot.miningGift && (
            <div className="p-3 mb-4 text-xs bg-meebot-bg rounded-lg">
                <div className="flex items-center font-bold text-green-400 mb-1">
                    <Gift className="w-4 h-4 mr-2"/>
                    <span>Inaugural Gift</span>
                </div>
                <p className="text-green-300/80">{bot.miningGift.program} ({bot.miningGift.boost})</p>
            </div>
        )}

        <div className="mt-auto pt-3 border-t border-meebot-border/50 grid grid-cols-2 gap-2 text-sm">
           <button onClick={handleViewTx} className="w-full text-center px-3 py-2 bg-meebot-bg hover:bg-meebot-primary/20 text-meebot-primary rounded-md transition-colors">
            View Transaction
           </button>
           <button onClick={onViewDNA} className="w-full text-center px-3 py-2 bg-meebot-bg hover:bg-meebot-accent/20 text-meebot-accent rounded-md transition-colors">
            View DNA
           </button>
        </div>
      </div>
       <div className="px-4 py-2 bg-black/20 flex items-center justify-center text-xs text-meebot-text-secondary/70 border-t border-meebot-border/50">
          <Bot className="w-3 h-3 mr-1.5 text-meebot-primary/70" />
          <span>Powered by MEECHAIN</span>
      </div>
    </div>
  );
};


export const HallOfOriginsPage: React.FC = () => {
  const { meebots } = useMeeBots();
  const [chainFilter, setChainFilter] = useState<'All' | 'Sepolia' | 'Fuse' | 'BNB'>('All');
  const [selectedBot, setSelectedBot] = useState<MeeBotMetadata | null>(null);

  const filteredBots = useMemo(() => {
    if (chainFilter === 'All') return meebots;
    return meebots.filter(bot => bot.chainName === chainFilter);
  }, [meebots, chainFilter]);

  const filterOptions: ('All' | 'Sepolia' | 'Fuse' | 'BNB')[] = ['All', 'Sepolia', 'Fuse', 'BNB'];

  return (
    <div className="p-4 md:p-8 animate-fade-in">
       {selectedBot && <DNAViewer bot={selectedBot} onClose={() => setSelectedBot(null)} />}
       <div className="flex items-center mb-4">
        <Sparkles className="w-10 h-10 text-meebot-primary mr-4" />
        <div>
          <h1 className="text-4xl font-bold text-white">Hall of Origins</h1>
          <p className="text-meebot-text-secondary mt-1">
            A gallery of all MeeBots ever brought into existence.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-8">
        {filterOptions.map(option => {
            const isActive = chainFilter === option;
            return (
                <button
                    key={option}
                    onClick={() => setChainFilter(option)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                        isActive 
                        ? 'bg-meebot-primary text-meebot-bg' 
                        : 'bg-meebot-surface text-meebot-text-secondary hover:bg-meebot-border hover:text-meebot-text-primary'
                    }`}
                >
                    {option}
                </button>
            )
        })}
      </div>


      {filteredBots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBots.map(bot => (
            <MeeBotCard key={bot.id} bot={bot} onViewDNA={() => setSelectedBot(bot)} />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center h-64 text-center bg-meebot-surface border-2 border-dashed rounded-lg border-meebot-border text-meebot-text-secondary">
            <p className="text-lg">No MeeBots found for this network.</p>
            <p>Go to the Genesis page or change the filter.</p>
        </div>
      )}
    </div>
  );
};
