import React from 'react';

const EMOJIS = ['😂', '😡', '🎯', '🎉', '😱', '👀'];

interface ReactionsDeckProps {
    onSendReaction: (emoji: string) => void;
}

export const ReactionsDeck: React.FC<ReactionsDeckProps> = ({ onSendReaction }) => {
    return (
        <div
            style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--shadow-lg)'
            }}
        >
            {EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    className="btn-ghost"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.4rem',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.1s ease',
                        borderRadius: '50%'
                    }}
                    onClick={() => onSendReaction(emoji)}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};
