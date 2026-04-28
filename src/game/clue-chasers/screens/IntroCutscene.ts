/**
 * IntroCutscene — 4-panel first-time intro comic sequence.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * GSAP delayedCall for all timing — no setTimeout/setInterval (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 * One-shot flag: seenIntro persisted to localStorage.
 */
import { Container, Text, Rectangle } from 'pixi.js';
import gsap from 'gsap';

export const SEEN_INTRO_KEY = 'cc_seenIntro';
export const PANEL_ADVANCE_MS = 500;
export const SKIP_BUTTON_SIZE = 60; // >= 44pt

const PANELS = [
  { emoji: '🐕💨', label: 'Scooby sniffs out clues…' },
  { emoji: '🔍✨', label: 'Evidence flies into view…' },
  { emoji: '🃏🃏🃏', label: 'Suspects appear…' },
  { emoji: '🎭😱', label: 'The unmasking!' },
];

type SkipCallback = (route: string) => void;

interface InitOptions {
  viewportWidth: number;
  viewportHeight: number;
}

export class IntroCutscene {
  public container: Container = new Container();
  private panelContainers: Container[] = [];
  private skipButton: Container & { hitArea: Rectangle } | null = null;
  private skipCallback: SkipCallback | null = null;
  private activeTweens: gsap.core.Tween[] = [];
  private delayedCalls: gsap.core.Tween[] = [];
  private viewportWidth = 390;
  private viewportHeight = 688;

  /**
   * Should cutscene play on this launch?
   * Returns true if seenIntro flag has NOT been set.
   */
  shouldPlay(): boolean {
    return localStorage.getItem(SEEN_INTRO_KEY) !== '1';
  }

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive';
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    // Create 4 panels
    for (let i = 0; i < PANELS.length; i++) {
      const panel = new Container();
      const label = new Text(`${PANELS[i].emoji}\n${PANELS[i].label}`);
      panel.addChild(label);
      panel.x = options.viewportWidth / 2 - 60;
      panel.y = options.viewportHeight / 2 - 40;
      panel.alpha = i === 0 ? 1 : 0;
      this.panelContainers.push(panel);
      this.container.addChild(panel);
    }

    // Skip button — bottom-right, >= 44pt touch target
    const skip = new Container() as Container & { hitArea: Rectangle };
    skip.hitArea = new Rectangle(
      options.viewportWidth - SKIP_BUTTON_SIZE - 16,
      options.viewportHeight - SKIP_BUTTON_SIZE - 16,
      SKIP_BUTTON_SIZE,
      SKIP_BUTTON_SIZE,
    );
    skip.eventMode = 'static';
    skip.cursor = 'pointer';

    const skipLabel = new Text('Tap to skip →');
    skipLabel.x = options.viewportWidth - SKIP_BUTTON_SIZE - 16;
    skipLabel.y = options.viewportHeight - SKIP_BUTTON_SIZE - 16;
    skip.addChild(skipLabel);

    skip.on('pointertap', () => this.skip());
    this.skipButton = skip;
    this.container.addChild(skip);
  }

  getPanelCount(): number {
    return PANELS.length;
  }

  getPanelAdvanceMs(): number {
    return PANEL_ADVANCE_MS;
  }

  getSkipButton(): (Container & { hitArea: Rectangle }) | null {
    return this.skipButton;
  }

  setSkipCallback(cb: SkipCallback): void {
    this.skipCallback = cb;
  }

  /**
   * Skip cutscene immediately, persist seenIntro, navigate to game.
   */
  skip(): void {
    localStorage.setItem(SEEN_INTRO_KEY, '1');
    this.skipCallback?.('game');
  }

  /**
   * Complete all panels and navigate automatically.
   */
  complete(): void {
    localStorage.setItem(SEEN_INTRO_KEY, '1');
    this.skipCallback?.('game');
  }

  destroy(): void {
    this.delayedCalls.forEach(t => t.kill());
    this.delayedCalls = [];
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    for (const panel of this.panelContainers) {
      gsap.killTweensOf(panel);
    }
    this.panelContainers = [];

    if (this.skipButton) {
      gsap.killTweensOf(this.skipButton);
      this.skipButton.removeAllListeners();
      this.skipButton = null;
    }

    this.skipCallback = null;

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
