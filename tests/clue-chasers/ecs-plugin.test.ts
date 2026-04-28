/**
 * ClueChasersPlugin — ECS resources and actions.
 * Red tests written BEFORE implementation (TDD batch 1).
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';

// These imports will fail until implementation exists (red phase)
import {
  ClueChasersPlugin,
  type GamePhase,
  type HotspotOutcome,
} from '~/game/clue-chasers/state/ClueChasersPlugin';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

// Simple seeded RNG for tests (mulberry32)
function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('ClueChasersPlugin: ECS resources and actions', () => {
  it('mounts with correct default resource values', () => {
    const db = createDb();
    expect(db.resources.tapCounter).toBe(15);
    expect(db.resources.startingTaps).toBe(15);
    expect(db.resources.gamePhase).toBe('Investigating');
    expect(db.resources.currentScore).toBe(0);
    expect(db.resources.starsEarned).toBe(0);
    expect(db.resources.coinBalance).toBe(0);
    expect(db.resources.selectedSuspect).toBe('');
    expect(db.resources.correctSuspect).toBe('');
    expect(Array.isArray(db.resources.clueBoardState)).toBe(true);
    expect(db.resources.clueBoardState).toHaveLength(5);
    db.resources.clueBoardState.forEach((slot: unknown) => {
      expect(slot).toBeNull();
    });
  });

  it('tapHotspot action is pure (no Math.random, no Pixi)', () => {
    const db = createDb();
    const rng = makeRng(42);
    // Verify action is a function and does not throw
    expect(typeof db.actions.tapHotspot).toBe('function');
    const result = db.actions.tapHotspot({
      hotspotId: 'h1',
      outcome: 'evidence',
      evidenceType: 'footprint',
      position: [100, 200],
      rng,
    });
    // Returns animation metadata (no Pixi objects in result)
    expect(result).toHaveProperty('outcome');
    expect(result).toHaveProperty('position');
  });

  it('tapHotspot evidence outcome: decrements tapCounter, returns animation metadata', () => {
    const db = createDb();
    const rng = makeRng(1);
    const before = db.resources.tapCounter;
    const result = db.actions.tapHotspot({
      hotspotId: 'h2',
      outcome: 'evidence',
      evidenceType: 'document',
      position: [50, 150],
      rng,
    });
    expect(db.resources.tapCounter).toBe(before - 1);
    expect(result.outcome).toBe('evidence');
    expect(result.evidenceType).toBe('document');
    expect(result.position).toEqual([50, 150]);
    expect(result).toHaveProperty('slotIndex');
  });

  it('tapHotspot red-herring outcome: decrements tapCounter, returns puff metadata', () => {
    const db = createDb();
    const rng = makeRng(2);
    const before = db.resources.tapCounter;
    const result = db.actions.tapHotspot({
      hotspotId: 'h3',
      outcome: 'red-herring',
      evidenceType: null,
      position: [200, 300],
      rng,
    });
    expect(db.resources.tapCounter).toBe(before - 1);
    expect(result.outcome).toBe('red-herring');
    expect(result.position).toEqual([200, 300]);
  });

  it('tapHotspot locked-hotspot: does not decrement tapCounter', () => {
    const db = createDb();
    const rng = makeRng(3);
    const before = db.resources.tapCounter;
    db.actions.tapHotspot({
      hotspotId: 'h4',
      outcome: 'locked',
      evidenceType: null,
      position: [300, 400],
      rng,
    });
    expect(db.resources.tapCounter).toBe(before);
  });

  it('fillClueBoardSlot transaction fills slot in order', () => {
    const db = createDb();
    db.transactions.fillClueBoardSlot({ evidenceType: 'fingerprint', slotIndex: 0 });
    expect(db.resources.clueBoardState[0]).toBe('fingerprint');
    expect(db.resources.clueBoardState[1]).toBeNull();
  });

  it('caseScore formula: base * efficiency, clamped [1000, 2000]', () => {
    const db = createDb();
    // Set up: 15 starting taps, 15 remaining → max score
    db.transactions.setStartingTaps({ value: 15 });
    db.transactions.setTapCounter({ value: 15 });
    const maxScore = db.actions.computeCaseScore({});
    expect(maxScore).toBe(2000);

    // 0 remaining → min score (1000)
    db.transactions.setTapCounter({ value: 0 });
    const minScore = db.actions.computeCaseScore({});
    expect(minScore).toBe(1000);

    // partial: 7 remaining of 15 → 1000 * (7/15 + 1) ≈ 1467
    db.transactions.setTapCounter({ value: 7 });
    const midScore = db.actions.computeCaseScore({});
    expect(midScore).toBeGreaterThanOrEqual(1466);
    expect(midScore).toBeLessThanOrEqual(1468);
  });
});
