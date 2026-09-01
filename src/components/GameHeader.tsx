import React from 'react';
import type { PlayerId, GameMode, AIDifficulty, PlayerBingoState } from '../types/game';
import { Volume2, VolumeX, Home, RotateCcw, Bot, Globe, Users } from 'lucide-react';

interface GameHeaderProps {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  turn: PlayerId;
  winner: PlayerId | 'tie' | null;
  p1Name: string;
  p2Name: string;
  p1State: PlayerBingoState;
  p2State: PlayerBingoState;
  p1Score: number;
  p2Score: number;
  myPlayerId: PlayerId;
  isMuted: boolean;
  isVoiceEnabled?: boolean;
  onToggleMute: () => void;
  onToggleVoice?: () => void;
  onNewGame: () => void;
  onGoHome: () => void;
}

const BINGO_CHARS = ['B', 'I', 'N', 'G', 'O'];

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  aiDifficulty,
  turn,
  winner,
  p1Name,
  p2Name,
  p1State,
  p2State,
  p1Score,
  p2Score,
  myPlayerId,
  isMuted,
  isVoiceEnabled = true,
  onToggleMute,
  onToggleVoice,
  onNewGame,
  onGoHome,
}) => {
  const getTurnMessage = () => {
    if (winner) {
      if (winner === 'tie') return 'Game Tied!';
      if (mode === 'vs-computer') {
        return winner === 'player1' ? '🎉 BINGO! You Defeated the AI!' : '🤖 BINGO! Computer Won!';
      }
      return `🎉 BINGO! ${winner === 'player1' ? p1Name : p2Name} Won!`;
    }

    if (mode === 'vs-computer') {
      return turn === 'player1' ? '👉 Your Turn (Call a Number)' : '🤖 Computer Calling Number...';
    }

    if (mode === 'offline-2p') {
      return `👉 ${turn === 'player1' ? p1Name : p2Name}'s Turn to Call`;
    }

    if (turn === myPlayerId) {
      return '👉 Your Turn to Call a Number';
    }
    return `⏳ ${turn === 'player1' ? p1Name : p2Name}'s Turn to Call...`;
  };

  const getTurnColor = () => {
    if (winner && winner !== 'tie') {
      return winner === 'player1' ? 'var(--color-p1)' : winner === 'computer' ? 'var(--color-cpu)' : 'var(--color-p2)';
    }
    return turn === 'player1' ? 'var(--color-p1)' : turn === 'computer' ? 'var(--color-cpu)' : 'var(--color-p2)';
  };

  const turnColor = getTurnColor();
  const badgeClass =
    mode === 'vs-computer'
      ? 'badge badge-cpu'
      : mode === 'offline-2p'
        ? 'badge badge-p2'
        : 'badge badge-p1';

  const p1DisplayName = mode === 'online-2p' && myPlayerId === 'player1' ? `${p1Name} (YOU)` : p1Name;
  const p2DisplayName =
    mode === 'vs-computer'
      ? 'Computer'
      : mode === 'online-2p' && myPlayerId === 'player2'
        ? `${p2Name} (YOU)`
        : p2Name;
  const p2ScoreColor = mode === 'vs-computer' ? 'var(--color-cpu)' : 'var(--color-p2)';

  const renderBingoBadges = (lineCount: number, activeColor: string) => {
    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        {BINGO_CHARS.map((char, idx) => {
          const isAchieved = idx < lineCount;
          return (
            <span
              key={char}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 900,
                background: isAchieved ? activeColor : 'rgba(255, 255, 255, 0.08)',
                color: isAchieved ? '#000' : 'var(--text-muted)',
                border: isAchieved ? `1px solid ${activeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isAchieved ? `0 0 10px ${activeColor}` : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <header style={{ width: '100%', maxWidth: '640px', marginBottom: '16px' }}>
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <button className="btn btn-ghost" onClick={onGoHome} style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
          <Home size={18} /> Menu
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={badgeClass} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {mode === 'vs-computer' ? <Bot size={14} /> : mode === 'offline-2p' ? <Users size={14} /> : <Globe size={14} />}
            {mode === 'vs-computer' ? `VS AI (${aiDifficulty.toUpperCase()})` : mode === 'offline-2p' ? 'OFFLINE 2P' : 'ONLINE 2P'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onToggleVoice && (
            <button
              className="btn btn-ghost"
              onClick={onToggleVoice}
              style={{ padding: '8px', borderRadius: '50%' }}
              title={isVoiceEnabled ? 'Mute Caller Voice' : 'Enable Caller Voice'}
            >
              <div style={{ fontSize: '1.2rem', lineHeight: '1rem', opacity: isVoiceEnabled ? 1 : 0.4 }}>🗣️</div>
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={onToggleMute}
            style={{ padding: '8px', borderRadius: '50%' }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={20} color="#ff0844" /> : <Volume2 size={20} color="#00f2fe" />}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onNewGame}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            title="Start New Game"
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>

      {/* Scoreboard, B-I-N-G-O Line Tracker, and Turn Indicator */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Player 1 Card & Bingo Progress */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {p1DisplayName} ({p1Score} PTS)
          </div>
          {renderBingoBadges(p1State.lineCount, 'var(--color-p1)')}
        </div>

        {/* Turn Status Center Box */}
        <div
          className="turn-pulse"
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.4)',
            border: `1px solid ${turnColor}`,
            color: turnColor,
            boxShadow: `0 0 15px ${turnColor}44`,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            maxWidth: '200px',
          }}
        >
          {getTurnMessage()}
        </div>

        {/* Player 2 / Computer Card & Bingo Progress */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {p2DisplayName} ({p2Score} PTS)
          </div>
          {renderBingoBadges(p2State.lineCount, p2ScoreColor)}
        </div>
      </div>
    </header>
  );
};
