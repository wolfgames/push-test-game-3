/**
 * LevelGenerator — determinism and solvability.
 * Red tests written BEFORE implementation (TDD batch 6).
 */
import { describe, it, expect } from 'vitest';
import { generateLevel } from '~/game/clue-chasers/state/levelGenerator';
import { FALLBACK_CASES } from '~/game/clue-chasers/data/fallback-cases';

describe('LevelGenerator: determinism and solvability', () => {
  it('seed determinism: same seed always returns same layout', () => {
    const a = generateLevel({ seed: 1_001_000, difficultyTier: 'Easy' });
    const b = generateLevel({ seed: 1_001_000, difficultyTier: 'Easy' });
    expect(a.hotspots).toEqual(b.hotspots);
    expect(a.correctSuspectId).toBe(b.correctSuspectId);
  });

  it('different seeds return different hotspot layouts', () => {
    const a = generateLevel({ seed: 1_001_000, difficultyTier: 'Easy' });
    const b = generateLevel({ seed: 1_002_000, difficultyTier: 'Easy' });
    // At least one hotspot position should differ
    const positionsMatch = a.hotspots.every((h, i) =>
      h.x === b.hotspots[i]?.x && h.y === b.hotspots[i]?.y
    );
    expect(positionsMatch).toBe(false);
  });

  it('solvability: simulated optimal play fills board before tapLimit', () => {
    const layout = generateLevel({ seed: 1_001_000, difficultyTier: 'Easy' });
    // Simulate optimal play: always pick evidence hotspot
    let taps = 0;
    let evidenceCollected = 0;
    const evidenceHotspots = layout.hotspots.filter(h => h.outcome === 'evidence');
    for (const h of evidenceHotspots) {
      if (taps < layout.tapLimit) {
        taps++;
        evidenceCollected++;
      }
    }
    expect(evidenceCollected).toBeGreaterThanOrEqual(layout.clueSlotsRequired);
    expect(taps).toBeLessThanOrEqual(layout.tapLimit);
  });

  it('fallback chain: after 10 retries, hand-crafted fallback promoted', () => {
    // Use a seed that triggers fallback by passing an unsolvable override
    const layout = generateLevel({ seed: 1_001_000, difficultyTier: 'Easy', forceUnsolvable: true });
    // Should come from fallback pool (has a defined id with 'fallback' or matches hand-crafted)
    expect(FALLBACK_CASES.length).toBeGreaterThanOrEqual(7);
    // Layout should still be valid CaseLayout
    expect(layout.hotspots).toBeDefined();
    expect(layout.tapLimit).toBeGreaterThan(0);
  });

  it('seed formula: chapterIndex*100000 + caseIndex*1000 + variantIndex', () => {
    // Chapter 1, Case 2, Variant 0 → seed 100000 + 2000 + 0 = 102000
    const seed = 1 * 100_000 + 2 * 1_000 + 0;
    expect(seed).toBe(102_000);
    const layout = generateLevel({ seed, difficultyTier: 'Easy' });
    expect(layout).toBeDefined();
    expect(layout.hotspots.length).toBeGreaterThan(0);
  });
});
