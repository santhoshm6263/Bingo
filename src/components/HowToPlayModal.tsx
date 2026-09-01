import React from 'react';
import { X, CheckCircle, Target, Trophy, Bot, Globe } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-p1)' }}>
            📖 How to Play 5-Line Bingo 1–25
          </h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Rule Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', fontSize: '0.92rem', color: '#cbd5e1' }}>
          <div
            style={{
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={18} color="var(--color-p1)" /> 5×5 Randomized Boards
            </div>
            Each player has a 5×5 grid with numbers 1 through 25 shuffled randomly.
          </div>

          <div
            style={{
              background: 'rgba(255, 8, 68, 0.1)',
              border: '1px solid rgba(255, 8, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={18} color="var(--color-p2)" /> Calling Numbers
            </div>
            Players take turns calling out any unmarked number (1–25). When a number is called, it gets marked on <b>BOTH</b> players' boards!
          </div>

          <div
            style={{
              background: 'rgba(127, 0, 255, 0.1)',
              border: '1px solid rgba(127, 0, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={18} color="var(--color-cpu)" /> 5 Completed Lines = BINGO Win!
            </div>
            Every completed row, column, or diagonal of 5 marked numbers awards <b>1 Line</b>:
            <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li><b>1st Line:</b> B</li>
              <li><b>2nd Line:</b> I</li>
              <li><b>3rd Line:</b> N</li>
              <li><b>4th Line:</b> G</li>
              <li><b>5th Line:</b> O 🏆 (B-I-N-G-O Victory!)</li>
            </ul>
            The first player to complete <b>5 total lines</b> wins the game immediately!
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>🎮 Game Modes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={16} color="var(--color-cpu)" /> <b>VS Computer:</b> AI strategizes to maximize its own lines while blocking yours.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--color-p1)" /> <b>Play Online:</b> Create a room code to play real-time with a friend!
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }} onClick={onClose}>
          Got It! Let's Play
        </button>
      </div>
    </div>
  );
};
