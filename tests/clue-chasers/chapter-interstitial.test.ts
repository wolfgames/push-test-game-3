/**
 * ChapterInterstitial: transition and content.
 * Red tests written BEFORE implementation (TDD batch 10).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  },
}));

import { ChapterInterstitial } from '~/game/clue-chasers/screens/ChapterInterstitial';

describe('ChapterInterstitial: transition and content', () => {
  let interstitial: ChapterInterstitial;

  beforeEach(() => {
    interstitial = new ChapterInterstitial();
  });

  it('Mystery Machine drive-across: 1200ms GSAP tween', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    interstitial.init({ viewportWidth: 390, viewportHeight: 688 });
    await interstitial.playDriveAcross();
    const calls = (gsap.to as any).mock.calls;
    const driveTween = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.duration && opts.duration >= 1.0 && opts.duration <= 1.5;
    });
    expect(driveTween).toBeDefined();
  });

  it('case counter "Case N of 5" visible', () => {
    interstitial.init({ viewportWidth: 390, viewportHeight: 688 });
    interstitial.setCaseInfo({ caseIndex: 2, totalCases: 5 });
    const text = interstitial.getCaseCounterText();
    expect(text).toBe('Case 2 of 5');
  });

  it('progress bar visible during chapter play, hidden during tutorial', () => {
    interstitial.init({ viewportWidth: 390, viewportHeight: 688 });
    interstitial.setCaseInfo({ caseIndex: 1, totalCases: 5, isIntro: false });
    expect(interstitial.isProgressBarVisible()).toBe(true);
    interstitial.setCaseInfo({ caseIndex: 1, totalCases: 5, isIntro: true });
    expect(interstitial.isProgressBarVisible()).toBe(false);
  });
});
