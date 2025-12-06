
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const LoadingMessages = [
  "Initializing MeeChain Core...",
  "Syncing Neural Network...",
  "Loading Persona Matrices...",
  "Establishing Secure Uplink...",
  "Waking up MeeBot..."
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Message cycling
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LoadingMessages.length);
    }, 800);

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Random increment for realistic feel
        return Math.min(prev + Math.random() * 5, 100);
      });
    }, 100);

    // Completion timer
    const completionTimeout = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 800); // Wait for fade out animation
    }, 3500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(completionTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0D0C1D] transition-opacity duration-1000 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-meebot-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-meebot-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Custom M Logo */}
        <div className="mb-12 relative w-32 h-32 md:w-40 md:h-40 animate-particle-float">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,207,232,0.5)]">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00CFE8" />
                <stop offset="100%" stopColor="#FF1B93" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* The M Shape */}
            <path 
              d="M20 80 V25 L50 55 L80 25 V80" 
              stroke="url(#logoGradient)" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-pulse-slow"
            />
            
            {/* Decorative Nodes */}
            <circle cx="20" cy="25" r="4" fill="#00CFE8" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="50" cy="55" r="4" fill="#FFFFFF" />
            <circle cx="80" cy="25" r="4" fill="#FF1B93" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
          </svg>
          
          {/* Orbiting Sparkle */}
          <div className="absolute -top-4 -right-4 animate-spin" style={{ animationDuration: '4s' }}>
             <Sparkles className="w-6 h-6 text-yellow-400 opacity-80" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-meebot-primary to-meebot-accent tracking-widest mb-2 font-mono">
          MEECHAIN
        </h1>
        <p className="text-meebot-text-secondary text-sm tracking-[0.3em] uppercase opacity-70 mb-12">
          Genesis Protocol
        </p>

        {/* Loading Bar & Text */}
        <div className="w-64 md:w-80">
          <div className="flex justify-between text-xs font-mono text-meebot-primary mb-2 h-4">
            <span>{LoadingMessages[messageIndex]}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-meebot-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-meebot-primary to-meebot-accent transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
