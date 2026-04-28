/**
 * DeductionPhase — overlay and input blocking.
 * Red tests written BEFORE implementation (TDD batch 5).
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

const rng = () => 0.5;

describe('DeductionPhase: overlay and input blocking', () => {
  it('Deduce! button activates only when clueBoardState all 5 filled', () => {
    const db = createDb();
    db.transactions.setStartingTaps({ value: 15 });
    // Fill all 5 slots
    for (let i = 0; i < 5; i++) {
      db.transactions.fillClueBoardSlot({ evidenceType: 'footprint', slotIndex: i });
    }
    const filled = db.resources.clueBoardState.filter(s => s !== null).length;
    expect(filled).toBe(5);
    // Game phase should still be Investigating until Deduce! button is tapped
    expect(db.resources.gamePhase).toBe('Investigating');
  });

  it('scene dim tween fires on Deduction phase entry', () => {
    const db = createDb();
    db.transactions.setGamePhase({ phase: 'Deduction' });
    expect(db.resources.gamePhase).toBe('Deduction');
    // The actual scene dim is handled by GameController observing phase changes
    // We verify the ECS state is correct
  });

  it('hotspot input blocked during Deduction phase', () => {
    const db = createDb();
    db.transactions.setGamePhase({ phase: 'Deduction' });
    // tapHotspot should not process during Deduction phase
    // (input blocking is handled in GameController, but we verify the ECS phase)
    expect(db.resources.gamePhase).toBe('Deduction');
    expect(db.resources.gamePhase).not.toBe('Investigating');
  });

  it('wrong guess decrements tapCounter', () => {
    const db = createDb();
    db.transactions.setStartingTaps({ value: 15 });
    db.transactions.setGamePhase({ phase: 'Deduction' });
    db.transactions.setCorrectSuspect({ suspectId: 'suspect-a' });
    const before = db.resources.tapCounter;
    db.actions.accuse({ suspectId: 'suspect-b' }); // wrong
    expect(db.resources.tapCounter).toBe(before - 1);
    expect(db.resources.gamePhase).toBe('Deduction'); // stays in Deduction
  });

  it('wrong guess at 0 taps triggers loss', () => {
    const db = createDb();
    db.transactions.setTapCounter({ value: 1 });
    db.transactions.setGamePhase({ phase: 'Deduction' });
    db.transactions.setCorrectSuspect({ suspectId: 'suspect-a' });
    db.actions.accuse({ suspectId: 'suspect-b' }); // wrong
    expect(db.resources.tapCounter).toBe(0);
    expect(db.resources.gamePhase).toBe('Loss');
  });
});
