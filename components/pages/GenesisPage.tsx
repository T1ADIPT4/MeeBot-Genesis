
// FIX: Add type declarations for the Web Speech API to resolve TypeScript errors.
// This is necessary because these APIs are not yet part of the standard DOM typings.
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
  isFinal: boolean;
}

interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}



import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Wand, Zap, AlertTriangle, Bot, Image as ImageIcon, Volume2, LoaderCircle, CheckCircle, Shuffle, Shield, Brush, BrainCircuit, Leaf, Mic, Globe } from 'lucide-react';
import { generateMeeBotImage } from '../../services/geminiService';
import { speak } from '../../services/ttsService';
import { useSettings } from '../../contexts/SettingsContext';
import { usePersonas } from '../../contexts/PersonaContext';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { detectLanguage } from '../../services/analysisService';
import type { Persona } from '../../types';
import { Confetti } from '../Confetti';

const GenerativeLoadingState: React.FC = () => {
    const { t } = useLanguage();
    const loadingMessages = [
        t('genesis.loading_1'),
        t('genesis.loading_2'),
        t('genesis.loading_3'),
        t('genesis.loading_4'),
    ];

    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        setMessage(loadingMessages[0]); // Reset on mount or language change
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, [loadingMessages]);

    const particles = React.useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const size = Math.random() * 0.5 + 0.25;
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 2;
        const colorClass = ['bg-meebot-primary', 'bg-meebot-accent', 'bg-white'][Math.floor(Math.random() * 3)];
        
        return (
            <div
                key={i}
                className={`absolute rounded-full animate-particle-float ${colorClass}`}
                style={{
                    width: `${size}rem`,
                    height: `${size}rem`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    left: `${Math.random() * 100}%`,
                }}
            />
        );
    }), []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute bottom-0 w-full h-1/2">
                    {particles}
                </div>
                <Bot className="w-24 h-24 animate-brand-glow" />
            </div>
            <p className="text-lg text-meebot-text-secondary transition-opacity duration-500 text-center px-4">{message}</p>
            <p className="text-sm text-meebot-text-secondary/70">This can take a moment, please be patient.</p>
        </div>
    );
};

const InitialState: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-meebot-text-secondary">
      <ImageIcon className="w-24 h-24" />
      <p className="text-lg">{t('genesis.initial_state')}</p>
    </div>
  );
}

const VoiceTester: React.FC = () => {
  const [testText, setTestText] = useState('Hello, I am MeeBot!');
  const [testMood, setTestMood] = useState('serene');
  const { t } = useLanguage();

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
          {t('genesis.voice_test')}
        </label>
        <div className="flex space-x-2">
          <input
            id="voice-test"
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder={t('genesis.type_voice')}
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
          {t('genesis.try_typing')}
        </p>
      </form>
    </div>
  );
};

// Mapping of persona names to their respective Lucide icons for visual representation in the grid.
const PERSONA_ICON_MAP: Record<string, React.ElementType> = {
  'guardian protector': Shield,
  'creative soul': Brush,
  'data wizard': BrainCircuit,
  'energetic spark': Zap,
  'nature synth': Leaf,
};

const PersonaIcon: React.FC<{ personaName: string; className?: string }> = ({ personaName, className = "w-8 h-8 mb-3 text-meebot-primary" }) => {
    const Icon = PERSONA_ICON_MAP[personaName.toLowerCase()] || Bot;
    return <Icon className={className} />;
};

const PersonaSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="w-full h-[100px] p-3 bg-meebot-surface border border-meebot-border rounded-lg">
                <div className="w-full h-full bg-meebot-bg rounded animate-pulse"></div>
            </div>
        ))}
    </div>
);

const StyleTagSkeleton: React.FC = () => (
    <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-meebot-surface border border-meebot-border rounded-full animate-pulse"></div>
        ))}
    </div>
);


export const GenesisPage: React.FC = () => {
  const { personas, isLoading: arePersonasLoading } = usePersonas();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [description, setDescription] = useState('');
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
  const { t } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [detectedLangName, setDetectedLangName] = useState('English');

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    if (!arePersonasLoading && personas.length > 0 && !selectedPersonaId) {
      setSelectedPersonaId(personas[0].id);
    }
  }, [personas, arePersonasLoading, selectedPersonaId]);

  useEffect(() => {
    if (selectedPersona?.stylePrompts?.length) {
      setSelectedStyle(selectedPersona.stylePrompts[0]);
    } else {
      setSelectedStyle('');
    }
  }, [selectedPersona]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Detect language whenever description changes
  useEffect(() => {
    if (!description.trim()) {
        setDetectedLangName('English');
        return;
    }
    const { name } = detectLanguage(description);
    setDetectedLangName(name);
  }, [description]);
  
  const handleVisualize = useCallback(async () => {
    if (!description.trim()) {
      setError("Please provide a description for your MeeBot.");
      return;
    }
    if (!selectedPersona) {
      setError("Please select a valid persona.");
      return;
    }
    
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

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please try on Chrome or Safari.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setSpeechError(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      let message = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        message = "Microphone access denied. Please enable it in your browser's settings to use this feature.";
      }
      setSpeechError(message);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setDescription(prev => (prev ? prev.trim() + ' ' : '') + transcript);
    };
    
    recognition.start();

  }, [isRecording]);

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
        setGeneratedImage(null);
        setIsComplete(false);
        setMintSuccess(null);
        setShowConfetti(false);
    }, 6000);
  };

  return (
    <div className="flex flex-col h-full lg:flex-row">
      {showConfetti && <Confetti />}
      <div className="w-full p-6 space-y-6 overflow-y-auto border-b lg:w-2/5 xl:w-1/3 lg:border-b-0 lg:border-r border-meebot-border">
        <h2 className="text-2xl font-bold text-white">{t('genesis.define')}</h2>
        
        <div className="space-y-6">
            <div>
              <label className="block mb-3 text-md font-semibold text-meebot-text-secondary">
                <span className="text-xs font-bold text-meebot-accent px-2 py-1 bg-meebot-accent/10 rounded-full mr-2">1</span>
                {t('genesis.step1')}
              </label>
              {arePersonasLoading ? (
                <PersonaSkeleton />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {personas.map(p => {
                      const isSelected = p.id === selectedPersonaId;
                      return (
                          <button 
                            key={p.id} 
                            onClick={() => setSelectedPersonaId(p.id)}
                            className={`p-4 text-left border-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-meebot-primary/10 border-meebot-primary' : 'bg-meebot-surface border-meebot-border hover:border-meebot-border/50'}`}
                          >
                              <PersonaIcon personaName={p.name} />
                              <h4 className={`font-bold ${isSelected ? 'text-meebot-primary' : 'text-meebot-text-primary'}`}>{p.name}</h4>
                              <p className="text-xs text-meebot-text-secondary">{p.description}</p>
                          </button>
                      )
                  })}
                </div>
              )}
            </div>

            {selectedPersona && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-md font-semibold text-meebot-text-secondary">
                     <span className="text-xs font-bold text-meebot-accent px-2 py-1 bg-meebot-accent/10 rounded-full mr-2">2</span>
                    {t('genesis.step2')}
                  </label>
                  <button
                    onClick={handleRandomizeStyle}
                    className="flex items-center px-3 py-1 text-xs font-semibold transition-colors rounded-md bg-meebot-surface hover:bg-meebot-border text-meebot-accent disabled:text-meebot-text-secondary/50 disabled:cursor-not-allowed"
                    disabled={arePersonasLoading || !selectedPersona?.stylePrompts?.length}
                    aria-label="Randomize art style"
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    {t('genesis.random_style')}
                  </button>
                </div>
                 {arePersonasLoading ? (
                    <StyleTagSkeleton />
                 ) : (
                    <div className="flex flex-wrap gap-2">
                        {selectedPersona.stylePrompts.map(style => {
                            const isSelected = style === selectedStyle;
                            return (
                                <button
                                    key={style}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${isSelected ? 'bg-meebot-primary text-meebot-bg border-transparent' : 'bg-meebot-bg text-meebot-text-secondary border-meebot-border hover:bg-meebot-border hover:text-meebot-text-primary'}`}
                                >
                                    {style}
                                </button>
                            );
                        })}
                    </div>
                 )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="text-md font-semibold text-meebot-text-secondary flex items-center">
                  <span className="text-xs font-bold text-meebot-accent px-2 py-1 bg-meebot-accent/10 rounded-full mr-2">3</span>
                  {t('genesis.step3')}
                  {description.trim() && (
                    <span className="ml-2 text-xs font-normal text-meebot-primary bg-meebot-primary/10 px-2 py-0.5 rounded-full flex items-center animate-fade-in">
                        <Globe className="w-3 h-3 mr-1" /> {detectedLangName} Detected
                    </span>
                  )}
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('genesis.placeholder')}
                  className="w-full p-3 pr-12 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
                />
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isRecording
                      ? 'bg-red-500/20 text-red-500 animate-pulse'
                      : 'text-meebot-text-secondary hover:bg-meebot-border hover:text-meebot-text-primary'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording voice input'}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              {speechError && <p className="mt-2 text-xs text-red-400">{speechError}</p>}
            </div>
            
            <div>
               <label htmlFor="mood" className="block mb-2 text-md font-semibold text-meebot-text-secondary">
                 <span className="text-xs font-bold text-meebot-accent px-2 py-1 bg-meebot-accent/10 rounded-full mr-2">4</span>
                 {t('genesis.step4')}
                </label>
               <input
                id="mood"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder={t('genesis.mood_placeholder')}
                className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg focus:ring-meebot-primary focus:border-meebot-primary"
               />
            </div>
        </div>


        <div className="pt-4 space-y-4">
          <button 
            onClick={handleVisualize}
            disabled={isLoading || arePersonasLoading || personas.length === 0 || !!mintSuccess}
            className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-200 bg-meebot-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary disabled:bg-meebot-text-secondary disabled:cursor-not-allowed"
          >
            <Wand className={`w-6 h-6 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('genesis.visualizing') : t('genesis.visualize')}
          </button>
          
          <button 
            onClick={handleMint}
            disabled={!isComplete || isLoading || !!mintSuccess}
            className="flex items-center justify-center w-full px-6 py-4 font-semibold text-meebot-primary transition-all duration-200 bg-transparent border-2 border-meebot-accent rounded-lg hover:bg-meebot-accent hover:text-meebot-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-accent disabled:border-meebot-text-secondary/50 disabled:text-meebot-text-secondary/50 disabled:cursor-not-allowed"
          >
            <Zap className="w-6 h-6 mr-3" />
            {t('genesis.mint')}
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
          {isLoading && <GenerativeLoadingState />}
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
