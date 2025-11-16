import React, { useState } from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { speak } from '../../services/ttsService';
import { ArrowRightLeft, LoaderCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const CHAINS = [
    { chainId: 11155111, name: 'Sepolia' },
    { chainId: 122, name: 'Fuse' },
    { chainId: 56, name: 'BNB' },
];

export const MigrationPage: React.FC = () => {
    const { meebots, migrateMeeBot } = useMeeBots();
    const [selectedBotId, setSelectedBotId] = useState<string>(meebots[0]?.id || '');
    const [destinationChainName, setDestinationChainName] = useState<string>('');
    const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    const selectedBot = meebots.find(bot => bot.id === selectedBotId);

    React.useEffect(() => {
        if (!selectedBotId && meebots.length > 0) {
            setSelectedBotId(meebots[0].id);
        }
        if (selectedBot) {
            const newAvailableChains = CHAINS.filter(chain => chain.name !== selectedBot.chainName);
            setDestinationChainName(newAvailableChains[0]?.name || '');
        }
    }, [meebots, selectedBotId, selectedBot]);


    const handleMigrate = async () => {
        if (!selectedBotId || !destinationChainName) {
            setError('Please select a MeeBot and a destination chain.');
            return;
        }

        setMigrationStatus('migrating');
        setError('');
        
        speak(`Initiating migration for ${selectedBot?.name} to the ${destinationChainName} network. Please wait.`, 'stoic');

        try {
            await migrateMeeBot(selectedBotId, destinationChainName);
            setMigrationStatus('success');
            setTimeout(() => setMigrationStatus('idle'), 5000); // Reset after 5s
        } catch (e) {
            console.error(e);
            const errorMessage = 'Migration failed. The cross-chain bridge might be offline.';
            setError(errorMessage);
            setMigrationStatus('error');
            speak(errorMessage, 'stoic');
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex items-center mb-8">
                <ArrowRightLeft className="w-10 h-10 text-meebot-primary mr-4" />
                <div>
                    <h1 className="text-4xl font-bold text-white">Cross-Chain Migration</h1>
                    <p className="text-meebot-text-secondary mt-1">
                        Move your MeeBots between supported blockchains seamlessly.
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-meebot-surface border border-meebot-border rounded-lg p-8 shadow-lg">
                {meebots.length > 0 ? (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="meebot-select" className="block text-sm font-medium text-meebot-text-secondary mb-2">Select MeeBot to Migrate</label>
                            <select
                                id="meebot-select"
                                value={selectedBotId}
                                onChange={(e) => setSelectedBotId(e.target.value)}
                                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg"
                            >
                                {meebots.map(bot => (
                                    <option key={bot.id} value={bot.id}>
                                        {bot.name} ({bot.persona}) - Currently on {bot.chainName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-center text-meebot-text-secondary">
                            <div className="border-t border-dashed border-meebot-border flex-grow"></div>
                            <span className="mx-4">Migrate To</span>
                            <div className="border-t border-dashed border-meebot-border flex-grow"></div>
                        </div>

                        <div>
                            <label htmlFor="chain-select" className="block text-sm font-medium text-meebot-text-secondary mb-2">Destination Chain</label>
                            <select
                                id="chain-select"
                                value={destinationChainName}
                                onChange={(e) => setDestinationChainName(e.target.value)}
                                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg"
                                disabled={!selectedBot}
                            >
                                {selectedBot && CHAINS.filter(c => c.name !== selectedBot.chainName).map(chain => (
                                    <option key={chain.chainId} value={chain.name}>{chain.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleMigrate}
                            disabled={migrationStatus === 'migrating' || !selectedBotId || !destinationChainName}
                            className="w-full flex items-center justify-center px-6 py-4 text-lg font-semibold text-white transition-all duration-200 bg-meebot-accent rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-accent disabled:bg-meebot-text-secondary disabled:cursor-not-allowed"
                        >
                           {migrationStatus === 'migrating' ? (
                                <>
                                    <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                                    Migrating...
                                </>
                           ) : (
                                <>
                                    <ArrowRightLeft className="w-6 h-6 mr-3" />
                                    Initiate Migration
                                </>
                           )}
                        </button>

                        {migrationStatus === 'success' && (
                            <div className="mt-4 p-4 bg-green-900/50 border border-green-500/30 rounded-lg flex items-center text-green-300 animate-fade-in">
                                <CheckCircle className="w-6 h-6 mr-3 shrink-0"/>
                                <p className="text-sm font-semibold">Migration successful! Your MeeBot is now on {destinationChainName}.</p>
                            </div>
                        )}
                         {migrationStatus === 'error' && error && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center text-red-400 animate-fade-in">
                                <AlertTriangle className="w-6 h-6 mr-3 shrink-0"/>
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-meebot-text-secondary py-8">
                        <p>You don't have any MeeBots to migrate.</p>
                        <p>Create one on the Genesis page first.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
