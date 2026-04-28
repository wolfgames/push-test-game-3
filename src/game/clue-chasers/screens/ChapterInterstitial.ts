/**
 * ChapterInterstitial — GPU Container for chapter start transition.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

interface InitOptions {
  viewportWidth: number;
  viewportHeight: number;
}

interface CaseInfo {
  caseIndex: number;
  totalCases: number;
  isIntro?: boolean;
}

const MYSTERY_MACHINE_EMOJI = '🚐';
const DRIVE_DURATION = 1.2; // seconds

export class ChapterInterstitial {
  public container: Container = new Container();
  private mysteryMachine: Text | null = null;
  private caseCounterText: Text | null = null;
  private caseInfo: CaseInfo = { caseIndex: 1, totalCases: 5, isIntro: false };
  private progressBarVisible = true;
  private activeTweens: gsap.core.Tween[] = [];
  private viewportWidth = 390;
  private viewportHeight = 688;

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive';
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    // Mystery Machine sprite — emoji fallback
    const mm = new Text(MYSTERY_MACHINE_EMOJI);
    mm.x = options.viewportWidth + 40; // Start off-screen right
    mm.y = options.viewportHeight / 2;
    this.mysteryMachine = mm;
    this.container.addChild(mm);

    // Case counter text
    const counter = new Text('Case 1 of 5');
    counter.x = options.viewportWidth / 2 - 40;
    counter.y = options.viewportHeight * 0.7;
    this.caseCounterText = counter;
    this.container.addChild(counter);
  }

  /**
   * Animate Mystery Machine driving across the screen.
   * Duration: 1200ms GSAP tween.
   */
  async playDriveAcross(): Promise<void> {
    if (!this.mysteryMachine) return;
    return new Promise<void>((resolve) => {
      const tween = gsap.to(this.mysteryMachine!, {
        x: this.viewportWidth / 2,
        duration: DRIVE_DURATION,
        ease: 'power2.out',
        onComplete: resolve,
      });
      this.activeTweens.push(tween);
    });
  }

  /**
   * Set case information for display.
   */
  setCaseInfo(info: CaseInfo): void {
    this.caseInfo = info;
    this.progressBarVisible = !info.isIntro;
    if (this.caseCounterText) {
      this.caseCounterText.text = `Case ${info.caseIndex} of ${info.totalCases}`;
    }
  }

  /**
   * Get current case counter text for test assertions.
   */
  getCaseCounterText(): string {
    return `Case ${this.caseInfo.caseIndex} of ${this.caseInfo.totalCases}`;
  }

  /**
   * Whether progress bar should be visible.
   */
  isProgressBarVisible(): boolean {
    return this.progressBarVisible;
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    if (this.mysteryMachine) {
      gsap.killTweensOf(this.mysteryMachine);
      this.mysteryMachine = null;
    }
    if (this.caseCounterText) {
      gsap.killTweensOf(this.caseCounterText);
      this.caseCounterText = null;
    }

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
