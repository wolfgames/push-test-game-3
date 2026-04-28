/**
 * StartScreen: branded title and routing.
 * Red tests written BEFORE implementation (TDD batch 9).
 */
import { describe, it, expect } from 'vitest';
import { START_SCREEN_CONFIG } from '~/game/clue-chasers/screens/startScreenConfig';

describe('StartScreen: branded title and routing', () => {
  it('shows Scooby-Doo: Clue Chasers heading', () => {
    expect(START_SCREEN_CONFIG.heading).toBe('Scooby-Doo: Clue Chasers');
  });

  it('Investigate! button at bottom-center >= 44pt', () => {
    expect(START_SCREEN_CONFIG.primaryButtonText).toBe('Investigate!');
    expect(START_SCREEN_CONFIG.primaryButtonMinHeight).toBeGreaterThanOrEqual(44);
  });

  it('Investigate! routes to tutorial on first launch', () => {
    expect(START_SCREEN_CONFIG.firstLaunchRoute).toBe('game');
    // First-launch flag key
    expect(START_SCREEN_CONFIG.seenTutorialKey).toBeDefined();
  });

  it('no scaffold placeholder text', () => {
    // None of the strings should contain generic placeholder text
    const textValues = [
      START_SCREEN_CONFIG.heading,
      START_SCREEN_CONFIG.primaryButtonText,
    ];
    const forbidden = ['Game Over', 'Score', 'Start Game', 'Play', 'TODO', 'placeholder'];
    for (const text of textValues) {
      for (const word of forbidden) {
        expect(text, `Found forbidden text '${word}' in '${text}'`).not.toContain(word);
      }
    }
  });
});
