/**
 * Hand-Crafted Cases — Tutorial T1, T2, and Chapter 1 Case 1.
 *
 * preserveAcrossPipeline: true
 * GDD explicitly states: do not overwrite during build pipeline runs.
 * These are manually curated scene layouts — never procedurally generated.
 *
 * T1: Library scene — 3 evidence, no tap counter display, auto-win, no Deduction Phase.
 * T2: Mansion foyer — 5 hotspots (3 evidence, 1 red herring, 1 empty), tap limit 12.
 */
import type { HotspotOutcome, EvidenceType } from '../state/ClueChasersPlugin';

// ── Types ────────────────────────────────────────────────────────────────────

export interface HotspotLayout {
  id: string;
  x: number;
  y: number;
  outcome: HotspotOutcome;
  evidenceType: EvidenceType | null;
  locked: boolean;
}

export interface CaseLayout {
  id: string;
  chapterId: string;
  sceneId: string;
  sceneEmoji: string;
  sceneLabel: string;
  clueSlotsRequired: number;
  tapLimit: number;
  isIntro: boolean;
  skipDeduction: boolean;
  hotspots: HotspotLayout[];
  suspects?: Array<{ id: string; name: string; motive: string; emoji: string }>;
  correctSuspectId?: string;
}

// ── Tutorial T1 — Library Scene ─────────────────────────────────────────────

const T1: CaseLayout = {
  id: 'tutorial-1',
  chapterId: 'tutorial',
  sceneId: 'library',
  sceneEmoji: '📚',
  sceneLabel: 'Library',
  clueSlotsRequired: 3,
  tapLimit: 20,
  isIntro: true,
  skipDeduction: true, // auto-win after board fills
  hotspots: [
    // 3 active evidence hotspots (cozy positions in library scene)
    { id: 't1-h1', x: 120, y: 280, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 't1-h2', x: 220, y: 320, outcome: 'evidence', evidenceType: 'document', locked: false },
    // Third is slightly hidden to build discovery
    { id: 't1-h3', x: 310, y: 200, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
  ],
};

// ── Tutorial T2 — Mansion Foyer ──────────────────────────────────────────────

const T2: CaseLayout = {
  id: 'tutorial-2',
  chapterId: 'tutorial',
  sceneId: 'mansion-foyer',
  sceneEmoji: '🏛️',
  sceneLabel: 'Mansion Foyer',
  clueSlotsRequired: 5,
  tapLimit: 12,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    // 5 evidence (clueSlotsRequired=5 — all must be collectable)
    { id: 't2-h1', x: 80, y: 300, outcome: 'evidence', evidenceType: 'voice', locked: false },
    { id: 't2-h2', x: 170, y: 250, outcome: 'evidence', evidenceType: 'disguise', locked: false },
    { id: 't2-h3', x: 280, y: 350, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 't2-h6', x: 200, y: 150, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 't2-h7', x: 320, y: 180, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    // 1 red herring (teaches lesson)
    { id: 't2-h4', x: 340, y: 280, outcome: 'red-herring', evidenceType: null, locked: false },
    // 1 empty (teaches patience)
    { id: 't2-h5', x: 50, y: 200, outcome: 'empty', evidenceType: null, locked: false },
  ],
  suspects: [
    { id: 'butler-t2', name: 'The Butler', motive: 'Hidden inheritance', emoji: '🧐' },
    { id: 'gardener-t2', name: 'The Gardener', motive: 'Disputed land', emoji: '👨‍🌾' },
    { id: 'cook-t2', name: 'The Cook', motive: 'Secret recipe theft', emoji: '👨‍🍳' },
  ],
  correctSuspectId: 'butler-t2',
};

// ── Chapter 1, Case 1 — Haunted Library (hand-crafted) ───────────────────────

const CH1_C1: CaseLayout = {
  id: 'ch1-case-1',
  chapterId: 'chapter-1',
  sceneId: 'mansion-library',
  sceneEmoji: '🕯️',
  sceneLabel: 'Haunted Library',
  clueSlotsRequired: 3,
  tapLimit: 15,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    { id: 'c1-h1', x: 100, y: 320, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 'c1-h2', x: 200, y: 260, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 'c1-h3', x: 290, y: 340, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    { id: 'c1-h4', x: 150, y: 180, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c1-h5', x: 350, y: 200, outcome: 'empty', evidenceType: null, locked: false },
  ],
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
};

// ── Exports ──────────────────────────────────────────────────────────────────

export const HAND_CRAFTED_CASES: CaseLayout[] = [T1, T2, CH1_C1];

/**
 * Get a tutorial case by ID ('T1' or 'T2').
 */
export function getTutorialCase(tutorialId: 'T1' | 'T2'): CaseLayout | undefined {
  const idMap = { T1: 'tutorial-1', T2: 'tutorial-2' };
  return HAND_CRAFTED_CASES.find(c => c.id === idMap[tutorialId]);
}

/**
 * Get a case by its full ID.
 */
export function getCaseById(id: string): CaseLayout | undefined {
  return HAND_CRAFTED_CASES.find(c => c.id === id);
}
