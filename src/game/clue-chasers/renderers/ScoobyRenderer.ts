/**
 * ScoobyRenderer — GPU Container for Scooby-Doo companion.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * eventMode='passive' on parent (guardrail #4).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

export type ReactionType = 'locked' | 'red-herring' | 'win' | 'loss' | 'idle';

export interface ReactionResult {
  voCue: string;
}

interface InitOptions {
  viewportWidth: number;
  viewportHeight: number;
}

const SCOOBY_EMOJI = '🐕';
const SCOOBY_SIZE = 64;
const MARGIN_X = 16;
const MARGIN_Y = 120; // above clue board

export class ScoobyRenderer {
  public container: Container = new Container();
  private scoobySprite: Text | null = null;
  private activeTweens: gsap.core.Tween[] = [];
  private idleTween: gsap.core.Tween | null = null;
  private viewportWidth = 390;
  private viewportHeight = 688;

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive'; // Parent is passive (guardrail #4)
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    // Scooby emoji sprite — GPU text fallback until atlas loads
    const sprite = new Text(SCOOBY_EMOJI);
    sprite.x = MARGIN_X;
    sprite.y = options.viewportHeight - MARGIN_Y;
    this.scoobySprite = sprite;
    this.container.addChild(sprite);
  }

  /**
   * Start idle loop animation (runs continuously).
   */
  startIdle(): void {
    if (!this.scoobySprite) return;
    const tween = gsap.to(this.scoobySprite.scale, {
      x: 1.02,
      y: 1.02,
      duration: 1.0,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
    this.idleTween = tween;
    this.activeTweens.push(tween);
  }

  /**
   * Play a contextual reaction and return the VO cue.
   */
  playReaction(type: ReactionType): ReactionResult {
    if (!this.scoobySprite) return { voCue: '' };

    switch (type) {
      case 'locked': {
        // Ruh-roh: slight jump then settle
        const tween = gsap.to(this.scoobySprite, {
          y: this.scoobySprite.y - 12,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
        this.activeTweens.push(tween);
        return { voCue: 'ruh-roh' };
      }
      case 'red-herring': {
        // Shrug: scaleX flip
        const tween = gsap.to(this.scoobySprite.scale, {
          x: -1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'none',
        });
        this.activeTweens.push(tween);
        return { voCue: 'wah-wah' };
      }
      case 'win': {
        // Jump
        const tween = gsap.to(this.scoobySprite, {
          y: this.scoobySprite.y - 30,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
        this.activeTweens.push(tween);
        return { voCue: 'scooby-dooby-doo' };
      }
      case 'loss': {
        // Droop: translateY down
        const tween = gsap.to(this.scoobySprite, {
          y: this.scoobySprite.y + 10,
          duration: 0.3,
          ease: 'power2.in',
        });
        this.activeTweens.push(tween);
        return { voCue: 'sad-trombone' };
      }
      default:
        return { voCue: '' };
    }
  }

  destroy(): void {
    if (this.idleTween) {
      this.idleTween.kill();
      this.idleTween = null;
    }
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    if (this.scoobySprite) {
      gsap.killTweensOf(this.scoobySprite);
      gsap.killTweensOf(this.scoobySprite.scale);
      this.scoobySprite = null;
    }

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
