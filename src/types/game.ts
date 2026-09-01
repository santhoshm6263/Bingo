export type PlayerId = 'player1' | 'player2' | 'computer';

export type GameMode = 'vs-computer' | 'offline-2p' | 'online-2p';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'steal' | 'shuffle' | 'freeSpace';

export interface Cell {
  id: number;
  number: number;
  marked: boolean;
  markedBy: PlayerId | null;
  index: number;
  animating?: boolean;
  powerUp?: PowerUpType | null;
}

export interface WinningLine {
  type: 'row' | 'col' | 'diag';
  lineIndex: number;
  indices: number[];
}

export interface PlayerBingoState {
  board: Cell[];
  lineCount: number;
  bingoLetters: string; // e.g. "B", "BI", "BIN", "BING", "BINGO"
  completedLines: WinningLine[];
}

export interface MoveRecord {
  player: PlayerId;
  cellNumber: number;
  timestamp: number;
}

export interface GameState {
  p1State: PlayerBingoState;
  p2State: PlayerBingoState;
  turn: PlayerId;
  winner: PlayerId | 'tie' | null;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  moveHistory: MoveRecord[];
  p1Score: number;
  p2Score: number;
  p1Name: string;
  p2Name: string;
  myPlayerId: PlayerId;
  powerUpMode: boolean;
}

export type PeerMessageType =
  | 'JOIN_REQUEST'
  | 'ROOM_ACCEPTED'
  | 'MOVE'
  | 'REMATCH_REQUEST'
  | 'STATE_SYNC'
  | 'PLAYER_DISCONNECTED'
  | 'REACTION';

export interface PeerMessage {
  type: PeerMessageType;
  payload?: any;
  sender?: string;
}
