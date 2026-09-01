import React from 'react';
import type { PlayerId, GameMode } from '../types/game';
import { Trophy, RotateCcw, Home, Frown } from 'lucide-react';

interface GameOverModalProps {
  winner: PlayerId | 'tie' | null;
  mode: GameMode;
  p1Name: string;
  p2Name: string;
  p1Score: number;
  p2Score: number;
  myPlayerId: PlayerId;
  onRematch: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  mode,
  p1Name,
  p2Name,
  p1Score,
  p2Score,
  myPlayerId,
  onRematch,
  onGoHome,
}) => {
  if (!winner) return null;

  const isTie = winner === 'tie';
  const isWinnerMe = winner === myPlayerId;
  const isCpuWinner = winner === 'computer';

  const getWinnerText = () => {
    if (isTie) return 'Game Tied!';
    if (mode === 'vs-computer') {
      return winner === 'player1' ? '🎉 BINGO! You Defeated the AI!' : '🤖 BINGO! Computer Wins!';
    }
    if (isWinnerMe) return '🏆 BINGO VICTORY! YOU WON!';
    return `🎉 BINGO! ${winner === 'player1' ? p1Name : p2Name} Wins!`;
  };

  const getWinnerColor = () => {
    if (isTie) return 'var(--text-muted)';
    if (winner === 'player1') return 'var(--color-p1)';
    if (winner === 'computer') return 'var(--color-cpu)';
    return 'var(--color-p2)';
  };

  const winnerColor = getWinnerColor();

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        {/* Icon Header */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: `2px solid ${winnerColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: `0 0 25px ${winnerColor}`,
          }}
        >
          {isWinnerMe ? (
            <Trophy size={36} color="var(--color-p1)" />
          ) : isCpuWinner ? (
            <Frown size={36} color="var(--color-cpu)" />
          ) : (
            <Trophy size={36} color="var(--color-p2)" />
          )}
        </div>

        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: winnerColor,
            marginBottom: '8px',
          }}
        >
          {getWinnerText()}
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          {isTie
            ? 'All numbers were called without reaching 5 lines!'
            : 'Completed 5 total lines (B-I-N-G-O) to win!'}
        </p>

        {/* Score Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p1Name}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-p1)' }}>
              {p1Score}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {mode === 'vs-computer' ? 'Computer' : p2Name}
            </div>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: mode === 'vs-computer' ? 'var(--color-cpu)' : 'var(--color-p2)',
              }}
            >
              {p2Score}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={onRematch}>
            <RotateCcw size={18} /> Play Again / Rematch
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', padding: '12px' }} onClick={onGoHome}>
            <Home size={18} /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
