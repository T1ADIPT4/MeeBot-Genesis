import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center text-meebot-text-secondary animate-fade-in">
      <Construction className="w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="max-w-md mt-2">This section is under construction. Check back soon for exciting new features!</p>
    </div>
  );
};