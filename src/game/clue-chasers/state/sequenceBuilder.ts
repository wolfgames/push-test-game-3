/**
 * sequenceBuilder — pure ordered event emitters for win/loss sequences.
 *
 * These functions emit a sequence of labeled steps synchronously.
 * The controller (GameController) reads the steps and wires GSAP animations.
 *
 * Pure: no Math.random(), no Pixi imports, no DOM reads (guardrail #9).
 */

export type WinStep =
  | 'villain-card-scale'
  | 'scene-dim'
  | 'unmasking-flip'
  | 'villain-banner'
  | 'scooby-jump'
  | 'star-fill'
  | 'results-fade'
  | 'next-case-button';

export type LossStep =
  | 'freeze-input'
  | 'scene-desaturate'
  | 'scooby-droop'
  | 'loss-overlay-fade'
  | 'text-type-in'
  | 'try-again-button'
  | 'keep-going-button';

export interface WinSequenceOptions {
  onStep: (step: WinStep) => void;
  suspectName: string;
  starsEarned: number;
}

export interface LossSequenceOptions {
  onStep: (step: LossStep) => void;
}

const WIN_STEPS: WinStep[] = [
  'villain-card-scale',
  'scene-dim',
  'unmasking-flip',
  'villain-banner',
  'scooby-jump',
  'star-fill',
  'results-fade',
  'next-case-button',
];

const LOSS_STEPS: LossStep[] = [
  'freeze-input',
  'scene-desaturate',
  'scooby-droop',
  'loss-overlay-fade',
  'text-type-in',
  'try-again-button',
  'keep-going-button',
];

/**
 * Emit 8-step win sequence.
 * Steps are emitted synchronously; the controller wires async GSAP per step.
 */
export function buildWinSequence(options: WinSequenceOptions): WinStep[] {
  const { onStep } = options;
  for (const step of WIN_STEPS) {
    onStep(step);
  }
  return WIN_STEPS;
}

/**
 * Emit 7-step loss sequence.
 * Steps are emitted synchronously; the controller wires async GSAP per step.
 */
export function buildLossSequence(options: LossSequenceOptions): LossStep[] {
  const { onStep } = options;
  for (const step of LOSS_STEPS) {
    onStep(step);
  }
  return LOSS_STEPS;
}
