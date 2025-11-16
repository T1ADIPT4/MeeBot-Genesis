
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Wand, Zap, AlertTriangle, Bot, Image as ImageIcon, Volume2, LoaderCircle, CheckCircle, Shuffle } from 'lucide-react';
import { generateMeeBotImage } from '../../services/geminiService';
import { speak } from '../../services/ttsService';
import { useSettings } from '../../contexts/SettingsContext';
import { usePersonas } from '../../contexts/PersonaContext';
import { useMeeBots } from '../../contexts/MeeBotContext';
import type { Persona } from '../../types';

const CONFETTI_COUNT = 150;
const COLORS = ['#00F5D4', '#FF00E6', '#FFFFFF'];

const Confetti: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden" aria-hidden="true">
            {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}vw`,
                    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                    animation: `confetti-fall ${Math.random() * 3 + 2}s ${Math.random() * 2}s linear forwards`,
                    width: `${Math.floor(Math.random() * 10) + 8}px`,
                    height: `${Math.floor(Math.random() * 6) + 5}px`,
                    opacity: Math.random() + 0.5,
                };
                return <div key={i} className="absolute top-[-10vh] rounded-sm" style={style} />;
            })}
        </div>
    );
};


const BrandedLoadingState: React.FC<{text: string}> = ({ text }) => (
  <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
    <div className="relative">
      <Bot className="w-24 h-24 animate-brand-glow" />
    </div>
    <p className="text-lg text-meebot-text-secondary">{text}</p>
    <p className="text-sm text-meebot-text-secondary/70">This can take a moment, please be patient.</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-meebot-text-secondary">
    <ImageIcon className="w-24 h-24" />
    <p className="text-lg">Your MeeBot's visualization will appear here.</p>
  </div>
);

const VoiceTester: React.FC = () => {
  const [testText, setTestText] = useState('Hello, I am MeeBot!');
  const [testMood, setTestMood] = useState('serene');

  const handleTestSpeak = (e: React.FormEvent) => {
    e.preventDefault();
    if (testText.trim()) {
      speak(testText, testMood);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-meebot-border animate-fade-in">
      <form onSubmit={handleTestSpeak}>
        <label htmlFor="voice-test" className="block mb-2 text-sm font-medium text-meebot-text-secondary">
          Test MeeBot Voice
        </label>
        <div className="flex space-x-2">
          <input
            id="voice-test"
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type something for MeeBot to say..."
            className="flex-grow w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
          />
          <select value={testMood} onChange={e => setTestMood(e.target.value)} className="p-3 bg-meebot-surface border border-meebot-border rounded-lg">
            <option value="serene">Serene</option>
            <option value="joyful">Joyful</option>
            <option value="stoic">Stoic</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center p-3 text-white transition-colors duration-200 bg-meebot-accent rounded-lg shrink-0 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-accent"
            aria-label="Test speak"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
        <p className="mt-2 text-xs text-meebot-text-secondary/70">
          Try typing in Thai (e.g., "สวัสดี") or Japanese (e.g., "こんにちは") to hear different voices.
        </p>
      </form>
    </div>
  );
};

export const GenesisPage: React.FC = () => {
  const { personas, isLoading: arePersonasLoading } = usePersonas();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [description, setDescription] = useState('a radiant, crystalline bot holding a glowing lotus flower');
  const [mood, setMood] = useState('serene');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { customInstructions } = useSettings();
  const { mintMeeBot } = useMeeBots();

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);
  // State to hold the user's chosen art style from the selected persona.
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    // Set default selected persona when personas load
    if (!arePersonasLoading && personas.length > 0 && !selectedPersonaId) {
      setSelectedPersonaId(personas[0].id);
    }
  }, [personas, arePersonasLoading, selectedPersonaId]);

  useEffect(() => {
    // When the persona changes, update the available art styles in the dropdown
    // and automatically select the first style as the default.
    if (selectedPersona?.stylePrompts?.length) {
      setSelectedStyle(selectedPersona.stylePrompts[0]);
    } else {
      setSelectedStyle('');
    }
  }, [selectedPersona]);

  useEffect(() => {
    return () => {
      // Abort any ongoing request and speech when the component unmounts
      abortControllerRef.current?.abort();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const handleVisualize = useCallback(async () => {
    if (!description.trim()) {
      setError("Please provide a description for your MeeBot.");
      return;
    }
    if (!selectedPersona) {
      setError("Please select a valid persona.");
      return;
    }
    
    // Abort previous request if a new one is started
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsComplete(false);
    setMintSuccess(null);

    try {
      const imageUrl = await generateMeeBotImage(
        {
          personaName: selectedPersona.name,
          description: description,
          mood: mood,
          stylePrompt: selectedStyle,
        },
        abortControllerRef.current.signal,
        customInstructions
      );
      setGeneratedImage(imageUrl);
      setIsComplete(true);
      
      const successMessage = `Your ${selectedPersona.name} MeeBot has arrived!`;
      speak(successMessage, mood);

    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
         setError('Failed to generate image. The digital ether is turbulent. Please try a simpler description or try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [description, selectedPersona, customInstructions, mood, selectedStyle]);

  const handleRandomizeStyle = useCallback(() => {
    if (selectedPersona?.stylePrompts?.length) {
      const randomIndex = Math.floor(Math.random() * selectedPersona.stylePrompts.length);
      setSelectedStyle(selectedPersona.stylePrompts[randomIndex]);
    }
  }, [selectedPersona]);

  const handleMint = () => {
    if (!isComplete || !generatedImage || !selectedPersona) {
      alert("Please visualize your MeeBot first!");
      return;
    }

    const newMeeBot = mintMeeBot({
      persona: selectedPersona.name,
      prompt: description,
      emotion: mood,
      image: generatedImage,
    });
    
    const speakMessage = `I am ${newMeeBot.name}, a ${newMeeBot.persona}. To begin our journey, I grant you the gift of the ${newMeeBot.miningGift?.program}.`;
    const displayMessage = `Minted! Your new ${newMeeBot.persona} MeeBot, ${newMeeBot.name}, has granted you the "${newMeeBot.miningGift?.program}"!`;
    
    speak(speakMessage, newMeeBot.emotion);
    setMintSuccess(displayMessage);
    setShowConfetti(true);
    
    setTimeout(() => {
        // Reset form for next creation
        setGeneratedImage(null);
        setIsComplete(false);
        setMintSuccess(null);
        setShowConfetti(false);
    }, 6000); // Give user time to see message
  };

  return (
    <div className="flex flex-col h-full lg:flex-row">
      {showConfetti && <Confetti />}
      <div className="w-full p-6 space-y-6 overflow-y-auto border-b lg:w-1/3 lg:border-b-0 lg:border-r border-meebot-border">
        <h2 className="text-2xl font-bold text-white">Define Your MeeBot</h2>
        
        <div>
          <label htmlFor="persona" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Persona</label>
          {arePersonasLoading ? (
            <div className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg flex items-center text-meebot-text-secondary">
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/> Loading Personas...
            </div>
          ) : (
            <select
              id="persona"
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
            >
              {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>

        {/* Art Style selection dropdown, populated based on the chosen persona. */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="style" className="text-sm font-medium text-meebot-text-secondary">
              Art Style
            </label>
            <button
              onClick={handleRandomizeStyle}
              className="flex items-center px-2 py-1 text-xs font-semibold transition-colors rounded-md bg-meebot-surface hover:bg-meebot-border text-meebot-accent disabled:text-meebot-text-secondary/50 disabled:cursor-not-allowed"
              disabled={!selectedPersona?.stylePrompts?.length}
              aria-label="Randomize art style"
            >
              <Shuffle className="w-4 h-4 mr-1" />
              Randomize
            </button>
          </div>
          <select
            id="style"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
            disabled={!selectedPersona?.stylePrompts?.length}
          >
            {selectedPersona?.stylePrompts?.length ? (
              selectedPersona.stylePrompts.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))
            ) : (
              <option value="">Default Style</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Prompt / Description</label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., a small bot made of moss and stone, with glowing mushroom eyes"
            className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
          />
        </div>
        
        <div>
           <label htmlFor="mood" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Emotion / Mood</label>
           <input
            id="mood"
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., joyful, contemplative, energetic"
            className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
           />
        </div>


        <div className="pt-4 space-y-4">
          <button 
            onClick={handleVisualize}
            disabled={isLoading || arePersonasLoading || personas.length === 0 || !!mintSuccess}
            className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-200 bg-meebot-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary disabled:bg-meebot-text-secondary disabled:cursor-not-allowed"
          >
            <Wand className={`w-6 h-6 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Visualizing...' : 'Visualize'}
          </button>
          
          <button 
            onClick={handleMint}
            disabled={!isComplete || isLoading || !!mintSuccess}
            className="flex items-center justify-center w-full px-6 py-4 font-semibold text-meebot-primary transition-all duration-200 bg-transparent border-2 border-meebot-accent rounded-lg hover:bg-meebot-accent hover:text-meebot-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-accent disabled:border-meebot-text-secondary/50 disabled:text-meebot-text-secondary/50 disabled:cursor-not-allowed"
          >
            <Zap className="w-6 h-6 mr-3" />
            Mint as NFT
          </button>

          {mintSuccess && (
            <div className="mt-4 p-4 bg-green-900/50 border border-green-500/30 rounded-lg flex items-center text-green-300 animate-fade-in">
                <CheckCircle className="w-6 h-6 mr-3 shrink-0"/>
                <p className="text-sm font-semibold">{mintSuccess}</p>
            </div>
          )}
        </div>

        <VoiceTester />
      </div>
      
      <div className="flex-1 p-6 bg-black/20">
        <div className="flex items-center justify-center w-full h-full bg-meebot-surface border-2 border-dashed rounded-lg border-meebot-border">
          {isLoading && <BrandedLoadingState text="Summoning your MeeBot from the digital ether..." />}
          {!isLoading && error && (
            <div className="p-8 text-center text-red-400 animate-fade-in">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="mb-2 text-xl font-semibold">An Error Occurred</h3>
              <p className="max-w-md mx-auto text-red-400/80">{error}</p>
            </div>
          )}
          {!isLoading && !error && generatedImage && (
            <img 
              src={generatedImage} 
              alt={`AI visualization of a ${selectedPersona?.name || 'MeeBot'}: ${description}`}
              className={`object-contain w-full h-full max-h-[80vh] p-2 rounded-lg animate-fade-in ${isComplete ? 'animate-glow' : ''}`}
            />
          )}
          {!isLoading && !error && !generatedImage && <InitialState />}
        </div>
      </div>
    </div>
  );
};
