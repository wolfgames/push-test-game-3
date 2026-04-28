/**
 * HudRenderer — HUD elements: tap counter (top-right), score (top-left), progress bar.
 *
 * GPU only (guardrail #1). GSAP for animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

const WARNING_THRESHOLD = 3;

export class HudRenderer {
  public container: Container = new Container();
  private tapCounterContainer: Container = new Container();
  private tapCounterLabel: Text | null = null;
  private activeTweens: gsap.core.Tween[] = [];
  private tapCounterVisible = true;

  init(viewportWidth: number, _viewportHeight: number): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'none'; // HUD is passive (guardrail #4)

    // Tap counter at top-right
    this.tapCounterContainer = new Container();
    this.tapCounterContainer.x = viewportWidth - 60;
    this.tapCounterContainer.y = 10;

    const pawEmoji = new Text('🐾');
    pawEmoji.x = 0;
    pawEmoji.y = 0;
    this.tapCounterContainer.addChild(pawEmoji);

    this.tapCounterLabel = new Text('15');
    this.tapCounterLabel.x = 30;
    this.tapCounterLabel.y = 0;
    this.tapCounterContainer.addChild(this.tapCounterLabel);

    this.container.addChild(this.tapCounterContainer);
  }

  /**
   * Update tap counter display with scale-pop animation.
   */
  updateTapCounter(value: number, startingTaps: number): void {
    if (!this.tapCounterLabel || !this.tapCounterVisible) return;

    this.tapCounterLabel.text = String(value);

    // Kill previous tween before creating new one (guardrail #2)
    gsap.killTweensOf(this.tapCounterContainer.scale);

    // Scale-pop: 1.0 → 1.15 → 1.0, 120ms back.out
    gsap.to(this.tapCounterContainer.scale, {
      x: 1.15,
      y: 1.15,
      duration: 0.06,
      ease: 'back.out(1.7)',
      yoyo: true,
      repeat: 1,
    });

    // Warning pulse when <= 3
    if (value <= WARNING_THRESHOLD && value > 0) {
      this._playWarningPulse();
    }
  }

  private _playWarningPulse(): void {
    gsap.killTweensOf(this.tapCounterLabel);
    // Pulsing red tint (simulate with alpha changes since tint requires pixi prop)
    gsap.to(this.tapCounterContainer, {
      alpha: 0.6,
      duration: 0.15,
      yoyo: true,
      repeat: 5,
      ease: 'none',
      onComplete: () => { this.tapCounterContainer.alpha = 1; },
    });
  }

  showTapCounter(): void {
    this.tapCounterVisible = true;
    this.tapCounterContainer.alpha = 1;
    this.tapCounterContainer.visible = true;
  }

  hideTapCounter(): void {
    this.tapCounterVisible = false;
    this.tapCounterContainer.alpha = 0;
    this.tapCounterContainer.visible = false;
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    if (this.tapCounterLabel) {
      gsap.killTweensOf(this.tapCounterLabel);
    }
    if (this.tapCounterContainer) {
      gsap.killTweensOf(this.tapCounterContainer);
      gsap.killTweensOf(this.tapCounterContainer.scale);
      this.tapCounterContainer.removeAllListeners();
    }
    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
    this.tapCounterLabel = null;
  }
}
