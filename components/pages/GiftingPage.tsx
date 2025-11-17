import React, { useState } from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { speak } from '../../services/ttsService';
import { Gift, LoaderCircle, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const GiftingPage: React.FC = () => {
    const { meebots, giftMeeBot } = useMeeBots();
    const [selectedBotId, setSelectedBotId] = useState<string>(meebots[0]?.id || '');
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'gifting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    React.useEffect(() => {
        if (!selectedBotId && meebots.length > 0) {
            setSelectedBotId(meebots[0].id);
        }
    }, [meebots, selectedBotId]);

    const handleGift = async () => {
        if (!selectedBotId || !recipientAddress.trim() || !message.trim()) {
            setError('Please select a MeeBot, enter a recipient address, and write a message.');
            setStatus('error');
            return;
        }

        setStatus('gifting');
        setError('');
        
        speak(`Preparing to send ${meebots.find(b => b.id === selectedBotId)?.name} as a gift.`, 'stoic');

        try {
            await giftMeeBot(selectedBotId, recipientAddress, message);
            setStatus('success');
            // Clear form
            setRecipientAddress('');
            setMessage('');
            setSelectedBotId(meebots.length > 1 ? meebots.filter(b => b.id !== selectedBotId)[0].id : '');

            setTimeout(() => setStatus('idle'), 5000); // Reset after 5s
        } catch (e) {
            console.error(e);
            const errorMessage = 'Gifting failed. The network seems congested.';
            setError(errorMessage);
            setStatus('error');
            speak(errorMessage, 'stoic');
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex items-center mb-8">
                <Gift className="w-10 h-10 text-meebot-accent mr-4" />
                <div>
                    <h1 className="text-4xl font-bold text-white">Gifting Center</h1>
                    <p className="text-meebot-text-secondary mt-1">
                        Send your MeeBot companions to friends as a special gift.
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-meebot-surface border border-meebot-border rounded-lg p-8 shadow-lg">
                {meebots.length > 0 ? (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="meebot-select" className="block text-sm font-medium text-meebot-text-secondary mb-2">1. Select MeeBot to Gift</label>
                            <select
                                id="meebot-select"
                                value={selectedBotId}
                                onChange={(e) => setSelectedBotId(e.target.value)}
                                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg"
                            >
                                {meebots.map(bot => (
                                    <option key={bot.id} value={bot.id}>
                                        {bot.name} ({bot.persona})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="recipient-address" className="block text-sm font-medium text-meebot-text-secondary mb-2">2. Recipient Address</label>
                            <input
                                id="recipient-address"
                                type="text"
                                value={recipientAddress}
                                onChange={e => setRecipientAddress(e.target.value)}
                                placeholder="0xRecipientAddress..."
                                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg font-mono"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="gift-message" className="block text-sm font-medium text-meebot-text-secondary mb-2">3. Add a Message</label>
                            <textarea
                                id="gift-message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={4}
                                placeholder="A message for your friend..."
                                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg"
                            />
                        </div>

                        <button
                            onClick={handleGift}
                            disabled={status === 'gifting' || !selectedBotId}
                            className="w-full flex items-center justify-center px-6 py-4 text-lg font-semibold text-white transition-all duration-200 bg-meebot-accent rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-accent disabled:bg-meebot-text-secondary disabled:cursor-not-allowed"
                        >
                           {status === 'gifting' ? (
                                <>
                                    <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                                    Sending Gift...
                                </>
                           ) : (
                                <>
                                    <Send className="w-6 h-6 mr-3" />
                                    Send MeeBot as Gift
                                </>
                           )}
                        </button>

                        {status === 'success' && (
                            <div className="mt-4 p-4 bg-green-900/50 border border-green-500/30 rounded-lg flex items-center text-green-300 animate-fade-in">
                                <CheckCircle className="w-6 h-6 mr-3 shrink-0"/>
                                <p className="text-sm font-semibold">Gift sent successfully! A new memory has been recorded.</p>
                            </div>
                        )}
                         {status === 'error' && error && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center text-red-400 animate-fade-in">
                                <AlertTriangle className="w-6 h-6 mr-3 shrink-0"/>
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-meebot-text-secondary py-8">
                        <p>You don't have any MeeBots to gift.</p>
                        <p>Create one on the Genesis page first.</p>
                    </div>
                )}
            </div>
        </div>
    );
};