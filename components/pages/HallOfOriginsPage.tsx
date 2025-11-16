import React from 'react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import type { MeeBotMetadata, MemoryEvent } from '../../types';
import { Sparkles, BookOpen, Gift, Award, FileText, Heart, Hash, ArrowRightLeft, Bot } from 'lucide-react';

export const TimelineIcon: React.FC<{ type: MemoryEvent['type'] }> = ({ type }) => {
    switch(type) {
        case 'Mint': return <Sparkles className="w-4 h-4 text-meebot-accent" />;
        case 'MiningGift': return <Gift className="w-4 h-4 text-green-400" />;
        case 'Badge': return <Award className="w-4 h-4 text-yellow-400" />;
        case 'Proposal': return <FileText className="w-4 h-4 text-blue-400" />;
        case 'EmotionShift': return <Heart className="w-4 h-4 text-pink-400" />;
        case 'Migration': return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
        default: return <BookOpen className="w-4 h-4 text-meebot-text-secondary" />;
    }
};

const getChainTagStyle = (chainName?: string) => {
    switch (chainName) {
        case 'Sepolia': return 'bg-blue-500/20 text-blue-300';
        case 'Fuse': return 'bg-green-500/20 text-green-300';
        case 'BNB': return 'bg-yellow-500/20 text-yellow-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};


const MeeBotCard: React.FC<{ bot: MeeBotMetadata }> = ({ bot }) => {
  const handleViewTx = () => {
    alert(`Viewing transaction on a simulated block explorer:\n\nChain: ${bot.chainName}\nTransaction Hash: ${bot.txHash}\nToken URI: ${bot.tokenURI}`);
  };

  const handleViewHistory = () => {
    const history = bot.memory.map(e => `[${new Date(e.timestamp).toLocaleString()}] ${e.message}`).join('\n');
    alert(`Memory Log for ${bot.name}:\n\n${history}`);
  };
  
  const emotionAttribute = bot.attributes.find(a => a.trait_type === 'Emotion');

  return (
    <div className="bg-meebot-surface border border-meebot-border rounded-lg overflow-hidden transition-all duration-300 hover:border-meebot-primary hover:shadow-2xl hover:shadow-meebot-primary/20 animate-fade-in flex flex-col">
      <img
        src={bot.image}
        alt={`Visualization of ${bot.soul_prompt}`}
        className="w-full h-48 object-cover bg-black/20"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2 gap-2">
            <span className="inline-block bg-meebot-accent/90 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
              {bot.persona}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getChainTagStyle(bot.chainName)}`}>
                  {bot.chainName}
              </span>
              <span className="text-xs font-mono text-meebot-text-secondary flex items-center">
                  <Hash className="w-3 h-3 mr-1"/>{bot.name.split('#')[1]}
              </span>
            </div>
        </div>
        
        <p className="text-sm text-meebot-text-secondary leading-tight flex-grow mb-3 italic">"{bot.soul_prompt}"</p>
        
        {emotionAttribute && (
            <div className="mb-4 text-xs text-meebot-text-secondary">
                Feeling: <strong className="capitalize text-meebot-text-primary">{emotionAttribute.value}</strong>
            </div>
        )}
        
        {bot.miningGift && (
            <div className="p-3 mb-4 text-xs bg-meebot-bg rounded-lg">
                <div className="flex items-center font-bold text-green-400 mb-1">
                    <Gift className="w-4 h-4 mr-2"/>
                    <span>Inaugural Gift</span>
                </div>
                <p className="text-green-300/80">{bot.miningGift.program} ({bot.miningGift.boost})</p>
            </div>
        )}

        <div className="mt-auto pt-3 border-t border-meebot-border/50 grid grid-cols-2 gap-2 text-sm">
           <button onClick={handleViewTx} className="w-full text-center px-3 py-2 bg-meebot-bg hover:bg-meebot-primary/20 text-meebot-primary rounded-md transition-colors">
            View Transaction
           </button>
           <button onClick={handleViewHistory} className="w-full text-center px-3 py-2 bg-meebot-bg hover:bg-meebot-accent/20 text-meebot-accent rounded-md transition-colors">
            View History
           </button>
        </div>
      </div>
       <div className="px-4 py-2 bg-black/20 flex items-center justify-center text-xs text-meebot-text-secondary/70 border-t border-meebot-border/50">
          <Bot className="w-3 h-3 mr-1.5 text-meebot-primary/70" />
          <span>Powered by MEECHAIN</span>
      </div>
    </div>
  );
};


export const HallOfOriginsPage: React.FC = () => {
  const { meebots } = useMeeBots();

  return (
    <div className="p-4 md:p-8 animate-fade-in">
       <div className="flex items-center mb-8">
        <Sparkles className="w-10 h-10 text-meebot-primary mr-4" />
        <div>
          <h1 className="text-4xl font-bold text-white">Hall of Origins</h1>
          <p className="text-meebot-text-secondary mt-1">
            A gallery of all MeeBots ever brought into existence.
          </p>
        </div>
      </div>

      {meebots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {meebots.map(bot => (
            <MeeBotCard key={bot.id} bot={bot} />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center h-64 text-center bg-meebot-surface border-2 border-dashed rounded-lg border-meebot-border text-meebot-text-secondary">
            <p className="text-lg">The Hall is empty.</p>
            <p>Go to the Genesis page to create the first MeeBot.</p>
        </div>
      )}
    </div>
  );
};
