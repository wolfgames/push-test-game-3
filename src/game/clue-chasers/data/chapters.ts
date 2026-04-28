/**
 * Chapters — Chapter and case metadata for Scooby-Doo: Clue Chasers.
 * Core pass covers Tutorial + Chapter 1 only.
 * Chapters 2-3 are post-launch content added via separate pipeline runs.
 */
import type { DifficultyTierName } from './difficulty-tiers';

export interface SuspectInfo {
  id: string;
  name: string;
  motive: string;
  emoji: string;
}

export interface ChapterCaseEntry {
  caseIndex: number;
  /** Null = use hand-crafted layout from hand-crafted-cases.ts */
  procedural: boolean;
  difficultyTier: DifficultyTierName;
}

export interface ChapterData {
  id: string;
  chapterIndex: number;
  title: string;
  sceneId: string;
  suspects: SuspectInfo[];
  correctSuspectId: string;
  cases: ChapterCaseEntry[];
}

// ── Tutorial ─────────────────────────────────────────────────────────────────

export const TUTORIAL_CHAPTER: ChapterData = {
  id: 'tutorial',
  chapterIndex: 0,
  title: 'Tutorial',
  sceneId: 'library',
  suspects: [],
  correctSuspectId: '',
  cases: [
    { caseIndex: 1, procedural: false, difficultyTier: 'Intro' },
    { caseIndex: 2, procedural: false, difficultyTier: 'Easy' },
  ],
};

// ── Chapter 1 ─────────────────────────────────────────────────────────────────

export const CHAPTER_1: ChapterData = {
  id: 'chapter-1',
  chapterIndex: 1,
  title: 'The Haunted Mansion Mystery',
  sceneId: 'mansion',
  suspects: [
    { id: 'caretaker-jones', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'professor-whitmore', name: 'Professor Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'mayor-bellweather-ch1', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ],
  correctSuspectId: 'mayor-bellweather-ch1',
  cases: [
    { caseIndex: 1, procedural: false, difficultyTier: 'Easy' },  // hand-crafted CH1_C1
    { caseIndex: 2, procedural: true, difficultyTier: 'Easy' },
    { caseIndex: 3, procedural: true, difficultyTier: 'Easy+' },
    { caseIndex: 4, procedural: true, difficultyTier: 'Easy+' },
    { caseIndex: 5, procedural: true, difficultyTier: 'Easy+' },
  ],
};

export const ALL_CHAPTERS: ChapterData[] = [TUTORIAL_CHAPTER, CHAPTER_1];

/**
 * Get chapter data by chapter ID.
 */
export function getChapterById(id: string): ChapterData | undefined {
  return ALL_CHAPTERS.find(c => c.id === id);
}

/**
 * Compute seed for a procedural level.
 * Formula: chapterIndex * 100_000 + caseIndex * 1_000 + variantIndex
 */
export function computeSeed(chapterIndex: number, caseIndex: number, variantIndex = 0): number {
  return chapterIndex * 100_000 + caseIndex * 1_000 + variantIndex;
}
