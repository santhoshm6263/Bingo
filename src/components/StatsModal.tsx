import React, { useState, useEffect } from 'react';
import { X, Activity } from 'lucide-react';
import { getStats } from '../utils/storage';
import type { GameStats } from '../utils/storage';

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState<GameStats | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStats(getStats());
        }
    }, [isOpen]);

    if (!isOpen || !stats) return null;

    const renderStatCard = (title: string, data: { wins: number; losses: number; ties: number; totalGames: number }) => {
        const winRate = data.totalGames > 0 ? ((data.wins / data.totalGames) * 100).toFixed(1) : '0.0';
        return (
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                <h4 style={{ color: 'var(--color-p1)', marginBottom: '12px', fontSize: '1rem', fontWeight: 700 }}>{title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)' }}>Wins</div>
                        <div style={{ fontWeight: 800, color: '#00f2fe' }}>{data.wins}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)' }}>Losses</div>
                        <div style={{ fontWeight: 800, color: '#ff0844' }}>{data.losses}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)' }}>Ties</div>
                        <div style={{ fontWeight: 800 }}>{data.ties}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Win Rate</div>
                        <div style={{ fontWeight: 800, color: '#e0c3fc' }}>{winRate}%</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '420px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={22} color="#00f2fe" />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Player Stats</h2>
                    </div>
                    <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <div>
                    {renderStatCard('VS Computer', stats.vsComputer)}
                    {renderStatCard('Offline 2-Player', stats.offline2p)}
                    {renderStatCard('Online Multiplayer', stats.online2p)}
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={onClose}>
                    Awesome!
                </button>
            </div>
        </div>
    );
};
