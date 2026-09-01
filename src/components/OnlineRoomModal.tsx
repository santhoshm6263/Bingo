import React, { useState, useEffect } from 'react';
import { peerService } from '../services/peerService';
import { soundManager } from '../utils/audio';
import { Copy, Check, Globe, Users, ArrowRight, X, Loader2 } from 'lucide-react';

interface OnlineRoomModalProps {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
  onRoomConnected: (roomCode: string, isHost: boolean) => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomConnected,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen && !roomCode) {
      setRoomCode(peerService.generateRoomCode());
    }

    const unsubStatus = peerService.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMsg(msg);

      if (newStatus === 'connected') {
        soundManager.playRoomJoin();
        const isHost = peerService.getIsHost();
        onRoomConnected(peerService.getRoomCode(), isHost);
      }
    });

    return () => unsubStatus();
  }, [isOpen, roomCode, onRoomConnected]);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    try {
      setStatus('connecting');
      setStatusMsg('Initializing room host...');
      await peerService.createRoom(roomCode);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) return;
    try {
      setStatus('connecting');
      setStatusMsg(`Connecting to room ${joinCodeInput.toUpperCase()}...`);
      await peerService.joinRoom(joinCodeInput.trim());
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBg =
    status === 'error' || status === 'disconnected'
      ? 'rgba(255, 8, 68, 0.15)'
      : status === 'connected'
      ? 'rgba(0, 242, 254, 0.15)'
      : 'rgba(255, 255, 255, 0.05)';

  const statusBorder =
    status === 'error' || status === 'disconnected'
      ? '1px solid var(--color-p2)'
      : status === 'connected'
      ? '1px solid var(--color-p1)'
      : '1px solid var(--card-border)';

  const statusColor = status === 'error' || status === 'disconnected' ? 'var(--color-p2)' : '#fff';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={22} color="var(--color-p1)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Play Online 2P</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setTab('create')}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'create' ? 'var(--color-p1-grad)' : 'transparent',
              color: tab === 'create' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create Room
          </button>
          <button
            onClick={() => setTab('join')}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'join' ? 'var(--color-p2-grad)' : 'transparent',
              color: tab === 'join' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Join Room
          </button>
        </div>

        {/* Tab Content: Create Room */}
        {tab === 'create' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Share this room code with Player 2 so they can join your match.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px dashed var(--color-p1)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ROOM CODE</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', color: 'var(--color-p1)' }}>
                  {roomCode}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={copyRoomCode} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                {copied ? <Check size={16} color="#00f2fe" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {status === 'idle' && (
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleCreateRoom}>
                <Users size={18} /> Host Game Room
              </button>
            )}
          </div>
        )}

        {/* Tab Content: Join Room */}
        {tab === 'join' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Enter the 5-character Room Code given by your friend to join.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                className="input-field"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. X7K9P"
                maxLength={8}
                style={{ fontSize: '1.3rem', letterSpacing: '3px', textAlign: 'center', textTransform: 'uppercase' }}
              />
            </div>

            {status === 'idle' && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '14px' }}
                onClick={handleJoinRoom}
                disabled={!joinCodeInput.trim()}
              >
                <ArrowRight size={18} /> Join Game Room
              </button>
            )}
          </div>
        )}

        {/* Connection Loader / Status Message */}
        {status !== 'idle' && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: statusBg,
              border: statusBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              color: statusColor,
            }}
          >
            {status === 'connecting' && <Loader2 size={20} className="turn-pulse" />}
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
