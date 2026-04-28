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
    // Exact copy from GDD § Tutorial Level 1 — Pre-level dialogue
    'pre-level': {
      text: "Rikes! Someone's been in here, Shaggy! Let's look around!",
      duration: 2500,
      emoji: '🐕',
    },
    // Exact copy from GDD § Tutorial Level 1 — Post-level dialogue
    'post-win': {
      text: "Zoinks! Three clues already! You're a natural, pal!",
      duration: 2000,
      emoji: '🎉',
    },
  },
  'tutorial-2': {
    // Exact copy from GDD § Tutorial Level 2 — Pre-level dialogue
    'pre-level': {
      text: "Careful, pal — not everything is a clue. Some things are just… spooky red herrings!",
      duration: 3000,
      emoji: '🐕',
    },
    'first-red-herring': {
      text: "Wah-wah! That's a red herring, Scoob!",
      duration: 2000,
      emoji: '🤷',
    },
    // Exact copy from GDD § Tutorial Level 2 — Post-level dialogue (wrong guess)
    'wrong-guess': {
      text: "Hmm, nope! Let's think again…",
      duration: 2000,
      emoji: '🤔',
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
  // Exact copy from GDD § Hotspot entity — edge case VO
  'locked-hotspot': {
    text: "Ruh-roh, something's missing!",
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
