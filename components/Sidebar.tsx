import React from 'react';
import { Bot, LayoutDashboard, Sparkles, Settings, FileText, Palette, ArrowRightLeft, Target, Gift, MessageSquare, Landmark } from 'lucide-react';
import type { NavigationItem } from '../types';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isOpen: boolean;
}

const NavLink: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const baseClasses = "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg";
  const activeClasses = "bg-meebot-primary/20 text-meebot-primary";
  const inactiveClasses = "text-meebot-text-secondary hover:bg-meebot-surface hover:text-meebot-text-primary";

  return (
    <a
      href={`#${item.path}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.title}</span>
    </a>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, isOpen }) => {
  const navigationItems = React.useMemo<NavigationItem[]>(() => [
    { path: '/', title: 'Dashboard', icon: LayoutDashboard },
    { path: '/genesis', title: 'MeeBot Genesis', icon: Bot },
    { path: '/chat', title: 'MeeBot Chat', icon: MessageSquare },
    { path: '/governance', title: 'Governance', icon: Landmark },
    { path: '/gifting', title: 'Gifting Center', icon: Gift },
    { path: '/migration', title: 'Migration', icon: ArrowRightLeft },
    { path: '/missions', title: 'Missions', icon: Target },
    { path: '/analysis', title: 'Proposal Analysis', icon: FileText },
    { path: '/origins', title: 'Hall of Origins', icon: Sparkles },
    { path: '/personas', title: 'Personas', icon: Palette },
    { path: '/settings', title: 'Settings', icon: Settings },
  ], []);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  }

  return (
    <aside className={`absolute inset-y-0 left-0 z-30 w-64 px-4 py-8 bg-meebot-bg border-r border-meebot-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <a
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
        className="flex items-center mb-10 group"
      >
        <Bot className="w-8 h-8 text-meebot-primary transition-transform duration-300 group-hover:rotate-12" />
        <h1 className="ml-3 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-meebot-accent">MeeChain</h1>
      </a>
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            isActive={currentPath === item.path}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
};