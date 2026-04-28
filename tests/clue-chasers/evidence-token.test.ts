/**
 * EvidenceToken — fly-arc animation.
 * Red tests written BEFORE implementation (TDD batch 1).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) { this.children = this.children.filter(c => c !== child); }
    destroy(_opts?: any) {}
    removeAllListeners() {}
    on(_event: string, _fn: any) { return this; }
  }
  class MockText extends MockContainer {
    text = '';
    constructor(text?: string) { super(); this.text = text ?? ''; }
  }
  return { Container: MockContainer, Text: MockText };
});

const mockTween = { kill: vi.fn() };
vi.mock('gsap', () => ({
  default: {
    to: vi.fn((target: any, vars: any) => {
      // Immediately invoke onComplete so promises resolve in tests
      if (vars?.onComplete) {
        // Set target props to end values for x/y assertions
        if (vars.x !== undefined) target.x = vars.x;
        if (vars.y !== undefined) target.y = vars.y;
        setTimeout(vars.onComplete, 0);
      }
      return mockTween;
    }),
    from: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return mockTween;
    }),
    killTweensOf: vi.fn(),
  },
}));

import { EvidenceTokenRenderer } from '~/game/clue-chasers/renderers/EvidenceTokenRenderer';

describe('EvidenceToken: fly-arc animation', () => {
  let renderer: EvidenceTokenRenderer;

  beforeEach(() => {
    renderer = new EvidenceTokenRenderer();
    // Init with 5 board slot positions
    renderer.init([
      { x: 50, y: 720 }, { x: 110, y: 720 }, { x: 170, y: 720 },
      { x: 230, y: 720 }, { x: 290, y: 720 },
    ]);
  });

  it('fly-arc tween target is next open Clue Board slot position', async () => {
    const gsap = (await import('gsap')).default;
    await renderer.flyToSlot({
      evidenceType: 'footprint',
      fromPosition: { x: 100, y: 300 },
      slotIndex: 0,
      parentContainer: new (await import('pixi.js')).Container() as any,
    });
    const calls = (gsap.to as any).mock.calls;
    // Should have called gsap.to with x: 50, y: 720
    const arcCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.x === 50 && opts.y === 720;
    });
    expect(arcCall).toBeDefined();
    // Verify ease and duration
    expect(arcCall[1].ease).toContain('back');
    expect(arcCall[1].duration).toBeGreaterThan(0);
  });

  it('board-full edge case: shake plays, no token created', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    // Mark all 5 slots filled
    for (let i = 0; i < 5; i++) {
      renderer.markSlotFilled(i);
    }
    const result = await renderer.flyToSlot({
      evidenceType: 'document',
      fromPosition: { x: 150, y: 200 },
      slotIndex: -1, // board full
      parentContainer: new (await import('pixi.js')).Container() as any,
    });
    expect(result.boardFull).toBe(true);
    // gsap.to called for shake, not arc
    const calls = (gsap.to as any).mock.calls;
    const shakeCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.duration && opts.duration <= 0.15;
    });
    expect(shakeCall).toBeDefined();
  });
});
