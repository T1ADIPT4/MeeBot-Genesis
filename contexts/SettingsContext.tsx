
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SETTINGS_INSTRUCTIONS_KEY = 'meebot-custom-instructions';
const SETTINGS_VOICE_KEY = 'meebot-voice-style';

const DEFAULT_INSTRUCTIONS = `// Add your MeeBot instructions here...`;

interface SettingsContextType {
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
  voiceStyle: string;
  setVoiceStyle: (style: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customInstructions, setCustomInstructionsState] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_INSTRUCTIONS;
    }
    try {
      const item = window.localStorage.getItem(SETTINGS_INSTRUCTIONS_KEY);
      return item ? item : DEFAULT_INSTRUCTIONS;
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      return DEFAULT_INSTRUCTIONS;
    }
  });

  const [voiceStyle, setVoiceStyleState] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return 'Default';
    }
    try {
      const item = window.localStorage.getItem(SETTINGS_VOICE_KEY);
      return item ? item : 'Default';
    } catch (error) {
      console.error("Failed to read voice style from localStorage", error);
      return 'Default';
    }
  });

  const setCustomInstructions = (instructions: string) => {
    try {
      window.localStorage.setItem(SETTINGS_INSTRUCTIONS_KEY, instructions);
      setCustomInstructionsState(instructions);
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  };

  const setVoiceStyle = (style: string) => {
    try {
      window.localStorage.setItem(SETTINGS_VOICE_KEY, style);
      setVoiceStyleState(style);
    } catch (error) {
      console.error("Failed to write voice style to localStorage", error);
    }
  };
  
  return (
    <SettingsContext.Provider value={{ customInstructions, setCustomInstructions, voiceStyle, setVoiceStyle }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
