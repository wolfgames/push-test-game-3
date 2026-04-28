/**
 * WinLossSequences: ordered event chains.
 * Red tests written BEFORE implementation (TDD batch 7).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) { this.children = this.children.filter(c => c !== child); }
    destroy(_opts?: any) {}
    removeAllListeners() {}
  }
  return { Container: MockContainer };
});

vi.mock('gsap', () => ({
  default: {
    to: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return { kill: vi.fn() };
    }),
    killTweensOf: vi.fn(),
    timeline: vi.fn(() => {
      const steps: string[] = [];
      const tl = {
        _steps: steps,
        add: vi.fn((label: string) => { steps.push(label); return tl; }),
        to: vi.fn((_target: any, vars: any, _position?: any) => {
          if (vars?.onComplete) setTimeout(vars.onComplete, 0);
          return tl;
        }),
        call: vi.fn((fn: () => void) => {
          setTimeout(fn, 0);
          return tl;
        }),
        kill: vi.fn(),
        play: vi.fn(() => tl),
      };
      return tl;
    }),
  },
}));

import { buildWinSequence, buildLossSequence } from '~/game/clue-chasers/state/sequenceBuilder';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

describe('WinLossSequences: ordered event chains', () => {
  it('win sequence: emits 8 steps in correct order', () => {
    const events: string[] = [];
    buildWinSequence({
      onStep: (step: string) => events.push(step),
      suspectName: 'Mayor Bellweather',
      starsEarned: 3,
    });
    expect(events).toHaveLength(8);
    expect(events[0]).toBe('villain-card-scale');
    expect(events[1]).toBe('scene-dim');
    expect(events[2]).toBe('unmasking-flip');
    expect(events[3]).toBe('villain-banner');
    expect(events[4]).toBe('scooby-jump');
    expect(events[5]).toBe('star-fill');
    expect(events[6]).toBe('results-fade');
    expect(events[7]).toBe('next-case-button');
  });

  it('loss sequence: emits 7 steps in correct order', () => {
    const events: string[] = [];
    buildLossSequence({
      onStep: (step: string) => events.push(step),
    });
    expect(events).toHaveLength(7);
    expect(events[0]).toBe('freeze-input');
    expect(events[1]).toBe('scene-desaturate');
    expect(events[2]).toBe('scooby-droop');
    expect(events[3]).toBe('loss-overlay-fade');
    expect(events[4]).toBe('text-type-in');
    expect(events[5]).toBe('try-again-button');
    expect(events[6]).toBe('keep-going-button');
  });

  it('input blocked during Animating phase', () => {
    const db = createDb();
    db.transactions.setGamePhase({ phase: 'Animating' });
    expect(db.resources.gamePhase).toBe('Animating');
    expect(db.resources.gamePhase).not.toBe('Investigating');
  });

  it('sequence completes before input re-enabled', () => {
    const db = createDb();
    db.transactions.setGamePhase({ phase: 'Animating' });
    // After sequence, phase transitions to Win or Loss
    db.transactions.setGamePhase({ phase: 'Win' });
    expect(db.resources.gamePhase).toBe('Win');
    expect(db.resources.gamePhase).not.toBe('Animating');
  });
});
