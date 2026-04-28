/**
 * HotspotRenderer — tappable scene zones with shimmer animation.
 *
 * GPU only: no DOM, no document.createElement (guardrail #1).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 * eventMode='passive' on parent Container (guardrail #4).
 */
import { Container, Text, Rectangle } from 'pixi.js';
import gsap from 'gsap';

import type { HotspotOutcome, EvidenceType } from '../state/ClueChasersPlugin';

export interface HotspotData {
  id: string;
  x: number;
  y: number;
  outcome: HotspotOutcome;
  evidenceType: EvidenceType | null;
  locked: boolean;
}

const HOTSPOT_SIZE = 44; // minimum touch target (pt)
const SHIMMER_SCALE = 1.03;
const SHIMMER_DURATION = 0.7; // 2 * 700ms = 1400ms full cycle

interface HotspotContainer extends Container {
  __hotspotId: string;
}

export class HotspotRenderer {
  private containers: HotspotContainer[] = [];
  private shimmerTweens: Map<string, gsap.core.Tween> = new Map();
  public container: Container = new Container();

  constructor() {
    // Parent container must be 'passive' so children receive input (guardrail #4)
    this.container.eventMode = 'passive';
  }

  init(hotspots: HotspotData[]): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive';

    for (const hotspot of hotspots) {
      const c = new Container() as HotspotContainer;
      c.__hotspotId = hotspot.id;
      c.x = hotspot.x - HOTSPOT_SIZE / 2;
      c.y = hotspot.y - HOTSPOT_SIZE / 2;

      // Minimum 44x44pt touch target
      c.hitArea = new Rectangle(0, 0, HOTSPOT_SIZE, HOTSPOT_SIZE);

      if (hotspot.locked) {
        c.eventMode = 'static';
        c.cursor = 'not-allowed';
      } else {
        c.eventMode = 'static';
        c.cursor = 'pointer';
      }

      // Emoji fallback label
      const label = new Text(hotspot.locked ? '🔒' : '🔍');
      label.x = 4;
      label.y = 4;
      c.addChild(label);

      // Shimmer on active (non-locked, non-spent) hotspots
      if (!hotspot.locked) {
        const tween = gsap.to(c, {
          pixi: { scaleX: SHIMMER_SCALE, scaleY: SHIMMER_SCALE },
          duration: SHIMMER_DURATION,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
        this.shimmerTweens.set(hotspot.id, tween);
      }

      this.containers.push(c);
      this.container.addChild(c);
    }
  }

  getHotspotContainers(): HotspotContainer[] {
    return this.containers;
  }

  /**
   * Mark a hotspot as spent: dim it, disable interaction, kill shimmer.
   */
  markSpent(hotspotId: string): void {
    const c = this.containers.find(c => c.__hotspotId === hotspotId);
    if (!c) return;

    // Kill shimmer tween
    const tween = this.shimmerTweens.get(hotspotId);
    if (tween) {
      tween.kill();
      this.shimmerTweens.delete(hotspotId);
    }
    gsap.killTweensOf(c);

    c.eventMode = 'none';
    c.alpha = 0.35;
    // Reset scale from shimmer
    c.scale.set(1);
  }

  /**
   * Play padlock-shake on a locked hotspot tap.
   */
  playLockedShake(hotspotId: string): void {
    const c = this.containers.find(c => c.__hotspotId === hotspotId);
    if (!c) return;
    const origX = c.x;
    gsap.to(c, {
      x: origX + 6,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: 'none',
      onComplete: () => { c.x = origX; },
    });
  }

  destroy(): void {
    // Kill tweens before destroying (guardrail #2)
    this.shimmerTweens.forEach(tween => tween.kill());
    this.shimmerTweens.clear();

    for (const c of this.containers) {
      gsap.killTweensOf(c);
      c.removeAllListeners();
      c.parent?.removeChild(c);
      c.destroy({ children: true });
    }
    this.containers = [];

    if (this.container) {
      this.container.removeAllListeners();
      this.container.destroy({ children: false });
    }
  }
}
