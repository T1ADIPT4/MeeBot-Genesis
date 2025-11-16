import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, RotateCcw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_INSTRUCTIONS = `// Example: "Use a calm, female voice for all speech."
// Example: "Summarize proposals in a single paragraph, not bullet points."
// Example: "For image generation, add a 'pixel art' style."
`;

const CustomInstructionPanel: React.FC = () => {
  const { customInstructions, setCustomInstructions } = useSettings();
  const [instructions, setInstructions] = useState(customInstructions);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Sync local state if context changes from elsewhere
    setInstructions(customInstructions);
  }, [customInstructions]);

  const handleSave = () => {
    setCustomInstructions(instructions);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setInstructions(DEFAULT_INSTRUCTIONS);
  }

  return (
    <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center mb-4">
            <Settings className="w-8 h-8 text-meebot-primary mr-3" />
            <h2 className="text-2xl font-bold text-white">MeeBot Custom Instructions</h2>
        </div>
      
      <p className="mb-4 text-meebot-text-secondary">
        Adjust the behavior, style, and personality of your MeeBot using natural language. These instructions will be applied during image generation and proposal analysis.
      </p>
      
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={10}
        className="w-full p-3 font-mono text-sm bg-meebot-bg border border-meebot-border rounded-lg text-meebot-text-primary focus:ring-2 focus:ring-meebot-primary focus:border-meebot-primary"
        placeholder="// Example: Use emojis instead of SVG icons"
      />
      
      <div className="flex flex-col items-center justify-between mt-4 space-y-3 sm:flex-row sm:space-y-0">
        <button 
          onClick={handleReset} 
          className="flex items-center text-sm transition-colors text-meebot-text-secondary hover:text-white"
        >
            <RotateCcw className="w-4 h-4 mr-2" />
          Reset to default examples
        </button>
        <div className="flex items-center space-x-4">
           {isSaved && (
            <div className="flex items-center text-green-400 animate-fade-in">
              <CheckCircle className="w-5 h-5 mr-2" />
              <p className="text-sm font-semibold">Instructions saved!</p>
            </div>
          )}
          <button 
            onClick={handleSave} 
            className="px-6 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};


export const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
        <CustomInstructionPanel />
    </div>
  )
}