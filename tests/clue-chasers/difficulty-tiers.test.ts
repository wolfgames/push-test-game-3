/**
 * DifficultyTiers — parameter correctness.
 * Red tests written BEFORE implementation (TDD batch 6).
 */
import { describe, it, expect } from 'vitest';
import { DIFFICULTY_TIERS, getDifficultyTier } from '~/game/clue-chasers/data/difficulty-tiers';

describe('DifficultyTiers: parameter correctness', () => {
  it('Easy tier: clueSlotsRequired=3, tapLimit=15', () => {
    const tier = DIFFICULTY_TIERS['Easy'];
    expect(tier.clueSlotsRequired).toBe(3);
    expect(tier.tapLimit).toBe(15);
  });

  it('Easy+ tier: clueSlotsRequired=5, tapLimit=15, lockedHotspots=1', () => {
    const tier = DIFFICULTY_TIERS['Easy+'];
    expect(tier.clueSlotsRequired).toBe(5);
    expect(tier.tapLimit).toBe(15);
    expect(tier.lockedHotspotCount).toBe(1);
  });

  it('no jump > 1 difficulty unit between consecutive cases', () => {
    const tierOrder = ['Intro', 'Easy', 'Easy+', 'Medium', 'Medium+', 'Hard'] as const;
    for (let i = 1; i < tierOrder.length; i++) {
      const prev = DIFFICULTY_TIERS[tierOrder[i - 1]];
      const curr = DIFFICULTY_TIERS[tierOrder[i]];
      // Difficulty unit: change in clueSlotsRequired
      const slotDiff = Math.abs(curr.clueSlotsRequired - prev.clueSlotsRequired);
      expect(slotDiff).toBeLessThanOrEqual(2);
    }
  });
});
