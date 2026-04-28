/**
 * HandCraftedLevels — static layout data.
 * Red tests written BEFORE implementation (TDD batch 4).
 */
import { describe, it, expect } from 'vitest';
import {
  HAND_CRAFTED_CASES,
  getTutorialCase,
} from '~/game/clue-chasers/data/hand-crafted-cases';

describe('HandCraftedLevels: static layout data', () => {
  it('T1 layout: clueSlotsRequired=3, tapLimit=20', () => {
    const t1 = getTutorialCase('T1');
    expect(t1).toBeDefined();
    expect(t1!.clueSlotsRequired).toBe(3);
    expect(t1!.tapLimit).toBe(20);
    expect(t1!.isIntro).toBe(true);
  });

  it('T2 layout: clueSlotsRequired=5, tapLimit=12, red herring present', () => {
    const t2 = getTutorialCase('T2');
    expect(t2).toBeDefined();
    expect(t2!.clueSlotsRequired).toBe(5);
    expect(t2!.tapLimit).toBe(12);
    const hasRedHerring = t2!.hotspots.some(h => h.outcome === 'red-herring');
    expect(hasRedHerring).toBe(true);
  });

  it('hand-crafted pool length >= 2 (T1 + T2)', () => {
    expect(HAND_CRAFTED_CASES.length).toBeGreaterThanOrEqual(2);
  });
});
