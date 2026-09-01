import React, { useState } from 'react';
import type { AIDifficulty } from '../types/game';
import { Bot, Globe, HelpCircle, User, Zap, Sparkles, Users, Activity } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { ThemePicker } from './ThemePicker';

interface HomeScreenProps {
  p1Name: string;
  p2Name: string;
  onUpdateP1Name: (name: string) => void;
  onUpdateP2Name: (name: string) => void;
  onStartVsComputer: (difficulty: AIDifficulty) => void;
  onStartOffline2P: () => void;
  powerUpMode: boolean;
  onTogglePowerUpMode: () => void;
  onOpenOnlineModal: () => void;
  onOpenHowToPlay: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  p1Name,
  p2Name,
  onUpdateP1Name,
  onUpdateP2Name,
  onStartVsComputer,
  onStartOffline2P,
  powerUpMode,
  onTogglePowerUpMode,
  onOpenOnlineModal,
  onOpenHowToPlay,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '540px',
        padding: '36px 28px',
        textAlign: 'center',
        margin: '0 auto',
      }}
    >
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '0.85rem',
            color: 'var(--color-p1)',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Sparkles size={16} /> 5×5 NUMBER STRATEGY
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #00f2fe 50%, #4facfe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}
        >
          BINGO 1–25
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Call numbers 1–25. Be the first to complete 5 lines (B-I-N-G-O) to win!
        </p>
      </div>

      {/* Player Names Input Section */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--card-border)',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          textAlign: 'left',
        }}
      >
        <div>
          <label
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-p1)',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px',
            }}
          >
            <User size={13} /> Player 1 Name
          </label>
          <input
            type="text"
            className="input-field"
            value={p1Name}
            onChange={(e) => onUpdateP1Name(e.target.value)}
            placeholder="Player 1"
            maxLength={14}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-p2)',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px',
            }}
          >
            <User size={13} /> Player 2 Name
          </label>
          <input
            type="text"
            className="input-field"
            value={p2Name}
            onChange={(e) => onUpdateP2Name(e.target.value)}
            placeholder="Player 2"
            maxLength={14}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* POWER UPS TOGGLE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '10px' }}>
        <button
          onClick={onTogglePowerUpMode}
          style={{
            background: powerUpMode ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: powerUpMode ? '1px solid var(--color-p1)' : '1px solid var(--card-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {powerUpMode ? '⭐ Power-Ups Enabled' : '⚪ Classic Mode'}
        </button>
      </div>

      {/* VS COMPUTER SECTION */}
      <div
        style={{
          background: 'rgba(127, 0, 255, 0.08)',
          border: '1px solid rgba(127, 0, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Bot size={20} color="var(--color-cpu)" />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            Play vs Computer
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => {
            const isSelected = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected
                    ? '1.5px solid var(--color-cpu)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSelected ? 'rgba(127, 0, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {diff}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-cpu"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => onStartVsComputer(selectedDifficulty)}
        >
          <Zap size={18} /> Start vs AI ({selectedDifficulty})
        </button>
      </div>

      {/* 2-PLAYER MODES (OFFLINE & ONLINE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
          onClick={onStartOffline2P}
        >
          <Users size={20} /> Play Offline 2P (Pass & Play)
        </button>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
          onClick={onOpenOnlineModal}
        >
          <Globe size={20} /> Play Online 2P (Room Code)
        </button>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => setIsStatsOpen(true)}
        >
          <Activity size={18} /> View Match History & Stats
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', padding: '12px' }}
          onClick={onOpenHowToPlay}
        >
          <HelpCircle size={18} /> How to Play Rules
        </button>
      </div>

      <ThemePicker />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
};
