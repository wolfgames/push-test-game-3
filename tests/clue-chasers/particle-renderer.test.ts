/**
 * ParticleRenderer: pool management and caps.
 * Red tests written BEFORE implementation (TDD batch 8).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
    tint = 0xffffff;
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) { this.children = this.children.filter(c => c !== child); }
    destroy(_opts?: any) {}
    removeAllListeners() {}
  }
  class MockText extends MockContainer {
    text = '';
    constructor(text?: string) { super(); this.text = text ?? ''; }
  }
  return { Container: MockContainer, Text: MockText };
});

vi.mock('gsap', () => ({
  default: {
    to: vi.fn((_target: any, vars: any) => {
      if (vars?.onComplete) setTimeout(vars.onComplete, 0);
      return { kill: vi.fn() };
    }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn((_delay: number, fn: () => void) => {
      setTimeout(fn, 0);
      return { kill: vi.fn() };
    }),
  },
}));

import { ParticleRenderer } from '~/game/clue-chasers/renderers/ParticleRenderer';

describe('ParticleRenderer: pool management and caps', () => {
  let renderer: ParticleRenderer;

  beforeEach(() => {
    renderer = new ParticleRenderer();
    renderer.init({ viewportWidth: 390, viewportHeight: 688 });
  });

  it('particles pre-allocated in pool (not created per-tap)', () => {
    // Pool should exist and be pre-allocated before any effect plays
    const poolSize = renderer.getPoolSize();
    expect(poolSize).toBeGreaterThanOrEqual(80);
  });

  it('red-herring puff: exactly 8 particles, 180ms duration', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    renderer.playPuff({ x: 100, y: 200, count: 8, duration: 180 });
    const calls = (gsap.to as any).mock.calls;
    // Should call gsap.to 8 times (once per particle)
    const tweenCalls = calls.filter((args: any[]) => {
      const opts = args[1];
      return opts && opts.duration && opts.duration <= 0.2;
    });
    expect(tweenCalls.length).toBe(8);
  });

  it('confetti burst: 50 particles, <= 80 concurrent', () => {
    const activeCount = renderer.playConfetti({ x: 195, y: 50, count: 50 });
    expect(activeCount).toBeLessThanOrEqual(80);
    expect(activeCount).toBe(50);
  });

  it('no Pixi filters used (tint+alpha only)', () => {
    // Verify no filter property is set on particles
    const hasFilters = renderer.hasFilters();
    expect(hasFilters).toBe(false);
  });
});
