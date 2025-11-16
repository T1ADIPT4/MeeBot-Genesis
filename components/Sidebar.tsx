
import React from 'react';
import { Bot, LayoutDashboard, Sparkles, Settings } from 'lucide-react';
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
  const activeClasses = "bg-brand-primary/20 text-brand-primary";
  const inactiveClasses = "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text";

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
    { path: '/origins', title: 'Hall of Origins', icon: Sparkles },
    { path: '/settings', title: 'Settings', icon: Settings },
  ], []);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  }

  return (
    <aside className={`absolute inset-y-0 left-0 z-30 w-64 px-4 py-8 bg-brand-bg border-r border-brand-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center mb-10">
        <Bot className="w-8 h-8 text-brand-primary" />
        <h1 className="ml-3 text-2xl font-bold text-white">MeeChain</h1>
      </div>
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
