
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Wand, Zap, AlertTriangle, Bot, Image as ImageIcon } from 'lucide-react';
import { MeeBotPersona } from '../../types';
import { generateMeeBotImage } from '../../services/geminiService';

const personaOptions = Object.entries(MeeBotPersona).map(([key, value]) => ({
  label: key.replace(/([A-Z])/g, ' $1').trim(),
  value: value
}));

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
    <div className="relative">
      <Bot className="w-24 h-24 text-brand-primary/50 animate-pulse-slow" />
      <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-30 bg-brand-primary blur-2xl"></div>
    </div>
    <p className="text-lg text-brand-text-secondary">Summoning your MeeBot from the digital ether...</p>
    <p className="text-sm text-brand-text-secondary/70">This can take a moment, please be patient.</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-brand-text-secondary">
    <ImageIcon className="w-24 h-24" />
    <p className="text-lg">Your MeeBot's visualization will appear here.</p>
  </div>
);

export const GenesisPage: React.FC = () => {
  const [persona, setPersona] = useState<MeeBotPersona>(MeeBotPersona.Creative);
  const [description, setDescription] = useState('a radiant, crystalline bot holding a glowing lotus flower');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Abort any ongoing request when the component unmounts
      abortControllerRef.current?.abort();
    };
  }, []);
  
  const handleVisualize = useCallback(async () => {
    if (!description.trim()) {
      setError("Please provide a description for your MeeBot.");
      return;
    }
    
    // Abort previous request if a new one is started
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsComplete(false);

    const fullPrompt = `A digital art masterpiece of a ${persona.split('-')[0]} MeeBot. The bot is described as: "${description}". The style should be cinematic, with dramatic lighting, 8k resolution, highly detailed, fantasy art, concept art.`;
    
    try {
      const imageUrl = await generateMeeBotImage(fullPrompt, abortControllerRef.current.signal);
      setGeneratedImage(imageUrl);
      setIsComplete(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(`Your ${persona.split('-')[0]} MeeBot has arrived!`);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
         setError('Failed to generate image. The digital ether is turbulent. Please try a simpler description or try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [description, persona]);

  const personaLabel = personaOptions.find(p => p.value === persona)?.label || 'Bot';

  return (
    <div className="flex flex-col h-full lg:flex-row">
      <div className="w-full p-6 space-y-6 overflow-y-auto border-b lg:w-1/3 lg:border-b-0 lg:border-r border-brand-border">
        <h2 className="text-2xl font-bold text-white">Define Your MeeBot</h2>
        
        <div>
          <label htmlFor="persona" className="block mb-2 text-sm font-medium text-brand-text-secondary">Persona</label>
          <select
            id="persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value as MeeBotPersona)}
            className="w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          >
            {personaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-brand-text-secondary">Description</label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., a small bot made of moss and stone, with glowing mushroom eyes"
            className="w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <div className="pt-4 space-y-4">
          <button 
            onClick={handleVisualize}
            disabled={isLoading}
            className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-200 bg-brand-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary disabled:bg-brand-text-secondary disabled:cursor-not-allowed"
          >
            <Wand className={`w-6 h-6 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Visualizing...' : 'Visualize'}
          </button>
          
          <button 
            onClick={() => alert(`Minting a ${personaLabel} MeeBot NFT!\n(This is a mock action)`)}
            disabled={!isComplete || isLoading}
            className="flex items-center justify-center w-full px-6 py-4 font-semibold text-brand-primary transition-all duration-200 bg-transparent border-2 border-brand-secondary rounded-lg hover:bg-brand-secondary hover:text-brand-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-secondary disabled:border-brand-text-secondary/50 disabled:text-brand-text-secondary/50 disabled:cursor-not-allowed"
          >
            <Zap className="w-6 h-6 mr-3" />
            Mint as NFT
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 bg-black/20">
        <div className="flex items-center justify-center w-full h-full bg-brand-surface border-2 border-dashed rounded-lg border-brand-border">
          {isLoading && <LoadingState />}
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
              alt={`AI visualization of a ${personaLabel} MeeBot: ${description}`}
              className={`object-contain w-full h-full max-h-[80vh] p-2 rounded-lg animate-fade-in ${isComplete ? 'animate-glow' : ''}`}
            />
          )}
          {!isLoading && !error && !generatedImage && <InitialState />}
        </div>
      </div>
    </div>
  );
};
