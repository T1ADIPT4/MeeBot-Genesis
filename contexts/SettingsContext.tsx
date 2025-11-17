
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SETTINGS_STORAGE_KEY = 'meebot-custom-instructions';

const DEFAULT_INSTRUCTIONS = `// Add your MeeBot instructions here...`;

interface SettingsContextType {
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customInstructions, setCustomInstructionsState] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_INSTRUCTIONS;
    }
    try {
      const item = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      return item ? item : DEFAULT_INSTRUCTIONS;
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      return DEFAULT_INSTRUCTIONS;
    }
  });

  const setCustomInstructions = (instructions: string) => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, instructions);
      setCustomInstructionsState(instructions);
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  };
  
  return (
    <SettingsContext.Provider value={{ customInstructions, setCustomInstructions }}>
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
