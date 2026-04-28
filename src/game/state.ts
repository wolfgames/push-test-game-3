import { createSignal, createRoot } from 'solid-js';

/**
 * Game state that persists across screens.
 * Created in a root to avoid disposal issues.
 *
 * Add your game-specific signals here.
 * Pause state lives in core/systems/pause (scaffold feature).
 */

export type GameOutcome = 'win' | 'loss' | null;

export interface GameState {
  score: () => number;
  setScore: (score: number) => void;
  addScore: (amount: number) => void;

  level: () => number;
  setLevel: (level: number) => void;
  incrementLevel: () => void;

  // Clue Chasers extended state
  starsEarned: () => number;
  setStarsEarned: (stars: number) => void;
  gameOutcome: () => GameOutcome;
  setGameOutcome: (outcome: GameOutcome) => void;
  villainName: () => string;
  setVillainName: (name: string) => void;
  coinBalance: () => number;
  setCoinBalance: (balance: number) => void;

  reset: () => void;
}

function createGameState(): GameState {
  const [score, setScore] = createSignal(0);
  const [level, setLevel] = createSignal(1);
  const [starsEarned, setStarsEarned] = createSignal(0);
  const [gameOutcome, setGameOutcome] = createSignal<GameOutcome>(null);
  const [villainName, setVillainName] = createSignal('');
  const [coinBalance, setCoinBalance] = createSignal(0);

  return {
    score,
    setScore,
    addScore: (amount: number) => setScore((s) => s + amount),

    level,
    setLevel,
    incrementLevel: () => setLevel((l) => l + 1),

    starsEarned,
    setStarsEarned,
    gameOutcome,
    setGameOutcome,
    villainName,
    setVillainName,
    coinBalance,
    setCoinBalance,

    reset: () => {
      setScore(0);
      setLevel(1);
      setStarsEarned(0);
      setGameOutcome(null);
      setVillainName('');
    },
  };
}

export const gameState = createRoot(createGameState);
