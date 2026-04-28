/**
 * Level Generator — produces procedural CaseLayout from a seed + difficulty tier.
 * Pure function: no Math.random(), no Pixi imports, no DOM reads (guardrail #9).
 *
 * Seed formula: chapterIndex * 100_000 + caseIndex * 1_000 + variantIndex
 */
import type { CaseLayout, HotspotLayout } from '../data/hand-crafted-cases';
import type { DifficultyTierName } from '../data/difficulty-tiers';
import { DIFFICULTY_TIERS } from '../data/difficulty-tiers';
import { FALLBACK_CASES } from '../data/fallback-cases';
import { CHAPTER_1 } from '../data/chapters';
import type { EvidenceType } from '../state/ClueChasersPlugin';

export interface GenerateLevelOptions {
  seed: number;
  difficultyTier: DifficultyTierName;
  /** Testing hook: force generator to exhaust retries and use fallback */
  forceUnsolvable?: boolean;
}

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

// ── Scene grid ───────────────────────────────────────────────────────────────

const SCENE_WIDTH = 390;
const SCENE_HEIGHT = 600; // scene canvas minus HUDs

const GRID_COLS = 6;
const GRID_ROWS = 5;
const CELL_W = Math.floor(SCENE_WIDTH / GRID_COLS);
const CELL_H = Math.floor(SCENE_HEIGHT / GRID_ROWS);
const MARGIN = 30;

const EVIDENCE_TYPES: EvidenceType[] = ['footprint', 'document', 'fingerprint', 'voice', 'disguise'];

const SCENE_IDS = [
  'mansion-library',
  'mansion-study',
  'mansion-cellar',
  'mansion-tower',
  'mansion-garden',
  'mansion-foyer',
];

// ── Grid position generator ───────────────────────────────────────────────────

function gridPositions(rng: () => number, count: number): Array<{ x: number; y: number }> {
  // Shuffle grid cells deterministically
  const cells: Array<{ col: number; row: number }> = [];
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      cells.push({ col, row });
    }
  }
  // Fisher-Yates shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, count).map(({ col, row }) => ({
    x: MARGIN + col * CELL_W + Math.floor(rng() * (CELL_W - MARGIN * 2)),
    y: MARGIN + row * CELL_H + Math.floor(rng() * (CELL_H - MARGIN * 2)),
  }));
}

// ── Solvability check ─────────────────────────────────────────────────────────

function isSolvable(layout: CaseLayout): boolean {
  const evidenceHotspots = layout.hotspots.filter(
    h => h.outcome === 'evidence' && !h.locked
  );
  // Greedy sim: pick evidence hotspots first, each costs 1 tap
  let taps = 0;
  let evidenceCollected = 0;
  for (const h of evidenceHotspots) {
    if (taps >= layout.tapLimit) break;
    taps++;
    evidenceCollected++;
    if (evidenceCollected >= layout.clueSlotsRequired) return true;
  }
  return false;
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateLevel(options: GenerateLevelOptions): CaseLayout {
  const { seed, difficultyTier, forceUnsolvable = false } = options;
  const tier = DIFFICULTY_TIERS[difficultyTier];

  const MAX_RETRIES = 10;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (forceUnsolvable) break; // Skip generation and go straight to fallback

    const variantSeed = seed + attempt;
    const rng = mulberry32(variantSeed);

    // 1. Scene selection
    const sceneIndex = Math.floor(rng() * SCENE_IDS.length);
    const sceneId = SCENE_IDS[sceneIndex];

    // 2. Suspect pool (from Chapter 1) — correct suspect chosen by seeded RNG (GDD Step 2)
    const suspects = [...CHAPTER_1.suspects];
    const suspectIndex = Math.floor(rng() * suspects.length);
    const correctSuspectId = suspects[suspectIndex].id;

    // 3. Evidence placement — shuffle EVIDENCE_TYPES to assign to hotspots
    const evidencePool = [...EVIDENCE_TYPES];
    for (let i = evidencePool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [evidencePool[i], evidencePool[j]] = [evidencePool[j], evidencePool[i]];
    }

    // 4. Total hotspot count = evidence + red herrings + locked + empty
    const totalHotspots =
      tier.clueSlotsRequired +
      tier.redHerringCount +
      tier.lockedHotspotCount +
      1; // one empty hotspot

    const positions = gridPositions(rng, totalHotspots);

    const hotspots: HotspotLayout[] = [];
    let posIdx = 0;
    let evidenceIdx = 0;

    // Evidence hotspots
    for (let i = 0; i < tier.clueSlotsRequired; i++) {
      hotspots.push({
        id: `gen-${variantSeed}-e${i}`,
        x: positions[posIdx].x,
        y: positions[posIdx].y,
        outcome: 'evidence',
        evidenceType: evidencePool[evidenceIdx % evidencePool.length],
        locked: false,
      });
      posIdx++;
      evidenceIdx++;
    }

    // Red herring hotspots
    for (let i = 0; i < tier.redHerringCount; i++) {
      hotspots.push({
        id: `gen-${variantSeed}-r${i}`,
        x: positions[posIdx].x,
        y: positions[posIdx].y,
        outcome: 'red-herring',
        evidenceType: null,
        locked: false,
      });
      posIdx++;
    }

    // Locked hotspots
    for (let i = 0; i < tier.lockedHotspotCount; i++) {
      hotspots.push({
        id: `gen-${variantSeed}-l${i}`,
        x: positions[posIdx].x,
        y: positions[posIdx].y,
        outcome: 'empty',
        evidenceType: null,
        locked: true,
      });
      posIdx++;
    }

    // Empty hotspot
    if (posIdx < positions.length) {
      hotspots.push({
        id: `gen-${variantSeed}-empty`,
        x: positions[posIdx].x,
        y: positions[posIdx].y,
        outcome: 'empty',
        evidenceType: null,
        locked: false,
      });
    }

    const layout: CaseLayout = {
      id: `generated-${variantSeed}`,
      chapterId: 'chapter-1',
      sceneId,
      sceneEmoji: '🕵️',
      sceneLabel: 'Mystery Scene',
      clueSlotsRequired: tier.clueSlotsRequired,
      tapLimit: tier.tapLimit,
      isIntro: false,
      skipDeduction: false,
      hotspots,
      suspects,
      correctSuspectId,
    };

    // 5. Solvability check
    if (isSolvable(layout)) {
      return layout;
    }
  }

  // 6. Fallback chain: use hand-crafted fallback
  const fallback = FALLBACK_CASES.find(c => c.chapterId === 'chapter-1');
  if (fallback) return fallback;

  // Absolute last resort: return Tutorial T2 (always solvable)
  return FALLBACK_CASES[1];
}
