/**
 * ContinueSystem — coin spend and tap restore.
 * Red tests written BEFORE implementation (TDD batch 3).
 */
import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

describe('ContinueSystem: coin spend and tap restore', () => {
  it('Keep Going with >= 5 coins: coinBalance -= 5, tapCounter += 5, returns to game', () => {
    const db = createDb();
    db.transactions.setCoinBalance({ balance: 10 });
    db.transactions.setTapCounter({ value: 0 });
    db.transactions.setGamePhase({ phase: 'Loss' });

    const result = db.actions.continueCase();
    expect(result.success).toBe(true);
    expect(db.resources.coinBalance).toBe(5); // 10 - 5
    expect(db.resources.tapCounter).toBe(5);  // restored to 5 bonus taps
    expect(db.resources.gamePhase).toBe('Investigating');
  });

  it('Keep Going with < 5 coins: shake feedback, no state change', () => {
    const db = createDb();
    db.transactions.setCoinBalance({ balance: 3 });
    db.transactions.setTapCounter({ value: 0 });
    db.transactions.setGamePhase({ phase: 'Loss' });

    const result = db.actions.continueCase();
    expect(result.success).toBe(false);
    expect(result.reason).toBe('not-enough-coins');
    // No state change
    expect(db.resources.coinBalance).toBe(3);
    expect(db.resources.tapCounter).toBe(0);
    expect(db.resources.gamePhase).toBe('Loss');
  });
});
