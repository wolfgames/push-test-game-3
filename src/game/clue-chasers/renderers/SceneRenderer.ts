/**
 * SceneRenderer — investigation scene background and pan support.
 *
 * GPU only (guardrail #1). GSAP for animation (guardrail #3).
 * Tweens killed before destroy (guardrail #2).
 */
import { Container, Text } from 'pixi.js';
import gsap from 'gsap';

export interface SceneConfig {
  sceneId: string;
  label: string;
  backgroundColor: number;
  emoji: string;
}

const DEFAULT_SCENE: SceneConfig = {
  sceneId: 'default',
  label: 'Scene',
  backgroundColor: 0x1a1a2e,
  emoji: '🏚️',
};

export class SceneRenderer {
  public container: Container = new Container();
  private bgContainer: Container = new Container();
  private activeTweens: gsap.core.Tween[] = [];
  private sceneWidth = 390;
  private viewportWidth = 390;
  private currentScene: SceneConfig = DEFAULT_SCENE;

  init(
    viewportWidth: number,
    viewportHeight: number,
    scene?: Partial<SceneConfig>,
  ): void {
    this.destroy();
    this.container = new Container();
    this.bgContainer = new Container();
    this.viewportWidth = viewportWidth;
    this.sceneWidth = viewportWidth;

    this.currentScene = { ...DEFAULT_SCENE, ...scene };

    // Background emoji label (fallback until atlas loads)
    const bg = new Text(this.currentScene.emoji);
    bg.x = viewportWidth / 2 - 20;
    bg.y = viewportHeight / 2 - 20;
    this.bgContainer.addChild(bg);

    this.container.addChild(this.bgContainer);
  }

  /**
   * Desaturate the scene (loss sequence step 2).
   * GSAP tint shift approximation — real desaturation would require filter (guardrail #13).
   * We lower alpha/tint to simulate desaturation using tint.
   */
  desaturate(duration = 0.35): Promise<void> {
    return new Promise((resolve) => {
      // Simulate desaturation by dimming and reducing contrast via alpha on bg
      const tween = gsap.to(this.bgContainer, {
        alpha: 0.4,
        duration,
        ease: 'power1.inOut',
        onComplete: resolve,
      });
      this.activeTweens.push(tween);
    });
  }

  /**
   * Restore scene from desaturation.
   */
  restore(duration = 0.3): Promise<void> {
    return new Promise((resolve) => {
      const tween = gsap.to(this.bgContainer, {
        alpha: 1,
        duration,
        ease: 'power1.inOut',
        onComplete: resolve,
      });
      this.activeTweens.push(tween);
    });
  }

  /**
   * Dim scene for deduction overlay.
   */
  dim(alpha = 0.5, duration = 0.3): Promise<void> {
    return new Promise((resolve) => {
      const tween = gsap.to(this.bgContainer, {
        alpha,
        duration,
        ease: 'power1.inOut',
        onComplete: resolve,
      });
      this.activeTweens.push(tween);
    });
  }

  destroy(): void {
    this.activeTweens.forEach(t => t.kill());
    this.activeTweens = [];

    if (this.bgContainer) {
      gsap.killTweensOf(this.bgContainer);
      this.bgContainer.removeAllListeners();
    }

    if (this.container) {
      gsap.killTweensOf(this.container);
      this.container.removeAllListeners();
      this.container.destroy({ children: true });
    }
  }
}
