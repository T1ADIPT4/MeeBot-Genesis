import type { Persona } from '../types';
import { mockPersonas } from '../data/mockPersonas';

// Create an in-memory store initialized with mock data.
// This allows the app to be fully functional without a Firebase backend.
let inMemoryPersonas: Persona[] = [...mockPersonas];
let nextId = inMemoryPersonas.length + 1;

// Simulate network delay to mimic an async API call.
const simulateDelay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches personas from the in-memory store.
 * @returns A promise that resolves to an array of Persona objects.
 */
export async function getPersonas(): Promise<Persona[]> {
  await simulateDelay();
  // Return a sorted copy of the personas.
  return [...inMemoryPersonas].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Adds a new persona to the in-memory store.
 * @param personaData The data for the new persona.
 * @returns A promise that resolves to the newly created Persona object.
 */
export async function addPersona(personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const newPersona: Persona = {
    id: `persona-${nextId++}`,
    ...personaData,
  };
  inMemoryPersonas.push(newPersona);
  return newPersona;
}

/**
 * Updates an existing persona in the in-memory store.
 * @param id The ID of the persona to update.
 * @param personaData The new data for the persona.
 * @returns A promise that resolves to the updated Persona object.
 */
export async function updatePersona(id: string, personaData: Omit<Persona, 'id'>): Promise<Persona> {
  await simulateDelay();
  const personaIndex = inMemoryPersonas.findIndex(p => p.id === id);
  if (personaIndex === -1) {
    throw new Error('Persona not found');
  }
  const updatedPersona = { ...inMemoryPersonas[personaIndex], ...personaData };
  inMemoryPersonas[personaIndex] = updatedPersona;
  return updatedPersona;
}

/**
 * Deletes a persona from the in-memory store.
 * @param id The ID of the persona to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deletePersona(id: string): Promise<void> {
  await simulateDelay();
  inMemoryPersonas = inMemoryPersonas.filter(p => p.id !== id);
}
