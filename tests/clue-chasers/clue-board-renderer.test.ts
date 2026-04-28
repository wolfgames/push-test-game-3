/**
 * ClueBoardRenderer — slots and golden-glow.
 * Red tests written BEFORE implementation (TDD batch 1).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0; visible = true;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
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
  class MockGraphics extends MockContainer {
    circle(_x: number, _y: number, _r: number) { return this; }
    fill(_color: any) { return this; }
    stroke(_opts: any) { return this; }
    rect(_x: number, _y: number, _w: number, _h: number) { return this; }
  }
  return { Container: MockContainer, Text: MockText, Graphics: MockGraphics };
});

const mockTween = { kill: vi.fn() };
vi.mock('gsap', () => ({
  default: {
    to: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return mockTween;
    }),
    from: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return mockTween;
    }),
    killTweensOf: vi.fn(),
  },
}));

import { ClueBoardRenderer } from '~/game/clue-chasers/renderers/ClueBoardRenderer';

describe('ClueBoardRenderer: slots and golden-glow', () => {
  let renderer: ClueBoardRenderer;

  beforeEach(() => {
    renderer = new ClueBoardRenderer();
    renderer.init({ viewportWidth: 390, hudHeight: 100, requiredSlots: 5 });
  });

  it('5 slots rendered with correct initial state', () => {
    const slots = renderer.getSlots();
    expect(slots).toHaveLength(5);
    slots.forEach((slot) => {
      expect(slot.filled).toBe(false);
      expect(slot.evidenceType).toBeNull();
    });
  });

  it('slot bounce-in on token land', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    await renderer.fillSlot(0, 'footprint');
    expect(renderer.getSlots()[0].filled).toBe(true);
    expect(renderer.getSlots()[0].evidenceType).toBe('footprint');
    // Verify bounce-in tween fired
    const calls = (gsap.to as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const bounceCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.ease && opts.ease.includes('elastic');
    });
    expect(bounceCall).toBeDefined();
  });

  it('golden-glow activates when all 5 slots filled', async () => {
    const gsap = (await import('gsap')).default;
    for (let i = 0; i < 5; i++) {
      await renderer.fillSlot(i, 'footprint');
    }
    expect(renderer.isBoardFull()).toBe(true);
    // golden-glow: gsap.to called with golden tint or scale pulsing
    const calls = (gsap.to as any).mock.calls;
    const glowCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.repeat && opts.yoyo === true;
    });
    expect(glowCall).toBeDefined();
  });

  it('Deduce button scales in (300ms) when board full', async () => {
    const gsap = (await import('gsap')).default;
    for (let i = 0; i < 5; i++) {
      await renderer.fillSlot(i, 'fingerprint');
    }
    expect(renderer.isDeduceButtonVisible()).toBe(true);
    const calls = (gsap.to as any).mock.calls;
    const scaleCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && Math.abs((opts.duration ?? 0) - 0.3) < 0.05;
    });
    expect(scaleCall).toBeDefined();
  });
});
