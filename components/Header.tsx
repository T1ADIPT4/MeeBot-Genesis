import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
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
      {/* Placeholder for user profile, notifications etc. */}
      <div></div>
    </header>
  );
};