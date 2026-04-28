/**
 * Fallback Cases — hand-crafted pool used when procedural generator
 * fails solvability check after 10 retries.
 *
 * Pool must contain >= 7 cases covering Tutorial T1, T2, and Ch1-C1 through Ch1-C5.
 * preserveAcrossPipeline: true — do not overwrite during build pipeline runs.
 */
import type { CaseLayout } from './hand-crafted-cases';
import { HAND_CRAFTED_CASES } from './hand-crafted-cases';

// ── Additional fallback cases Ch1-C2 through Ch1-C5 ─────────────────────────

const CH1_C2: CaseLayout = {
  id: 'ch1-case-2-fallback',
  chapterId: 'chapter-1',
  sceneId: 'mansion-study',
  sceneEmoji: '📖',
  sceneLabel: 'Mansion Study',
  clueSlotsRequired: 3,
  tapLimit: 15,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    { id: 'c2-h1', x: 90, y: 310, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 'c2-h2', x: 210, y: 270, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    { id: 'c2-h3', x: 300, y: 330, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 'c2-h4', x: 140, y: 190, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c2-h5', x: 350, y: 210, outcome: 'empty', evidenceType: null, locked: false },
  ],
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
};

const CH1_C3: CaseLayout = {
  id: 'ch1-case-3-fallback',
  chapterId: 'chapter-1',
  sceneId: 'mansion-cellar',
  sceneEmoji: '🕯️',
  sceneLabel: 'Mansion Cellar',
  clueSlotsRequired: 5,
  tapLimit: 15,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    { id: 'c3-h1', x: 80, y: 290, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 'c3-h2', x: 160, y: 260, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 'c3-h3', x: 240, y: 320, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    { id: 'c3-h4', x: 320, y: 280, outcome: 'evidence', evidenceType: 'voice', locked: false },
    { id: 'c3-h5', x: 120, y: 220, outcome: 'evidence', evidenceType: 'disguise', locked: false },
    { id: 'c3-h6', x: 200, y: 180, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c3-h7', x: 300, y: 200, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c3-h8', x: 50, y: 350, outcome: 'empty', evidenceType: null, locked: true },
  ],
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
};

const CH1_C4: CaseLayout = {
  id: 'ch1-case-4-fallback',
  chapterId: 'chapter-1',
  sceneId: 'mansion-tower',
  sceneEmoji: '🗼',
  sceneLabel: 'Mansion Tower',
  clueSlotsRequired: 5,
  tapLimit: 15,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    { id: 'c4-h1', x: 100, y: 300, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    { id: 'c4-h2', x: 190, y: 260, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 'c4-h3', x: 270, y: 340, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 'c4-h4', x: 350, y: 290, outcome: 'evidence', evidenceType: 'disguise', locked: false },
    { id: 'c4-h5', x: 60, y: 220, outcome: 'evidence', evidenceType: 'voice', locked: false },
    { id: 'c4-h6', x: 230, y: 200, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c4-h7', x: 310, y: 180, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c4-h8', x: 140, y: 380, outcome: 'empty', evidenceType: null, locked: true },
  ],
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
};

const CH1_C5: CaseLayout = {
  id: 'ch1-case-5-fallback',
  chapterId: 'chapter-1',
  sceneId: 'mansion-garden',
  sceneEmoji: '🌿',
  sceneLabel: 'Mansion Garden',
  clueSlotsRequired: 5,
  tapLimit: 15,
  isIntro: false,
  skipDeduction: false,
  hotspots: [
    { id: 'c5-h1', x: 110, y: 295, outcome: 'evidence', evidenceType: 'footprint', locked: false },
    { id: 'c5-h2', x: 205, y: 255, outcome: 'evidence', evidenceType: 'fingerprint', locked: false },
    { id: 'c5-h3', x: 285, y: 335, outcome: 'evidence', evidenceType: 'document', locked: false },
    { id: 'c5-h4', x: 355, y: 285, outcome: 'evidence', evidenceType: 'voice', locked: false },
    { id: 'c5-h5', x: 65, y: 225, outcome: 'evidence', evidenceType: 'disguise', locked: false },
    { id: 'c5-h6', x: 175, y: 195, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c5-h7', x: 320, y: 175, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c5-h8', x: 240, y: 375, outcome: 'red-herring', evidenceType: null, locked: false },
    { id: 'c5-h9', x: 50, y: 360, outcome: 'empty', evidenceType: null, locked: true },
  ],
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
};

// ── Export ───────────────────────────────────────────────────────────────────

/**
 * Full fallback pool: Tutorial T1, T2, Ch1-C1 (from hand-crafted) + Ch1-C2 through Ch1-C5.
 * Length must be >= 7.
 */
export const FALLBACK_CASES: CaseLayout[] = [
  ...HAND_CRAFTED_CASES, // T1, T2, CH1_C1 (3 cases)
  CH1_C2,
  CH1_C3,
  CH1_C4,
  CH1_C5,
];

/**
 * Get fallback case for a given chapter and case index (1-based).
 */
export function getFallbackCase(chapterId: string, caseIndex: number): CaseLayout | undefined {
  const chapterCases = FALLBACK_CASES.filter(c => c.chapterId === chapterId);
  return chapterCases[caseIndex - 1];
}
