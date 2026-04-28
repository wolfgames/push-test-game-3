/**
 * Scoring — star rating thresholds.
 * Red tests written BEFORE implementation (TDD batch 2).
 */
import { describe, it, expect } from 'vitest';
import { computeScore, computeStars } from '~/game/clue-chasers/state/game-logic';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

describe('Scoring: star rating thresholds', () => {
  it('caseScore formula: base * efficiency, 1000 min 2000 max', () => {
    expect(computeScore(15, 15)).toBe(2000); // all taps remaining = max
    expect(computeScore(0, 15)).toBe(1000);  // 0 taps remaining = min
    expect(computeScore(7, 15)).toBeGreaterThanOrEqual(1466);
    expect(computeScore(7, 15)).toBeLessThanOrEqual(1468);
  });

  it('3-star threshold: caseScore >= 1500', () => {
    // 3 stars when score >= 1500
    expect(computeStars(1500)).toBe(3);
    expect(computeStars(2000)).toBe(3);
    expect(computeStars(1499)).toBe(2);
  });

  it('2-star threshold: caseScore >= 1200', () => {
    expect(computeStars(1200)).toBe(2);
    expect(computeStars(1300)).toBe(2);
    expect(computeStars(1199)).toBe(1);
  });

  it('1-star threshold: caseScore >= 1000', () => {
    expect(computeStars(1000)).toBe(1);
    expect(computeStars(1100)).toBe(1);
  });

  it('two-player striation: high efficiency >> low efficiency', () => {
    // Easy tier: 15 start taps
    const playerAScore = computeScore(12, 15); // 12 remaining
    const playerBScore = computeScore(2, 15);  // 2 remaining
    expect(playerAScore).toBeGreaterThanOrEqual(1800);
    expect(playerBScore).toBeLessThanOrEqual(1133);
    expect(playerAScore - playerBScore).toBeGreaterThanOrEqual(600);
  });
});
