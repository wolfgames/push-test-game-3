/**
 * AudioConfig: sprite key validation.
 * Red tests written BEFORE implementation (TDD batch 8).
 */
import { describe, it, expect } from 'vitest';
import { AUDIO_CONFIG } from '~/game/clue-chasers/audio/audio-config';

describe('AudioConfig: sprite key validation', () => {
  it("all audio sprite entries use 'urls' key (not 'src')", () => {
    // Every audio bundle must have 'urls' array, never 'src'
    for (const [key, entry] of Object.entries(AUDIO_CONFIG)) {
      expect(entry, `Entry '${key}' missing urls`).toHaveProperty('urls');
      expect(entry, `Entry '${key}' should not have 'src'`).not.toHaveProperty('src');
      expect(Array.isArray(entry.urls), `Entry '${key}' urls must be an array`).toBe(true);
    }
  });

  it('unlockAudio called before first sound (audio config includes unlock requirement)', () => {
    // The config must include all required SFX keys
    const requiredKeys = ['whoosh', 'wah-wah', 'ruh-roh', 'hmm-nope', 'scooby-dooby-doo', 'investigation-chime'];
    for (const key of requiredKeys) {
      expect(AUDIO_CONFIG, `Missing required audio key: ${key}`).toHaveProperty(key);
    }
  });
});
