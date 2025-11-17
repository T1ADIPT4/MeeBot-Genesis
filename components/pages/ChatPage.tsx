import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { useSettings } from '../../contexts/SettingsContext';
import { usePersonas } from '../../contexts/PersonaContext';
import { startChatSession, sendMessageStream } from '../../services/chatService';
import { speak } from '../../services/ttsService';
import { MessageSquare, Send, Bot, User, LoaderCircle } from 'lucide-react';
import type { Chat } from '@google/genai';

type ChatTurn = { role: "user" | "meebot"; text: string; };

const ChatMessage: React.FC<{ turn: ChatTurn }> = ({ turn }) => {
    const isUser = turn.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-meebot-primary flex items-center justify-center shrink-0"><Bot className="w-5 h-5 text-meebot-bg"/></div>}
            <div className={`max-w-md p-3 rounded-lg ${isUser ? 'bg-meebot-primary text-meebot-bg' : 'bg-meebot-surface'}`}>
                <p className="text-sm">{turn.text}</p>
            </div>
             {isUser && <div className="w-8 h-8 rounded-full bg-meebot-accent flex items-center justify-center shrink-0"><User className="w-5 h-5 text-meebot-bg"/></div>}
        </div>
    );
};

export const ChatPage: React.FC = () => {
    const { meebots, logChatMemory } = useMeeBots();
    const { personas } = usePersonas();
    const { customInstructions } = useSettings();

    const [selectedBotId, setSelectedBotId] = useState<string>(meebots[0]?.id || '');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [turns, setTurns] = useState<ChatTurn[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const selectedBot = meebots.find(b => b.id === selectedBotId);

    // Initialize or change chat session when bot selection changes
    useEffect(() => {
        if (selectedBot) {
            const botPersona = personas.find(p => p.name === selectedBot.persona);
            if (botPersona) {
                const session = startChatSession(botPersona, customInstructions);
                setChatSession(session);
                setTurns([{role: 'meebot', text: `Hello! I am ${selectedBot.name}. How can I help you today?`}]);
            }
        }
    }, [selectedBot, personas, customInstructions]);

    // Auto-scroll chat window
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [turns, isStreaming]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || !chatSession || isStreaming) return;

        const userTurn: ChatTurn = { role: "user", text: input };
        setTurns(prev => [...prev, userTurn]);
        setInput("");
        setIsStreaming(true);

        // Add an empty meebot turn to stream into
        setTurns(prev => [...prev, {role: 'meebot', text: ''}]);
        
        let fullBotReply = "";
        try {
            for await (const chunk of sendMessageStream(chatSession, input)) {
                fullBotReply += chunk;
                setTurns(prev => {
                    const next = [...prev];
                    next[next.length - 1].text = fullBotReply;
                    return next;
                });
            }
            speak(fullBotReply, selectedBot?.emotion);
            if(selectedBotId) {
                logChatMemory(selectedBotId, userTurn.text);
            }
        } catch (error) {
            console.error("Chat failed:", error);
            const errorText = "I seem to be having trouble connecting. Please try again later.";
             setTurns(prev => {
                const next = [...prev];
                next[next.length - 1].text = errorText;
                return next;
            });
            speak(errorText, 'stoic');
        } finally {
            setIsStreaming(false);
        }
    }, [input, chatSession, isStreaming, selectedBot, selectedBotId, logChatMemory]);

    return (
         <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col">
            <div className="flex items-center mb-8">
                <MessageSquare className="w-10 h-10 text-meebot-primary mr-4" />
                <div>
                    <h1 className="text-4xl font-bold text-white">MeeBot Chat</h1>
                    <p className="text-meebot-text-secondary mt-1">
                        Have a conversation with your AI companion.
                    </p>
                </div>
            </div>

            {meebots.length > 0 ? (
                <div className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden">
                    <div className="lg:w-1/4">
                        <label htmlFor="bot-selector" className="block text-sm font-medium text-meebot-text-secondary mb-2">Select a MeeBot to chat with:</label>
                        <select
                            id="bot-selector"
                            value={selectedBotId}
                            onChange={e => setSelectedBotId(e.target.value)}
                            className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg"
                        >
                            {meebots.map(bot => <option key={bot.id} value={bot.id}>{bot.name} ({bot.persona})</option>)}
                        </select>
                    </div>
                    <div className="flex-grow lg:w-3/4 flex flex-col bg-meebot-bg border border-meebot-border rounded-lg">
                        <div ref={chatWindowRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                           {turns.map((turn, i) => <ChatMessage key={i} turn={turn}/>)}
                           {isStreaming && turns[turns.length - 1].text === '' && <LoaderCircle className="w-6 h-6 animate-spin text-meebot-primary"/>}
                        </div>
                        <div className="p-4 border-t border-meebot-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input flex-1 w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Talk to your MeeBot..."
                                    disabled={isStreaming}
                                />
                                <button
                                    className="p-3 bg-meebot-primary text-white rounded-lg disabled:bg-meebot-text-secondary"
                                    onClick={handleSend}
                                    disabled={isStreaming || !input.trim()}
                                    aria-label="Send message"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-meebot-text-secondary">
                    <p className="text-lg">You don't have any MeeBots to chat with.</p>
                    <p>Go to the Genesis page to create one first.</p>
                </div>
            )}
        </div>
    );
};
