import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Persona } from '../types';
import { getPersonas, addPersona, updatePersona, deletePersona as apiDeletePersona } from '../services/personaService';

interface PersonaContextType {
  personas: Persona[];
  isLoading: boolean;
  error: string | null;
  addPersona: (personaData: Omit<Persona, 'id'>) => Promise<void>;
  updatePersona: (id: string, personaData: Omit<Persona, 'id'>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  fetchPersonas: () => Promise<void>;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPersonas();
      setPersonas(data);
    } catch (err) {
      setError('Failed to load personas.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleAddPersona = async (personaData: Omit<Persona, 'id'>) => {
    const newPersona = await addPersona(personaData);
    setPersonas(prev => [...prev, newPersona].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdatePersona = async (id: string, personaData: Omit<Persona, 'id'>) => {
    const updatedPersona = await updatePersona(id, personaData);
    setPersonas(prev => prev.map(p => p.id === id ? updatedPersona : p).sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeletePersona = async (id: string) => {
    await apiDeletePersona(id);
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PersonaContext.Provider value={{ personas, isLoading, error, addPersona: handleAddPersona, updatePersona: handleUpdatePersona, deletePersona: handleDeletePersona, fetchPersonas }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersonas = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersonas must be used within a PersonaProvider');
  }
  return context;
};
