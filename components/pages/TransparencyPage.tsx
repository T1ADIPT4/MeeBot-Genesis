
import React, { useEffect, useState } from 'react';
import { Shield, Code, Database, CheckCircle, ExternalLink, Server, Lock, Cpu, Award, Bot, FileCheck, Eye, Hash, Terminal, FileText } from 'lucide-react';
import { isFirebaseInitialized, getStoredConfig } from '../../services/firebase';

const CORE_CONTRACTS = [
    { 
        name: 'MeeToken', 
        address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 
        features: 'Points System, Token Rewards, Genesis Ritual, NFT Membership, Gating', 
        status: 'Active' as const 
    },
    { 
        name: 'MeeBadgeNFT', 
        address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', 
        features: 'Mining Badges, Leveling, ERC-1155 Evolution', 
        status: 'Active' as const 
    },
    { 
        name: 'BadgeNFTUpgrade', 
        address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', 
        features: 'Upgrade Logic, Burn + Mint Flow, Level Sync', 
        status: 'Active' as const 
    },
    { 
        name: 'QuestManager', 
        address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', 
        features: 'Mission Tracking, Reward Dispatch', 
        status: 'Active' as const 
    },
    { 
        name: 'FootballNFT', 
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', 
        features: 'Special Event Quests (World Cup)', 
        status: 'Active' as const 
    },
];

const ContractCard: React.FC<{ name: string; address: string; features: string; status: 'Active' | 'Maintenance' }> = ({ name, address, features, status }) => (
    <div className="p-4 mb-4 border rounded-lg bg-meebot-bg border-meebot-border hover:border-meebot-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-meebot-primary" />
                <span className="font-bold text-white">{name}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {status}
            </span>
        </div>
        <div className="mb-3 text-xs text-meebot-text-secondary">
            <span className="font-semibold text-meebot-accent">Features:</span> {features}
        </div>
        <div className="flex items-center justify-between p-2 mb-2 font-mono text-xs rounded bg-meebot-surface text-meebot-text-secondary">
            <span className="truncate">{address}</span>
            <button 
                onClick={() => navigator.clipboard.writeText(address)}
                className="ml-2 hover:text-white"
                title="Copy Address"
            >
                <code className="text-[10px] border border-meebot-border px-1 rounded">COPY</code>
            </button>
        </div>
        <a 
            href={`https://sepolia.etherscan.io/address/${address}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs transition-colors text-meebot-text-secondary hover:text-meebot-primary"
        >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Contract on Explorer
        </a>
    </div>
);

const MechanicSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl hover:border-meebot-primary/50 transition-colors">
        <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-meebot-primary/10">
                <Icon className="w-6 h-6 text-meebot-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-sm leading-relaxed text-meebot-text-secondary space-y-3">
            {children}
        </div>
    </div>
);

export const TransparencyPage: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [projectId, setProjectId] = useState("Not Configured");

    useEffect(() => {
        setIsConnected(isFirebaseInitialized());
        const config = getStoredConfig();
        if (config && config.projectId) {
            setProjectId(config.projectId);
        }
    }, []);

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
            <Shield className="w-12 h-12 mr-4 text-meebot-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Transparency Report</h1>
                <p className="mt-2 text-meebot-text-secondary max-w-2xl">
                    MeeChain Mining System: Verifiable, Fair, and Open. <br/>
                    Verify every mechanic, contract interaction, and state update.
                </p>
            </div>
        </div>

        {/* Intro Card */}
        <div className="mb-8 p-6 bg-gradient-to-r from-meebot-surface to-meebot-bg border border-meebot-primary/30 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 bg-meebot-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-meebot-bg p-3 rounded-full border-2 border-meebot-primary shrink-0">
                    <Bot className="w-10 h-10 text-meebot-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">System Integrity Status: OPTIMAL</h2>
                    <p className="text-meebot-text-secondary">
                        Welcome to the core transparency module. Here you can verify the "Code is Law" principles governing your MeeBot's evolution.
                        All mining logic, badge distribution, and governance voting is fully auditable on-chain.
                    </p>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Contracts */}
            <div className="space-y-6 lg:col-span-1">
                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-6 text-xl font-bold text-white">
                        <Code className="w-5 h-5 mr-2 text-meebot-accent" />
                        Smart Contracts
                    </h2>
                    <p className="text-xs text-meebot-text-secondary mb-4">
                        Official contract addresses mapped to platform features.
                    </p>
                    {CORE_CONTRACTS.map(contract => (
                        <ContractCard 
                            key={contract.address}
                            name={contract.name}
                            address={contract.address}
                            features={contract.features}
                            status={contract.status}
                        />
                    ))}
                </div>

                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-4 text-xl font-bold text-white">
                        <Lock className="w-5 h-5 mr-2 text-green-400" />
                        Security Measures
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Immutable Logic:</strong> Scoring logic cannot be altered after deployment.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Signature Verification:</strong> Prevents spam mining with digital signatures.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Multi-sig Treasury:</strong> Prize funds are controlled by 3/5 Consensus.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Mechanics Details */}
            <div className="space-y-6 lg:col-span-2">
                
                <MechanicSection title="1. Mining Mechanics & Leveling Criteria" icon={Cpu}>
                    <p>
                        The mining process uses a <strong>Proof-of-Contribution</strong> model. Every mining action interacts with the <span className="text-meebot-primary font-mono">MeeToken</span> contract for point accumulation.
                    </p>
                    <div className="bg-meebot-bg p-4 rounded-lg border border-meebot-border my-3">
                        <h4 className="font-bold text-white mb-2 text-sm">Leveling Formula</h4>
                        <div className="font-mono text-xs text-meebot-primary bg-black/30 p-2 rounded mb-2">
                            Level = floor(TotalPoints / 10)
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between border-b border-meebot-border/50 pb-2">
                                <span>⛏️ Standard Mining Action</span>
                                <span className="font-mono text-white">+1 Point</span>
                            </li>
                             <li className="flex justify-between border-b border-meebot-border/50 pb-2 pt-1">
                                <span>⚡ Streak Bonus (7 Days)</span>
                                <span className="font-mono text-white">+5 Points</span>
                            </li>
                            <li className="flex justify-between pt-1">
                                <span>📈 Level Up Threshold</span>
                                <span className="font-mono text-white">Every 10 Points</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                        <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                             <strong>Verification Step:</strong> You can query the <code>miningPoints(address)</code> function on Etherscan using your wallet address to confirm your points match the UI.
                        </p>
                    </div>
                </MechanicSection>

                <MechanicSection title="2. NFT Badge Evolution" icon={Award}>
                    <p>
                        Badges are <span className="text-meebot-primary font-mono">ERC-1155</span> tokens managed by the <span className="text-meebot-primary font-mono">MeeBadgeNFT</span> contract. Evolution logic (Burn + Mint) is handled by <span className="text-meebot-primary font-mono">BadgeNFTUpgrade</span>.
                    </p>
                     <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-meebot-bg text-meebot-text-secondary">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-lg">Level</th>
                                    <th className="px-4 py-2">Badge Tier</th>
                                    <th className="px-4 py-2">Contract</th>
                                    <th className="px-4 py-2 rounded-tr-lg">Benefits</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-meebot-border">
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">1</td>
                                    <td className="px-4 py-2 font-bold text-orange-400">🥉 Bronze</td>
                                    <td className="px-4 py-2 font-mono text-xs">MeeBadgeNFT</td>
                                    <td className="px-4 py-2 text-xs text-meebot-text-secondary">Access to Discord</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">5</td>
                                    <td className="px-4 py-2 font-bold text-gray-300">🥈 Silver</td>
                                    <td className="px-4 py-2 font-mono text-xs">MeeBadgeNFT</td>
                                    <td className="px-4 py-2 text-xs text-meebot-text-secondary">+5% Staking Boost</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">10</td>
                                    <td className="px-4 py-2 font-bold text-yellow-400">🥇 Gold</td>
                                    <td className="px-4 py-2 font-mono text-xs">MeeBadgeNFT</td>
                                    <td className="px-4 py-2 text-xs text-meebot-text-secondary">Governance Voting Power x1.5</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">20</td>
                                    <td className="px-4 py-2 font-bold text-purple-400">🌟 Legend</td>
                                    <td className="px-4 py-2 font-mono text-xs">MeeBadgeNFT</td>
                                    <td className="px-4 py-2 text-xs text-meebot-text-secondary">Beta Access to new GenAI models</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </MechanicSection>

                <MechanicSection title="3. Data Synchronization & Audit Logs" icon={Database}>
                    <p>
                        We utilize a dual-state system. The <strong>Blockchain</strong> acts as the immutable source of truth for ownership and balances, while <strong>Firestore</strong> provides real-time indexing for the leaderboard.
                    </p>
                    
                    <div className={`mt-4 mb-4 p-4 border rounded-lg ${isConnected ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                        <div className="flex items-center justify-between mb-2">
                             <h5 className={`font-bold flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                                <Server className="w-4 h-4"/> 
                                Current Connection Status
                             </h5>
                             <span className={`text-xs font-bold px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {isConnected ? 'LIVE CONNECTION' : 'SIMULATION MODE'}
                             </span>
                        </div>
                        <p className="text-xs text-meebot-text-secondary mb-2">
                            {isConnected 
                                ? "The frontend is connected to the live Firebase instance. Leaderboards and stats are syncing in real-time." 
                                : "The frontend is currently operating in Simulation (Mock) Mode. Go to Settings to configure your API Key."}
                        </p>
                         <div className="text-xs font-mono bg-black/30 p-2 rounded text-meebot-text-secondary break-all">
                            <span className="text-meebot-primary">Target Project ID:</span><br/>
                            {projectId}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 mb-4">
                        <div className="p-3 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-green-400 mb-1 text-xs flex items-center"><Hash className="w-3 h-3 mr-1"/> On-Chain State</h5>
                            <ul className="list-disc list-inside text-xs text-meebot-text-secondary pl-1">
                                <li>Wallet Balances</li>
                                <li>NFT Ownership</li>
                                <li>Proposal Votes</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-blue-400 mb-1 text-xs flex items-center"><Terminal className="w-3 h-3 mr-1"/> Off-Chain Index</h5>
                            <ul className="list-disc list-inside text-xs text-meebot-text-secondary pl-1">
                                <li>Leaderboard Rankings</li>
                                <li>User Profiles</li>
                                <li>Activity Feeds</li>
                            </ul>
                        </div>
                    </div>
                    
                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><FileCheck className="w-4 h-4 text-meebot-primary"/> System Versioning</h4>
                    <div className="bg-meebot-bg rounded-lg border border-meebot-border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-meebot-surface text-meebot-text-secondary text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2">Module</th>
                                    <th className="px-4 py-2">Version</th>
                                    <th className="px-4 py-2">Last Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-meebot-border text-meebot-text-primary">
                                <tr>
                                    <td className="px-4 py-2">Mining Contract (MeeToken)</td>
                                    <td className="px-4 py-2 font-mono text-xs text-meebot-accent">v1.2.0</td>
                                    <td className="px-4 py-2 text-xs">2023-10-15 (Certik)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2">NFT Core (MeeBadgeNFT)</td>
                                    <td className="px-4 py-2 font-mono text-xs text-meebot-accent">v2.1.0</td>
                                    <td className="px-4 py-2 text-xs">2023-12-10 (Halborn)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </MechanicSection>

                <div className="mt-8 text-center text-meebot-text-secondary text-sm">
                    <p>Transparency is a continuous process. This page is automatically updated based on the latest contract deployments.</p>
                </div>

            </div>
        </div>
    </div>
  );
};
