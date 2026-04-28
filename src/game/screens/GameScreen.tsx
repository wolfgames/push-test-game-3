import { onMount, onCleanup, createEffect } from 'solid-js';
import gsap from 'gsap';

import { useAssets } from '~/core/systems/assets';
import { PauseOverlay, useTuning, type ScaffoldTuning } from '~/core';
import { Logo } from '~/core/ui/Logo';
import { useAudio } from '~/core/systems/audio';
import { useGameTracking } from '~/game/setup/tracking';
import { useScreen } from '~/core/systems/screens';

import type { GameTuning } from '~/game/tuning';
import { useGameData } from '~/game/screens/useGameData';
import { gameState } from '~/game/state';

// Scooby-Doo: Clue Chasers game controller
import { setupGame } from '~/game/clue-chasers/GameController';

export default function GameScreen() {
  const { coordinator } = useAssets();
  const tuning = useTuning<ScaffoldTuning, GameTuning>();
  const audio = useAudio();
  const gameData = useGameData();
  const { core: analytics } = useGameTracking();
  const { goto } = useScreen();
  let containerRef: HTMLDivElement | undefined;

  // Setup game-specific controller (creates signals & effects in reactive context)
  const controller = setupGame({
    coordinator,
    tuning,
    audio,
    gameData,
    analytics,
  });

  // Navigate to results screen when game outcome is set (win or loss).
  // Bridge propagates ECS gamePhase → gameState.gameOutcome.
  // Use GSAP delayedCall (not setTimeout per guardrail #3) to allow
  // GPU animations to begin before screen transition.
  let outcomeTimer: gsap.core.Tween | null = null;
  createEffect(() => {
    const outcome = gameState.gameOutcome();
    if (outcome === 'win' || outcome === 'loss') {
      outcomeTimer?.kill();
      outcomeTimer = gsap.delayedCall(0.8, () => { void goto('results'); });
    }
  });

  onMount(() => {
    if (containerRef) controller.init(containerRef);
  });

  onCleanup(() => {
    outcomeTimer?.kill();
    outcomeTimer = null;
    controller.destroy();
  });

  return (
    <div class="fixed inset-0 bg-black">
      {/* Engine canvas container */}
      <div
        ref={containerRef}
        class="absolute inset-0"
      />

      {/* Accessibility: Screen reader announcements */}
      <div
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {controller.ariaText()}
      </div>

      {/* Pause overlay */}
      <PauseOverlay />

      {/* Wolf Games logo at bottom center */}
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Logo />
      </div>
    </div>
  );
}
