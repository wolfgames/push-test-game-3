/**
 * ScenePanController — handles horizontal pan gesture discrimination.
 *
 * Pure state machine — no Pixi imports, no Math.random() (guardrail #9).
 * No requestAnimationFrame — momentum applied via GSAP in renderer (guardrail #3).
 *
 * Tap vs Pan discrimination: horizontal delta < 12px = tap; >= 12px = pan.
 */

const PAN_THRESHOLD = 12; // px horizontal movement to trigger pan
const MOMENTUM_FRICTION = 0.85; // velocity decay per frame equivalent

interface Options {
  sceneWidth: number;
  viewportWidth: number;
}

export class ScenePanController {
  private sceneWidth: number;
  private viewportWidth: number;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private sceneOffsetX = 0;
  private velocity = 0;
  private _isPanning = false;
  private _hasMomentum = false;
  private pointerDownActive = false;

  constructor(options: Options) {
    this.sceneWidth = options.sceneWidth;
    this.viewportWidth = options.viewportWidth;
  }

  pointerDown(x: number, _y: number): void {
    this.startX = x;
    this.startY = _y;
    this.currentX = x;
    this._isPanning = false;
    this._hasMomentum = false;
    this.velocity = 0;
    this.pointerDownActive = true;
  }

  pointerMove(x: number, y: number): void {
    if (!this.pointerDownActive) return;
    const dx = x - this.startX;
    const dy = y - this.startY;

    // Only pan horizontally; ignore if vertical movement dominant
    if (Math.abs(dx) > PAN_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      this._isPanning = true;
      this.velocity = x - this.currentX;
      this.currentX = x;
      // Update scene offset (clamped)
      this.sceneOffsetX = this.clamp(this.sceneOffsetX + (x - (this.currentX - this.velocity)));
    }
  }

  pointerUp(x: number, _y: number): void {
    if (!this.pointerDownActive) return;
    const dx = x - this.startX;
    if (this._isPanning || Math.abs(dx) >= PAN_THRESHOLD) {
      this._hasMomentum = Math.abs(this.velocity) > 0;
      this.velocity = dx; // Carry final delta as velocity
    }
    this.pointerDownActive = false;
  }

  isPanning(): boolean {
    return this._isPanning;
  }

  hasMomentum(): boolean {
    return this._hasMomentum;
  }

  isTap(): boolean {
    // Tap only if pointer released without triggering pan
    return !this._isPanning && !this._hasMomentum;
  }

  getVelocity(): number {
    return this.velocity;
  }

  getClampedX(): number {
    return this.clamp(this.sceneOffsetX);
  }

  private clamp(x: number): number {
    const minX = -(this.sceneWidth - this.viewportWidth);
    return Math.max(minX, Math.min(0, x));
  }

  reset(): void {
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.sceneOffsetX = 0;
    this.velocity = 0;
    this._isPanning = false;
    this._hasMomentum = false;
    this.pointerDownActive = false;
  }
}
