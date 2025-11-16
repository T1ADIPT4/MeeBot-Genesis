
import React from 'react';
import { mockMeeBots } from '../../data/mockMeeBots';
import type { MeeBotMetadata } from '../../types';
import { Sparkles } from 'lucide-react';

const MeeBotCard: React.FC<{ bot: MeeBotMetadata }> = ({ bot }) => {
  const personaLabel = bot.persona.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="group relative overflow-hidden rounded-lg bg-brand-surface border border-brand-border transition-all duration-300 hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/20 animate-fade-in">
      <img
        src={bot.imageDataUrl}
        alt={`Visualization of ${bot.description}`}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 bg-black/20"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full p-4">
        <span className="inline-block bg-brand-secondary/90 text-white px-3 py-1 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
          {personaLabel}
        </span>
        <p className="text-sm text-brand-text leading-tight drop-shadow-md">{bot.description}</p>
      </div>
    </div>
  );
};

export const HallOfOriginsPage: React.FC = () => {
  if (!mockMeeBots || mockMeeBots.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-brand-text-secondary animate-fade-in">
        <Sparkles className="w-24 h-24 mb-6" />
        <h1 className="text-3xl font-bold text-white">The Hall is Eagerly Awaiting</h1>
        <p className="max-w-md mt-2">No MeeBots have been minted yet. Be the first to add a creation to the Hall of Origins!</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center mb-8">
        <Sparkles className="w-10 h-10 text-brand-secondary mr-4" />
        <div>
            <h1 className="text-4xl font-bold text-white">Hall of Origins</h1>
            <p className="text-brand-text-secondary mt-1">A gallery of unique MeeBots brought to life by the community.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockMeeBots.map((bot) => (
          <MeeBotCard key={bot.createdAt} bot={bot} />
        ))}
      </div>
    </div>
  );
};
