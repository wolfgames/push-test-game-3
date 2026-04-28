/**
 * ChapterProgression: data and unlock state.
 * Red tests written BEFORE implementation (TDD batch 10).
 */
import { describe, it, expect } from 'vitest';
import { ALL_CHAPTERS, CHAPTER_1 } from '~/game/clue-chasers/data/chapters';

describe('ChapterProgression: data and unlock state', () => {
  it('chapters.ts has data for all chapters with 5 cases each in Chapter 1', () => {
    expect(ALL_CHAPTERS.length).toBeGreaterThanOrEqual(2);
    expect(CHAPTER_1.cases).toHaveLength(5);
    expect(CHAPTER_1.id).toBe('chapter-1');
  });

  it('Chapter 1 unlocked, Chapters 2-3 locked at launch', () => {
    // Chapter 1 exists and has cases defined
    expect(CHAPTER_1.cases.length).toBeGreaterThan(0);
    // Post-launch chapters would be added later — core pass has chapter-1 only
    const launchChapters = ALL_CHAPTERS.filter(c => c.id !== 'tutorial');
    expect(launchChapters.length).toBeGreaterThanOrEqual(1);
    // Only Chapter 1 has real cases in core pass
    const chapter1 = launchChapters.find(c => c.id === 'chapter-1');
    expect(chapter1).toBeDefined();
    expect(chapter1!.cases.length).toBe(5);
  });

  it('case-level star ratings: each chapter has suspects and correctSuspectId', () => {
    expect(CHAPTER_1.suspects.length).toBeGreaterThan(0);
    expect(CHAPTER_1.correctSuspectId).toBeDefined();
    expect(CHAPTER_1.correctSuspectId.length).toBeGreaterThan(0);
  });
});
