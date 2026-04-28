/**
 * bridgeEcsToSignals — connects ECS resource changes to SolidJS signals.
 * Signals are the DOM bridge only; ECS is the source of truth.
 *
 * Bridges: currentScore, starsEarned, coinBalance, gamePhase (→ gameOutcome).
 * gamePhase 'Win' → gameOutcome 'win'; 'Loss' → gameOutcome 'loss'; others → null.
 */
import type { ClueChasersDatabase } from './ClueChasersPlugin';
import { gameState } from '~/game/state';

export type CleanupFn = () => void;

/**
 * Subscribe to ECS resource changes and propagate to SolidJS signals.
 * Call on DB init; call the returned function on DB destroy.
 */
export function bridgeEcsToSignals(db: ClueChasersDatabase): CleanupFn {
  const cleanups: CleanupFn[] = [];

  // Bridge score → gameState.score
  // observe.resources.X is Observe<T> = (notify) => Unobserve
  const unsubscribeScore = db.observe.resources.currentScore((score) => {
    gameState.setScore(score);
  });
  cleanups.push(unsubscribeScore);

  // Bridge starsEarned → gameState.starsEarned (ResultsScreen reads this)
  const unsubscribeStars = db.observe.resources.starsEarned((stars) => {
    gameState.setStarsEarned(stars);
  });
  cleanups.push(unsubscribeStars);

  // Bridge coinBalance → gameState.coinBalance (ResultsScreen reads for Keep Going)
  const unsubscribeCoins = db.observe.resources.coinBalance((balance) => {
    gameState.setCoinBalance(balance);
  });
  cleanups.push(unsubscribeCoins);

  // Bridge gamePhase → gameState.gameOutcome (ResultsScreen reads to show win/loss)
  // 'Win' → 'win'; 'Loss' → 'loss'; all other phases → null
  const unsubscribePhase = db.observe.resources.gamePhase((phase) => {
    if (phase === 'Win') {
      gameState.setGameOutcome('win');
    } else if (phase === 'Loss') {
      gameState.setGameOutcome('loss');
    }
    // Investigating / Animating / Deduction do not change gameOutcome
  });
  cleanups.push(unsubscribePhase);

  return () => {
    cleanups.forEach(fn => fn());
  };
}
