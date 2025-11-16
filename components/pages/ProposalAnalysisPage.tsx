import React, { useState, useCallback } from 'react';
import { FileText, LoaderCircle, Languages, AlertTriangle, Wand2, Bot } from 'lucide-react';
import { analyzeProposal, detectLanguage } from '../../services/analysisService';
import { speak } from '../../services/ttsService';
import { useSettings } from '../../contexts/SettingsContext';
import { useMeeBots } from '../../contexts/MeeBotContext';

const BrandedLoader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center h-full text-meebot-text-secondary">
      <Bot className="w-12 h-12 mb-4 animate-brand-glow" />
      <p>{text}</p>
  </div>
);


export const ProposalAnalysisPage: React.FC = () => {
  const [proposal, setProposal] = useState('');
  const [summary, setSummary] = useState('');
  const [languageName, setLanguageName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { customInstructions } = useSettings();
  const { addProposalAnalysis } = useMeeBots();

  const handleAnalyze = useCallback(async () => {
    if (!proposal.trim()) {
      setError('Please enter a proposal to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary('');
    setLanguageName('');
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const langInfo = detectLanguage(proposal);
      setLanguageName(langInfo.name);

      const result = await analyzeProposal(proposal, langInfo.name, customInstructions);
      setSummary(result);
      
      // Log the successful analysis to the context for tracking
      addProposalAnalysis(proposal, result);

      speak(result);
    } catch (err) {
      setError('Failed to analyze the proposal. The connection to the digital consciousness may be unstable. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [proposal, customInstructions, addProposalAnalysis]);

  return (
    <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col">
      <div className="flex items-center mb-8">
        <FileText className="w-10 h-10 text-meebot-accent mr-4" />
        <div>
          <h1 className="text-4xl font-bold text-white">Proposal Analysis</h1>
          <p className="text-meebot-text-secondary mt-1">
            Let MeeBot analyze and summarize proposals in any supported language.
          </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        {/* Input Column */}
        <div className="lg:w-1/2 flex flex-col">
            <label htmlFor="proposal-input" className="block mb-2 font-medium text-meebot-text-secondary">
              Enter Proposal Text
            </label>
            <textarea
                id="proposal-input"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                rows={10}
                className="w-full p-3 bg-meebot-surface border border-meebot-border rounded-lg text-meebot-text-primary focus:ring-meebot-primary focus:border-meebot-primary flex-grow"
                placeholder="Paste your proposal here in any language (e.g., English, ไทย, 日本語)..."
            />
            <button 
              onClick={handleAnalyze} 
              disabled={isLoading}
              className="flex items-center justify-center w-full px-6 py-4 mt-4 text-lg font-semibold text-white transition-all duration-200 bg-meebot-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary disabled:bg-meebot-text-secondary disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6 mr-3" />
                  Analyze with MeeBot
                </>
              )}
            </button>
        </div>

        {/* Output Column */}
        <div className="lg:w-1/2 flex flex-col">
            <h2 className="block mb-2 font-medium text-meebot-text-secondary">Analysis Result</h2>
            <div className="flex-grow p-4 bg-meebot-surface border-2 border-dashed rounded-lg border-meebot-border">
                {isLoading && (
                    <BrandedLoader text="MeeBot is thinking..." />
                )}
                {error && (
                    <div className="p-4 text-center text-red-400">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="mb-2 text-lg font-semibold">Analysis Failed</h3>
                        <p className="text-red-400/80">{error}</p>
                  </div>
                )}
                {!isLoading && !error && summary && (
                    <div className="text-meebot-text-primary animate-fade-in">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-meebot-border">
                            <Languages className="w-5 h-5 text-meebot-accent"/>
                            <span className="font-semibold text-meebot-text-secondary">Language Detected:</span>
                            <span className="font-bold text-white">{languageName}</span>
                        </div>
                        <div
                            className="prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}
                        />
                    </div>
                )}
                {!isLoading && !error && !summary && (
                     <div className="flex items-center justify-center h-full text-center text-meebot-text-secondary">
                        <p>The proposal summary will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};