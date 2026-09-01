import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { PeerMessage } from '../types/game';

type MessageCallback = (msg: PeerMessage) => void;
type StatusCallback = (status: 'disconnected' | 'connecting' | 'connected' | 'error', message?: string) => void;

class PeerService {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private roomCode: string = '';
  private isHost: boolean = false;
  private onMessageCallbacks: MessageCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];

  /**
   * Helper to generate a clean 5-character alphanumeric room code
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private getFullPeerId(code: string): string {
    return `bingo-1to25-room-${code.toUpperCase().trim()}`;
  }

  /**
   * Create a new multiplayer game room as Host
   */
  public createRoom(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.destroy();
      this.roomCode = code.toUpperCase().trim();
      this.isHost = true;

      const peerId = this.getFullPeerId(this.roomCode);
      this.notifyStatus('connecting', 'Creating game room...');

      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        console.log('Room host peer opened:', id);
        this.notifyStatus('connecting', 'Waiting for Player 2 to join...');
        resolve(this.roomCode);
      });

      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.setupConnectionHandlers();
        this.notifyStatus('connected', 'Player 2 connected!');
      });

      this.peer.on('error', (err) => {
        console.error('Peer creation error:', err);
        this.notifyStatus('error', err.type === 'unavailable-id' ? 'Room code already in use. Please try another code.' : err.message);
        reject(err);
      });
    });
  }

  /**
   * Join an existing multiplayer game room as Guest
   */
  public joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.destroy();
      this.roomCode = code.toUpperCase().trim();
      this.isHost = false;

      this.notifyStatus('connecting', 'Connecting to server...');

      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', () => {
        const targetPeerId = this.getFullPeerId(this.roomCode);
        this.notifyStatus('connecting', `Joining room ${this.roomCode}...`);

        this.conn = this.peer!.connect(targetPeerId, {
          reliable: true,
        });

        if (!this.conn) {
          this.notifyStatus('error', 'Could not establish connection');
          reject(new Error('Connection failed'));
          return;
        }

        this.setupConnectionHandlers();

        this.conn.on('open', () => {
          this.notifyStatus('connected', 'Connected to room host!');
          resolve();
        });

        this.conn.on('error', (err) => {
          console.error('Connection error:', err);
          this.notifyStatus('error', 'Failed to connect to room.');
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Guest peer error:', err);
        this.notifyStatus('error', 'Peer connection failed. Check room code.');
        reject(err);
      });
    });
  }

  private setupConnectionHandlers() {
    if (!this.conn) return;

    this.conn.on('data', (data: any) => {
      console.log('Received peer message:', data);
      const msg = data as PeerMessage;
      this.onMessageCallbacks.forEach((cb) => cb(msg));
    });

    this.conn.on('close', () => {
      console.log('Peer connection closed');
      this.notifyStatus('disconnected', 'Opponent disconnected');
      this.onMessageCallbacks.forEach((cb) => cb({ type: 'PLAYER_DISCONNECTED' }));
    });

    this.conn.on('error', (err) => {
      console.error('Data connection error:', err);
      this.notifyStatus('error', 'Network error occurred');
    });
  }

  /**
   * Send a peer message across WebRTC DataChannel
   */
  public send(msg: PeerMessage) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    } else {
      console.warn('Cannot send message: Peer connection not open', msg);
    }
  }

  public subscribeMessage(cb: MessageCallback) {
    this.onMessageCallbacks.push(cb);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeStatus(cb: StatusCallback) {
    this.onStatusCallbacks.push(cb);
    return () => {
      this.onStatusCallbacks = this.onStatusCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyStatus(status: 'disconnected' | 'connecting' | 'connected' | 'error', message?: string) {
    this.onStatusCallbacks.forEach((cb) => cb(status, message));
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public destroy() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.onMessageCallbacks = [];
    this.onStatusCallbacks = [];
  }
}

export const peerService = new PeerService();
