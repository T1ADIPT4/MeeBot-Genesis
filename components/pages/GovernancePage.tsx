import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Landmark, PlusCircle, LoaderCircle, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Hammer, BrainCircuit, HardHat, Server, X, BarChart2, ExternalLink } from 'lucide-react';
import { fetchAllProposals, UnifiedProposal } from '../../services/unifiedProposalService';
import * as onChainService from '../../services/onChainProposalService';
import { Skeleton } from '../Skeleton';

type ChainFilter = 'All' | 'Sepolia' | 'Fuse' | 'BNB';
type OnChainNetwork = 'Sepolia' | 'Fuse' | 'BNB';


const getChainTagStyle = (chainName?: string) => {
    switch (chainName) {
        case 'Sepolia': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'Fuse': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'BNB': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
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

const CreateProposalModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedChain, setSelectedChain] = useState<OnChainNetwork>('Sepolia');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }
        setIsCreating(true);
        setError('');
        try {
            await onChainService.createProposal(title, description, selectedChain);
            onSuccess();
        } catch (err) {
            setError('Failed to create proposal. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in" onClick={onClose}>
            <div className="bg-meebot-surface p-6 rounded-lg w-full max-w-lg border border-meebot-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Create On-Chain Proposal</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-meebot-bg"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="prop-title" className="block text-sm font-medium text-meebot-text-secondary mb-1">Title</label>
                        <input id="prop-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="prop-desc" className="block text-sm font-medium text-meebot-text-secondary mb-1">Description</label>
                        <textarea id="prop-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="prop-chain" className="block text-sm font-medium text-meebot-text-secondary mb-1">Destination Chain</label>
                        <select id="prop-chain" value={selectedChain} onChange={e => setSelectedChain(e.target.value as OnChainNetwork)} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-md">
                            <option value="Sepolia">Sepolia</option>
                            <option value="Fuse">Fuse</option>
                            <option value="BNB">BNB Chain</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-meebot-border">Cancel</button>
                        <button type="submit" disabled={isCreating} className="px-4 py-2 rounded-md bg-meebot-primary text-white flex items-center disabled:bg-meebot-text-secondary">
                            {isCreating && <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/>}
                            {isCreating ? 'Submitting...' : 'Submit Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const OffChainProposalCard: React.FC<{ proposal: Extract<UnifiedProposal, { source: 'offchain' }> }> = ({ proposal }) => {
    const statusStyles = {
        approved: 'text-green-400 bg-green-500/10',
        pending: 'text-yellow-400 bg-yellow-500/10',
        rejected: 'text-red-400 bg-red-500/10',
    };
    
    return (
        <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white pr-4 line-clamp-2">{proposal.title}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize shrink-0 ${statusStyles[proposal.status]}`}>{proposal.status}</span>
            </div>
            <p className="text-sm text-meebot-text-secondary mb-3 line-clamp-3 flex-grow">{proposal.description}</p>
            <div className="text-xs text-meebot-text-secondary/80 flex justify-between items-center pt-2 border-t border-meebot-border/50 mt-auto">
                <span>{new Date(proposal.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-meebot-bg border border-meebot-border">
                    <BrainCircuit className="w-3 h-3 text-meebot-accent"/>
                    <span>Off-Chain</span>
                </div>
            </div>
        </div>
    );
};

const OnChainProposalCard: React.FC<{
    proposal: Extract<UnifiedProposal, { source: 'onchain' }>;
    onVote: (id: string, support: boolean) => void;
    onExecute: (id: string) => void;
    isProcessing: (id: string) => boolean;
}> = ({ proposal, onVote, onExecute, isProcessing }) => {
    const canExecute = proposal.voteYes > proposal.voteNo && !proposal.executed;
    
    return (
         <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 animate-fade-in relative overflow-hidden h-full flex flex-col">
            {isProcessing(proposal.id) && <div className="absolute inset-0 bg-meebot-surface/80 flex items-center justify-center z-10"><LoaderCircle className="w-6 h-6 animate-spin text-meebot-primary"/></div>}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white pr-4 line-clamp-2">{proposal.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border shrink-0 ${getChainTagStyle(proposal.chainName)}`}>{proposal.chainName}</span>
            </div>
            <p className="text-sm text-meebot-text-secondary mb-3 line-clamp-3 flex-grow">{proposal.description}</p>
            
             <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                <div className="bg-meebot-bg p-2 rounded-md">
                    <p className="text-xs text-green-400">Yes Votes</p>
                    <p className="text-xl font-bold text-white">{proposal.voteYes}</p>
                </div>
                <div className="bg-meebot-bg p-2 rounded-md">
                    <p className="text-xs text-red-400">No Votes</p>
                    <p className="text-xl font-bold text-white">{proposal.voteNo}</p>
                </div>
            </div>
            
            <div className="flex gap-2 mb-3 mt-auto">
                <button
                    onClick={() => onVote(proposal.id, true)}
                    disabled={proposal.executed || isProcessing(proposal.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ThumbsUp className="w-4 h-4" /> Vote Yes
                </button>
                 <button
                    onClick={() => onVote(proposal.id, false)}
                    disabled={proposal.executed || isProcessing(proposal.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                     <ThumbsDown className="w-4 h-4" /> Vote No
                </button>
            </div>
            {canExecute && (
                 <button
                    onClick={() => onExecute(proposal.id)}
                    disabled={isProcessing(proposal.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-meebot-primary/20 text-meebot-primary hover:bg-meebot-primary/30 disabled:opacity-50 transition-colors mb-3"
                 >
                    <Hammer className="w-4 h-4" /> Execute Proposal
                 </button>
            )}

            <div className="text-xs text-meebot-text-secondary/80 flex justify-between items-center pt-2 border-t border-meebot-border/50">
                <span>{new Date(proposal.createdAt).toLocaleString()}</span>
                <a href={getExplorerLink(proposal).url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-meebot-primary transition-colors">
                    View on {getExplorerLink(proposal).name} <ExternalLink className="w-3 h-3"/>
                </a>
            </div>
             {proposal.executed && <div className="mt-2 text-center text-sm font-semibold text-green-400 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4"/>Executed</div>}
        </div>
    );
};

const GovernanceStats: React.FC<{proposals: UnifiedProposal[]}> = ({ proposals }) => {
    const stats = useMemo(() => {
        const onChain = proposals.filter(p => p.source === 'onchain');
        const offChain = proposals.filter(p => p.source === 'offchain');
        const byChain = onChain.reduce((acc, p) => {
            const chain = (p as Extract<UnifiedProposal, { source: 'onchain' }>).chainName;
            acc[chain] = (acc[chain] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: proposals.length,
            onChain: onChain.length,
            offChain: offChain.length,
            sepolia: byChain['Sepolia'] || 0,
            fuse: byChain['Fuse'] || 0,
            bnb: byChain['BNB'] || 0,
        }
    }, [proposals]);

    const chartData = [
        { name: 'Sepolia', count: stats.sepolia, color: 'bg-blue-500' },
        { name: 'Fuse', count: stats.fuse, color: 'bg-green-500' },
        { name: 'BNB', count: stats.bnb, color: 'bg-yellow-500' },
    ];
    const maxCount = Math.max(...chartData.map(d => d.count), 1);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-meebot-surface border border-meebot-border rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                <h3 className="text-sm font-medium text-meebot-text-secondary">Total Proposals</h3>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <div className="flex text-xs mt-1">
                    <span className="text-green-400 mr-2">{stats.onChain} On-Chain</span>
                    <span className="text-yellow-400">{stats.offChain} Off-Chain</span>
                </div>
            </div>
            <div className="p-4 bg-meebot-surface border border-meebot-border rounded-lg col-span-1 md:col-span-2 lg:col-span-3">
                 <h3 className="text-sm font-medium text-meebot-text-secondary mb-2 flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Network Activity</h3>
                 <div className="flex gap-4 h-24 items-end">
                    {chartData.map(item => (
                        <div key={item.name} className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-white font-bold">{item.count}</div>
                            <div
                                className={`w-full rounded-t-sm ${item.color}`}
                                style={{ height: `${(item.count / maxCount) * 100}%` }}
                                title={`${item.name}: ${item.count} proposals`}
                            ></div>
                            <div className="text-xs text-meebot-text-secondary mt-1">{item.name}</div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )
}

// --- Skeletons ---

const ProposalSkeleton = () => (
  <div className="bg-meebot-surface border border-meebot-border rounded-lg p-4 h-full">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-6" />
    <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
         <Skeleton className="h-12 rounded-md" />
         <Skeleton className="h-12 rounded-md" />
    </div>
    <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
    </div>
    <div className="pt-2 mt-2 border-t border-meebot-border/50 flex justify-between">
         <Skeleton className="h-3 w-1/3" />
         <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-meebot-surface border border-meebot-border rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="p-4 bg-meebot-surface border border-meebot-border rounded-lg col-span-1 md:col-span-2 lg:col-span-3">
             <Skeleton className="h-4 w-1/4 mb-4" />
             <div className="flex gap-4 h-24 items-end">
                 {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="w-full rounded-t-sm h-1/2" />)}
             </div>
        </div>
    </div>
);


export const GovernancePage: React.FC = () => {
    const [proposals, setProposals] = useState<UnifiedProposal[]>([]);
    const [chainFilter, setChainFilter] = useState<ChainFilter>('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const loadProposals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllProposals(chainFilter);
            setProposals(data);
        } catch (error) {
            console.error("Failed to load proposals:", error);
        } finally {
            setIsLoading(false);
        }
    }, [chainFilter]);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);

    const handleVote = async (id: string, support: boolean) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            await onChainService.voteOnProposal(id, support);
            await loadProposals(); // Refresh data
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleExecute = async (id: string) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            await onChainService.executeProposal(id);
            await loadProposals(); // Refresh data
        } catch (e) {
             alert((e as Error).message);
        } finally {
             setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };
    
    const filterOptions: ChainFilter[] = ['All', 'Sepolia', 'Fuse', 'BNB'];

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            {isModalOpen && <CreateProposalModal onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); loadProposals(); }} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <Landmark className="w-10 h-10 text-meebot-accent mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Governance Hub</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            Decentralized decision making for the MeeChain ecosystem.
                        </p>
                    </div>
                </div>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 shadow-lg">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Proposal
                </button>
            </div>

            {isLoading ? <StatsSkeleton /> : <GovernanceStats proposals={proposals} />}

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {filterOptions.map(option => (
                     <button
                        key={option}
                        onClick={() => setChainFilter(option)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                            chainFilter === option 
                            ? 'bg-meebot-primary text-meebot-bg' 
                            : 'bg-meebot-surface text-meebot-text-secondary hover:bg-meebot-border hover:text-meebot-text-primary'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {Array.from({ length: 6 }).map((_, i) => <ProposalSkeleton key={i} />)}
                </div>
            ) : proposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proposals.map(proposal => (
                        <div key={proposal.id} className="h-full">
                            {proposal.source === 'onchain' ? (
                                <OnChainProposalCard 
                                    proposal={proposal} 
                                    onVote={handleVote} 
                                    onExecute={handleExecute}
                                    isProcessing={(id) => processingIds.has(id)}
                                />
                            ) : (
                                <OffChainProposalCard proposal={proposal} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-meebot-surface border border-dashed border-meebot-border rounded-lg text-meebot-text-secondary">
                    <p>No proposals found for this filter.</p>
                </div>
            )}
        </div>
    );
};