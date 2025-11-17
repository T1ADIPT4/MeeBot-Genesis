
import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, RotateCcw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

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
    setInstructions("// Default MeeBot behavior");
  }

  return (
    <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-white">⚙️ MeeBot Custom Instructions</h2>
        </div>
      
      <p className="mb-4 text-meebot-text-secondary">
        ปรับแต่งพฤติกรรม, สไตล์, และบุคลิกของ MeeBot ตามที่คุณต้องการ
      </p>
      
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={10}
        className="w-full p-3 font-mono text-sm bg-meebot-bg border border-meebot-border rounded-lg text-meebot-text-primary focus:ring-2 focus:ring-meebot-primary focus:border-meebot-primary"
        placeholder="// Example: Use emojis instead of SVG icons"
      />
      
      <div className="flex flex-col items-center justify-end mt-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <button 
          onClick={handleReset} 
          className="flex items-center text-sm transition-colors text-meebot-text-secondary hover:text-white"
        >
          Reset to default
        </button>
        <div className="flex items-center space-x-4">
           {isSaved && (
            <p className="text-sm font-semibold text-green-400 animate-fade-in">✅ Instructions saved!</p>
          )}
          <button 
            onClick={handleSave} 
            className="px-6 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary"
          >
            Save changes
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
