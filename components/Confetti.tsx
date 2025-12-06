
import React from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#00CFE8', '#FF1B93', '#FFD700', '#FFFFFF'];

export const Confetti: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
            {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}vw`,
                    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                    animation: `confetti-fall ${Math.random() * 3 + 2}s ${Math.random() * 2}s linear forwards`,
                    width: `${Math.floor(Math.random() * 10) + 8}px`,
                    height: `${Math.floor(Math.random() * 6) + 5}px`,
                    opacity: Math.random() + 0.5,
                };
                return <div key={i} className="absolute top-[-10vh] rounded-sm" style={style} />;
            })}
        </div>
    );
};
