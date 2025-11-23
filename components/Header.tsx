
import React from 'react';
import { Menu, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-meebot-bg border-b border-meebot-border md:px-6">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 mr-2 -ml-2 text-meebot-text-secondary rounded-full md:hidden hover:bg-meebot-surface focus:outline-none focus:ring-2 focus:ring-meebot-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      
      <button 
        onClick={toggleLanguage}
        className="flex items-center px-3 py-1.5 text-sm font-medium text-meebot-text-secondary bg-meebot-surface border border-meebot-border rounded-full hover:text-white hover:border-meebot-primary transition-all group"
      >
        <Globe className="w-4 h-4 mr-2 group-hover:text-meebot-primary transition-colors" />
        <span className="uppercase font-mono">{language}</span>
      </button>
    </header>
  );
};
