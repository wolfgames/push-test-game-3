/**
 * ResultsScreen — win and loss variants for Scooby-Doo: Clue Chasers.
 *
 * Valid screen ID: 'results' (loading|start|game|results — guardrail: scaffold-state).
 * No 'Game Over' text — GDD wins (collision resolved in plan).
 * Safe area aware: padding-bottom accounts for 56px Logo DOM overlay.
 */
import { Show, For, createMemo } from 'solid-js';
import { useScreen } from '~/core/systems/screens';
import { Button } from '~/core/ui/Button';
import { gameState } from '~/game/state';

const RESERVED_BOTTOM_PX = 56;

export function ResultsScreen() {
  const { goto } = useScreen();

  const isWin = createMemo(() => gameState.gameOutcome() === 'win');
  const stars = createMemo(() => gameState.starsEarned());
  const villain = createMemo(() => gameState.villainName() || 'The Villain');
  const score = createMemo(() => gameState.score());
  const coins = createMemo(() => gameState.coinBalance());

  const handleNextCase = () => {
    gameState.reset();
    goto('game');
  };

  const handleTryAgain = () => {
    gameState.setGameOutcome(null);
    goto('game');
  };

  const handleMainMenu = () => {
    gameState.reset();
    goto('start');
  };

  return (
    <div
      class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black px-6"
      style={{ 'padding-bottom': `${RESERVED_BOTTOM_PX}px` }}
    >
      <Show
        when={isWin()}
        fallback={
          /* Loss variant — 'The mystery got away… for now!' (GDD language, guardrail #15) */
          <div class="flex flex-col items-center gap-6 w-full max-w-sm">
            <div class="text-center">
              <p class="text-5xl mb-2">🐕</p>
              <h1 class="text-2xl font-bold text-white mb-2">
                The mystery got away… for now!
              </h1>
              <p class="text-white/60 text-sm">
                Coins: {coins()} 🪙
              </p>
            </div>

            <div class="flex flex-col gap-3 w-full">
              <Button onClick={handleTryAgain}>
                Try Again
              </Button>
              <Show when={coins() >= 5}>
                <Button variant="secondary" onClick={() => {
                  /* Keep Going: handled by GameController coin spend */
                  gameState.setCoinBalance(coins() - 5);
                  gameState.setGameOutcome(null);
                  goto('game');
                }}>
                  Keep Going (5 🪙)
                </Button>
              </Show>
              <Show when={coins() < 5}>
                <Button variant="secondary" disabled>
                  Keep Going — Not enough coins
                </Button>
              </Show>
              <Button variant="secondary" onClick={handleMainMenu}>
                Main Menu
              </Button>
            </div>
          </div>
        }
      >
        {/* Win variant — villain unmasking + star rating */}
        <div class="flex flex-col items-center gap-6 w-full max-w-sm">
          {/* Villain name banner */}
          <div class="text-center">
            <p class="text-5xl mb-2">🎭</p>
            <h1 class="text-2xl font-bold text-yellow-400 mb-1">
              Case Solved!
            </h1>
            <p class="text-lg text-white/80">
              It was {villain()}!
            </p>
          </div>

          {/* Star fill animation (1-3 stars) */}
          <div class="flex gap-3 text-4xl">
            <For each={[1, 2, 3]}>
              {(i) => (
                <span
                  class="transition-all duration-200"
                  style={{
                    opacity: i <= stars() ? '1' : '0.2',
                    transform: i <= stars() ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  ⭐
                </span>
              )}
            </For>
          </div>

          <div class="text-center">
            <p class="text-white/60 text-sm mb-1">Score</p>
            <p class="text-4xl font-bold text-white">{score()}</p>
          </div>

          <div class="flex flex-col gap-3 w-full">
            <Button onClick={handleNextCase}>
              Next Case →
            </Button>
            <Button variant="secondary" onClick={handleMainMenu}>
              Main Menu
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
}
