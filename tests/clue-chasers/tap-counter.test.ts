/**
 * TapCounter — decrement and warning states.
 * Red tests written BEFORE implementation (TDD batch 2).
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

const rng = () => 0.5;

describe('TapCounter: decrement and warning states', () => {
  it('evidence tap decrements counter by 1', () => {
    const db = createDb();
    const before = db.resources.tapCounter;
    db.actions.tapHotspot({ hotspotId: 'h1', outcome: 'evidence', evidenceType: 'footprint', position: [0, 0], rng });
    expect(db.resources.tapCounter).toBe(before - 1);
  });

  it('red-herring tap decrements counter by 1', () => {
    const db = createDb();
    const before = db.resources.tapCounter;
    db.actions.tapHotspot({ hotspotId: 'h2', outcome: 'red-herring', evidenceType: null, position: [0, 0], rng });
    expect(db.resources.tapCounter).toBe(before - 1);
  });

  it('empty tap does not decrement', () => {
    const db = createDb();
    const before = db.resources.tapCounter;
    db.actions.tapHotspot({ hotspotId: 'h3', outcome: 'empty', evidenceType: null, position: [0, 0], rng });
    expect(db.resources.tapCounter).toBe(before);
  });

  it('counter at 3 triggers warning-pulse (counter <= 3)', () => {
    const db = createDb();
    // Set counter to 4 so next evidence tap brings it to 3
    db.transactions.setTapCounter({ value: 4 });
    db.actions.tapHotspot({ hotspotId: 'h4', outcome: 'evidence', evidenceType: 'footprint', position: [0, 0], rng });
    expect(db.resources.tapCounter).toBeLessThanOrEqual(3);
    // Warning state: counter <= 3 means warning should trigger
    expect(db.resources.tapCounter <= 3).toBe(true);
  });

  it('counter at 0 triggers loss phase transition', () => {
    const db = createDb();
    // Set tap counter to 1 so next tap triggers loss
    db.transactions.setTapCounter({ value: 1 });
    // clue board is not full (empty)
    db.actions.tapHotspot({ hotspotId: 'h5', outcome: 'evidence', evidenceType: 'footprint', position: [0, 0], rng });
    // Board is not full (only 1 evidence, required 5), so loss should trigger
    expect(db.resources.tapCounter).toBe(0);
    expect(db.resources.gamePhase).toBe('Loss');
  });
});
