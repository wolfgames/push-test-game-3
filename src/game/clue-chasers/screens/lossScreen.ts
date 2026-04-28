/**
 * Loss screen state helpers for Scooby-Doo: Clue Chasers.
 *
 * The actual visual rendering is done by ResultsScreen.tsx (SolidJS DOM overlay).
 * This module provides utilities for loss screen state management.
 */

export const LOSS_HEADING = 'The mystery got away… for now!';
export const TRY_AGAIN_LABEL = 'Try Again';
export const KEEP_GOING_LABEL = 'Keep Going';
export const KEEP_GOING_COIN_COST = 5;
export const KEEP_GOING_BONUS_TAPS = 5;

/**
 * Loss screen options for GameController to use when triggering loss sequence.
 */
export interface LossScreenOptions {
  headingText: string;
  tryAgainLabel: string;
  keepGoingLabel: string;
  coinCost: number;
  bonusTaps: number;
}

export const DEFAULT_LOSS_SCREEN_OPTIONS: LossScreenOptions = {
  headingText: LOSS_HEADING,
  tryAgainLabel: TRY_AGAIN_LABEL,
  keepGoingLabel: KEEP_GOING_LABEL,
  coinCost: KEEP_GOING_COIN_COST,
  bonusTaps: KEEP_GOING_BONUS_TAPS,
};
