import type { Persona } from '../types';

// In-memory store to mock a database since there is no running backend.
// This resolves the "Failed to fetch personas" error.
let mockPersonas: Persona[] = [
  {
    id: '1',
    name: 'Creative Soul',
    description: 'A visionary artist, always exploring new forms of expression.',
    stylePrompts: [
      'Ethereal watercolor painting, soft pastel colors, dreamlike atmosphere',
      'Dynamic abstract art, splashes of vibrant neon paint, energetic and chaotic',
      'Surrealist digital collage, blending vintage illustrations with cosmic elements'
    ]
  },
  {
    id: '2',
    name: 'Guardian Protector',
    description: 'A steadfast and powerful defender, radiating strength and safety.',
    stylePrompts: [
      'Heroic fantasy character art, polished steel armor, dramatic cinematic lighting',
      'Cyberpunk concept art, glowing neon accents, carbon fiber plating, defensive energy shield',
      'Ancient stone golem, overgrown with moss, standing in a misty, primordial forest'
    ]
  },
  {
    id: '3',
    name: 'Data Wizard',
    description: 'An ancient being of immense knowledge, seeing past, present, and future.',
    stylePrompts: [
      'Cosmic entity made of starlight, surrounded by floating holographic data streams',
      'Steampunk animatronic, intricate brass clockwork, glowing vacuum tubes for eyes',
      'Pixel art sprite, 16-bit, with a flowing robe made of glitched data patterns'
    ]
  },
  {
    id: '4',
    name: 'Energetic Spark',
    description: 'A vibrant and fast-moving bot, crackling with raw energy.',
    stylePrompts: [
        'Sleek, aerodynamic form made of pure lightning, motion blur effect',
        'Bold pop art style, halftone dots, vibrant flat colors, comic book aesthetic',
        'Fluid abstract sculpture, shimmering iridescent metal, constantly shifting shape'
    ]
  },
  {
    id: '5',
    name: 'Nature Synth',
    description: 'A harmonious blend of technology and the natural world.',
    stylePrompts: [
        'Biomechanical concept art, polished chrome skeleton intertwined with living vines',
        'Futuristic android with bioluminescent fungi patterns glowing on its chassis',
        'Character made of ancient, gnarled wood with vibrant crystals growing from its joints'
    ]
  }
];

let nextId = 6;

// Simulate network delay to make the UI feel more realistic
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPersonas(): Promise<Persona[]> {
  await simulateDelay();
  // Return a copy to prevent direct mutation of the mock data store
  return [...mockPersonas];
}

export async function addPersona(personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const newPersona: Persona = {
    id: (nextId++).toString(),
    ...personaData,
  };
  mockPersonas.push(newPersona);
  return newPersona;
}

export async function updatePersona(id: string, personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const personaIndex = mockPersonas.findIndex(p => p.id === id);
  if (personaIndex === -1) {
    throw new Error('Persona not found');
  }
  const updatedPersona = { id, ...personaData };
  mockPersonas[personaIndex] = updatedPersona;
  return updatedPersona;
}

export async function deletePersona(id: string): Promise<void> {
  await simulateDelay();
  const initialLength = mockPersonas.length;
  mockPersonas = mockPersonas.filter(p => p.id !== id);
  if (mockPersonas.length === initialLength) {
    throw new Error('Persona not found for deletion');
  }
}