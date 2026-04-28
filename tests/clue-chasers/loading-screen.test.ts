/**
 * LoadingScreen: branded content.
 * Red tests written BEFORE implementation (TDD batch 9).
 */
import { describe, it, expect } from 'vitest';
import { LOADING_SCREEN_CONFIG } from '~/game/clue-chasers/screens/loadingScreenConfig';

describe('LoadingScreen: branded content', () => {
  it('shows paw-print fallback and Mystery Inc. text (not generic Loading)', () => {
    expect(LOADING_SCREEN_CONFIG.progressEmoji).toBe('🐾');
    expect(LOADING_SCREEN_CONFIG.titleText).toBe('Mystery Inc.');
    expect(LOADING_SCREEN_CONFIG.titleText).not.toContain('Loading');
    expect(LOADING_SCREEN_CONFIG.titleText).not.toContain('Game');
  });

  it('progress bar crossfades on complete (400ms)', () => {
    expect(LOADING_SCREEN_CONFIG.crossfadeDurationMs).toBe(400);
  });

  it('screen consumes reserved_bottom_px=56 as padding', () => {
    expect(LOADING_SCREEN_CONFIG.reservedBottomPx).toBe(56);
  });
});
