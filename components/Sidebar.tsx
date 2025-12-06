
import React, { useEffect, useState, useRef } from 'react';
import { LayoutDashboard, Sparkles, Settings, FileText, Palette, ArrowRightLeft, Target, Gift, MessageSquare, Landmark, Pickaxe, Shield, Coins, Ticket } from 'lucide-react';
import type { NavigationItem } from '../types';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  const navigationItems = React.useMemo<NavigationItem[]>(() => [
    { path: '/', title: t('nav.home'), icon: Pickaxe },
    { path: '/portfolio', title: t('nav.portfolio'), icon: LayoutDashboard },
    { path: '/genesis', title: t('nav.genesis'), icon: Sparkles },
    { path: '/redemption', title: t('nav.perks'), icon: Ticket },
    { path: '/defi', title: t('nav.defi'), icon: Coins },
    { path: '/chat', title: t('nav.chat'), icon: MessageSquare },
    { path: '/governance', title: t('nav.governance'), icon: Landmark },
    { path: '/gifting', title: t('nav.gifting'), icon: Gift },
    { path: '/migration', title: t('nav.migration'), icon: ArrowRightLeft },
    { path: '/missions', title: t('nav.missions'), icon: Target },
    { path: '/analysis', title: t('nav.analysis'), icon: FileText },
    { path: '/transparency', title: t('nav.transparency'), icon: Shield },
    { path: '/origins', title: t('nav.origins'), icon: Sparkles },
    { path: '/personas', title: t('nav.personas'), icon: Palette },
    { path: '/settings', title: t('nav.settings'), icon: Settings },
  ], [t]);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  }

  return (
    <aside className={`absolute inset-y-0 left-0 z-30 w-64 px-4 py-8 bg-meebot-bg border-r border-meebot-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <BrandLogo
        className="mb-10"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
      />
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
