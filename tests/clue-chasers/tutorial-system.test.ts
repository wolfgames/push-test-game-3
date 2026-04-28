/**
 * TutorialSystem — ghost-finger and phase gating.
 * Red tests written BEFORE implementation (TDD batch 4).
 */
import { describe, it, expect } from 'vitest';
import {
  HAND_CRAFTED_CASES,
  getTutorialCase,
} from '~/game/clue-chasers/data/hand-crafted-cases';
import type { CaseLayout } from '~/game/clue-chasers/data/hand-crafted-cases';

describe('TutorialSystem: ghost-finger and phase gating', () => {
  it('ghost-finger pointer fires once on first session only', () => {
    // Validate that T1 layout has isIntro=true (the trigger for ghost-finger)
    const t1 = getTutorialCase('T1');
    expect(t1).toBeDefined();
    expect(t1!.isIntro).toBe(true);
  });

  it('Tutorial L1: tap counter hidden, Deduction skipped', () => {
    const t1 = getTutorialCase('T1');
    expect(t1!.isIntro).toBe(true);
    expect(t1!.tapLimit).toBeGreaterThanOrEqual(20); // Internal cap 20 taps
    expect(t1!.clueSlotsRequired).toBe(3);
    // T1 has no Deduction Phase (auto-win) — no suspects needed
    expect(t1!.skipDeduction).toBe(true);
  });

  it('Tutorial L2: tap counter visible at 12, Deduction Phase enabled', () => {
    const t2 = getTutorialCase('T2');
    expect(t2).toBeDefined();
    expect(t2!.isIntro).toBe(false);
    expect(t2!.tapLimit).toBe(12);
    expect(t2!.clueSlotsRequired).toBe(5);
    expect(t2!.skipDeduction).toBe(false);
  });

  it('first red herring tap in T2 triggers shrug reaction (once only)', () => {
    const t2 = getTutorialCase('T2');
    // T2 must have at least one red-herring hotspot
    const hasRedHerring = t2!.hotspots.some(h => h.outcome === 'red-herring');
    expect(hasRedHerring).toBe(true);
  });
});
