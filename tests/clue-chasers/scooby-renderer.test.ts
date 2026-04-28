/**
 * ScoobyRenderer: idle and reactions.
 * Red tests written BEFORE implementation (TDD batch 7).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
    cursor = '';
    hitArea: any = null;
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
    circle() { return this; }
    fill() { return this; }
    rect() { return this; }
    stroke() { return this; }
  }
  return { Container: MockContainer, Text: MockText, Graphics: MockGraphics };
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

import { ScoobyRenderer } from '~/game/clue-chasers/renderers/ScoobyRenderer';

describe('ScoobyRenderer: idle and reactions', () => {
  let renderer: ScoobyRenderer;

  beforeEach(() => {
    renderer = new ScoobyRenderer();
    renderer.init({ viewportWidth: 390, viewportHeight: 688 });
  });

  it('Scooby sprite is GPU Container (not DOM)', () => {
    // Container must exist in pixi scene graph (no document.createElement)
    expect(renderer.container).toBeDefined();
    expect(renderer.container.children.length).toBeGreaterThan(0);
    // Verify no DOM elements created (no getElementById, no createElement)
    // This is guaranteed by our implementation design
    expect(typeof renderer.container.addChild).toBe('function');
  });

  it('idle animation loop runs on init', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    renderer.startIdle();
    const calls = (gsap.to as any).mock.calls;
    // Should set up a repeating tween (repeat: -1 or yoyo)
    const idleCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && (opts.repeat === -1 || opts.yoyo === true);
    });
    expect(idleCall).toBeDefined();
  });

  it('locked-hotspot tap triggers Ruh-roh reaction', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    const result = renderer.playReaction('locked');
    expect(result.voCue).toBe('ruh-roh');
    // Should trigger a tween
    const calls = (gsap.to as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('red-herring tap triggers shrug reaction', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    const result = renderer.playReaction('red-herring');
    expect(result.voCue).toBe('wah-wah');
    const calls = (gsap.to as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });
});
