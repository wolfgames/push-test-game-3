/**
 * Audio Config — SFX and VO sprite definitions for Scooby-Doo: Clue Chasers.
 *
 * CRITICAL: All entries MUST use 'urls' key (not 'src').
 * Using 'src' instead of 'urls' causes runtime error per asset-bundles guardrail.
 *
 * Pattern: { urls: string[], sprite: Record<string, [number, number]> }
 * Where sprite value is [startMs, durationMs].
 */

export interface AudioEntry {
  urls: string[];
  sprite?: Record<string, [number, number]>;
}

/**
 * Audio sprite definitions for all game events.
 * Key names map to VO cue strings returned by renderers.
 */
export const AUDIO_CONFIG: Record<string, AudioEntry> = {
  'whoosh': {
    urls: ['audio/sfx/whoosh.mp3'],
    sprite: { 'default': [0, 200] },
  },
  'wah-wah': {
    urls: ['audio/sfx/wah-wah.mp3'],
    sprite: { 'default': [0, 300] },
  },
  'ruh-roh': {
    urls: ['audio/vo/ruh-roh.mp3'],
    sprite: { 'default': [0, 500] },
  },
  'hmm-nope': {
    urls: ['audio/vo/hmm-nope.mp3'],
    sprite: { 'default': [0, 600] },
  },
  'scooby-dooby-doo': {
    urls: ['audio/vo/scooby-dooby-doo.mp3'],
    sprite: { 'default': [0, 1200] },
  },
  'investigation-chime': {
    urls: ['audio/sfx/investigation-chime.mp3'],
    sprite: { 'default': [0, 600] },
  },
  'win-fanfare': {
    urls: ['audio/sfx/win-fanfare.mp3'],
    sprite: { 'default': [0, 2000] },
  },
  'sad-trombone': {
    urls: ['audio/sfx/sad-trombone.mp3'],
    sprite: { 'default': [0, 1500] },
  },
  'shimmer': {
    urls: ['audio/sfx/shimmer.mp3'],
    sprite: { 'default': [0, 150] },
  },
  'card-flip': {
    urls: ['audio/sfx/card-flip.mp3'],
    sprite: { 'default': [0, 300] },
  },
};
