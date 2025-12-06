import type { Persona } from '../types';
import { mockPersonas } from '../data/mockPersonas';

const STORAGE_KEY = 'meebot_personas_v1';

// Helper to simulate network delay for realistic UI feedback
const simulateDelay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

const loadFromStorage = (): Persona[] => {
  if (typeof window === 'undefined') return [...mockPersonas];
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    }
  } catch (error) {
    console.warn('Failed to load personas:', error);
  }
  return [...mockPersonas];
};

const saveToStorage = (personas: Persona[]) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
    } catch (error) {
        console.warn('Failed to save personas:', error);
    }
}

// In-memory cache initialized from storage
let personasCache: Persona[] = loadFromStorage();

export async function getPersonas(): Promise<Persona[]> {
  await simulateDelay();
  // Refresh from storage to sync across tabs (basic implementation)
  personasCache = loadFromStorage();
  return [...personasCache].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addPersona(personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const newPersona: Persona = {
    id: `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ...personaData,
  };
  personasCache = [...personasCache, newPersona];
  saveToStorage(personasCache);
  return newPersona;
}

export async function updatePersona(id: string, personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const index = personasCache.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Persona not found');
  
  const updatedPersona = { ...personasCache[index], ...personaData };
  personasCache = [
      ...personasCache.slice(0, index),
      updatedPersona,
      ...personasCache.slice(index + 1)
  ];
  saveToStorage(personasCache);
  return updatedPersona;
}

export async function deletePersona(id: string): Promise<void> {
  await simulateDelay();
  personasCache = personasCache.filter(p => p.id !== id);
  saveToStorage(personasCache);
}