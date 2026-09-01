import React, { useEffect, useState } from 'react';

const themes = [
    { id: 'default', name: 'Default Dark', color: '#00f2fe' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#ff00ff' },
    { id: 'light', name: 'Clean Light', color: '#f3f4f6' },
];

export const ThemePicker: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState('default');

    useEffect(() => {
        const saved = localStorage.getItem('bingo_mega_theme') || 'default';
        setCurrentTheme(saved);
        document.documentElement.className = `theme-${saved}`;
    }, []);

    const changeTheme = (id: string) => {
        setCurrentTheme(id);
        localStorage.setItem('bingo_mega_theme', id);
        document.documentElement.className = `theme-${id}`;
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            {themes.map(t => (
                <button
                    key={t.id}
                    className="btn btn-ghost"
                    onClick={() => changeTheme(t.id)}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        border: currentTheme === t.id ? `1px solid ${t.color}` : undefined,
                        color: currentTheme === t.id ? t.color : 'var(--text-muted)'
                    }}
                >
                    {t.name}
                </button>
            ))}
        </div>
    );
};
