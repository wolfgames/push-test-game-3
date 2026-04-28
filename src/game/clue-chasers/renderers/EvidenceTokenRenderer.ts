/**
 * EvidenceTokenRenderer — fly-arc animation from hotspot to Clue Board slot.
 *
 * GPU only (guardrail #1). GSAP for animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

import type { EvidenceType } from '../state/ClueChasersPlugin';

const TOKEN_EVIDENCE_EMOJIS: Record<EvidenceType, string> = {
  footprint: '👣',
  document: '📄',
  fingerprint: '🖐',
  voice: '🎙',
  disguise: '🎭',
};

const FLY_DURATION = 0.22; // 220ms
const TOKEN_SIZE = 56;

interface SlotPosition {
  x: number;
  y: number;
}

interface FlyToSlotInput {
  evidenceType: EvidenceType;
  fromPosition: { x: number; y: number };
  slotIndex: number;
  parentContainer: Container;
}

interface FlyToSlotResult {
  boardFull: boolean;
}

export class EvidenceTokenRenderer {
  private slotPositions: SlotPosition[] = [];
  private filledSlots: Set<number> = new Set();
  private activeTweens: gsap.core.Tween[] = [];

  init(slotPositions: SlotPosition[]): void {
    this.slotPositions = slotPositions;
    this.filledSlots.clear();
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];
  }

  markSlotFilled(slotIndex: number): void {
    this.filledSlots.add(slotIndex);
  }

  async flyToSlot(input: FlyToSlotInput): Promise<FlyToSlotResult> {
    const { evidenceType, fromPosition, slotIndex, parentContainer } = input;

    // Board full: slotIndex -1 or all slots filled
    const isFull = slotIndex === -1 || this.filledSlots.size >= this.slotPositions.length;
    if (isFull) {
      // Play short shake on the source position
      const shakeContainer = new Container();
      shakeContainer.x = fromPosition.x;
      shakeContainer.y = fromPosition.y;
      parentContainer.addChild(shakeContainer);

      await new Promise<void>((resolve) => {
        const tween = gsap.to(shakeContainer, {
          x: fromPosition.x + 5,
          duration: 0.04,
          yoyo: true,
          repeat: 3,
          ease: 'none',
          onComplete: () => {
            gsap.killTweensOf(shakeContainer);
            shakeContainer.parent?.removeChild(shakeContainer);
            shakeContainer.destroy({ children: true });
            resolve();
          },
        });
        this.activeTweens.push(tween);
      });

      return { boardFull: true };
    }

    const targetPos = this.slotPositions[slotIndex];
    if (!targetPos) return { boardFull: false };

    // Create token sprite
    const token = new Container();
    token.x = fromPosition.x - TOKEN_SIZE / 2;
    token.y = fromPosition.y - TOKEN_SIZE / 2;

    const emoji = new Text(TOKEN_EVIDENCE_EMOJIS[evidenceType] ?? '🔍');
    emoji.x = 4;
    emoji.y = 4;
    token.addChild(emoji);
    parentContainer.addChild(token);

    // Fly arc: x/y tween to slot center position, back.out ease
    await new Promise<void>((resolve) => {
      const tween = gsap.to(token, {
        x: targetPos.x,
        y: targetPos.y,
        duration: FLY_DURATION,
        ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.killTweensOf(token);
          token.parent?.removeChild(token);
          token.destroy({ children: true });
          this.filledSlots.add(slotIndex);
          resolve();
        },
      });
      this.activeTweens.push(tween);
    });

    return { boardFull: false };
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];
  }
}
