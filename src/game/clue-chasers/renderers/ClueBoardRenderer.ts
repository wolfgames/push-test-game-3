/**
 * ClueBoardRenderer — bottom HUD strip, 5 token slots, golden-glow + Deduce! button.
 *
 * GPU only (guardrail #1). GSAP for animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';

import type { EvidenceType } from '../state/ClueChasersPlugin';

const TOKEN_EVIDENCE_EMOJIS: Record<EvidenceType, string> = {
  footprint: '👣',
  document: '📄',
  fingerprint: '🖐',
  voice: '🎙',
  disguise: '🎭',
};

const SLOT_RADIUS = 28; // 56pt diameter
const HUD_HEIGHT = 100;
const SLOT_SPACING = 66;

interface SlotState {
  filled: boolean;
  evidenceType: EvidenceType | null;
  container: Container;
}

interface InitOptions {
  viewportWidth: number;
  hudHeight: number;
  requiredSlots: number;
}

export class ClueBoardRenderer {
  public container: Container = new Container();
  private slotStates: SlotState[] = [];
  private deduceButton: Container | null = null;
  private deduceVisible = false;
  private activeTweens: gsap.core.Tween[] = [];
  private requiredSlots = 5;

  init(options: InitOptions): void {
    this.destroy();
    this.container = new Container();
    this.requiredSlots = options.requiredSlots;

    const { viewportWidth } = options;

    // Slots centered horizontally
    const totalWidth = 5 * SLOT_SPACING;
    const startX = (viewportWidth - totalWidth) / 2 + SLOT_RADIUS;
    const slotY = HUD_HEIGHT / 2;

    for (let i = 0; i < 5; i++) {
      const locked = i >= options.requiredSlots;
      const slotContainer = new Container();
      slotContainer.x = startX + i * SLOT_SPACING;
      slotContainer.y = slotY;

      // Circle background
      const bg = new Graphics();
      bg.circle(0, 0, SLOT_RADIUS);
      if (locked) {
        bg.fill(0x333333);
      } else {
        bg.fill(0x555555);
        bg.stroke({ width: 2, color: 0x888888 });
      }
      slotContainer.addChild(bg);

      if (locked) {
        const lockText = new Text('🔒');
        lockText.x = -10;
        lockText.y = -10;
        slotContainer.addChild(lockText);
      }

      const state: SlotState = {
        filled: false,
        evidenceType: null,
        container: slotContainer,
      };
      this.slotStates.push(state);
      this.container.addChild(slotContainer);
    }

    // Deduce! button (hidden initially)
    const btn = new Container();
    btn.alpha = 0;
    btn.scale.set(0);
    const btnBg = new Graphics();
    btnBg.rect(-60, -20, 120, 40);
    btnBg.fill(0xFFD700);
    btn.addChild(btnBg);
    const btnText = new Text('Deduce!');
    btnText.x = -30;
    btnText.y = -14;
    btn.addChild(btnText);
    btn.x = viewportWidth / 2;
    btn.y = slotY;
    btn.eventMode = 'none';
    this.deduceButton = btn;
    this.container.addChild(btn);
  }

  getSlots(): Array<{ filled: boolean; evidenceType: EvidenceType | null }> {
    return this.slotStates.map(s => ({ filled: s.filled, evidenceType: s.evidenceType }));
  }

  getSlotPositions(): Array<{ x: number; y: number }> {
    return this.slotStates.map(s => ({ x: s.container.x, y: s.container.y }));
  }

  isBoardFull(): boolean {
    const required = this.slotStates.slice(0, this.requiredSlots);
    return required.every(s => s.filled);
  }

  isDeduceButtonVisible(): boolean {
    return this.deduceVisible;
  }

  async fillSlot(slotIndex: number, evidenceType: EvidenceType): Promise<void> {
    const slot = this.slotStates[slotIndex];
    if (!slot || slot.filled) return;

    slot.filled = true;
    slot.evidenceType = evidenceType;

    // Add emoji to slot
    const emojiLabel = new Text(TOKEN_EVIDENCE_EMOJIS[evidenceType] ?? '🔍');
    emojiLabel.x = -12;
    emojiLabel.y = -12;
    slot.container.addChild(emojiLabel);

    // Bounce-in: elastic.out (80ms) — scale from 0.5 to 1.1 to 1.0
    slot.container.scale.set(0.5);
    await new Promise<void>((resolve) => {
      const tween = gsap.to(slot.container.scale, {
        x: 1,
        y: 1,
        duration: 0.08,
        ease: 'elastic.out(1.5, 0.5)',
        onComplete: resolve,
      });
      this.activeTweens.push(tween);
    });

    // Check if board full
    if (this.isBoardFull()) {
      await this._playFullBoardEffects();
    }
  }

  private async _playFullBoardEffects(): Promise<void> {
    // Golden-glow pulse on container (800ms half-cycle)
    const glowTween = gsap.to(this.container, {
      alpha: 0.85,
      duration: 0.8,
      yoyo: true,
      repeat: 3,
      ease: 'sine.inOut',
    });
    this.activeTweens.push(glowTween);

    // Deduce! button scales in (300ms back.out)
    if (this.deduceButton) {
      this.deduceButton.eventMode = 'static';
      this.deduceVisible = true;
      await new Promise<void>((resolve) => {
        const tween = gsap.to(this.deduceButton!, {
          pixi: { scale: 1, alpha: 1 },
          duration: 0.3,
          ease: 'back.out(1.7)',
          onComplete: resolve,
        });
        this.activeTweens.push(tween);
      });
    }
  }

  destroy(): void {
    // Kill tweens first (guardrail #2)
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    for (const slot of this.slotStates) {
      gsap.killTweensOf(slot.container);
      slot.container.removeAllListeners();
    }

    if (this.deduceButton) {
      gsap.killTweensOf(this.deduceButton);
      this.deduceButton.removeAllListeners();
    }

    this.slotStates = [];
    this.deduceButton = null;
    this.deduceVisible = false;

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
