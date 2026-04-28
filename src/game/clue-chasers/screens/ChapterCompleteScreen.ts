/**
 * ChapterCompleteScreen — 3-panel comic sequence shown after all chapter cases complete.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

const PANEL_COUNT = 3;
const AUTO_ADVANCE_MS = 8000;

const PANELS = [
  { emoji: '🔑🔬🏛️', label: 'The suspects…' },
  { emoji: '🐕🎉🔍', label: 'Mystery solved!' },
  { emoji: '⭐⭐⭐', label: 'Chapter complete!' },
];

type ContinueCallback = (route: string) => void;

interface InitOptions {
  viewportWidth: number;
  viewportHeight: number;
}

export class ChapterCompleteScreen {
  public container: Container = new Container();
  private currentPanel = 0;
  private panelContainers: Container[] = [];
  private activeTweens: gsap.core.Tween[] = [];
  private continueCallback: ContinueCallback | null = null;
  private autoAdvanceTimer: gsap.core.Tween | null = null;
  private viewportWidth = 390;
  private viewportHeight = 688;

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive';
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.currentPanel = 0;

    for (let i = 0; i < PANEL_COUNT; i++) {
      const panel = new Container();
      const label = new Text(PANELS[i].emoji + '\n' + PANELS[i].label);
      panel.addChild(label);
      panel.alpha = i === 0 ? 1 : 0; // First panel visible
      panel.x = options.viewportWidth / 2 - 60;
      panel.y = options.viewportHeight / 2 - 40;
      this.panelContainers.push(panel);
      this.container.addChild(panel);
    }
  }

  getPanelCount(): number {
    return PANEL_COUNT;
  }

  getCurrentPanel(): number {
    return this.currentPanel;
  }

  getAutoAdvanceDelayMs(): number {
    return AUTO_ADVANCE_MS;
  }

  /**
   * Advance to next panel. On last panel, show continue button.
   */
  advancePanel(): void {
    if (this.currentPanel >= PANEL_COUNT - 1) {
      return;
    }
    // Fade out current, fade in next
    const current = this.panelContainers[this.currentPanel];
    const next = this.panelContainers[this.currentPanel + 1];
    if (current) {
      const t1 = gsap.to(current, { alpha: 0, duration: 0.3 });
      this.activeTweens.push(t1);
    }
    if (next) {
      const t2 = gsap.to(next, { alpha: 1, duration: 0.3 });
      this.activeTweens.push(t2);
    }
    this.currentPanel++;
  }

  setContinueCallback(callback: ContinueCallback): void {
    this.continueCallback = callback;
  }

  triggerContinue(): void {
    this.continueCallback?.('start');
  }

  destroy(): void {
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.kill();
      this.autoAdvanceTimer = null;
    }
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    for (const panel of this.panelContainers) {
      gsap.killTweensOf(panel);
    }
    this.panelContainers = [];
    this.continueCallback = null;
    this.currentPanel = 0;

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
