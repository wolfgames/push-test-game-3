/**
 * IntroCutscene: one-time gate and panel sequence.
 * Red tests written BEFORE implementation (TDD batch 12).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => localStorageMock[key] ?? null,
  setItem: (key: string, value: string) => { localStorageMock[key] = value; },
  removeItem: (key: string) => { delete localStorageMock[key]; },
  clear: () => { Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]); },
});

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
  class MockRectangle {
    x: number; y: number; width: number; height: number;
    constructor(x: number, y: number, width: number, height: number) {
      this.x = x; this.y = y; this.width = width; this.height = height;
    }
  }
  return { Container: MockContainer, Text: MockText, Rectangle: MockRectangle };
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

import { IntroCutscene } from '~/game/clue-chasers/screens/IntroCutscene';

const SEEN_INTRO_KEY = 'cc_seenIntro';

describe('IntroCutscene: one-time gate and panel sequence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('first launch: cutscene plays (no seenIntro flag)', () => {
    const cutscene = new IntroCutscene();
    // No flag set → should play
    expect(cutscene.shouldPlay()).toBe(true);
  });

  it('subsequent launch: cutscene skipped (seenIntro=true)', () => {
    localStorage.setItem(SEEN_INTRO_KEY, '1');
    const cutscene = new IntroCutscene();
    expect(cutscene.shouldPlay()).toBe(false);
  });

  it('tap-to-skip exits immediately and persists seenIntro', () => {
    const cutscene = new IntroCutscene();
    cutscene.init({ viewportWidth: 390, viewportHeight: 688 });
    let navigatedTo = '';
    cutscene.setSkipCallback((route) => { navigatedTo = route; });
    cutscene.skip();
    expect(localStorage.getItem(SEEN_INTRO_KEY)).toBe('1');
    expect(navigatedTo).toBe('game');
  });

  it('all 4 panels auto-advance at 500ms each', () => {
    const cutscene = new IntroCutscene();
    cutscene.init({ viewportWidth: 390, viewportHeight: 688 });
    expect(cutscene.getPanelCount()).toBe(4);
    expect(cutscene.getPanelAdvanceMs()).toBe(500);
  });

  it('tap-to-skip button >= 44pt touch target', () => {
    const cutscene = new IntroCutscene();
    cutscene.init({ viewportWidth: 390, viewportHeight: 688 });
    const skipButton = cutscene.getSkipButton();
    expect(skipButton).toBeDefined();
    expect(skipButton!.hitArea).toBeDefined();
    expect(skipButton!.hitArea.width).toBeGreaterThanOrEqual(44);
    expect(skipButton!.hitArea.height).toBeGreaterThanOrEqual(44);
  });
});
