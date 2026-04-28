/**
 * ScenePan: gesture discrimination and bounds.
 * Red tests written BEFORE implementation (TDD batch 11).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('gsap', () => ({
  default: {
    to: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return { kill: vi.fn() };
    }),
    killTweensOf: vi.fn(),
  },
}));

import { ScenePanController } from '~/game/clue-chasers/state/ScenePanController';

describe('ScenePan: gesture discrimination and bounds', () => {
  let pan: ScenePanController;

  beforeEach(() => {
    pan = new ScenePanController({
      sceneWidth: 780,   // wide scene: 2x viewport
      viewportWidth: 390,
    });
  });

  it('horizontal drag > 12px triggers pan (not tap)', () => {
    pan.pointerDown(0, 100);
    pan.pointerMove(15, 100); // 15px delta > 12px threshold
    expect(pan.isPanning()).toBe(true);
    expect(pan.isTap()).toBe(false);
  });

  it('vertical drag does not trigger pan', () => {
    pan.pointerDown(100, 0);
    pan.pointerMove(100, 50); // vertical move only
    expect(pan.isPanning()).toBe(false);
  });

  it('momentum deceleration: velocity decays on pointer-up', () => {
    pan.pointerDown(200, 100);
    pan.pointerMove(160, 100); // 40px drag
    pan.pointerUp(140, 100);
    // After pointer-up, should have recorded a velocity
    expect(pan.getVelocity()).not.toBe(0);
  });

  it('bounds snap: pan cannot go past scene edges', () => {
    pan.pointerDown(0, 100);
    pan.pointerMove(500, 100); // Huge drag right
    const clampedX = pan.getClampedX();
    expect(clampedX).toBeGreaterThanOrEqual(-(780 - 390)); // min = -(sceneWidth - viewportWidth)
    expect(clampedX).toBeLessThanOrEqual(0); // max = 0
  });

  it('active pan: hotspot tap not registered during momentum', () => {
    pan.pointerDown(0, 100);
    pan.pointerMove(50, 100); // Pan active
    pan.pointerUp(50, 100);   // Momentum active
    // During momentum, is isPanning() true
    expect(pan.isPanning() || pan.hasMomentum()).toBe(true);
    // Tap should not register
    expect(pan.isTap()).toBe(false);
  });
});
