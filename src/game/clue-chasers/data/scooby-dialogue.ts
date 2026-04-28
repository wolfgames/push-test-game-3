/**
 * Scooby dialogue data — keyed by caseId + event.
 * All dialogue strings are exact-copy from GDD where specified.
 */
export interface DialogueLine {
  text: string;
  duration: number; // ms auto-dismiss
  emoji: string;
}

export type DialogueEvent =
  | 'pre-level'
  | 'post-win'
  | 'first-red-herring'
  | 'locked-hotspot'
  | 'wrong-guess';

// ── Dialogue Map ─────────────────────────────────────────────────────────────

export const DIALOGUE: Record<string, Partial<Record<DialogueEvent, DialogueLine>>> = {
  'tutorial-1': {
    'pre-level': {
      text: "Rikes! Someone's been in here, Shaggy! Let's look around!",
      duration: 2500,
      emoji: '🐕',
    },
  },
  'tutorial-2': {
    'pre-level': {
      text: "Zoinks! Now things get tricky! Watch out for red herrings!",
      duration: 2500,
      emoji: '🐕',
    },
    'first-red-herring': {
      text: "Wah-wah! That's a red herring, Scoob!",
      duration: 2000,
      emoji: '🤷',
    },
  },
};

// ── Universal events ──────────────────────────────────────────────────────────

export const UNIVERSAL_DIALOGUE: Record<DialogueEvent, DialogueLine> = {
  'pre-level': {
    text: "Let's investigate, gang!",
    duration: 2000,
    emoji: '🐕',
  },
  'post-win': {
    text: "Scooby-Dooby-Doo! We solved the mystery!",
    duration: 3000,
    emoji: '🎉',
  },
  'first-red-herring': {
    text: "Wah-wah! That's a red herring!",
    duration: 2000,
    emoji: '🤷',
  },
  'locked-hotspot': {
    text: "Ruh-roh! That one's locked, Scoob!",
    duration: 2000,
    emoji: '😟',
  },
  'wrong-guess': {
    text: "Hmm, nope! That's not the culprit!",
    duration: 2000,
    emoji: '🤔',
  },
};

/**
 * Get dialogue line for a specific case and event.
 * Falls back to universal dialogue if no case-specific line.
 */
export function getDialogue(caseId: string, event: DialogueEvent): DialogueLine {
  const caseLine = DIALOGUE[caseId]?.[event];
  return caseLine ?? UNIVERSAL_DIALOGUE[event];
}
