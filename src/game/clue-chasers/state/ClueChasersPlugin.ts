/**
 * ClueChasersPlugin — ECS source of truth for Scooby-Doo: Clue Chasers.
 *
 * Property order (runtime-enforced):
 *   resources → transactions → actions
 *
 * Actions are PURE: no Math.random(), no Pixi imports.
 * All animation metadata is returned — controller animates.
 */
import { Database } from '@adobe/data/ecs';

// ── Types ───────────────────────────────────────────────────────────────────

export type GamePhase =
  | 'Investigating'
  | 'Animating'
  | 'Deduction'
  | 'Win'
  | 'Loss';

export type EvidenceType =
  | 'footprint'
  | 'document'
  | 'fingerprint'
  | 'voice'
  | 'disguise';

export type HotspotOutcome = 'evidence' | 'red-herring' | 'empty' | 'locked';

export interface TapHotspotInput {
  hotspotId: string;
  outcome: HotspotOutcome;
  evidenceType: EvidenceType | null;
  position: [number, number];
  rng: () => number;
}

export interface TapHotspotResult {
  outcome: HotspotOutcome;
  evidenceType: EvidenceType | null;
  position: [number, number];
  slotIndex: number;
  hotspotId: string;
}

// ── Plugin ──────────────────────────────────────────────────────────────────

export const ClueChasersPlugin = Database.Plugin.create({
  resources: {
    tapCounter: { default: 15 as number },
    startingTaps: { default: 15 as number },
    gamePhase: { default: 'Investigating' as GamePhase },
    currentScore: { default: 0 as number },
    starsEarned: { default: 0 as number },
    coinBalance: { default: 0 as number },
    selectedSuspect: { default: '' as string },
    correctSuspect: { default: '' as string },
    // 5 clue board slots — null = empty
    clueBoardState: {
      default: [null, null, null, null, null] as (EvidenceType | null)[],
    },
    // How many slots are required (3 for Easy, 5 for Easy+)
    requiredSlots: { default: 5 as number },
    // Tutorial flags
    isIntroLevel: { default: false as boolean },
    tutorialStep: { default: 0 as number },
    firstRedHerringReacted: { default: false as boolean },
    // Seed for procedural generation
    currentSeed: { default: 0 as number },
  },

  transactions: {
    decrementTapCounter(store) {
      if (store.resources.tapCounter > 0) {
        store.resources.tapCounter = store.resources.tapCounter - 1;
      }
    },

    setTapCounter(store, { value }: { value: number }) {
      store.resources.tapCounter = Math.max(0, value);
    },

    setStartingTaps(store, { value }: { value: number }) {
      store.resources.startingTaps = value;
      store.resources.tapCounter = value;
    },

    fillClueBoardSlot(
      store,
      { evidenceType, slotIndex }: { evidenceType: EvidenceType; slotIndex: number },
    ) {
      const board = [...store.resources.clueBoardState] as (EvidenceType | null)[];
      board[slotIndex] = evidenceType;
      store.resources.clueBoardState = board;
    },

    setGamePhase(store, { phase }: { phase: GamePhase }) {
      store.resources.gamePhase = phase;
    },

    addScore(store, { amount }: { amount: number }) {
      store.resources.currentScore = store.resources.currentScore + amount;
    },

    setScore(store, { score }: { score: number }) {
      store.resources.currentScore = score;
    },

    setStarsEarned(store, { stars }: { stars: number }) {
      store.resources.starsEarned = Math.min(3, Math.max(0, stars));
    },

    setCoinBalance(store, { balance }: { balance: number }) {
      store.resources.coinBalance = Math.max(0, balance);
    },

    setCorrectSuspect(store, { suspectId }: { suspectId: string }) {
      store.resources.correctSuspect = suspectId;
    },

    setSelectedSuspect(store, { suspectId }: { suspectId: string }) {
      store.resources.selectedSuspect = suspectId;
    },

    setFirstRedHerringReacted(store) {
      store.resources.firstRedHerringReacted = true;
    },

    resetCase(store, { seed, startingTaps, requiredSlots }: {
      seed: number;
      startingTaps: number;
      requiredSlots: number;
    }) {
      store.resources.tapCounter = startingTaps;
      store.resources.startingTaps = startingTaps;
      store.resources.currentScore = 0;
      store.resources.starsEarned = 0;
      store.resources.gamePhase = 'Investigating';
      store.resources.clueBoardState = [null, null, null, null, null];
      store.resources.selectedSuspect = '';
      store.resources.currentSeed = seed;
      store.resources.requiredSlots = requiredSlots;
      store.resources.firstRedHerringReacted = false;
    },

    restoreTapsForContinue(store) {
      if (store.resources.coinBalance >= 5) {
        store.resources.coinBalance = store.resources.coinBalance - 5;
        store.resources.tapCounter = 5;
        store.resources.gamePhase = 'Investigating';
      }
    },
  },

  actions: {
    /**
     * Tap a hotspot.
     * PURE: no Math.random(), no Pixi imports.
     * Returns animation metadata; controller animates.
     */
    tapHotspot(db, input: TapHotspotInput): TapHotspotResult {
      const { hotspotId, outcome, evidenceType, position } = input;

      if (outcome === 'locked') {
        // Locked hotspot: no counter decrement, just feedback metadata
        return { outcome: 'locked', evidenceType: null, position, slotIndex: -1, hotspotId };
      }

      if (outcome === 'empty') {
        // Empty tap: no counter decrement
        return { outcome: 'empty', evidenceType: null, position, slotIndex: -1, hotspotId };
      }

      // Evidence or red-herring: decrement tap counter
      db.transactions.decrementTapCounter();

      // Check loss condition
      if (db.resources.tapCounter === 0 && db.resources.gamePhase === 'Investigating') {
        const board = db.resources.clueBoardState;
        const filledCount = board.filter(s => s !== null).length;
        if (filledCount < db.resources.requiredSlots) {
          db.transactions.setGamePhase({ phase: 'Loss' });
        }
      }

      if (outcome === 'red-herring') {
        return { outcome: 'red-herring', evidenceType: null, position, slotIndex: -1, hotspotId };
      }

      // Evidence: find next open slot
      const board = db.resources.clueBoardState;
      const nextSlot = board.findIndex(s => s === null);
      if (nextSlot === -1) {
        // Board full — no fly-arc, just feedback
        return { outcome: 'evidence', evidenceType, position, slotIndex: -1, hotspotId };
      }

      // Fill the slot
      db.transactions.fillClueBoardSlot({ evidenceType: evidenceType!, slotIndex: nextSlot });

      return { outcome: 'evidence', evidenceType, position, slotIndex: nextSlot, hotspotId };
    },

    /**
     * Compute case score.
     * PURE: reads resources, returns number.
     */
    computeCaseScore(_db): number {
      const tapsRemaining = _db.resources.tapCounter;
      const startingTaps = _db.resources.startingTaps;
      if (startingTaps === 0) return 1000;
      const efficiency = tapsRemaining / startingTaps;
      const score = Math.round(1000 * (efficiency + 1.0));
      return Math.min(2000, Math.max(1000, score));
    },

    /**
     * Accuse a suspect.
     * Returns {correct, suspectId}.
     */
    accuse(db, { suspectId }: { suspectId: string }): { correct: boolean; suspectId: string } {
      db.transactions.setSelectedSuspect({ suspectId });
      const correct = suspectId === db.resources.correctSuspect;
      if (correct) {
        // Compute and store final score inline (can't call other actions from actions)
        const tapsRemaining = db.resources.tapCounter;
        const startingTaps = db.resources.startingTaps;
        const efficiency = startingTaps > 0 ? tapsRemaining / startingTaps : 0;
        const score = Math.min(2000, Math.max(1000, Math.round(1000 * (efficiency + 1.0))));
        db.transactions.setScore({ score });
        // Derive stars
        const stars = score >= 1500 ? 3 : score >= 1200 ? 2 : 1;
        db.transactions.setStarsEarned({ stars });
        db.transactions.setGamePhase({ phase: 'Win' });
      } else {
        // Wrong guess: decrement tap counter
        db.transactions.decrementTapCounter();
        if (db.resources.tapCounter === 0) {
          db.transactions.setGamePhase({ phase: 'Loss' });
        }
      }
      return { correct, suspectId };
    },

    /**
     * Retry the current case (seed+1, fresh state).
     */
    retryCase(db): { newSeed: number } {
      const newSeed = db.resources.currentSeed + 1;
      db.transactions.resetCase({
        seed: newSeed,
        startingTaps: db.resources.startingTaps,
        requiredSlots: db.resources.requiredSlots,
      });
      return { newSeed };
    },

    /**
     * Continue case after loss: spend 5 coins for 5 bonus taps.
     */
    continueCase(db): { success: boolean; reason?: string } {
      if (db.resources.coinBalance < 5) {
        return { success: false, reason: 'not-enough-coins' };
      }
      db.transactions.restoreTapsForContinue();
      return { success: true };
    },
  },
});

export type ClueChasersDatabase = Database.FromPlugin<typeof ClueChasersPlugin>;
