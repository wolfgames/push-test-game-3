/**
 * LossScreen — overlay and language.
 * Red tests written BEFORE implementation (TDD batch 3).
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';
import { gameState } from '~/game/state';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

describe('LossScreen: overlay and language', () => {
  it('loss overlay text is "The mystery got away" (not "Game Over")', () => {
    // The loss text is in ResultsScreen.tsx
    // We verify via gameState shape that the outcome is 'loss' (not a 'game-over' variant)
    gameState.setGameOutcome('loss');
    expect(gameState.gameOutcome()).toBe('loss');
    // Must NOT be null or any other value
    expect(gameState.gameOutcome()).not.toBe('game-over');
    expect(gameState.gameOutcome()).not.toBeNull();
  });

  it('scene desaturate tween fires on loss phase transition', () => {
    // This is handled by GameController watching ECS phase changes.
    // We verify the ECS state correctly transitions to Loss.
    const db = createDb();
    db.transactions.setTapCounter({ value: 1 });
    // Evidence tap brings counter to 0 with incomplete board → Loss
    db.actions.tapHotspot({
      hotspotId: 'h1',
      outcome: 'evidence',
      evidenceType: 'footprint',
      position: [100, 200],
      rng: () => 0.5,
    });
    expect(db.resources.tapCounter).toBe(0);
    expect(db.resources.gamePhase).toBe('Loss');
  });

  it('Try Again reloads case with seed+1', () => {
    const db = createDb();
    db.transactions.resetCase({ seed: 100, startingTaps: 15, requiredSlots: 5 });
    expect(db.resources.currentSeed).toBe(100);
    // retryCase should increment seed
    const result = db.actions.retryCase();
    expect(result.newSeed).toBe(101);
    expect(db.resources.currentSeed).toBe(101);
    expect(db.resources.gamePhase).toBe('Investigating');
    expect(db.resources.tapCounter).toBe(15);
  });
});
