import React, { useState } from 'react';
import { Palette, PlusCircle, Edit, Trash2, LoaderCircle, AlertTriangle } from 'lucide-react';
import { usePersonas } from '../../contexts/PersonaContext';
import { useMeeBots } from '../../contexts/MeeBotContext';
import type { Persona } from '../../types';
import { Skeleton } from '../Skeleton';

// Simple modal component
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
    <div className="bg-meebot-surface rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const PersonaForm: React.FC<{
    persona?: Persona | null;
    onSave: (data: Omit<Persona, 'id'>) => Promise<void>;
    onClose: () => void;
}> = ({ persona, onSave, onClose }) => {
    const [name, setName] = useState(persona?.name || '');
    const [description, setDescription] = useState(persona?.description || '');
    const [story, setStory] = useState(persona?.story || '');
    const [stylePrompts, setStylePrompts] = useState(persona?.stylePrompts.join('\n') || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const prompts = stylePrompts.split('\n').map(p => p.trim()).filter(Boolean);
        if (!name || !description || !story || prompts.length === 0) {
            setError('All fields and at least one style prompt are required.');
            return;
        }
        setIsSaving(true);
        try {
            await onSave({ name, description, story, stylePrompts: prompts });
            onClose();
        } catch (err) {
            setError('Failed to save persona. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-4 text-white">{persona ? 'Edit' : 'Create'} Persona</h3>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Name</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-lg"/>
                </div>
                <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Description</label>
                    <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-lg"/>
                </div>
                 <div>
                    <label htmlFor="story" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Core Traits & Background Story</label>
                    <textarea id="story" value={story} onChange={e => setStory(e.target.value)} rows={4} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-lg"/>
                </div>
                <div>
                    <label htmlFor="stylePrompts" className="block mb-2 text-sm font-medium text-meebot-text-secondary">Style Prompts (one per line)</label>
                    <textarea id="stylePrompts" value={stylePrompts} onChange={e => setStylePrompts(e.target.value)} rows={5} className="w-full p-2 bg-meebot-bg border border-meebot-border rounded-lg font-mono text-sm"/>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-meebot-border text-meebot-text-primary">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-meebot-primary text-white flex items-center disabled:bg-meebot-text-secondary">
                    {isSaving && <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/>}
                    Save Persona
                </button>
            </div>
        </form>
    );
};


export const PersonaManagementPage: React.FC = () => {
    const { personas, isLoading, error, addPersona, updatePersona, deletePersona } = usePersonas();
    const { notifyPersonaCreated } = useMeeBots();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

    const handleOpenCreate = () => {
        setEditingPersona(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (persona: Persona) => {
        setEditingPersona(persona);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this persona?')) {
            try {
                await deletePersona(id);
            } catch (e) {
                alert('Failed to delete persona.');
            }
        }
    }

    const handleSave = async (data: Omit<Persona, 'id'>) => {
        if (editingPersona) {
            await updatePersona(editingPersona.id, data);
        } else {
            await addPersona(data);
            // Notify the achievement system that a new persona was created
            notifyPersonaCreated();
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)}><PersonaForm persona={editingPersona} onSave={handleSave} onClose={() => setIsModalOpen(false)}/></Modal>}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <Palette className="w-10 h-10 text-meebot-accent mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Persona Management</h1>
                        <p className="text-meebot-text-secondary mt-1">Create and customize the archetypes for your MeeBots.</p>
                    </div>
                </div>
                 <button onClick={handleOpenCreate} className="flex items-center px-4 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Persona
                </button>
            </div>

            {isLoading && (
                <div className="bg-meebot-surface border border-meebot-border rounded-lg shadow-lg">
                    <ul className="divide-y divide-meebot-border">
                         {Array.from({ length: 3 }).map((_, i) => (
                            <li key={i} className="p-4 flex justify-between items-center">
                                <div className="flex-1 pr-4">
                                    <Skeleton className="h-6 w-1/3 mb-2" />
                                    <Skeleton className="h-4 w-2/3 mb-2" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <div className="flex gap-2">
                                     <Skeleton className="w-9 h-9 rounded" />
                                     <Skeleton className="w-9 h-9 rounded" />
                                </div>
                            </li>
                         ))}
                    </ul>
                </div>
            )}

            {error && <div className="flex flex-col justify-center items-center h-64 text-red-400"><AlertTriangle className="w-10 h-10 mb-2"/><p>{error}</p></div>}
            
            {!isLoading && !error && (
                <div className="bg-meebot-surface border border-meebot-border rounded-lg shadow-lg">
                    <ul className="divide-y divide-meebot-border">
                        {personas.map(persona => (
                            <li key={persona.id} className="p-4 flex justify-between items-center">
                                <div className="flex-1 pr-4">
                                    <h3 className="font-bold text-lg text-white">{persona.name}</h3>
                                    <p className="text-sm text-meebot-text-secondary">{persona.description}</p>
                                     <p className="text-xs mt-2 text-meebot-text-secondary/80 italic border-l-2 border-meebot-border pl-2">{persona.story}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleOpenEdit(persona)} className="p-2 text-meebot-text-secondary hover:text-meebot-primary"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(persona.id)} className="p-2 text-meebot-text-secondary hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            </li>
                        ))}
                         {personas.length === 0 && <li className="p-8 text-center text-meebot-text-secondary">No personas created yet. Click "Create Persona" to get started.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};
