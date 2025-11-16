// FIX: Add import for React to resolve namespace error for React.ComponentType.
import React from 'react';

export enum MeeBotPersona {
  Creative = 'creative-soul',
  Wise = 'wise-oracle',
  Energetic = 'energetic-spark',
  Guardian = 'guardian-protector',
  Mystic = 'mystic-dreamer',
}

export type MeeBotMetadata = {
  persona: MeeBotPersona;
  description: string;
  mood: string;
  imageDataUrl?: string;
  createdAt: number;
};

export type NavigationItem = {
  path: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};