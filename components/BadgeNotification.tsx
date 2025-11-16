import React from 'react';
import type { Badge } from '../types';
import { Award, X } from 'lucide-react';
import { speak } from '../services/ttsService';

interface BadgeNotificationProps {
    badge: Badge;
    onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose }) => {
    
    // Speak a congratulatory message when the notification appears.
    React.useEffect(() => {
        const message = `Congratulations! You've unlocked the ${badge.name} badge!`;
        // Use a joyful tone for the celebration.
        speak(message, 'joyful');
    }, [badge]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-labelledby="badge-notification-title"
        >
            <div 
                className="relative bg-meebot-surface border-2 border-meebot-primary rounded-lg shadow-2xl p-6 w-full max-w-md text-center m-4 animate-glow" 
                onClick={e => e.stopPropagation()}
            >
                <Award className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 id="badge-notification-title" className="text-2xl font-bold text-white mb-2">Badge Unlocked!</h2>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                    <badge.icon className="w-6 h-6 text-meebot-primary" />
                    <h3 className="text-xl font-semibold text-meebot-primary">{badge.name}</h3>
                </div>

                <p className="text-meebot-text-secondary mb-6">{badge.description}</p>
                
                <button
                    onClick={onClose}
                    className="px-6 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-surface focus:ring-meebot-primary"
                >
                    Awesome!
                </button>

                 <button onClick={onClose} className="absolute top-2 right-2 p-2 text-meebot-text-secondary hover:text-white" aria-label="Close notification">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};