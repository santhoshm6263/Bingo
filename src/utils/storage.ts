export interface PlayerStats {
  wins: number;
  losses: number;
  ties: number;
  totalGames: number;
}

export interface GameStats {
  vsComputer: PlayerStats;
  offline2p: PlayerStats;
  online2p: PlayerStats;
}

const DEFAULT_STATS: GameStats = {
  vsComputer: { wins: 0, losses: 0, ties: 0, totalGames: 0 },
  offline2p: { wins: 0, losses: 0, ties: 0, totalGames: 0 },
  online2p: { wins: 0, losses: 0, ties: 0, totalGames: 0 },
};

export function getStats(): GameStats {
  const saved = localStorage.getItem('bingo_mega_stats');
  if (saved) {
    try {
      return JSON.parse(saved) as GameStats;
    } catch (e) {
      console.error('Failed to parse stats');
    }
  }
  return DEFAULT_STATS;
}

export function saveStats(stats: GameStats) {
  localStorage.setItem('bingo_mega_stats', JSON.stringify(stats));
}

export function recordGameResult(mode: 'vs-computer' | 'offline-2p' | 'online-2p', result: 'win' | 'loss' | 'tie') {
  const stats = getStats();
  const target = stats[mode === 'vs-computer' ? 'vsComputer' : mode === 'offline-2p' ? 'offline2p' : 'online2p'];
  
  target.totalGames++;
  if (result === 'win') target.wins++;
  else if (result === 'loss') target.losses++;
  else if (result === 'tie') target.ties++;

  saveStats(stats);
}
