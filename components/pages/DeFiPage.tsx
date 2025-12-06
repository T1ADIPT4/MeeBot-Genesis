
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, RefreshCw, ChevronDown, Wallet, ArrowDown, History, Info, Coins, Send, CheckCircle, AlertTriangle, LoaderCircle, ArrowRight, ExternalLink, Link } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { speak } from '../../services/ttsService';
import { ethers } from 'ethers';

// Global declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- Contract Configuration ---
const MEE_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const T2P_TOKEN_ADDRESS = "0x765ddcca3849ef7cf3b8203ca79705bebf864444";
const EXCHANGE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; 

const TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

const EXCHANGE_ABI = [
    "function supplyT2P(uint256 amount)",
    "function supplyBNB() payable"
];

type TokenType = 'ETH' | 'USDT' | 'MEE' | 'BNB' | 'FUSE' | 'T2P';
type ChainType = 'Sepolia' | 'Fuse' | 'BNB';

interface TokenBalance {
    symbol: TokenType;
    balance: string; // Display string
    rawBalance: number;
    price: number; // in USDT
    icon: string;
}

// Initial Mock Balances
const MOCK_BALANCES: Record<TokenType, TokenBalance> = {
    'ETH': { symbol: 'ETH', balance: '1.45', rawBalance: 1.45, price: 3200, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026' },
    'USDT': { symbol: 'USDT', balance: '1250.00', rawBalance: 1250, price: 1.00, icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=026' },
    'MEE': { symbol: 'MEE', balance: '5000.00', rawBalance: 5000, price: 0.15, icon: 'https://via.placeholder.com/32/00CFE8/FFFFFF?text=M' },
    'BNB': { symbol: 'BNB', balance: '5.2', rawBalance: 5.2, price: 600, icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026' },
    'FUSE': { symbol: 'FUSE', balance: '1000', rawBalance: 1000, price: 0.05, icon: 'https://cryptologos.cc/logos/fuse-network-fuse-logo.png?v=026' },
    'T2P': { symbol: 'T2P', balance: '250.00', rawBalance: 250, price: 0.10, icon: 'https://via.placeholder.com/32/FF1B93/FFFFFF?text=T' },
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
            active 
            ? 'border-meebot-primary text-white bg-meebot-primary/5' 
            : 'border-transparent text-meebot-text-secondary hover:text-white hover:bg-meebot-surface'
        }`}
    >
        {children}
    </button>
);

export const DeFiPage: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'swap' | 'bridge'>('swap');
    
    // Wallet & Network State
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [balances, setBalances] = useState(MOCK_BALANCES);
    const [networkName, setNetworkName] = useState<string>('Simulation');

    // Swap State
    const [fromToken, setFromToken] = useState<TokenType>('ETH');
    const [toToken, setToToken] = useState<TokenType>('MEE');
    const [amountIn, setAmountIn] = useState<string>('');
    const [amountOut, setAmountOut] = useState<string>('');
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapStatus, setSwapStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string>('');
    
    // Bridge State
    const [sourceChain, setSourceChain] = useState<ChainType>('Sepolia');
    const [destChain, setDestChain] = useState<ChainType>('Fuse');
    const [bridgeAsset, setBridgeAsset] = useState<TokenType>('ETH');
    const [bridgeAmount, setBridgeAmount] = useState<string>('');
    const [isBridging, setIsBridging] = useState(false);
    const [bridgeSuccess, setBridgeSuccess] = useState(false);

    // --- Wallet Connection Logic ---
    const connectWallet = async () => {
        setIsConnecting(true);
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const network = await provider.getNetwork();
                setWalletAddress(accounts[0]);
                setNetworkName(network.name === 'unknown' ? 'Localhost/Sepolia' : network.name);
                
                speak("Wallet connected. Ready for transaction.", "stoic");
            } catch (error) {
                console.error("Connection error:", error);
                alert("Failed to connect wallet.");
            }
        } else {
            // Fallback for simulation
            setTimeout(() => {
                setWalletAddress("0x71C...9A21");
                speak("Simulation wallet connected.", "stoic");
            }, 1000);
        }
        setIsConnecting(false);
    };

    // --- Pricing & Calculation ---
    const getRate = (from: TokenType, to: TokenType) => {
        return balances[from].price / balances[to].price;
    };

    useEffect(() => {
        if (!amountIn || isNaN(Number(amountIn))) {
            setAmountOut('');
            return;
        }
        const rate = getRate(fromToken, toToken);
        const calculated = Number(amountIn) * rate;
        // Apply a small random variance to simulate live market
        const variance = 1 + (Math.random() * 0.002 - 0.001); 
        setAmountOut((calculated * variance).toFixed(6));
    }, [amountIn, fromToken, toToken, balances]);

    // --- Swap Execution ---
    const handleSwap = async () => {
        const bal = balances[fromToken].rawBalance;
        if (Number(amountIn) > bal) {
            alert(t('defi.error_insufficient'));
            return;
        }
        
        setIsSwapping(true);
        setSwapStatus('idle');
        setTxHash('');

        speak(`Initiating swap: ${amountIn} ${fromToken} for ${toToken}.`, 'stoic');
        
        try {
            if (walletAddress && window.ethereum && (fromToken === 'ETH' || fromToken === 'BNB' || fromToken === 'MEE' || fromToken === 'T2P')) {
                // Real Contract Interaction Logic
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, EXCHANGE_ABI, signer);

                let tx;
                if (fromToken === 'ETH' || fromToken === 'BNB') {
                    // Buying: Supply Native (BNB/ETH) to get Tokens
                    const val = ethers.parseEther(amountIn);
                    tx = await exchangeContract.supplyBNB({ value: val });
                } else if (fromToken === 'MEE' || fromToken === 'T2P') {
                     // Selling: Supply Token (MEE/T2P) to get Native
                     const tokenAddr = fromToken === 'MEE' ? MEE_TOKEN_ADDRESS : T2P_TOKEN_ADDRESS;
                     const tokenContract = new ethers.Contract(tokenAddr, TOKEN_ABI, signer);
                     
                     const val = ethers.parseEther(amountIn);
                     const approveTx = await tokenContract.approve(EXCHANGE_ADDRESS, val);
                     await approveTx.wait();
                     
                     tx = await exchangeContract.supplyT2P(val);
                }

                if (tx) {
                    await tx.wait();
                    setTxHash(tx.hash);
                }
            } else {
                // Simulation Mode
                await new Promise(resolve => setTimeout(resolve, 2000));
                setTxHash("0x" + Math.random().toString(16).substr(2, 64));
            }
            
            // Update UI State
            setSwapStatus('success');
            setAmountIn('');
            setAmountOut('');
            speak(t('defi.success_swap'), 'joyful');
            
            // Update Mock Balances
            setBalances(prev => ({
                ...prev,
                [fromToken]: { ...prev[fromToken], rawBalance: prev[fromToken].rawBalance - Number(amountIn), balance: (prev[fromToken].rawBalance - Number(amountIn)).toFixed(4) },
                [toToken]: { ...prev[toToken], rawBalance: prev[toToken].rawBalance + Number(amountOut), balance: (prev[toToken].rawBalance + Number(amountOut)).toFixed(4) }
            }));

        } catch (error) {
            console.error(error);
            setSwapStatus('error');
            speak("Transaction failed. Please check your balance and try again.", 'stoic');
        } finally {
            setIsSwapping(false);
        }
    };

    // --- Bridge Execution ---
    const handleBridge = async () => {
         const bal = balances[bridgeAsset].rawBalance;
        if (Number(bridgeAmount) > bal) {
            alert(t('defi.error_insufficient'));
            return;
        }
        setIsBridging(true);
        setBridgeSuccess(false);
        speak(`Bridging ${bridgeAmount} ${bridgeAsset} from ${sourceChain} to ${destChain}.`, 'stoic');

        // Simulate Cross-Chain Delay
        setTimeout(() => {
            setIsBridging(false);
            setBridgeSuccess(true);
            setBridgeAmount('');
            speak(t('defi.success_bridge'), 'joyful');
            
            setBalances(prev => ({
                ...prev,
                [bridgeAsset]: { ...prev[bridgeAsset], rawBalance: prev[bridgeAsset].rawBalance - Number(bridgeAmount), balance: (prev[bridgeAsset].rawBalance - Number(bridgeAmount)).toFixed(4) }
            }));
        }, 3000);
    };

    const switchTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setAmountIn(amountOut); 
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <Coins className="w-10 h-10 text-meebot-primary mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">{t('title.defi')}</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            Decentralized Exchange & Cross-Chain Bridge
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        walletAddress 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-meebot-surface border-meebot-primary text-meebot-primary hover:bg-meebot-primary hover:text-white'
                    }`}
                >
                    {isConnecting ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wallet className="w-4 h-4" />
                    )}
                    {walletAddress 
                        ? `${walletAddress.substring(0,6)}...${walletAddress.substring(38)}` 
                        : "Connect Wallet"
                    }
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Action Card */}
                <div className="lg:w-1/2">
                    <div className="bg-meebot-surface border border-meebot-border rounded-xl overflow-hidden shadow-xl">
                        <div className="flex border-b border-meebot-border">
                            <TabButton active={activeTab === 'swap'} onClick={() => setActiveTab('swap')}>
                                <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> {t('defi.swap_tab')}
                                </div>
                            </TabButton>
                            <TabButton active={activeTab === 'bridge'} onClick={() => setActiveTab('bridge')}>
                                <div className="flex items-center justify-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4" /> {t('defi.bridge_tab')}
                                </div>
                            </TabButton>
                        </div>

                        <div className="p-6 min-h-[400px]">
                            {activeTab === 'swap' ? (
                                <div className="space-y-4 animate-fade-in">
                                    {/* From Input */}
                                    <div className="bg-meebot-bg p-4 rounded-lg border border-meebot-border hover:border-meebot-primary/50 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs text-meebot-text-secondary font-bold">{t('defi.pay')}</span>
                                            <span className="text-xs text-meebot-text-secondary">
                                                {t('defi.balance')}: <span className="text-meebot-primary font-mono">{balances[fromToken].balance}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                value={amountIn}
                                                onChange={e => setAmountIn(e.target.value)}
                                                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-meebot-text-secondary/30"
                                            />
                                            <div className="relative group">
                                                <button className="flex items-center gap-2 bg-meebot-surface px-3 py-1.5 rounded-full border border-meebot-border hover:bg-meebot-border transition-colors">
                                                    <img src={balances[fromToken].icon} alt={fromToken} className="w-5 h-5 rounded-full" />
                                                    <span className="font-bold text-white">{fromToken}</span>
                                                    <ChevronDown className="w-4 h-4 text-meebot-text-secondary" />
                                                </button>
                                                {/* Dropdown */}
                                                <div className="absolute top-full right-0 mt-2 w-32 bg-meebot-surface border border-meebot-border rounded-lg shadow-xl hidden group-hover:block z-20">
                                                     {Object.keys(balances).map((t) => (
                                                        <div key={t} onClick={() => setFromToken(t as TokenType)} className="px-3 py-2 hover:bg-meebot-bg cursor-pointer flex items-center gap-2 text-sm text-white">
                                                            {t}
                                                        </div>
                                                     ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <button onClick={() => setAmountIn(String(balances[fromToken].rawBalance))} className="text-xs font-bold text-meebot-accent hover:text-white transition-colors">{t('defi.max')}</button>
                                            <span className="text-xs text-meebot-text-secondary">≈ ${(Number(amountIn) * balances[fromToken].price).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Switcher */}
                                    <div className="flex justify-center -my-2 relative z-10">
                                        <button onClick={switchTokens} className="bg-meebot-surface border border-meebot-border p-2 rounded-full hover:rotate-180 transition-transform duration-300 hover:border-meebot-primary hover:text-meebot-primary shadow-lg">
                                            <ArrowDown className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* To Input */}
                                    <div className="bg-meebot-bg p-4 rounded-lg border border-meebot-border">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs text-meebot-text-secondary font-bold">{t('defi.receive')}</span>
                                            <span className="text-xs text-meebot-text-secondary">
                                                {t('defi.balance')}: <span className="text-meebot-text-primary font-mono">{balances[toToken].balance}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                readOnly
                                                placeholder="0.0"
                                                value={amountOut}
                                                className="w-full bg-transparent text-2xl font-bold text-meebot-primary outline-none placeholder-meebot-text-secondary/30"
                                            />
                                            <div className="relative group">
                                                 <button className="flex items-center gap-2 bg-meebot-surface px-3 py-1.5 rounded-full border border-meebot-border hover:bg-meebot-border transition-colors">
                                                    <img src={balances[toToken].icon} alt={toToken} className="w-5 h-5 rounded-full" />
                                                    <span className="font-bold text-white">{toToken}</span>
                                                    <ChevronDown className="w-4 h-4 text-meebot-text-secondary" />
                                                </button>
                                                 {/* Dropdown */}
                                                 <div className="absolute top-full right-0 mt-2 w-32 bg-meebot-surface border border-meebot-border rounded-lg shadow-xl hidden group-hover:block z-20">
                                                     {Object.keys(balances).map((t) => (
                                                        <div key={t} onClick={() => setToToken(t as TokenType)} className="px-3 py-2 hover:bg-meebot-bg cursor-pointer flex items-center gap-2 text-sm text-white">
                                                            {t}
                                                        </div>
                                                     ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <span className="text-xs text-meebot-text-secondary">≈ ${(Number(amountOut) * balances[toToken].price).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Details Accordion */}
                                    <div className="px-3 py-3 bg-meebot-bg/50 rounded-lg text-xs space-y-2 text-meebot-text-secondary border border-meebot-border/50">
                                        <div className="flex justify-between">
                                            <span>{t('defi.rate')}</span>
                                            <span className="text-white font-mono">1 {fromToken} = {getRate(fromToken, toToken).toFixed(4)} {toToken}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('defi.slippage')}</span>
                                            <span className="text-white">0.5% (Auto)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('defi.network_fee')}</span>
                                            <span className="text-white">~$2.50</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSwap}
                                        disabled={isSwapping || !amountIn}
                                        className="w-full py-4 bg-meebot-primary hover:bg-opacity-80 text-white font-bold rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isSwapping ? <LoaderCircle className="w-5 h-5 animate-spin mr-2"/> : <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform" />}
                                        {isSwapping ? t('defi.processing') : t('defi.btn_swap')}
                                    </button>

                                    {swapStatus === 'success' && (
                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg flex flex-col gap-1 animate-fade-in">
                                            <div className="flex items-center font-bold">
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                {t('defi.success_swap')}
                                            </div>
                                            {txHash && (
                                                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs underline ml-7 hover:text-green-300">
                                                    View TX: {txHash.substring(0,12)}...
                                                </a>
                                            )}
                                        </div>
                                    )}
                                     {swapStatus === 'error' && (
                                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center animate-fade-in">
                                            <AlertTriangle className="w-5 h-5 mr-2" />
                                            Transaction Failed. Check console.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Chain Selector */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 bg-meebot-bg p-3 rounded-lg border border-meebot-border">
                                            <span className="text-xs text-meebot-text-secondary font-bold block mb-2">{t('defi.source_chain')}</span>
                                            <select 
                                                value={sourceChain} 
                                                onChange={e => setSourceChain(e.target.value as ChainType)}
                                                className="w-full bg-transparent text-white font-bold outline-none"
                                            >
                                                <option value="Sepolia">Sepolia (ETH)</option>
                                                <option value="Fuse">Fuse</option>
                                                <option value="BNB">BNB Chain</option>
                                            </select>
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-meebot-text-secondary animate-pulse" />
                                        <div className="flex-1 bg-meebot-bg p-3 rounded-lg border border-meebot-border">
                                            <span className="text-xs text-meebot-text-secondary font-bold block mb-2">{t('defi.dest_chain')}</span>
                                            <select 
                                                value={destChain} 
                                                onChange={e => setDestChain(e.target.value as ChainType)}
                                                className="w-full bg-transparent text-white font-bold outline-none"
                                            >
                                                <option value="Fuse">Fuse</option>
                                                <option value="Sepolia">Sepolia</option>
                                                <option value="BNB">BNB Chain</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Asset Input */}
                                    <div className="bg-meebot-bg p-4 rounded-lg border border-meebot-border">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs text-meebot-text-secondary font-bold">{t('defi.select_token')}</span>
                                            <span className="text-xs text-meebot-text-secondary">
                                                {t('defi.balance')}: <span className="text-meebot-primary font-mono">{balances[bridgeAsset].balance}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                value={bridgeAmount}
                                                onChange={e => setBridgeAmount(e.target.value)}
                                                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-meebot-text-secondary/30"
                                            />
                                            <div className="relative group">
                                                <button className="flex items-center gap-2 bg-meebot-surface px-3 py-1.5 rounded-full border border-meebot-border hover:bg-meebot-border transition-colors">
                                                    <img src={balances[bridgeAsset].icon} alt={bridgeAsset} className="w-5 h-5 rounded-full" />
                                                    <span className="font-bold text-white">{bridgeAsset}</span>
                                                </button>
                                                 {/* Dropdown */}
                                                 <div className="absolute top-full right-0 mt-2 w-32 bg-meebot-surface border border-meebot-border rounded-lg shadow-xl hidden group-hover:block z-20">
                                                     {Object.keys(balances).map((t) => (
                                                        <div key={t} onClick={() => setBridgeAsset(t as TokenType)} className="px-3 py-2 hover:bg-meebot-bg cursor-pointer flex items-center gap-2 text-sm text-white">
                                                            {t}
                                                        </div>
                                                     ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button onClick={() => setBridgeAmount(String(balances[bridgeAsset].rawBalance))} className="text-xs font-bold text-meebot-accent hover:text-white transition-colors">{t('defi.max')}</button>
                                        </div>
                                    </div>

                                    {/* Bridge Info */}
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3 text-xs text-yellow-200">
                                        <Info className="w-5 h-5 shrink-0" />
                                        <p>Bridging assets takes approximately 5-15 minutes. You will receive wrapped assets on the destination chain. 0.1% Bridge Fee applies.</p>
                                    </div>

                                    <button 
                                        onClick={handleBridge}
                                        disabled={isBridging || !bridgeAmount}
                                        className="w-full py-4 bg-meebot-accent hover:bg-opacity-80 text-white font-bold rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isBridging ? <LoaderCircle className="w-5 h-5 animate-spin mr-2"/> : <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />}
                                        {isBridging ? t('defi.processing') : t('defi.btn_bridge')}
                                    </button>

                                    {bridgeSuccess && (
                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg flex items-center animate-fade-in">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            {t('defi.success_bridge')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center mt-4 text-xs text-meebot-text-secondary flex items-center justify-center gap-1">
                        <Wallet className="w-3 h-3"/> {t('defi.powered_by')}
                    </div>
                </div>

                {/* Info / Stats Column */}
                <div className="lg:w-1/2 space-y-6">
                    {/* Network Info */}
                    <div className="bg-meebot-surface border border-meebot-border rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Link className="w-5 h-5 mr-2 text-meebot-primary"/> Connected Network
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${walletAddress ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                                <ExternalLink className={`w-6 h-6 ${walletAddress ? 'text-green-400' : 'text-yellow-400'}`} />
                            </div>
                            <div>
                                <p className="font-bold text-white">{networkName}</p>
                                <p className="text-sm text-meebot-text-secondary">{walletAddress ? "Live Environment" : "Simulation Environment"}</p>
                            </div>
                        </div>
                        {walletAddress && (
                            <div className="mt-4 pt-4 border-t border-meebot-border/50 text-xs font-mono text-meebot-text-secondary break-all">
                                <span className="block mb-1 font-bold text-meebot-text-primary">MeeChainToken Contract:</span>
                                {MEE_TOKEN_ADDRESS}
                            </div>
                        )}
                    </div>

                    {/* Market Info */}
                    <div className="bg-meebot-surface border border-meebot-border rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <History className="w-5 h-5 mr-2 text-meebot-accent"/> Recent Transactions
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm p-3 bg-meebot-bg rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-white">Bridge ETH to Fuse</span>
                                </div>
                                <span className="text-meebot-text-secondary text-xs">2 mins ago</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-meebot-bg rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-white">Swap BNB to MEE</span>
                                </div>
                                <span className="text-meebot-text-secondary text-xs">15 mins ago</span>
                            </div>
                        </div>
                    </div>

                    {/* Liquidity Promo */}
                    <div className="bg-gradient-to-br from-meebot-primary/20 to-meebot-accent/20 border border-meebot-border rounded-xl p-6 relative overflow-hidden group hover:border-meebot-primary/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-meebot-primary/30 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-meebot-accent/30 transition-colors"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Liquidity Mining Live!</h3>
                        <p className="text-sm text-white/80 mb-4">Provide liquidity to the MEE/ETH pool and earn up to 150% APY in mining rewards.</p>
                        <button className="px-4 py-2 bg-white text-meebot-bg font-bold rounded-lg text-sm hover:scale-105 transition-transform">
                            Add Liquidity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
