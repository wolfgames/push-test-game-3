/**
 * SuspectCards — accusation and feedback.
 * Red tests written BEFORE implementation (TDD batch 5).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { ClueChasersPlugin } from '~/game/clue-chasers/state/ClueChasersPlugin';

vi.mock('pixi.js', () => {
  class MockContainer {
    children: any[] = [];
    eventMode = 'none';
    alpha = 1; x = 0; y = 0;
    cursor = '';
    scale = { x: 1, y: 1, set(v: number) { this.x = v; this.y = v; } };
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
  class MockRectangle {
    x: number; y: number; width: number; height: number;
    constructor(x: number, y: number, width: number, height: number) {
      this.x = x; this.y = y; this.width = width; this.height = height;
    }
  }
  return { Container: MockContainer, Text: MockText, Graphics: MockGraphics, Rectangle: MockRectangle };
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

import { DeductionRenderer } from '~/game/clue-chasers/renderers/DeductionRenderer';
import { getCaseById } from '~/game/clue-chasers/data/hand-crafted-cases';

function createDb() {
  return Database.create(ClueChasersPlugin);
}

describe('SuspectCards: accusation and feedback', () => {
  let renderer: DeductionRenderer;
  const mockSuspects = [
    { id: 'suspect-a', name: 'Caretaker Jones', motive: 'Hidden treasure', emoji: '🔑' },
    { id: 'suspect-b', name: 'Prof. Whitmore', motive: 'Research cover-up', emoji: '🔬' },
    { id: 'suspect-c', name: 'Mayor Bellweather', motive: 'Land development', emoji: '🏛' },
  ];

  beforeEach(() => {
    renderer = new DeductionRenderer();
    renderer.init({
      suspects: mockSuspects,
      viewportWidth: 390,
      viewportHeight: 688,
    });
  });

  it('3 suspect cards rendered with name and emoji fallback', () => {
    const cards = renderer.getSuspectCards();
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.suspectId).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.emoji).toBeDefined();
    });
  });

  it('correct suspect tap: unmasking flip animation dispatched', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    await renderer.onSuspectTap('suspect-a', true);
    // Verify a flip tween was called
    const calls = (gsap.to as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('wrong suspect tap: shake animation + "Hmm nope" VO cue', async () => {
    const gsap = (await import('gsap')).default;
    (gsap.to as any).mockClear();
    const result = await renderer.onSuspectTap('suspect-b', false);
    expect(result.shake).toBe(true);
    expect(result.voCue).toBe('hmm-nope');
    const calls = (gsap.to as any).mock.calls;
    const shakeCall = calls.find((args: any[]) => {
      const opts = args[1];
      return opts && opts.duration && opts.duration <= 0.25;
    });
    expect(shakeCall).toBeDefined();
  });

  it('touch targets >= 44pt per card', () => {
    const cards = renderer.getSuspectCards();
    cards.forEach((card) => {
      expect(card.container.hitArea).toBeDefined();
      expect(card.container.hitArea.width).toBeGreaterThanOrEqual(44);
      expect(card.container.hitArea.height).toBeGreaterThanOrEqual(44);
    });
  });
});
