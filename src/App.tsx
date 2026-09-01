import { useState, useEffect, useCallback } from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { HomeScreen } from './components/HomeScreen';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ReactionsDeck } from './components/ReactionsDeck';
import type { PlayerId, GameMode, AIDifficulty, PlayerBingoState, PeerMessage } from './types/game';
import {
  createPlayerBingoState,
  markNumberOnBoard,
  checkOverallWinState,
  getAIMove,
} from './utils/gameLogic';
import { soundManager } from './utils/audio';
import { fireConfettiCelebration } from './utils/confetti';
import { peerService } from './services/peerService';
import { recordGameResult } from './utils/storage';
import { useRef } from 'react';

export function App() {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [mode, setMode] = useState<GameMode>('vs-computer');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  const [p1Name, setP1Name] = useState<string>('Player 1');
  const [p2Name, setP2Name] = useState<string>('Player 2');
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [myPlayerId, setMyPlayerId] = useState<PlayerId>('player1');

  const [p1State, setP1State] = useState<PlayerBingoState>(createPlayerBingoState());
  const [p2State, setP2State] = useState<PlayerBingoState>(createPlayerBingoState());
  const [turn, setTurn] = useState<PlayerId>('player1');
  const [winner, setWinner] = useState<PlayerId | 'tie' | null>(null);

  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(soundManager.getVoiceEnabled());
  const [isHost, setIsHost] = useState<boolean>(true);
  const [disconnectAlert, setDisconnectAlert] = useState<string | null>(null);
  const [powerUpMode, setPowerUpMode] = useState<boolean>(false);

  const [activeReaction, setActiveReaction] = useState<{ emoji: string, player: PlayerId, id: number } | null>(null);

  // Use a stable ref for all mutable state needed in cross-render callbacks like PeerJS handles
  const stateRef = useRef({ turn, p1State, p2State, mode, isHost, p1Name, p2Name, p1Score, p2Score, winner, powerUpMode });
  useEffect(() => {
    stateRef.current = { turn, p1State, p2State, mode, isHost, p1Name, p2Name, p1Score, p2Score, winner, powerUpMode };
  });

  // Check URL query parameters for auto room join (e.g. ?room=XYZ123)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('room') || window.location.hash.replace('#room=', '');
    if (codeFromUrl && codeFromUrl.length >= 4) {
      setIsOnlineModalOpen(true);
    }
  }, []);

  // Initialize board for VS Computer
  const startVsComputerGame = (difficulty: AIDifficulty) => {
    soundManager.playClick();
    setMode('vs-computer');
    setAiDifficulty(difficulty);

    const newP1 = createPlayerBingoState(undefined, powerUpMode);
    const newP2 = createPlayerBingoState(undefined, powerUpMode);
    setP1State(newP1);
    setP2State(newP2);
    setTurn('player1');
    setWinner(null);
    setScreen('game');
  };

  // Initialize board for Offline 2 Players (Pass & Play)
  const startOffline2PGame = () => {
    soundManager.playClick();
    setMode('offline-2p');
    setMyPlayerId('player1');

    const newP1 = createPlayerBingoState(undefined, powerUpMode);
    const newP2 = createPlayerBingoState(undefined, powerUpMode);
    setP1State(newP1);
    setP2State(newP2);
    setTurn('player1');
    setWinner(null);
    setScreen('game');
  };

  // Start Online 2P Game after room connection
  const handleRoomConnected = useCallback(
    (_code: string, hostStatus: boolean) => {
      setMode('online-2p');
      setIsHost(hostStatus);
      setIsOnlineModalOpen(false);
      setScreen('game');

      if (hostStatus) {
        setMyPlayerId('player1');
        const newP1 = createPlayerBingoState(undefined, powerUpMode);
        const newP2 = createPlayerBingoState(undefined, powerUpMode);
        setP1State(newP1);
        setP2State(newP2);
        setTurn('player1');
        setWinner(null);

        peerService.send({
          type: 'STATE_SYNC',
          payload: {
            p1State: newP1,
            p2State: newP2,
            turn: 'player1',
            winner: null,
            p1Name,
            p2Name,
            p1Score,
            p2Score,
            powerUpMode,
          },
        });
      } else {
        setMyPlayerId('player2');
        peerService.send({ type: 'JOIN_REQUEST', payload: { name: p1Name } });
      }
    },
    [p1Name, p2Name, p1Score, p2Score]
  );

  // Handle number calling by active player
  const handleCallNumber = (calledNum: number, extraFromPowerUp: boolean = false) => {
    if (winner !== null && !extraFromPowerUp) return;
    if (mode === 'online-2p' && turn !== myPlayerId && !extraFromPowerUp) return;

    soundManager.playClaim(turn === 'player1');
    if (!extraFromPowerUp) soundManager.speakNumber(calledNum);

    // Mark number on BOTH boards
    let updatedP1 = markNumberOnBoard(p1State, calledNum, turn);
    let updatedP2 = markNumberOnBoard(p2State, calledNum, turn);

    // Check for powerup on caller's board
    const callerBoard = turn === 'player1' ? p1State.board : p2State.board;
    const targetCell = callerBoard.find(c => c.number === calledNum);

    let bonusNumber: number | null = null;
    if (targetCell?.powerUp === 'freeSpace' && !extraFromPowerUp && powerUpMode) {
      // Find a random unmarked number to mark as bonus
      const unmarked = callerBoard.filter(c => !c.marked && c.number !== calledNum);
      if (unmarked.length > 0) {
        bonusNumber = unmarked[Math.floor(Math.random() * unmarked.length)].number;
        soundManager.playVictory(); // play small bonus sound
        updatedP1 = markNumberOnBoard(updatedP1, bonusNumber, turn);
        updatedP2 = markNumberOnBoard(updatedP2, bonusNumber, turn);
      }
    }

    const gameWinner = checkOverallWinState(updatedP1, updatedP2, turn, mode === 'vs-computer');
    const nextTurn: PlayerId =
      mode === 'vs-computer'
        ? 'computer'
        : turn === 'player1'
          ? 'player2'
          : 'player1';

    setP1State(updatedP1);
    setP2State(updatedP2);

    if (gameWinner !== null) {
      handleGameEnd(gameWinner);
    } else {
      setTurn(nextTurn);
    }

    // Broadcast online move
    if (mode === 'online-2p' && !extraFromPowerUp) {
      peerService.send({
        type: 'MOVE',
        payload: {
          calledNum,
          player: myPlayerId,
          p1State: updatedP1,
          p2State: updatedP2,
          nextTurn,
          gameWinner,
        },
      });
    }
  };

  // Computer AI turn trigger effect
  useEffect(() => {
    if (screen !== 'game' || mode !== 'vs-computer' || winner !== null) return;

    if (turn === 'computer') {
      const timer = setTimeout(() => {
        const cpuCalledNum = getAIMove(p2State, p1State, aiDifficulty);
        if (cpuCalledNum !== -1) {
          soundManager.playClaim(false);
          soundManager.speakNumber(cpuCalledNum);

          let updatedP1 = markNumberOnBoard(p1State, cpuCalledNum, 'computer');
          let updatedP2 = markNumberOnBoard(p2State, cpuCalledNum, 'computer');

          const cpuCell = p2State.board.find(c => c.number === cpuCalledNum);
          if (cpuCell?.powerUp === 'freeSpace' && powerUpMode) {
            const unmarked = p2State.board.filter(c => !c.marked && c.number !== cpuCalledNum);
            if (unmarked.length > 0) {
              const bonusNum = unmarked[Math.floor(Math.random() * unmarked.length)].number;
              updatedP1 = markNumberOnBoard(updatedP1, bonusNum, 'computer');
              updatedP2 = markNumberOnBoard(updatedP2, bonusNum, 'computer');
            }
          }

          const gameWinner = checkOverallWinState(updatedP1, updatedP2, 'computer', true);
          setP1State(updatedP1);
          setP2State(updatedP2);

          if (gameWinner !== null) {
            handleGameEnd(gameWinner);
          } else {
            setTurn('player1');
          }
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [p1State, p2State, turn, mode, winner, screen, aiDifficulty]);

  // PeerJS Message listener effect
  useEffect(() => {
    if (mode !== 'online-2p') return;

    const unsubMsg = peerService.subscribeMessage((msg: PeerMessage) => {
      const current = stateRef.current;

      if (msg.type === 'MOVE') {
        const { player, p1State: newP1, p2State: newP2, nextTurn, gameWinner, calledNum } = msg.payload;
        soundManager.playClaim(player === 'player1');
        if (calledNum) soundManager.speakNumber(calledNum);

        setP1State(newP1);
        setP2State(newP2);

        if (gameWinner !== null) {
          handleGameEnd(gameWinner);
        } else {
          setTurn(nextTurn);
        }
      } else if (msg.type === 'STATE_SYNC') {
        const { p1State: sP1, p2State: sP2, turn: sTurn, winner: sWinner, p1Name: sName1, p2Name: sName2, p1Score: sS1, p2Score: sS2, powerUpMode: sPowerUp } = msg.payload;
        if (sP1) setP1State(sP1);
        if (sP2) setP2State(sP2);
        if (sTurn) setTurn(sTurn);
        if (sWinner !== undefined) setWinner(sWinner);
        if (sName1) setP1Name(sName1);
        if (sName2) setP2Name(sName2);
        if (sS1 !== undefined) setP1Score(sS1);
        if (sS2 !== undefined) setP2Score(sS2);
        if (sPowerUp !== undefined) setPowerUpMode(sPowerUp);
      } else if (msg.type === 'JOIN_REQUEST') {
        const guestName = msg.payload.name;
        setP2Name(guestName);

        // Host syncs everything back to the guest
        peerService.send({
          type: 'STATE_SYNC',
          payload: {
            p1State: current.p1State,
            p2State: current.p2State,
            turn: current.turn,
            winner: current.winner,
            p1Name: current.p1Name,
            p2Name: guestName,
            p1Score: current.p1Score,
            p2Score: current.p2Score,
            powerUpMode: current.powerUpMode,
          },
        });
      } else if (msg.type === 'REACTION') {
        setActiveReaction({ emoji: msg.payload.emoji, player: msg.payload.player, id: Date.now() });
        setTimeout(() => setActiveReaction(null), 2500);
      } else if (msg.type === 'REMATCH_REQUEST') {
        handleRematchInternal(current);
      } else if (msg.type === 'PLAYER_DISCONNECTED') {
        setDisconnectAlert('Opponent has disconnected from the room.');
      }
    });

    return () => unsubMsg();
  }, [mode]);

  // Handle Game End
  const handleGameEnd = (gameWinner: PlayerId | 'tie') => {
    setWinner(gameWinner);

    if (gameWinner === 'player1') {
      setP1Score((prev) => prev + 1);
      soundManager.playVictory();
      fireConfettiCelebration();
      recordGameResult(stateRef.current.mode, 'win');
    } else if (gameWinner === 'player2') {
      setP2Score((prev) => prev + 1);
      if (stateRef.current.mode === 'offline-2p') {
        soundManager.playVictory();
        fireConfettiCelebration();
        recordGameResult('offline-2p', 'loss'); // From P1 perspective
      } else {
        soundManager.playDefeat();
        recordGameResult('online-2p', 'loss');
      }
    } else if (gameWinner === 'computer') {
      setP2Score((prev) => prev + 1);
      soundManager.playDefeat();
      recordGameResult('vs-computer', 'loss');
    } else if (gameWinner === 'tie') {
      recordGameResult(stateRef.current.mode, 'tie');
    }
  };

  // Rematch / Reset Game
  const handleRematchInternal = (st: typeof stateRef.current) => {
    soundManager.playClick();
    const newP1 = createPlayerBingoState(undefined, st.powerUpMode);
    const newP2 = createPlayerBingoState(undefined, st.powerUpMode);
    setP1State(newP1);
    setP2State(newP2);
    setWinner(null);

    const nextStartingTurn: PlayerId = st.turn === 'player1' ? 'player2' : 'player1';
    setTurn(st.mode === 'vs-computer' ? 'player1' : nextStartingTurn);

    if (st.mode === 'online-2p' && st.isHost) {
      peerService.send({
        type: 'STATE_SYNC',
        payload: {
          p1State: newP1,
          p2State: newP2,
          turn: nextStartingTurn,
          winner: null,
          p1Name: st.p1Name,
          p2Name: st.p2Name,
          p1Score: st.p1Score,
          p2Score: st.p2Score,
        },
      });
    } else if (st.mode === 'online-2p' && !st.isHost) {
      peerService.send({ type: 'REMATCH_REQUEST' });
    }
  };

  const handleRematch = () => handleRematchInternal(stateRef.current);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVoice = () => {
    const voiced = soundManager.toggleVoice();
    setIsVoiceEnabled(voiced);
  };

  const handleSendReaction = (emoji: string) => {
    setActiveReaction({ emoji, player: myPlayerId, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
    if (mode === 'online-2p') {
      peerService.send({ type: 'REACTION', payload: { emoji, player: myPlayerId } });
    }
  };

  const handleGoHome = () => {
    soundManager.playClick();
    if (mode === 'online-2p') {
      peerService.destroy();
    }
    setScreen('home');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {screen === 'home' && (
        <HomeScreen
          p1Name={p1Name}
          p2Name={p2Name}
          onUpdateP1Name={setP1Name}
          onUpdateP2Name={setP2Name}
          onStartVsComputer={startVsComputerGame}
          onStartOffline2P={startOffline2PGame}
          powerUpMode={powerUpMode}
          onTogglePowerUpMode={() => setPowerUpMode(prev => !prev)}
          onOpenOnlineModal={() => {
            soundManager.playClick();
            setIsOnlineModalOpen(true);
          }}
          onOpenHowToPlay={() => {
            soundManager.playClick();
            setIsHowToPlayOpen(true);
          }}
        />
      )}

      {screen === 'game' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GameHeader
            mode={mode}
            aiDifficulty={aiDifficulty}
            turn={turn}
            winner={winner}
            p1Name={p1Name}
            p2Name={p2Name}
            p1State={p1State}
            p2State={p2State}
            p1Score={p1Score}
            p2Score={p2Score}
            myPlayerId={myPlayerId}
            isMuted={isMuted}
            isVoiceEnabled={isVoiceEnabled}
            onToggleMute={handleToggleMute}
            onToggleVoice={handleToggleVoice}
            onNewGame={handleRematch}
            onGoHome={handleGoHome}
          />

          <GameBoard
            p1State={p1State}
            p2State={p2State}
            turn={turn}
            winner={winner}
            p1Name={p1Name}
            p2Name={p2Name}
            myPlayerId={myPlayerId}
            mode={mode}
            onCallNumber={handleCallNumber}
          />

          {/* Reaction Overlay */}
          {activeReaction && (
            <div
              key={activeReaction.id}
              style={{
                position: 'fixed',
                top: '40%',
                left: activeReaction.player === myPlayerId ? '30%' : '70%',
                transform: 'translate(-50%, -50%)',
                fontSize: '6rem',
                pointerEvents: 'none',
                animation: 'slideUp 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                opacity: 0,
                zIndex: 100,
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
              }}
            >
              {activeReaction.emoji}
            </div>
          )}

          {/* Emoji Reaction Deck - Only show in online matches mostly, or offline if you want */}
          {mode === 'online-2p' && winner === null && (
            <div style={{ position: 'fixed', bottom: '24px', zIndex: 50 }}>
              <ReactionsDeck onSendReaction={handleSendReaction} />
            </div>
          )}

          {/* Disconnect Alert Banner */}
          {disconnectAlert && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 20px',
                background: 'rgba(255, 8, 68, 0.2)',
                border: '1px solid var(--color-p2)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {disconnectAlert}
            </div>
          )}
        </div>
      )}

      {/* Online Room Modal */}
      <OnlineRoomModal
        playerName={p1Name}
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onRoomConnected={handleRoomConnected}
      />

      {/* Game Over Modal */}
      <GameOverModal
        winner={winner}
        mode={mode}
        p1Name={p1Name}
        p2Name={p2Name}
        p1Score={p1Score}
        p2Score={p2Score}
        myPlayerId={myPlayerId}
        onRematch={handleRematch}
        onGoHome={handleGoHome}
      />

      {/* How to Play Rules Modal */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
    </div>
  );
}

export default App;
