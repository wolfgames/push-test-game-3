/**
 * Scooby-Doo: Clue Chasers — game entry point.
 *
 * Exports the setupGame and setupStartScreen functions per mygame-contract.ts.
 */
export { setupGame } from './GameController';
export { setupStartScreen } from './screens/startView';
export type {
  GameController,
  GameControllerDeps,
  StartScreenController,
  StartScreenDeps,
  SetupGame,
  SetupStartScreen,
  GameMode,
} from '~/game/mygame-contract';
