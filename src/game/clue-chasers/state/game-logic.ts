/**
 * Game logic utilities — pure functions for Scooby-Doo: Clue Chasers.
 * No Math.random(), no Pixi imports (guardrail #9).
 */

import type { EvidenceType } from './ClueChasersPlugin';

// ── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Compute case score.
 * caseScore = 1000 * (tapsRemaining/startingTaps + 1.0), clamped [1000, 2000].
 */
export function computeScore(tapsRemaining: number, startingTaps: number): number {
  if (startingTaps === 0) return 1000;
  const efficiency = tapsRemaining / startingTaps;
  const raw = Math.round(1000 * (efficiency + 1.0));
  return Math.min(2000, Math.max(1000, raw));
}

/**
 * Derive star rating from case score.
 */
export function computeStars(score: number): 1 | 2 | 3 {
  if (score >= 1500) return 3;
  if (score >= 1200) return 2;
  return 1;
}

// ── Clue Board ───────────────────────────────────────────────────────────────

/**
 * Find the next open slot index in the clue board.
 * Returns -1 if board is full.
 */
export function findNextOpenSlot(board: (EvidenceType | null)[]): number {
  return board.findIndex(s => s === null);
}

/**
 * Count filled slots.
 */
export function countFilledSlots(board: (EvidenceType | null)[]): number {
  return board.filter(s => s !== null).length;
}

/**
 * Check if board is full up to required slots.
 */
export function isBoardFull(board: (EvidenceType | null)[], requiredSlots: number): boolean {
  const filled = board.slice(0, requiredSlots).filter(s => s !== null).length;
  return filled >= requiredSlots;
}
