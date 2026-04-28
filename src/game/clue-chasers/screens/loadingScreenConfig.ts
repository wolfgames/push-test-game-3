/**
 * Loading Screen Config — Scooby-Doo: Clue Chasers branded loading screen constants.
 * Used by LoadingScreen.tsx to replace generic scaffold content.
 */

export interface LoadingScreenConfig {
  /** Emoji shown as paw-print progress indicator */
  progressEmoji: string;
  /** Brand title text (replaces generic 'Loading') */
  titleText: string;
  /** Duration in ms for the crossfade when loading completes */
  crossfadeDurationMs: number;
  /** Bottom padding to consume DOM reserved area */
  reservedBottomPx: number;
  /** Background color — dark Mystery Inc. palette */
  backgroundColor: string;
}

export const LOADING_SCREEN_CONFIG: LoadingScreenConfig = {
  progressEmoji: '🐾',
  titleText: 'Mystery Inc.',
  crossfadeDurationMs: 400,
  reservedBottomPx: 56,
  backgroundColor: '#1a1a1a',
};
