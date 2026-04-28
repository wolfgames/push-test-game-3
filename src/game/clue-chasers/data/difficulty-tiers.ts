/**
 * Difficulty Tiers — parameter lookup table for level generation.
 * Maps tier name to generation parameters.
 */

export type DifficultyTierName = 'Intro' | 'Easy' | 'Easy+' | 'Medium' | 'Medium+' | 'Hard';

export interface DifficultyTierParams {
  clueSlotsRequired: number;
  tapLimit: number;
  lockedHotspotCount: number;
  redHerringCount: number;
  hotspotCount: number;
}

export const DIFFICULTY_TIERS: Record<DifficultyTierName, DifficultyTierParams> = {
  Intro: {
    clueSlotsRequired: 3,
    tapLimit: 20,
    lockedHotspotCount: 0,
    redHerringCount: 0,
    hotspotCount: 3,
  },
  Easy: {
    clueSlotsRequired: 3,
    tapLimit: 15,
    lockedHotspotCount: 0,
    redHerringCount: 1,
    hotspotCount: 5,
  },
  'Easy+': {
    clueSlotsRequired: 5,
    tapLimit: 15,
    lockedHotspotCount: 1,
    redHerringCount: 2,
    hotspotCount: 8,
  },
  Medium: {
    clueSlotsRequired: 5,
    tapLimit: 12,
    lockedHotspotCount: 2,
    redHerringCount: 2,
    hotspotCount: 9,
  },
  'Medium+': {
    clueSlotsRequired: 5,
    tapLimit: 10,
    lockedHotspotCount: 2,
    redHerringCount: 3,
    hotspotCount: 10,
  },
  Hard: {
    clueSlotsRequired: 5,
    tapLimit: 8,
    lockedHotspotCount: 3,
    redHerringCount: 3,
    hotspotCount: 11,
  },
};

/**
 * Get difficulty tier params by name.
 */
export function getDifficultyTier(name: DifficultyTierName): DifficultyTierParams {
  return DIFFICULTY_TIERS[name];
}
