/**
 * Asset manifest for Scooby-Doo: Clue Chasers.
 *
 * Bundle prefix rules (asset-bundles.mdc):
 * - scene-* → GPU (Pixi) spritesheets
 * - core-*  → GPU (Pixi) in-game UI atlases
 * - audio-* → Howler SFX/VO
 * - theme-* → DOM only (branding, pre-GPU loading screen)
 *
 * Core pass: Tutorial + Chapter 1 only (7 scenes).
 */
export const clueChasersManifest = {
  bundles: [
    {
      name: 'scene-tutorial',
      assets: [
        { alias: 'bg-library', src: 'assets/clue-chasers/scenes/bg-library.webp' },
        { alias: 'bg-mansion-foyer', src: 'assets/clue-chasers/scenes/bg-mansion_foyer.webp' },
      ],
    },
    {
      name: 'scene-ch1',
      assets: [
        { alias: 'bg-mansion-study', src: 'assets/clue-chasers/scenes/bg-mansion_study.webp' },
        { alias: 'bg-haunted-ballroom', src: 'assets/clue-chasers/scenes/bg-haunted_ballroom.webp' },
        { alias: 'bg-secret-passage', src: 'assets/clue-chasers/scenes/bg-secret_passage.webp' },
        { alias: 'bg-garden-maze', src: 'assets/clue-chasers/scenes/bg-garden_maze.webp' },
        { alias: 'bg-dungeon', src: 'assets/clue-chasers/scenes/bg-dungeon.webp' },
      ],
    },
    {
      name: 'core-ui',
      assets: [
        { alias: 'ui-token-footprint', src: 'assets/clue-chasers/ui/ui-token_footprint.webp' },
        { alias: 'ui-token-document', src: 'assets/clue-chasers/ui/ui-token_document.webp' },
        { alias: 'ui-token-fingerprint', src: 'assets/clue-chasers/ui/ui-token_fingerprint.webp' },
        { alias: 'ui-token-voice', src: 'assets/clue-chasers/ui/ui-token_voice.webp' },
        { alias: 'ui-token-disguise', src: 'assets/clue-chasers/ui/ui-token_disguise.webp' },
        { alias: 'character-scooby', src: 'assets/clue-chasers/characters/character-scooby.webp' },
      ],
    },
    {
      name: 'audio-sfx',
      assets: [
        {
          alias: 'sfx-main',
          src: 'assets/clue-chasers/audio/sfx-main.mp3',
          // Audio sprite manifest uses 'urls' key — critical (asset-bundles.mdc)
          data: {
            urls: ['assets/clue-chasers/audio/sfx-main.mp3'],
            sprite: {
              whoosh: [0, 200],
              'wah-wah': [300, 300],
              'ruh-roh': [700, 400],
              'investigation-chime': [1200, 600],
            },
          },
        },
      ],
    },
  ],
} as const;
