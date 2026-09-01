import React from 'react';
import type { PlayerId, PlayerBingoState, WinningLine, GameMode } from '../types/game';
import { UserCheck, Bot, Globe, Users } from 'lucide-react';

interface GameBoardProps {
  p1State: PlayerBingoState;
  p2State: PlayerBingoState;
  turn: PlayerId;
  winner: PlayerId | 'tie' | null;
  p1Name: string;
  p2Name: string;
  myPlayerId: PlayerId;
  mode: GameMode;
  onCallNumber: (num: number) => void;
}

const BINGO_CHARS = ['B', 'I', 'N', 'G', 'O'];

export const GameBoard: React.FC<GameBoardProps> = ({
  p1State,
  p2State,
  turn,
  winner,
  p1Name,
  p2Name,
  myPlayerId,
  mode,
  onCallNumber,
}) => {
  const isP1Turn = turn === 'player1' && winner === null;
  const isP2Turn = turn === 'player2' && winner === null;

  const myTitle = mode === 'online-2p' ? `${p1Name} (Your Board)` : `${p1Name}'s Board`;
  const oppTitle =
    mode === 'vs-computer'
      ? 'Computer Board'
      : mode === 'online-2p'
        ? `${p2Name} (Opponent Board)`
        : `${p2Name}'s Board`;

  const p1Color = 'var(--color-p1)';
  const p2Color = mode === 'vs-computer' ? 'var(--color-cpu)' : 'var(--color-p2)';

  const renderBoardGrid = (
    state: PlayerBingoState,
    isThisBoardActiveTurn: boolean,
    boardOwnerColor: string,
    ownerTitle: string,
    isCpuBoard: boolean
  ) => {
    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: '0 auto',
          border: isThisBoardActiveTurn ? `2px solid ${boardOwnerColor}` : '1px solid var(--card-border)',
          boxShadow: isThisBoardActiveTurn ? `0 0 20px ${boardOwnerColor}33` : 'var(--shadow-lg)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Board Header & B-I-N-G-O Badges */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800 }}>
            {isCpuBoard ? (
              <Bot size={18} color={p2Color} />
            ) : mode === 'offline-2p' ? (
              <Users size={18} color={boardOwnerColor} />
            ) : isThisBoardActiveTurn ? (
              <UserCheck size={18} color={p1Color} />
            ) : (
              <Globe size={18} color={p2Color} />
            )}
            <span style={{ color: boardOwnerColor }}>{ownerTitle}</span>
          </div>

          {/* B-I-N-G-O Badges */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {BINGO_CHARS.map((char, idx) => {
              const isAchieved = idx < state.lineCount;
              return (
                <span
                  key={char}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    background: isAchieved ? boardOwnerColor : 'rgba(255, 255, 255, 0.08)',
                    color: isAchieved ? '#000' : 'var(--text-muted)',
                    border: isAchieved ? `1px solid ${boardOwnerColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isAchieved ? `0 0 8px ${boardOwnerColor}` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* 5x5 Grid Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
              gap: '6px',
              position: 'relative',
            }}
          >
            {state.board.map((cell) => {
              const isMarked = cell.marked;
              const isP1Mark = cell.markedBy === 'player1';
              const isCpuMark = cell.markedBy === 'computer';

              let cellBg = 'rgba(255, 255, 255, 0.04)';
              let cellBorder = '1px solid rgba(255, 255, 255, 0.1)';
              let textColor = 'var(--text-main)';
              let glowShadow = 'none';

              if (isMarked) {
                if (isP1Mark) {
                  cellBg = 'linear-gradient(135deg, rgba(0, 242, 254, 0.3) 0%, rgba(79, 172, 254, 0.18) 100%)';
                  cellBorder = '1.5px solid var(--color-p1)';
                  textColor = 'var(--color-p1)';
                  glowShadow = '0 0 10px var(--color-p1-glow)';
                } else if (isCpuMark) {
                  cellBg = 'linear-gradient(135deg, rgba(127, 0, 255, 0.3) 0%, rgba(224, 195, 252, 0.18) 100%)';
                  cellBorder = '1.5px solid var(--color-cpu)';
                  textColor = '#e0c3fc';
                  glowShadow = '0 0 10px var(--color-cpu-glow)';
                } else {
                  cellBg = 'linear-gradient(135deg, rgba(255, 8, 68, 0.3) 0%, rgba(255, 177, 153, 0.18) 100%)';
                  cellBorder = '1.5px solid var(--color-p2)';
                  textColor = 'var(--color-p2)';
                  glowShadow = '0 0 10px var(--color-p2-glow)';
                }
              }

              const canClickCell =
                !isMarked &&
                winner === null &&
                (mode === 'offline-2p'
                  ? true
                  : turn === myPlayerId);

              const animationName = cell.animating ? 'cellClaimPulse 0.35s ease-out' : 'none';

              return (
                <button
                  key={cell.id}
                  onClick={() => {
                    if (canClickCell) {
                      onCallNumber(cell.number);
                    }
                  }}
                  disabled={!canClickCell}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: cellBg,
                    border: cellBorder,
                    borderRadius: 'var(--radius-md)',
                    color: textColor,
                    fontSize: 'clamp(1rem, 3.8vw, 1.6rem)',
                    fontWeight: 800,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: canClickCell ? 'pointer' : 'default',
                    boxShadow: glowShadow,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: animationName,
                    opacity: isMarked ? 0.85 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (canClickCell) {
                      e.currentTarget.style.transform = 'scale(1.06)';
                      e.currentTarget.style.borderColor = boardOwnerColor;
                      e.currentTarget.style.boxShadow = `0 0 12px ${boardOwnerColor}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMarked) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <span style={{ textDecoration: isMarked ? 'line-through' : 'none', position: 'relative', zIndex: 2 }}>{cell.number}</span>
                  {
                    !isMarked && cell.powerUp === 'freeSpace' && (
                      <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.6rem', opacity: 0.8, filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}>⭐</span>
                    )
                  }
                  {isMarked && (
                    <span style={{ position: 'absolute', bottom: '2px', fontSize: '0.6rem', fontWeight: 700 }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {/* SVG Completed Lines Overlay */}
            {renderWinningLinesSVG(state.completedLines, boardOwnerColor)}
          </div>
        </div>
      </div>
    );
  };

  const renderWinningLinesSVG = (completedLines: WinningLine[], strokeColor: string) => {
    if (!completedLines || completedLines.length === 0) return null;

    return (
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {completedLines.map((line, lIdx) => {
          const firstIdx = line.indices[0];
          const lastIdx = line.indices[4];

          const firstRow = Math.floor(firstIdx / 5);
          const firstCol = firstIdx % 5;
          const lastRow = Math.floor(lastIdx / 5);
          const lastCol = lastIdx % 5;

          const x1 = `${firstCol * 20 + 10}%`;
          const y1 = `${firstRow * 20 + 10}%`;
          const x2 = `${lastCol * 20 + 10}%`;
          const y2 = `${lastRow * 20 + 10}%`;

          return (
            <line
              key={`line-${line.type}-${line.lineIndex}-${lIdx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${strokeColor})`,
                transition: 'all 0.5s ease-in-out',
              }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      {/* Player 1 Board */}
      {renderBoardGrid(p1State, isP1Turn, p1Color, myTitle, false)}

      {/* Player 2 / Computer Board */}
      {renderBoardGrid(p2State, isP2Turn, p2Color, oppTitle, mode === 'vs-computer')}
    </div>
  );
};
