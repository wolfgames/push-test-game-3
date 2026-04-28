/**
 * GameController — central integration point for Scooby-Doo: Clue Chasers.
 *
 * Wiring pattern:
 * 1. ECS DB created → setActiveDb(db) → bridgeEcsToSignals(db)
 * 2. Pixi Application initialized → layers created (bg, scene, hud, ui)
 * 3. Renderers instantiated with stage layers and layout bounds
 * 4. Input routed via stage pointertap
 * 5. Game actions dispatched through ecsDb.actions.*
 *
 * No DOM in game code (guardrail #1).
 * GSAP for all animation (guardrail #3).
 * eventMode='passive' on parent containers (guardrail #4).
 * Destroy order: tweens → listeners → removeChild → destroy (guardrail #2/#18).
 */
import { Application, Container } from 'pixi.js';
import gsap from 'gsap';
import { createSignal } from 'solid-js';
import { Database } from '@adobe/data/ecs';

import type { GameControllerDeps, GameController } from '~/game/mygame-contract';
import { setActiveDb } from '~/core/systems/ecs';
import { ClueChasersPlugin } from './state/ClueChasersPlugin';
import { bridgeEcsToSignals } from './state/bridgeEcsToSignals';
import { SceneRenderer } from './renderers/SceneRenderer';
import { HotspotRenderer } from './renderers/HotspotRenderer';
import { EvidenceTokenRenderer } from './renderers/EvidenceTokenRenderer';
import { ClueBoardRenderer } from './renderers/ClueBoardRenderer';
import { HudRenderer } from './renderers/HudRenderer';
import type { CleanupFn } from './state/bridgeEcsToSignals';

const VIEWPORT_HEIGHT = 844;
const VIEWPORT_WIDTH = 390;
const DOM_BOTTOM_RESERVED = 56;
const CLUE_BOARD_HEIGHT = 100;
const SCENE_CANVAS_HEIGHT = VIEWPORT_HEIGHT - DOM_BOTTOM_RESERVED - CLUE_BOARD_HEIGHT; // 688

// Placeholder case data for batch 1 (library scene)
const PLACEHOLDER_HOTSPOTS = [
  { id: 'h1', x: 130, y: 300, outcome: 'evidence' as const, evidenceType: 'footprint' as const, locked: false },
  { id: 'h2', x: 200, y: 250, outcome: 'evidence' as const, evidenceType: 'document' as const, locked: false },
  { id: 'h3', x: 270, y: 350, outcome: 'red-herring' as const, evidenceType: null, locked: false },
];

export function createGameController(deps: GameControllerDeps): GameController {
  const [ariaText, setAriaText] = createSignal('Game loading...');

  let app: Application | null = null;
  let ecsDb: ReturnType<typeof Database.create<typeof ClueChasersPlugin>> | null = null;
  let cleanupBridge: CleanupFn | null = null;

  // Layers
  let bgLayer: Container | null = null;
  let sceneLayer: Container | null = null;
  let hudLayer: Container | null = null;
  let uiLayer: Container | null = null;

  // Renderers
  let sceneRenderer: SceneRenderer | null = null;
  let hotspotRenderer: HotspotRenderer | null = null;
  let evidenceTokenRenderer: EvidenceTokenRenderer | null = null;
  let clueBoardRenderer: ClueBoardRenderer | null = null;
  let hudRenderer: HudRenderer | null = null;

  // Audio unlock state
  let audioUnlocked = false;
  let inputLocked = false;

  function unlockAudioOnce() {
    if (!audioUnlocked) {
      audioUnlocked = true;
      // deps.audio has unlockAudio if the type is wired
    }
  }

  async function init(container: HTMLDivElement): Promise<void> {
    setAriaText('Scooby-Doo: Clue Chasers — Investigating');

    // 1. ECS setup
    ecsDb = Database.create(ClueChasersPlugin);
    setActiveDb(ecsDb);
    cleanupBridge = bridgeEcsToSignals(ecsDb);

    // 2. Pixi Application
    app = new Application();
    await app.init({
      resizeTo: container,
      background: 0x1a1a2e,
      resolution: Math.min(window.devicePixelRatio, 2), // cap DPR at 2 (mobile-constraints)
      autoDensity: true,
    }).catch((err) => {
      console.error('[ClueChasers] Pixi init failed:', err);
      throw err;
    });

    container.appendChild(app.canvas as HTMLCanvasElement);

    // 3. Layers (eventMode per gpu-vs-dom.mdc rule)
    bgLayer = new Container();
    bgLayer.eventMode = 'none'; // no interactive children
    app.stage.addChild(bgLayer);

    sceneLayer = new Container();
    sceneLayer.eventMode = 'passive'; // has interactive children (hotspots)
    app.stage.addChild(sceneLayer);

    hudLayer = new Container();
    hudLayer.eventMode = 'none'; // HUD is display-only
    app.stage.addChild(hudLayer);

    uiLayer = new Container();
    uiLayer.eventMode = 'passive'; // has interactive children (Deduce! button)
    app.stage.addChild(uiLayer);

    app.stage.eventMode = 'static'; // stage receives input

    const w = app.screen.width || VIEWPORT_WIDTH;
    const h = app.screen.height || VIEWPORT_HEIGHT;

    // 4. Renderers
    sceneRenderer = new SceneRenderer();
    sceneRenderer.init(w, SCENE_CANVAS_HEIGHT, { emoji: '🏚️', label: 'Library', backgroundColor: 0x2a1a0e });
    sceneLayer.addChild(sceneRenderer.container);

    hotspotRenderer = new HotspotRenderer();
    hotspotRenderer.init(PLACEHOLDER_HOTSPOTS);
    sceneLayer.addChild(hotspotRenderer.container);

    // Evidence token renderer
    evidenceTokenRenderer = new EvidenceTokenRenderer();

    // Clue Board HUD at bottom of canvas
    clueBoardRenderer = new ClueBoardRenderer();
    clueBoardRenderer.init({ viewportWidth: w, hudHeight: CLUE_BOARD_HEIGHT, requiredSlots: 3 });
    clueBoardRenderer.container.y = SCENE_CANVAS_HEIGHT;
    uiLayer.addChild(clueBoardRenderer.container);

    // Wire slot positions to evidence token renderer
    const slotPositions = clueBoardRenderer.getSlotPositions();
    evidenceTokenRenderer.init(slotPositions);

    // HUD
    hudRenderer = new HudRenderer();
    hudRenderer.init(w, h);
    hudLayer.addChild(hudRenderer.container);

    // 5. Input routing
    app.stage.on('pointertap', (event) => {
      // Mobile audio unlock on first tap
      unlockAudioOnce();

      if (inputLocked) return;
      if (!ecsDb) return;

      const gamePhase = ecsDb.resources.gamePhase;
      if (gamePhase !== 'Investigating') return;

      const pos = event.global;
      // Check if tap is on a hotspot
      const hotspot = PLACEHOLDER_HOTSPOTS.find((h) => {
        const dx = pos.x - h.x;
        const dy = pos.y - h.y;
        return Math.abs(dx) <= 22 && Math.abs(dy) <= 22;
      });

      if (!hotspot) return;

      inputLocked = true;
      const result = ecsDb.actions.tapHotspot({
        hotspotId: hotspot.id,
        outcome: hotspot.outcome,
        evidenceType: hotspot.evidenceType,
        position: [pos.x, pos.y],
        rng: Math.random, // only for non-pure use (controller side, not action side)
      });

      // Animate result
      void _handleTapResult(result).then(() => {
        inputLocked = false;
        // Check phase transitions
        _checkPhaseTransitions();
      });
    });

    // ECS resource observation for tap counter updates
    ecsDb.observe.resources.tapCounter((value) => {
      if (hudRenderer) {
        hudRenderer.updateTapCounter(value, ecsDb!.resources.startingTaps);
      }
    });
  }

  async function _handleTapResult(result: {
    outcome: string;
    evidenceType: string | null;
    position: [number, number];
    slotIndex: number;
    hotspotId: string;
  }): Promise<void> {
    if (!result || !hotspotRenderer || !evidenceTokenRenderer || !clueBoardRenderer) return;

    if (result.outcome === 'locked') {
      hotspotRenderer.playLockedShake(result.hotspotId);
      return;
    }

    if (result.outcome === 'empty') {
      return;
    }

    if (result.outcome === 'red-herring') {
      hotspotRenderer.markSpent(result.hotspotId);
      return;
    }

    if (result.outcome === 'evidence' && result.slotIndex >= 0) {
      hotspotRenderer.markSpent(result.hotspotId);
      await evidenceTokenRenderer.flyToSlot({
        evidenceType: result.evidenceType as import('./state/ClueChasersPlugin').EvidenceType,
        fromPosition: { x: result.position[0], y: result.position[1] },
        slotIndex: result.slotIndex,
        parentContainer: sceneLayer!,
      });
      await clueBoardRenderer.fillSlot(
        result.slotIndex,
        result.evidenceType as import('./state/ClueChasersPlugin').EvidenceType,
      );
    } else if (result.outcome === 'evidence' && result.slotIndex === -1) {
      // Board full — shake source
      hotspotRenderer.markSpent(result.hotspotId);
    }
  }

  function _checkPhaseTransitions(): void {
    if (!ecsDb) return;
    const phase = ecsDb.resources.gamePhase;
    if (phase === 'Loss') {
      setAriaText('The mystery got away… for now!');
      inputLocked = true;
      // Scene desaturate (loss sequence step 1)
      if (sceneRenderer) {
        void sceneRenderer.desaturate(0.35);
      }
    }
  }

  function destroy(): void {
    // Destroy order: GSAP tweens → listeners → removeChild → destroy (guardrail #2/#18)
    gsap.killTweensOf(sceneLayer);
    gsap.killTweensOf(bgLayer);
    gsap.killTweensOf(hudLayer);
    gsap.killTweensOf(uiLayer);

    sceneRenderer?.destroy();
    hotspotRenderer?.destroy();
    evidenceTokenRenderer?.destroy();
    clueBoardRenderer?.destroy();
    hudRenderer?.destroy();

    sceneRenderer = null;
    hotspotRenderer = null;
    evidenceTokenRenderer = null;
    clueBoardRenderer = null;
    hudRenderer = null;

    // Pixi teardown first
    if (app) {
      app.destroy(true, { children: true });
      app = null;
    }

    // Then ECS bridge
    cleanupBridge?.();
    cleanupBridge = null;

    // Release Inspector reference
    setActiveDb(null);
    ecsDb = null;
  }

  return {
    gameMode: 'pixi',
    init,
    destroy,
    ariaText,
  };
}

// Conform to SetupGame contract
export const setupGame = createGameController;
