/**
 * Start Screen Config — Scooby-Doo: Clue Chasers branded start screen constants.
 * Used by StartScreen.tsx and startView.ts to replace generic scaffold content.
 */

export interface StartScreenConfig {
  /** H1 heading text */
  heading: string;
  /** Primary CTA button label */
  primaryButtonText: string;
  /** Minimum height of primary button in pt (accessibility: >= 44pt) */
  primaryButtonMinHeight: number;
  /** Screen route for first-time launch */
  firstLaunchRoute: string;
  /** localStorage key for tutorial-seen flag */
  seenTutorialKey: string;
  /** Background color */
  backgroundColor: string;
  /** Tagline below heading */
  tagline: string;
}

export const START_SCREEN_CONFIG: StartScreenConfig = {
  heading: 'Scooby-Doo: Clue Chasers',
  primaryButtonText: 'Investigate!',
  primaryButtonMinHeight: 56,
  firstLaunchRoute: 'game',
  seenTutorialKey: 'cc_seenTutorial',
  backgroundColor: '#1a1a2a',
  tagline: 'Solve the mystery with the Mystery Inc. gang!',
};
