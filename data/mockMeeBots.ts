
import { MeeBotPersona, type MeeBotMetadata } from '../types';

// Using simple 1x1 pixel base64 encoded images as placeholders.
// In a real app, these would be the URLs from the image generation service.
export const mockMeeBots: MeeBotMetadata[] = [
  {
    persona: MeeBotPersona.Creative,
    description: 'A radiant, crystalline bot holding a glowing lotus flower.',
    mood: 'serene',
    imageDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAEBCZP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAn//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/An//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2gAMAwEAAgADAAAAEAD/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2gAIAQEDAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIDAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQEAAT8hf//Z',
    createdAt: 1672531200000,
  },
  {
    persona: MeeBotPersona.Guardian,
    description: 'A giant bot made of ancient stone and overgrown with moss, standing guard.',
    mood: 'stoic',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgGA5c5G4wAAAABJRU5ErkJggg==', // Placeholder green
    createdAt: 1672617600000,
  },
  {
    persona: MeeBotPersona.Energetic,
    description: 'A small, quick bot crackling with electrical energy, zipping through the air.',
    mood: 'excited',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // Placeholder red
    createdAt: 1672704000000,
  },
    {
    persona: MeeBotPersona.Wise,
    description: 'An old bot resembling a metallic owl, with gears turning slowly and eyes that glow with wisdom.',
    mood: 'contemplative',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // Placeholder white
    createdAt: 1672790400000,
  },
];
