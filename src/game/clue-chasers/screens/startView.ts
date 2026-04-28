/**
 * Start Screen View — Scooby-Doo: Clue Chasers.
 *
 * GPU canvas shows Mystery Machine animated scene.
 * 'Investigate!' button routes to Tutorial Level 1 (first-time)
 * or Chapter Select (returning player).
 *
 * No DOM in GPU canvas code (guardrail #1).
 */
import type {
  StartScreenDeps,
  StartScreenController,
  SetupStartScreen,
} from '~/game/mygame-contract';

const SEEN_TUTORIAL_KEY = 'cc_seenTutorial';

export const setupStartScreen: SetupStartScreen = (
  deps: StartScreenDeps,
): StartScreenController => {
  let wrapper: HTMLDivElement | null = null;
  let investigateBtn: HTMLButtonElement | null = null;

  return {
    backgroundColor: '#1a1a2e',

    init(container: HTMLDivElement) {
      wrapper = document.createElement('div');
      wrapper.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:flex-end;' +
        'height:100%;padding-bottom:calc(max(env(safe-area-inset-bottom), 56px));gap:16px;';

      const title = document.createElement('h1');
      title.textContent = 'Scooby-Doo: Clue Chasers';
      title.style.cssText =
        'font-size:2rem;font-weight:900;color:#FFD700;margin:0;text-align:center;' +
        'font-family:system-ui,sans-serif;text-shadow:2px 2px 8px rgba(0,0,0,0.8);' +
        'position:absolute;top:40%;left:50%;transform:translateX(-50%);';

      investigateBtn = document.createElement('button');
      investigateBtn.textContent = 'Investigate!';
      investigateBtn.style.cssText =
        'font-size:1.4rem;font-weight:800;padding:16px 56px;border:none;border-radius:16px;' +
        'background:#FFD700;color:#1a1a2e;cursor:pointer;font-family:system-ui,sans-serif;' +
        'box-shadow:0 4px 16px rgba(255,215,0,0.4);min-height:56px;min-width:44px;' +
        'touch-action:none;';

      investigateBtn.addEventListener('click', async () => {
        if (!investigateBtn) return;
        investigateBtn.disabled = true;
        investigateBtn.textContent = 'Loading…';

        await deps.initGpu();
        deps.unlockAudio();
        await deps.loadCore();
        try {
          await deps.loadAudio();
        } catch {
          // Audio optional
        }

        const isReturningPlayer = localStorage.getItem(SEEN_TUTORIAL_KEY) === '1';
        deps.analytics.trackGameStart({
          start_source: 'investigate_button',
          is_returning_player: isReturningPlayer,
        });
        deps.goto('game');
      }, { once: true });

      wrapper.append(title, investigateBtn);
      container.append(wrapper);
    },

    destroy() {
      wrapper?.remove();
      wrapper = null;
      investigateBtn = null;
    },
  };
};
