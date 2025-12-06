
import React, { useState } from 'react';
import { Palette, PlusCircle, Edit, Trash2, LoaderCircle, AlertTriangle, X, Save } from 'lucide-react';
import { usePersonas } from '../../contexts/PersonaContext';
import { useMeeBots } from '../../contexts/MeeBotContext';
import type { Persona } from '../../types';
import { Skeleton } from '../Skeleton';

// Simple modal component
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string }> = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="bg-meebot-surface rounded-xl shadow-2xl p-6 w-full max-w-lg border border-meebot-border relative" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6 border-b border-meebot-border/50 pb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-meebot-text-secondary hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>
      </div>
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
            {error && (
                <div className="flex items-center gap-2 text-red-400 mb-4 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
            <div className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-bold text-meebot-text-secondary">Persona Name</label>
                    <input 
                        id="name" 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg text-white focus:border-meebot-primary outline-none focus:ring-1 focus:ring-meebot-primary transition-all" 
                        placeholder="e.g. Cyber Ninja"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block mb-1 text-sm font-bold text-meebot-text-secondary">Short Description</label>
                    <input 
                        id="description" 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg text-white focus:border-meebot-primary outline-none focus:ring-1 focus:ring-meebot-primary transition-all" 
                        placeholder="A brief summary of their character..."
                    />
                </div>
                 <div>
                    <label htmlFor="story" className="block mb-1 text-sm font-bold text-meebot-text-secondary">Backstory</label>
                    <textarea 
                        id="story" 
                        rows={3} 
                        value={story} 
                        onChange={e => setStory(e.target.value)} 
                        className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg text-white focus:border-meebot-primary outline-none focus:ring-1 focus:ring-meebot-primary transition-all" 
                        placeholder="Where did they come from? What is their purpose?"
                    />
                </div>
                <div>
                    <label htmlFor="prompts" className="block mb-1 text-sm font-bold text-meebot-text-secondary">Style Prompts</label>
                    <p className="text-xs text-meebot-text-secondary/70 mb-2">Enter one art style prompt per line (e.g., "Neon lights", "Pixel art").</p>
                    <textarea 
                        id="prompts" 
                        rows={4} 
                        value={stylePrompts} 
                        onChange={e => setStylePrompts(e.target.value)} 
                        className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg text-white focus:border-meebot-primary outline-none focus:ring-1 focus:ring-meebot-primary transition-all font-mono text-sm" 
                        placeholder="Neon lights&#10;Cyberpunk city background&#10;Vibrant colors"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-meebot-border/50">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent border border-meebot-border text-meebot-text-secondary hover:text-white hover:border-white transition-colors font-semibold">
                    Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-meebot-primary text-white font-bold hover:bg-opacity-90 transition-colors flex items-center shadow-lg shadow-meebot-primary/20">
                    {isSaving ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                    {isSaving ? 'Saving...' : 'Save Persona'}
                </button>
            </div>
        </form>
    );
};

export const PersonaManagementPage: React.FC = () => {
    const { personas, isLoading, addPersona, updatePersona, deletePersona } = usePersonas();
    const { notifyPersonaCreated } = useMeeBots();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

    const handleCreate = async (data: Omit<Persona, 'id'>) => {
        await addPersona(data);
        notifyPersonaCreated(); // Trigger mission/badge progress
    };

    const handleEdit = async (data: Omit<Persona, 'id'>) => {
        if (editingPersona) {
            await updatePersona(editingPersona.id, data);
        }
    };

    const openCreateModal = () => {
        setEditingPersona(null);
        setIsModalOpen(true);
    };

    const openEditModal = (persona: Persona) => {
        setEditingPersona(persona);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this persona? This cannot be undone.")) {
            await deletePersona(id);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div className="flex items-center">
                    <Palette className="w-10 h-10 text-meebot-primary mr-4" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Persona Management</h1>
                        <p className="text-meebot-text-secondary mt-1">
                            Create and customize the identities that shape your MeeBots.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="flex items-center px-6 py-3 bg-meebot-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-bold shadow-lg hover:shadow-meebot-primary/30 transform hover:-translate-y-0.5"
                >
                    <PlusCircle className="w-5 h-5 mr-2"/>
                    Create New Persona
                </button>
            </div>

            {isModalOpen && (
                <Modal 
                    onClose={() => setIsModalOpen(false)} 
                    title={editingPersona ? "Edit Persona" : "Create New Persona"}
                >
                    <PersonaForm 
                        persona={editingPersona} 
                        onSave={editingPersona ? handleEdit : handleCreate} 
                        onClose={() => setIsModalOpen(false)} 
                    />
                </Modal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-meebot-surface border border-meebot-border rounded-xl p-6 space-y-4">
                            <Skeleton className="h-8 w-3/4 mb-2"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-24 w-full rounded-lg"/>
                            <div className="pt-4 flex gap-2">
                                <Skeleton className="h-8 w-16"/>
                                <Skeleton className="h-8 w-8"/>
                            </div>
                        </div>
                    ))
                ) : (
                    personas.map(persona => (
                        <div key={persona.id} className="bg-meebot-surface border border-meebot-border rounded-xl p-6 flex flex-col hover:border-meebot-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-meebot-primary/5">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-meebot-primary transition-colors line-clamp-1">{persona.name}</h3>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(persona)} className="p-2 text-meebot-text-secondary hover:text-white hover:bg-meebot-border rounded-lg transition-colors" title="Edit">
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => handleDelete(persona.id)} className="p-2 text-meebot-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-meebot-text-secondary mb-4 italic border-l-2 border-meebot-accent pl-3">
                                "{persona.description}"
                            </p>
                            
                            <div className="text-xs text-meebot-text-secondary/80 bg-meebot-bg p-4 rounded-lg mb-4 flex-grow overflow-y-auto max-h-32 custom-scrollbar border border-meebot-border/50">
                                <strong className="block text-meebot-primary mb-1 uppercase tracking-wider text-[10px]">Backstory</strong>
                                {persona.story}
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-meebot-border/50 flex justify-between items-center">
                                <span className="text-xs font-semibold text-meebot-text-secondary bg-meebot-bg px-2 py-1 rounded border border-meebot-border">
                                    {persona.stylePrompts.length} Styles
                                </span>
                                <span className="text-[10px] text-meebot-text-secondary/50 font-mono">ID: {persona.id.substring(0,8)}...</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!isLoading && personas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-meebot-surface border border-dashed border-meebot-border rounded-xl text-meebot-text-secondary">
                    <Palette className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-xl font-bold text-white mb-2">No Personas Found</p>
                    <p className="mb-6">Create your first custom persona to get started!</p>
                    <button 
                        onClick={openCreateModal}
                        className="px-6 py-2 bg-meebot-surface border border-meebot-primary text-meebot-primary hover:bg-meebot-primary hover:text-white rounded-lg transition-colors font-bold"
                    >
                        Create Persona
                    </button>
                </div>
            )}
        </div>
    );
};
