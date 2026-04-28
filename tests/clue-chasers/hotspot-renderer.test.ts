/**
 * HotspotRenderer — touch targets and shimmer.
 * Red tests written BEFORE implementation (TDD batch 1).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pixi.js to avoid GPU initialization in tests
vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    cursor = 'default';
    hitArea: any = null;
    alpha = 1;
    x = 0;
    y = 0;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) { this.children = this.children.filter(c => c !== child); }
    destroy(_opts?: any) {}
    removeAllListeners() {}
    on(_event: string, _fn: any) {}
    off(_event: string, _fn: any) {}
  }
  class MockText extends MockContainer {
    text = '';
    constructor(text?: string) { super(); this.text = text ?? ''; }
  }
  class MockRectangle {
    constructor(public x: number, public y: number, public width: number, public height: number) {}
  }
  return {
    Container: MockContainer,
    Text: MockText,
    Rectangle: MockRectangle,
  };
});

// Mock gsap
const mockTween = { kill: vi.fn() };
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(() => mockTween),
    killTweensOf: vi.fn(),
  },
}));

import { HotspotRenderer } from '~/game/clue-chasers/renderers/HotspotRenderer';
import type { HotspotData } from '~/game/clue-chasers/renderers/HotspotRenderer';

const mockHotspots: HotspotData[] = [
  { id: 'h1', x: 100, y: 200, outcome: 'evidence', evidenceType: 'footprint', locked: false },
  { id: 'h2', x: 200, y: 300, outcome: 'red-herring', evidenceType: null, locked: false },
  { id: 'h3', x: 300, y: 400, outcome: 'locked', evidenceType: null, locked: true },
];

describe('HotspotRenderer: touch targets and shimmer', () => {
  let renderer: HotspotRenderer;

  beforeEach(() => {
    renderer = new HotspotRenderer();
    renderer.init(mockHotspots);
  });

  it('each hotspot hitArea >= 44x44pt', () => {
    const hotspots = renderer.getHotspotContainers();
    expect(hotspots.length).toBe(3);
    hotspots.forEach((c) => {
      expect(c.hitArea).not.toBeNull();
      expect(c.hitArea.width).toBeGreaterThanOrEqual(44);
      expect(c.hitArea.height).toBeGreaterThanOrEqual(44);
    });
  });

  it('shimmer GSAP tween created with scale 1.0->1.03 at 1400ms', async () => {
    const gsapModule = await import('gsap');
    const gsap = (gsapModule as any).default;
    // Check gsap.to was called with correct params for shimmer
    const calls = (gsap.to as any).mock.calls;
    const shimmerCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.duration && Math.abs(opts.duration - 0.7) < 0.1 && opts.yoyo === true;
    });
    expect(shimmerCall).toBeDefined();
  });

  it('spent hotspot is non-interactive after tap', () => {
    renderer.markSpent('h1');
    const hotspots = renderer.getHotspotContainers();
    const spent = hotspots.find(c => (c as any).__hotspotId === 'h1');
    expect(spent).toBeDefined();
    expect(spent!.eventMode).toBe('none');
    expect(spent!.alpha).toBeLessThan(1);
  });
});
