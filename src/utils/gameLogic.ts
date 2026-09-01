import type { Cell, PlayerId, WinningLine, PlayerBingoState, AIDifficulty } from '../types/game';

// All 12 possible 5-in-a-line winning combinations on a 5x5 grid
export const WINNING_LINES: WinningLine[] = [
  // 5 Rows
  { type: 'row', lineIndex: 0, indices: [0, 1, 2, 3, 4] },
  { type: 'row', lineIndex: 1, indices: [5, 6, 7, 8, 9] },
  { type: 'row', lineIndex: 2, indices: [10, 11, 12, 13, 14] },
  { type: 'row', lineIndex: 3, indices: [15, 16, 17, 18, 19] },
  { type: 'row', lineIndex: 4, indices: [20, 21, 22, 23, 24] },
  // 5 Columns
  { type: 'col', lineIndex: 0, indices: [0, 5, 10, 15, 20] },
  { type: 'col', lineIndex: 1, indices: [1, 6, 11, 16, 21] },
  { type: 'col', lineIndex: 2, indices: [2, 7, 12, 17, 22] },
  { type: 'col', lineIndex: 3, indices: [3, 8, 13, 18, 23] },
  { type: 'col', lineIndex: 4, indices: [4, 9, 14, 19, 24] },
  // 2 Diagonals
  { type: 'diag', lineIndex: 0, indices: [0, 6, 12, 18, 24] },
  { type: 'diag', lineIndex: 1, indices: [4, 8, 12, 16, 20] },
];

const BINGO_CHARS = ['B', 'I', 'N', 'G', 'O'];

/**
 * Generates a randomized 5x5 board with numbers 1..25.
 */
export function generateRandomBoard(withPowerUps: boolean = false): Cell[] {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);

  // Fisher-Yates Shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const cells: Cell[] = numbers.map((num, idx) => ({
    id: idx,
    number: num,
    marked: false,
    markedBy: null,
    index: idx,
    animating: false,
    powerUp: null,
  }));

  if (withPowerUps) {
    // Assign 2 freeSpace and 1 smash/steal (let's do 3 freeSpace for simplicity)
    const indices: number[] = [];
    while (indices.length < 3) {
      const r = Math.floor(Math.random() * 25);
      if (!indices.includes(r)) indices.push(r);
    }
    indices.forEach(idx => {
      cells[idx].powerUp = 'freeSpace';
    });
  }

  return cells;
}

/**
 * Evaluates completed lines on a board.
 */
export function evaluatePlayerBoard(board: Cell[]): { lineCount: number; completedLines: WinningLine[]; bingoLetters: string } {
  const completedLines: WinningLine[] = [];

  for (const line of WINNING_LINES) {
    const isLineCompleted = line.indices.every((idx) => board[idx].marked);
    if (isLineCompleted) {
      completedLines.push(line);
    }
  }

  const lineCount = completedLines.length;
  const bingoLetters = BINGO_CHARS.slice(0, Math.min(lineCount, 5)).join('');

  return { lineCount, completedLines, bingoLetters };
}

/**
 * Creates an initial PlayerBingoState object.
 */
export function createPlayerBingoState(customBoard?: Cell[], withPowerUps: boolean = false): PlayerBingoState {
  const b = customBoard || generateRandomBoard(withPowerUps);
  const evalResult = evaluatePlayerBoard(b);
  return {
    board: b,
    lineCount: evalResult.lineCount,
    bingoLetters: evalResult.bingoLetters,
    completedLines: evalResult.completedLines,
  };
}

/**
 * Marks a called number on a player's board.
 */
export function markNumberOnBoard(state: PlayerBingoState, num: number, calledBy: PlayerId): PlayerBingoState {
  let changed = false;
  const updatedBoard = state.board.map((cell) => {
    if (cell.number === num && !cell.marked) {
      changed = true;
      return { ...cell, marked: true, markedBy: calledBy, animating: true };
    }
    return cell;
  });

  if (!changed) return state;

  const evalResult = evaluatePlayerBoard(updatedBoard);

  return {
    board: updatedBoard,
    lineCount: evalResult.lineCount,
    bingoLetters: evalResult.bingoLetters,
    completedLines: evalResult.completedLines,
  };
}

/**
 * Checks overall game winner based on 5 completed lines.
 */
export function checkOverallWinState(
  p1State: PlayerBingoState,
  p2State: PlayerBingoState,
  currentTurnCaller: PlayerId,
  p2IsCpu: boolean = false
): PlayerId | 'tie' | null {
  const p1Wins = p1State.lineCount >= 5;
  const p2Wins = p2State.lineCount >= 5;

  if (p1Wins && p2Wins) {
    // If both reach 5+ lines simultaneously, the active caller wins
    if (p1State.lineCount > p2State.lineCount) return 'player1';
    if (p2State.lineCount > p1State.lineCount) return p2IsCpu ? 'computer' : 'player2';
    // If equal lines, the player who called the winning number wins
    if (currentTurnCaller === 'player1') return 'player1';
    return p2IsCpu ? 'computer' : 'player2';
  }

  if (p1Wins) return 'player1';
  if (p2Wins) return p2IsCpu ? 'computer' : 'player2';

  // If all 25 numbers are marked and nobody hit 5 lines
  const allMarked = p1State.board.every((c) => c.marked);
  if (allMarked) return 'tie';

  return null;
}

/**
 * Intelligent AI Decision Engine for 5-Line Bingo.
 */
export function getAIMove(
  cpuState: PlayerBingoState,
  humanState: PlayerBingoState,
  difficulty: AIDifficulty
): number {
  // Numbers 1..25 that are not marked yet
  const availableNumbers = cpuState.board
    .filter((cell) => !cell.marked)
    .map((cell) => cell.number);

  if (availableNumbers.length === 0) return -1;

  // Easy difficulty: 60% random choice
  if (difficulty === 'easy' && Math.random() < 0.6) {
    return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  }

  let bestNum = availableNumbers[0];
  let bestScore = -Infinity;

  for (const num of availableNumbers) {
    let score = 0;

    const simCpu = markNumberOnBoard(cpuState, num, 'computer');
    const simHuman = markNumberOnBoard(humanState, num, 'player1');

    // Priority 1: Instant Win (Gives CPU 5+ lines)
    if (simCpu.lineCount >= 5) {
      return num;
    }

    // Priority 2: Block Human Win (If Human would get 5 lines on their turn)
    if (simHuman.lineCount >= 5) {
      score += 400;
    }

    // Reward completing lines for CPU
    const cpuLineGain = simCpu.lineCount - cpuState.lineCount;
    score += cpuLineGain * 150;

    // Penalty for giving Human new lines
    const humanLineGain = simHuman.lineCount - humanState.lineCount;
    score -= humanLineGain * 30;

    // Strategic weight for lines near completion (4 out of 5 filled)
    for (const line of WINNING_LINES) {
      const cpuCount = line.indices.filter((idx) => simCpu.board[idx].marked).length;
      score += Math.pow(cpuCount, 2) * 3;
    }

    // Slight randomness
    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      bestNum = num;
    }
  }

  return bestNum;
}
