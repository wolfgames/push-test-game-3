/**
 * ChapterCompleteScreen: comic and navigation.
 * Red tests written BEFORE implementation (TDD batch 10).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
    cursor = '';
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

import { ChapterCompleteScreen } from '~/game/clue-chasers/screens/ChapterCompleteScreen';

describe('ChapterCompleteScreen: comic and navigation', () => {
  let screen: ChapterCompleteScreen;

  beforeEach(() => {
    screen = new ChapterCompleteScreen();
    screen.init({ viewportWidth: 390, viewportHeight: 688 });
  });

  it('3 panels render in sequence', () => {
    expect(screen.getPanelCount()).toBe(3);
    expect(screen.getCurrentPanel()).toBe(0);
  });

  it('tap-through advances panels', () => {
    screen.advancePanel();
    expect(screen.getCurrentPanel()).toBe(1);
    screen.advancePanel();
    expect(screen.getCurrentPanel()).toBe(2);
  });

  it('auto-advance after 8s delay configured', () => {
    expect(screen.getAutoAdvanceDelayMs()).toBe(8000);
  });

  it('Continue button navigates to Chapter Select', () => {
    let navigatedTo = '';
    screen.setContinueCallback((route) => { navigatedTo = route; });
    screen.triggerContinue();
    expect(navigatedTo).toBe('start');
  });
});
