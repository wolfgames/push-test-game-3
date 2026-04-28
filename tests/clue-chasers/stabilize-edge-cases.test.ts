/**
 * Stabilize edge-case tests — written by phase 60-stabilize.
 * One additional edge-case per new feature from implementation-plan.yml.
 * Covers untested boundary conditions not present in the batch test files.
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';
import { computeScore, computeStars, isBoardFull } from '~/game/clue-chasers/state/game-logic';
import { generateLevel } from '~/game/clue-chasers/state/levelGenerator';
import { DIFFICULTY_TIERS } from '~/game/clue-chasers/data/difficulty-tiers';
import { HAND_CRAFTED_CASES } from '~/game/clue-chasers/data/hand-crafted-cases';
import { FALLBACK_CASES } from '~/game/clue-chasers/data/fallback-cases';
import { AUDIO_CONFIG } from '~/game/clue-chasers/audio/audio-config';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

// ── ecs-game-state: wrong suspect correct suspect boundary ─────────────────
describe('ecs-game-state: accuse — correct vs incorrect boundary', () => {
  it('correct accusation stores final score and stars atomically', () => {
    const db = createDb();
    db.transactions.setStartingTaps({ value: 15 });
    db.transactions.setTapCounter({ value: 10 });
    db.transactions.setCorrectSuspect({ suspectId: 'mayor' });
    const result = db.actions.accuse({ suspectId: 'mayor' });
    expect(result.correct).toBe(true);
    // Score must be stored (not zero)
    expect(db.resources.currentScore).toBeGreaterThanOrEqual(1000);
    expect(db.resources.starsEarned).toBeGreaterThanOrEqual(1);
    expect(db.resources.gamePhase).toBe('Win');
  });
});

// ── hotspot-system: empty-tap never changes phase ─────────────────────────
describe('hotspot-system: empty tap does not change game phase', () => {
  it('empty-outcome tap leaves gamePhase as Investigating', () => {
    const db = createDb();
    expect(db.resources.gamePhase).toBe('Investigating');
    db.actions.tapHotspot({ hotspotId: 'h-empty', outcome: 'empty', evidenceType: null, position: [100, 200], rng: () => 0.5 });
    expect(db.resources.gamePhase).toBe('Investigating');
  });
});

// ── evidence-token: board-full edge case: slot stays -1 ────────────────────
describe('evidence-token: board-full slot returns slotIndex -1', () => {
  it('filling all 5 slots then tapping another evidence returns slotIndex -1', () => {
    const db = createDb();
    // Fill all 5 slots first via transactions
    for (let i = 0; i < 5; i++) {
      db.transactions.fillClueBoardSlot({ evidenceType: 'footprint', slotIndex: i });
    }
    // Now tap another evidence hotspot — board is full
    const result = db.actions.tapHotspot({
      hotspotId: 'h-extra',
      outcome: 'evidence',
      evidenceType: 'document',
      position: [50, 100],
      rng: () => 0.5,
    });
    expect(result.slotIndex).toBe(-1);
  });
});

// ── clue-board: isBoardFull with partial required slots ───────────────────
describe('clue-board: isBoardFull with requiredSlots < 5', () => {
  it('board with 3 required slots is full when first 3 are filled', () => {
    const board = ['footprint', 'document', 'fingerprint', null, null] as ('footprint' | 'document' | 'fingerprint' | null)[];
    expect(isBoardFull(board, 3)).toBe(true);
  });

  it('board with 3 required slots is not full when only 2 are filled', () => {
    const board = ['footprint', 'document', null, null, null] as ('footprint' | 'document' | null)[];
    expect(isBoardFull(board, 3)).toBe(false);
  });
});

// ── tap-counter: counter never goes below 0 ───────────────────────────────
describe('tap-counter: counter floor is 0', () => {
  it('decrementTapCounter does not go below 0', () => {
    const db = createDb();
    db.transactions.setTapCounter({ value: 0 });
    db.transactions.decrementTapCounter();
    expect(db.resources.tapCounter).toBe(0);
  });
});

// ── scoring-star-rating: boundary at exactly 1500 ────────────────────────
describe('scoring-star-rating: exact threshold boundaries', () => {
  it('score of exactly 1500 earns 3 stars', () => {
    expect(computeStars(1500)).toBe(3);
  });

  it('score of exactly 1200 earns 2 stars (not 3)', () => {
    expect(computeStars(1200)).toBe(2);
  });

  it('score of exactly 1000 earns 1 star', () => {
    expect(computeStars(1000)).toBe(1);
  });
});

// ── loss-screen: retry resets counter to startingTaps ────────────────────
describe('loss-screen: retryCase resets tap counter to startingTaps', () => {
  it('retryCase restores tapCounter to startingTaps value', () => {
    const db = createDb();
    db.transactions.setStartingTaps({ value: 14 });
    db.transactions.setTapCounter({ value: 0 }); // simulate exhaustion
    db.actions.retryCase();
    expect(db.resources.tapCounter).toBe(14);
    expect(db.resources.gamePhase).toBe('Investigating');
  });
});

// ── continue-system: exact coin boundary ─────────────────────────────────
describe('continue-system: coin boundary conditions', () => {
  it('Keep Going with exactly 5 coins succeeds', () => {
    const db = createDb();
    db.transactions.setCoinBalance({ balance: 5 });
    db.transactions.setTapCounter({ value: 0 });
    const result = db.actions.continueCase();
    expect(result.success).toBe(true);
    expect(db.resources.coinBalance).toBe(0);
    expect(db.resources.tapCounter).toBe(5);
  });

  it('Keep Going with 4 coins fails', () => {
    const db = createDb();
    db.transactions.setCoinBalance({ balance: 4 });
    const result = db.actions.continueCase();
    expect(result.success).toBe(false);
    expect(db.resources.coinBalance).toBe(4); // unchanged
  });
});

// ── deduction-phase: correct accusation transitions to Win (not Deduction) ──
describe('deduction-phase: phase transition on correct accusation', () => {
  it('correct accusation transitions to Win phase, not stays in Deduction', () => {
    const db = createDb();
    db.transactions.setGamePhase({ phase: 'Deduction' });
    db.transactions.setCorrectSuspect({ suspectId: 'butler' });
    const result = db.actions.accuse({ suspectId: 'butler' });
    expect(result.correct).toBe(true);
    expect(db.resources.gamePhase).toBe('Win');
    expect(db.resources.gamePhase).not.toBe('Deduction');
  });
});

// ── scene-generation-algorithm: Easy tier solvability ────────────────────
describe('scene-generation-algorithm: multiple seeds are all solvable', () => {
  it('first 5 Easy seeds are all solvable', () => {
    for (let i = 0; i < 5; i++) {
      const seed = 1 * 100_000 + (i + 1) * 1_000 + 0;
      const layout = generateLevel({ seed, difficultyTier: 'Easy' });
      const evidenceHotspots = layout.hotspots.filter(h => h.outcome === 'evidence');
      expect(evidenceHotspots.length).toBeGreaterThanOrEqual(layout.clueSlotsRequired);
      expect(layout.tapLimit).toBeGreaterThanOrEqual(layout.clueSlotsRequired);
    }
  });
});

// ── difficulty-curve: no jump > 1 unit between consecutive cases ──────────
describe('difficulty-curve: consecutive tier progression', () => {
  it('tapLimit decrements by at most 1 between consecutive chapter 1 cases', () => {
    const easyLimit = DIFFICULTY_TIERS['Easy'].tapLimit;
    const easyPlusLimit = DIFFICULTY_TIERS['Easy+'].tapLimit;
    // Easy=15, Easy+=14 — difference of 1
    expect(easyLimit - easyPlusLimit).toBeLessThanOrEqual(1);
  });

  it('Easy tier has 0 locked hotspots (chapter 1 cases 1-2)', () => {
    expect(DIFFICULTY_TIERS['Easy'].lockedHotspotCount).toBe(0);
  });

  it('Easy+ tier has 1 locked hotspot (chapter 1 cases 3-5)', () => {
    expect(DIFFICULTY_TIERS['Easy+'].lockedHotspotCount).toBe(1);
  });
});

// ── hand-crafted-levels: tutorial levels in fallback pool ─────────────────
describe('hand-crafted-levels: fallback pool contains tutorial layouts', () => {
  it('fallback-cases pool has at least 7 entries (T1, T2, Ch1-C1 through Ch1-C5)', () => {
    expect(FALLBACK_CASES.length).toBeGreaterThanOrEqual(7);
  });

  it('hand-crafted T1 cannot be failed (tapLimit >= clueSlotsRequired)', () => {
    const t1 = HAND_CRAFTED_CASES.find(c => c.isIntro && c.clueSlotsRequired === 3);
    expect(t1).toBeDefined();
    expect(t1!.tapLimit).toBeGreaterThanOrEqual(t1!.clueSlotsRequired * 3); // Very generous
  });
});

// ── audio-system: no 'src' key in audio sprite definitions ───────────────
describe('audio-system: audio sprite key compliance', () => {
  it('no audio sprite entry uses the banned "src" key', () => {
    const entries = Object.values(AUDIO_CONFIG);
    for (const entry of entries) {
      expect(entry).not.toHaveProperty('src');
    }
  });

  it('all audio sprite entries have "urls" key', () => {
    const entries = Object.values(AUDIO_CONFIG);
    for (const entry of entries) {
      expect(entry).toHaveProperty('urls');
    }
  });
});

// ── scoring: computeScore with startingTaps=0 returns floor ───────────────
describe('scoring: edge case when startingTaps is 0', () => {
  it('computeScore returns floor 1000 when startingTaps is 0', () => {
    expect(computeScore(0, 0)).toBe(1000);
    expect(computeScore(5, 0)).toBe(1000);
  });
});
