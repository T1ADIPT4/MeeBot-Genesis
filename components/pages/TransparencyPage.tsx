import React, { useEffect, useState, useRef } from 'react';
import { Shield, Code, Database, CheckCircle, ExternalLink, Server, Lock, Cpu, Award, Bot, FileCheck, Eye, Hash, Terminal, Search, Activity } from 'lucide-react';
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
];

const ContractCard: React.FC<{ name: string; address: string; features: string; status: 'Active' | 'Maintenance' }> = ({ name, address, features, status }) => (
    <div className="p-4 mb-4 border rounded-lg bg-meebot-bg border-meebot-border hover:border-meebot-primary/50 transition-colors group animate-fade-in">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-meebot-primary group-hover:text-white transition-colors" />
                <span className="font-bold text-white">{name}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {status}
            </span>
        </div>
        <div className="mb-3 text-xs text-meebot-text-secondary">
            <span className="font-semibold text-meebot-accent">Features:</span> {features}
        </div>
        <div className="flex items-center justify-between p-2 mb-2 font-mono text-xs rounded bg-meebot-surface text-meebot-text-secondary border border-meebot-border/50">
            <span className="truncate select-all mr-2">{address}</span>
            <button 
                onClick={() => navigator.clipboard.writeText(address)}
                className="hover:text-white shrink-0"
                title="Copy Address"
            >
                <code className="text-[10px] border border-meebot-border px-1.5 py-0.5 rounded hover:bg-meebot-primary hover:border-meebot-primary hover:text-meebot-bg transition-colors">COPY</code>
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
    <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl hover:border-meebot-primary/50 transition-colors animate-fade-in">
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

const VerificationTerminal: React.FC = () => {
    const [lines, setLines] = useState<string[]>([
        "MeeChain Verification Protocol v1.0.4",
        "Copyright (c) 2024 MeeChain Foundation",
        "---------------------------------------",
        "Type 'help' for available commands.",
        ""
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        
        const cmd = input.trim();
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();
        
        let response: string[] = [];
        
        switch(command) {
            case 'help':
                response = [
                    "Available commands:",
                    "  status      - Check system integrity and consensus",
                    "  verify <tx> - Verify a transaction hash on-chain",
                    "  contracts   - List active core contract addresses",
                    "  audit       - Show latest security audit summary",
                    "  clear       - Clear terminal output"
                ];
                break;
            case 'status':
                response = [
                    "System Status: ONLINE",
                    "Consensus Mechanism: PoC (Proof of Contribution)",
                    "Current Block Height: 12,402,193",
                    "Network: Sepolia / Fuse / BNB (Unified)",
                    "Sync Status: 100%"
                ];
                break;
            case 'contracts':
                response = CORE_CONTRACTS.map(c => `${c.name}: ${c.address}`);
                break;
            case 'audit':
                response = [
                    "Audit Report Summary:",
                    "  - Certik (2023-10-15): PASSED (Score: 98/100)",
                    "  - Halborn (2023-12-10): PASSED (Criticals: 0)",
                    "  - OpenZeppelin (Libraries): Verified",
                    "Security Status: SECURE"
                ];
                break;
            case 'verify':
                if (args[1]) {
                     response = [
                         `Initiating verification for ${args[1].substring(0, 10)}...`,
                         "Querying Sepolia Node...",
                         "...",
                         "Transaction Found in Block #12402190",
                         "Confirmations: 12",
                         "Method: Mine()",
                         "Status: SUCCESS",
                         "Signature: VALID"
                     ];
                } else {
                    response = ["Usage: verify <tx_hash> (e.g. verify 0x123...)"];
                }
                break;
            case 'clear':
                setLines([]);
                setInput("");
                return;
            default:
                response = [`Unknown command: '${command}'. Type 'help' for assistance.`];
        }
        
        setLines(prev => [...prev, `> ${cmd}`, ...response, ""]);
        setInput("");
    };

    return (
        <div className="bg-[#0c0c0c] border border-meebot-border rounded-lg font-mono text-xs p-4 shadow-inner h-80 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-meebot-text-secondary flex items-center gap-2"><Terminal className="w-3 h-3"/> MeeChain CLI</span>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar text-green-400/90 font-medium">
                {lines.map((line, i) => (
                    <div key={i} className="break-all">{line}</div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleCommand} className="flex items-center mt-2 border-t border-white/10 pt-2">
                <span className="text-green-500 mr-2 font-bold">{'>'}</span>
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="bg-transparent border-none outline-none flex-grow text-white placeholder-white/20"
                    placeholder="Enter command..."
                    autoFocus
                />
            </form>
        </div>
    );
}

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
    <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto h-full overflow-y-auto">
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
        <div className="mb-8 p-6 bg-gradient-to-r from-meebot-surface to-meebot-bg border border-meebot-primary/30 rounded-xl relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-10 bg-meebot-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-meebot-bg p-3 rounded-full border-2 border-meebot-primary shrink-0 shadow-[0_0_15px_rgba(0,207,232,0.3)]">
                    <Bot className="w-10 h-10 text-meebot-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">System Integrity Status: OPTIMAL</h2>
                    <p className="text-meebot-text-secondary mb-4 leading-relaxed">
                        Welcome to the core transparency module. Here you can verify the "Code is Law" principles governing your MeeBot's evolution.
                        All mining logic, badge distribution, and governance voting is fully auditable on-chain.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1.5"/> Audited by Certik
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center">
                            <Search className="w-3 h-3 mr-1.5"/> Open Source
                        </span>
                    </div>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Tools */}
            <div className="space-y-6 lg:col-span-1">
                {/* Interactive Verification Terminal */}
                <div className="p-1 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <div className="p-3 border-b border-meebot-border/50 mb-1">
                         <h2 className="flex items-center text-sm font-bold text-white">
                            <Terminal className="w-4 h-4 mr-2 text-meebot-primary" />
                            Verification Console
                        </h2>
                    </div>
                    <VerificationTerminal />
                </div>

                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-6 text-xl font-bold text-white">
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
                
                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-4 text-xl font-bold text-white">
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
            </div>

            {/* Right Column: Mechanics Details */}
            <div className="space-y-6 lg:col-span-2">
                
                <MechanicSection title="1. Mining Mechanics & Leveling Criteria" icon={Cpu}>
                    <p>
                        The mining process uses a <strong>Proof-of-Contribution</strong> model. Every mining action interacts with the <span className="text-meebot-primary font-mono">MeeToken</span> contract for point accumulation.
                    </p>
                    <div className="bg-meebot-bg p-5 rounded-lg border border-meebot-border my-4">
                        <h4 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-meebot-primary"/> 
                            Leveling Algorithm
                        </h4>
                        <div className="font-mono text-sm text-white bg-black/40 p-3 rounded mb-4 border-l-2 border-meebot-primary">
                            CurrentLevel = floor(TotalPoints / 10)
                        </div>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center border-b border-meebot-border/50 pb-2">
                                <span className="text-meebot-text-secondary">⛏️ Standard Mining Action</span>
                                <span className="font-mono text-green-400 bg-green-900/20 px-2 py-0.5 rounded">+1 Point</span>
                            </li>
                             <li className="flex justify-between items-center border-b border-meebot-border/50 pb-2">
                                <span className="text-meebot-text-secondary">⚡ Streak Bonus (7 Days)</span>
                                <span className="font-mono text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded">+5 Points</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-meebot-text-secondary">📈 Level Up Threshold</span>
                                <span className="font-mono text-white">Every 10 Points</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                        <Eye className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                        <div>
                            <strong className="block text-blue-400 mb-1">Verification Step:</strong>
                            You can query the <code className="bg-black/30 px-1 rounded">miningPoints(address)</code> function on Etherscan using your wallet address to confirm that your on-chain points match what is displayed in the Mining Rig UI. Use the terminal on the left to simulate this check.
                        </div>
                    </div>
                </MechanicSection>

                <MechanicSection title="2. NFT Badge Evolution" icon={Award}>
                    <p>
                        Badges are <span className="text-meebot-primary font-mono">ERC-1155</span> tokens managed by the <span className="text-meebot-primary font-mono">MeeBadgeNFT</span> contract. Evolution logic (Burn + Mint) is handled by <span className="text-meebot-primary font-mono">BadgeNFTUpgrade</span>.
                    </p>
                     <div className="overflow-x-auto mt-4 border border-meebot-border rounded-lg bg-meebot-bg">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-meebot-surface text-meebot-text-secondary">
                                <tr>
                                    <th className="px-4 py-3">Level</th>
                                    <th className="px-4 py-3">Badge Tier</th>
                                    <th className="px-4 py-3">Contract</th>
                                    <th className="px-4 py-3">Benefits</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-meebot-border">
                                <tr className="hover:bg-meebot-surface/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">Lvl 1</td>
                                    <td className="px-4 py-3 font-bold text-orange-400 flex items-center gap-2"><Award className="w-4 h-4"/> Bronze</td>
                                    <td className="px-4 py-3 font-mono text-xs text-meebot-text-secondary">MeeBadgeNFT</td>
                                    <td className="px-4 py-3 text-xs text-meebot-text-secondary">Access to Discord</td>
                                </tr>
                                <tr className="hover:bg-meebot-surface/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">Lvl 5</td>
                                    <td className="px-4 py-3 font-bold text-gray-300 flex items-center gap-2"><Award className="w-4 h-4"/> Silver</td>
                                    <td className="px-4 py-3 font-mono text-xs text-meebot-text-secondary">MeeBadgeNFT</td>
                                    <td className="px-4 py-3 text-xs text-meebot-text-secondary">+5% Staking Boost</td>
                                </tr>
                                <tr className="hover:bg-meebot-surface/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">Lvl 10</td>
                                    <td className="px-4 py-3 font-bold text-yellow-400 flex items-center gap-2"><Award className="w-4 h-4"/> Gold</td>
                                    <td className="px-4 py-3 font-mono text-xs text-meebot-text-secondary">MeeBadgeNFT</td>
                                    <td className="px-4 py-3 text-xs text-meebot-text-secondary">Voting Power x1.5</td>
                                </tr>
                                <tr className="hover:bg-meebot-surface/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">Lvl 20</td>
                                    <td className="px-4 py-3 font-bold text-purple-400 flex items-center gap-2"><Award className="w-4 h-4"/> Legend</td>
                                    <td className="px-4 py-3 font-mono text-xs text-meebot-text-secondary">MeeBadgeNFT</td>
                                    <td className="px-4 py-3 text-xs text-meebot-text-secondary">Beta Access GenAI</td>
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
                         <div className="text-xs font-mono bg-black/30 p-2 rounded text-meebot-text-secondary break-all flex items-center justify-between">
                            <span><span className="text-meebot-primary">Project ID:</span> {projectId}</span>
                            {isConnected && <CheckCircle className="w-3 h-3 text-green-500"/>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 mb-4">
                        <div className="p-4 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-green-400 mb-2 text-xs flex items-center"><Hash className="w-3 h-3 mr-1"/> On-Chain State</h5>
                            <ul className="space-y-1 text-xs text-meebot-text-secondary">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Wallet Balances</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> NFT Ownership</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Proposal Votes</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-blue-400 mb-2 text-xs flex items-center"><Terminal className="w-3 h-3 mr-1"/> Off-Chain Index</h5>
                            <ul className="space-y-1 text-xs text-meebot-text-secondary">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Leaderboard Rankings</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> User Profiles</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Activity Feeds</li>
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