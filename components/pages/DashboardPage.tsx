
import React from 'react';
import { Bot, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in">
      <div className="relative mb-8">
        <Bot className="w-32 h-32 text-brand-primary animate-pulse-slow" />
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-20 bg-brand-primary blur-2xl"></div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Welcome to MeeBot Genesis</h1>
      <p className="max-w-2xl mt-4 text-lg text-brand-text-secondary">
        This is where your journey begins. Create, visualize, and bring your unique MeeBot companions to life using the power of generative AI.
      </p>
      <button
        onClick={() => navigate('/genesis')}
        className="inline-flex items-center justify-center px-8 py-4 mt-10 text-lg font-semibold text-white transition-all duration-200 bg-brand-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary"
      >
        Create Your First MeeBot
        <ArrowRight className="w-6 h-6 ml-3" />
      </button>
    </div>
  );
};
