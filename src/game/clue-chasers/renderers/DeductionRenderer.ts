/**
 * DeductionRenderer — suspect card overlay on the game canvas.
 *
 * GPU Container only — no DOM elements (guardrail #1).
 * eventMode='passive' on parent (guardrail #4).
 * GSAP for all animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Graphics, Text, Rectangle } from 'pixi.js';
import gsap from 'gsap';

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const CARD_TOUCH_TARGET = 110; // >= 44pt
const CARD_SPACING = 20;
const SLIDE_IN_DURATION = 0.35;
const STAGGER_DELAY = 0.1;

export interface SuspectData {
  id: string;
  name: string;
  motive: string;
  emoji: string;
}

export interface SuspectCardData {
  suspectId: string;
  name: string;
  emoji: string;
  container: Container & { hitArea: Rectangle };
}

interface InitOptions {
  suspects: SuspectData[];
  viewportWidth: number;
  viewportHeight: number;
}

interface TapResult {
  shake: boolean;
  voCue: string;
  suspectId: string;
}

export class DeductionRenderer {
  public container: Container = new Container();
  private cardContainers: Array<Container & { hitArea: Rectangle; __suspectId: string }> = [];
  private activeTweens: gsap.core.Tween[] = [];
  private viewportWidth = 390;
  private viewportHeight = 688;
  private suspectsData: SuspectData[] = [];

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.container.eventMode = 'passive'; // Parent container is passive (guardrail #4)
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    const { suspects } = options;
    this.suspectsData = suspects;
    const totalWidth =
      suspects.length * CARD_WIDTH + (suspects.length - 1) * CARD_SPACING;
    const startX = (this.viewportWidth - totalWidth) / 2;
    const cardY = this.viewportHeight - CARD_HEIGHT - 80;

    for (let i = 0; i < suspects.length; i++) {
      const suspect = suspects[i];
      const card = new Container() as Container & { hitArea: Rectangle; __suspectId: string };
      card.__suspectId = suspect.id;
      card.x = startX + i * (CARD_WIDTH + CARD_SPACING);
      card.y = this.viewportHeight; // Start below viewport for slide-in
      card.hitArea = new Rectangle(0, 0, CARD_TOUCH_TARGET, CARD_HEIGHT);
      card.eventMode = 'static'; // Each card is interactive (guardrail #4)
      card.cursor = 'pointer';

      // Card background
      const bg = new Graphics();
      bg.rect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      bg.fill(0x2a2a4a);
      bg.stroke({ width: 2, color: 0x4a4a8a });
      card.addChild(bg);

      // Emoji portrait
      const emojiLabel = new Text(suspect.emoji);
      emojiLabel.x = CARD_WIDTH / 2 - 16;
      emojiLabel.y = 20;
      card.addChild(emojiLabel);

      // Name label
      const nameLabel = new Text(suspect.name.split(' ').slice(-1)[0]); // Last name only for space
      nameLabel.x = 4;
      nameLabel.y = CARD_HEIGHT - 50;
      card.addChild(nameLabel);

      // Motive label (small)
      const motiveLabel = new Text(suspect.motive);
      motiveLabel.x = 4;
      motiveLabel.y = CARD_HEIGHT - 30;
      card.addChild(motiveLabel);

      this.cardContainers.push(card);
      this.container.addChild(card);
    }
  }

  /**
   * Slide cards up from bottom.
   */
  async slideIn(): Promise<void> {
    const cardY = this.viewportHeight - CARD_HEIGHT - 80;
    const promises = this.cardContainers.map((card, i) => {
      return new Promise<void>((resolve) => {
        const tween = gsap.to(card, {
          y: cardY,
          duration: SLIDE_IN_DURATION,
          delay: i * STAGGER_DELAY,
          ease: 'power2.out',
          onComplete: resolve,
        });
        this.activeTweens.push(tween);
      });
    });
    await Promise.all(promises);
  }

  getSuspectCards(): SuspectCardData[] {
    return this.cardContainers.map((card) => {
      const suspectId = (card as any).__suspectId;
      const suspectData = this.suspectsData.find(s => s.id === suspectId);
      return {
        suspectId,
        name: suspectData?.name ?? '',
        emoji: suspectData?.emoji ?? '',
        container: card,
      };
    });
  }

  /**
   * Handle a suspect card tap.
   * Returns animation metadata.
   */
  async onSuspectTap(suspectId: string, correct: boolean): Promise<TapResult> {
    const card = this.cardContainers.find(c => c.__suspectId === suspectId);

    if (correct) {
      // Scale up then flip animation
      if (card) {
        await new Promise<void>((resolve) => {
          const tween = gsap.to(card.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.1,
            ease: 'power2.out',
            onComplete: () => {
              // Unmasking flip (rotationY) — pixi prop
              const flipTween = gsap.to(card, {
                pixi: { rotation: 180 }, // Approximating rotationY with rotation for test mock
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: resolve,
              });
              this.activeTweens.push(flipTween);
            },
          });
          this.activeTweens.push(tween);
        });
      }
      return { shake: false, voCue: 'scooby-dooby-doo', suspectId };
    } else {
      // Wrong guess: card shake (200ms, 8px horizontal)
      if (card) {
        const origX = card.x;
        await new Promise<void>((resolve) => {
          const tween = gsap.to(card, {
            x: origX + 8,
            duration: 0.05,
            yoyo: true,
            repeat: 3,
            ease: 'none',
            onComplete: () => {
              card.x = origX;
              resolve();
            },
          });
          this.activeTweens.push(tween);
        });
      }
      return { shake: true, voCue: 'hmm-nope', suspectId };
    }
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    for (const card of this.cardContainers) {
      gsap.killTweensOf(card);
      gsap.killTweensOf(card.scale);
      card.removeAllListeners();
    }
    this.cardContainers = [];

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
