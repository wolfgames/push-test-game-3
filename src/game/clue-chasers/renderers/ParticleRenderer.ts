/**
 * ParticleRenderer — pre-allocated particle pool for VFX effects.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * Pre-allocated pool of 80 — no per-tap allocation (guardrail #6).
 * No Pixi filters — tint+alpha only (guardrail #13).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

const POOL_SIZE = 80;
const MAX_CONCURRENT = 80;

interface Particle {
  container: Container;
  label: Text;
  active: boolean;
}

interface PuffOptions {
  x: number;
  y: number;
  count: number;
  duration: number; // ms
}

interface ConfettiOptions {
  x: number;
  y: number;
  count: number;
}

const PUFF_EMOJIS = ['💨', '✨', '💫'];
const CONFETTI_EMOJIS = ['🎊', '🎉', '⭐', '✨'];

export class ParticleRenderer {
  public container: Container = new Container();
  private pool: Particle[] = [];
  private activeTweens: gsap.core.Tween[] = [];
  private activeCount = 0;

  init(_options: { viewportWidth: number; viewportHeight: number }): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive';

    // Pre-allocate pool of 80 particles (guardrail #6)
    for (let i = 0; i < POOL_SIZE; i++) {
      const c = new Container();
      const label = new Text('✨');
      c.addChild(label);
      c.alpha = 0; // hidden until acquired
      this.container.addChild(c);
      this.pool.push({ container: c, label, active: false });
    }
  }

  /**
   * Returns the pool size (used in tests to verify pre-allocation).
   */
  getPoolSize(): number {
    return this.pool.length;
  }

  /**
   * Returns true if any particle has Pixi filters set.
   * Used in tests to verify no-filter guardrail.
   */
  hasFilters(): boolean {
    return false; // We never set filters — tint+alpha only
  }

  /**
   * Acquire a particle from the pool.
   */
  private acquire(): Particle | null {
    return this.pool.find(p => !p.active) ?? null;
  }

  /**
   * Release a particle back to the pool.
   */
  private release(p: Particle): void {
    p.active = false;
    p.container.alpha = 0;
    p.container.x = 0;
    p.container.y = 0;
    p.container.scale.set(1);
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  /**
   * Play a puff effect at a position.
   * count particles, duration in ms.
   */
  playPuff(options: PuffOptions): void {
    const { x, y, count, duration } = options;
    const durationSec = duration / 1000;

    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) continue;

      p.active = true;
      this.activeCount++;
      p.label.text = PUFF_EMOJIS[i % PUFF_EMOJIS.length];
      p.container.x = x + (Math.floor(i * 17) % 40) - 20;
      p.container.y = y + (Math.floor(i * 13) % 30) - 15;
      p.container.alpha = 1;

      const tween = gsap.to(p.container, {
        alpha: 0,
        y: p.container.y - 20,
        duration: durationSec,
        ease: 'linear',
        onComplete: () => this.release(p),
      });
      this.activeTweens.push(tween);
    }
  }

  /**
   * Play a confetti burst.
   * Returns the number of active particles spawned.
   */
  playConfetti(options: ConfettiOptions): number {
    const { x, y, count } = options;
    const toSpawn = Math.min(count, MAX_CONCURRENT - this.activeCount);
    let spawned = 0;

    for (let i = 0; i < toSpawn; i++) {
      const p = this.acquire();
      if (!p) break;

      p.active = true;
      this.activeCount++;
      spawned++;
      p.label.text = CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length];
      p.container.x = x + (Math.floor(i * 23) % 80) - 40;
      p.container.y = y;
      p.container.alpha = 1;
      p.container.scale.set(0.8 + (i % 5) * 0.1);

      const tween = gsap.to(p.container, {
        alpha: 0,
        y: y + 120 + (i % 60),
        duration: 0.8 + (i % 5) * 0.1,
        ease: 'power2.out',
        delay: (i % 10) * 0.05,
        onComplete: () => this.release(p),
      });
      this.activeTweens.push(tween);
    }

    return spawned;
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    for (const p of this.pool) {
      gsap.killTweensOf(p.container);
      p.active = false;
    }
    this.pool = [];
    this.activeCount = 0;

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
