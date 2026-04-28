/**
 * bridgeEcsToSignals — connects ECS resource changes to SolidJS signals.
 * Signals are the DOM bridge only; ECS is the source of truth.
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

  // Bridge starsEarned → gameState additional signal (if extended)
  // For now, starsEarned is used directly by ResultsScreen via clueChasersState signal

  return () => {
    cleanups.forEach(fn => fn());
  };
}
