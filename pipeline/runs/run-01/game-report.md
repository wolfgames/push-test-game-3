---
type: game-report
game: "Scooby-Doo: Clue Chasers"
pipeline_version: "0.3.8"
run: 1
pass: core
status: partial
features:
  total: 22
  implemented: 22
  partial: 4
  deferred: 0
tests:
  new: 121
  passing: 121
  total: 262
issues:
  critical: 4
  minor: 3
cos:
  - id: core-interaction
    status: partial
    note: "One-gesture tap works; hotspot 44pt targets met; input blocked during animation. Gap: interaction-archetype.md not written; pointer capture not explicitly acquired in handler; ParticleRenderer (red-herring puff) orphaned from GameController."
  - id: canvas
    status: pass
    note: "Scene canvas 688px (844-56-100) at 390px width. Evidence tokens 56pt diameter. Hotspot touch targets 44pt minimum. No HUD/scene overlap. Emoji fallbacks maintain visual distinctiveness. Scooby-Doo theme present."
  - id: animated-dynamics
    status: partial
    note: "All animations are GSAP-only (no rAF). ECS action returns metadata; controller animates. Input blocked during animation. Evidence fly arc (220ms back.out) and clue-board bounce-in (80ms elastic.out) present. Gap: ScoobyRenderer, ParticleRenderer, and win/loss sequence builder (8-step chain) orphaned from GameController — reactions fire in tests but not wired into the live tap handler."
  - id: scoring
    status: partial
    note: "Two multiplicative dimensions present: base completion (1000) × efficiency multiplier (tapsRemaining/startingTaps). Continuous leaderboard striation achieved (1000–2000 range). Gap: maximum score ratio is 2× (2000 vs 1000), not the 3× minimum stated in scoring.md exit criteria. For this hidden-object genre, chain/cascade multipliers are N/A, but the ratio criterion applies."
completeness:
  items_required: 22
  items_met: 17
  items_gaps: 5
blocking:
  cos_failed: []
  completeness_gaps:
    - "interaction-archetype.md not written — game's tap interaction archetype document missing"
    - "score-popup animation at hotspot location not implemented — score display is HUD-only, no in-scene popup"
    - "ParticleRenderer orphaned — red-herring puff (8 particles, 180ms) and dust-disturb particles not wired into GameController tap handler"
    - "DeductionRenderer orphaned — Deduce! button never triggers phase transition to Deduction in live game; suspect card overlay not active"
    - "scoring 3x ratio not achieved — expert/beginner ratio is 2x (2000/1000); scoring.md exit criterion requires 3x minimum"
---

# Pipeline Report: Scooby-Doo: Clue Chasers

## Blocking issues — must resolve before next pass

The following gaps must be resolved before the `secondary` pass can begin. `05-pass-gate` will reject `secondary` until `$runLog.status` is `complete` or explicitly waived.

**CoS partial — `condition-core-interaction`**: Interaction archetype document (`interaction-archetype.md`) not created. Pointer capture not explicitly acquired in `pointertap` handler. ParticleRenderer (red-herring puff VFX) is orphaned from GameController — red-herring taps do not show particle feedback in-game, violating the "every action produces multi-channel feedback" rule.

**CoS partial — `condition-animated-dynamics`**: Win sequence (8-step GSAP timeline), loss sequence, ScoobyRenderer reactions, and ParticleRenderer effects are all implemented as tested modules but are not wired into the live GameController. The game's animated dynamics are tested but not reachable in a running session.

**CoS partial — `condition-scoring`**: The efficiency-based scoring formula has a max 2× expert/beginner ratio (2000 vs 1000). The scoring.md exit criterion requires a skilled player to score at least 3× higher than a beginner. A wider-range dimension (e.g., bonus for speed of collection, disguise-fragment bonus, or a wider multiplier curve) would close this gap.

**Completeness gap — `DeductionRenderer` not wired**: The Deduction Phase (suspect cards, wrong-guess feedback, unmasking flip) is fully implemented and tested but is orphaned from GameController. The Deduce! button's `eventMode` is set to `'static'` when the board fills, but no `pointertap` listener on the Clue Board layer routes to `ecsDb.actions.accuse`. A player cannot complete a case in the running game.

**Completeness gap — `score popup` missing**: GDD and completeness checklist require a score popup animation at the clear location (evidence collection point). Only HUD score display is implemented; no in-scene score popup fires on hotspot tap.

## Features

- [x] ECS game state (ClueChasersPlugin) — implemented; 7 resources, 4 actions, all pure
- [x] Gameplay screen (GameController, Pixi GPU mode) — implemented; wired to tutorial-1 hand-crafted case (stabilize fix)
- [x] Hotspot system — implemented; 44pt touch targets, shimmer, locked shake, spent dimming
- [x] Evidence token (fly-to-board arc 220ms, bounce-in 80ms) — implemented and tested
- [x] Clue Board (5 slots, golden-glow, Deduce! button scale-in) — implemented; button not yet wired to Deduction phase
- [x] Tap counter (decrement, warning pulse at <=3, loss trigger) — implemented and tested
- [x] Scoring star rating (caseScore formula, stars 1-3) — implemented and tested
- [x] Level complete screen (ResultsScreen win variant, star fill, Next Case button) — implemented
- [x] Loss screen (ResultsScreen loss variant, "mystery got away" language) — implemented
- [x] Continue system (5 coins for 5 bonus taps, coin boundary tests) — implemented
- [x] Tutorial system (T1 auto-win, T2 full case, ghost-finger pointer) — implemented; now wired to HAND_CRAFTED_CASES (stabilize fix)
- [x] Hand-crafted levels (T1, T2, Ch1-C1 typed CaseLayout) — implemented and preserved
- [x] Deduction phase (ECS accuse action, wrong-guess decrement) — implemented and tested; visual overlay orphaned
- [x] Suspect cards (3 portrait cards, slide-up animation) — implemented and tested; orphaned from GameController
- [x] Scene generation algorithm (6-step seeded procedural, solvability check) — implemented and tested
- [x] Difficulty curve (Intro/Easy/Easy+/Medium/Medium+/Hard tiers) — implemented
- [x] Scooby companion (idle, reactions, speech bubbles) — implemented and tested; orphaned from GameController
- [x] Win/loss sequences (8-step win chain, 7-step loss chain) — implemented and tested; orphaned from GameController
- [x] VFX particles (pre-allocated pool of 80, red-herring puff, confetti) — implemented and tested; orphaned from GameController
- [x] Audio config (urls key, SFX/VO map) — implemented; verified by test
- [x] Loading screen (Scooby-branded, paw-print progress) — implemented
- [x] Title/start screen (Scooby-Doo: Clue Chasers heading, Investigate! button) — implemented
- [x] Chapter start interstitial — implemented; orphaned (no navigation wiring)
- [x] Chapter complete story reveal — implemented; orphaned
- [x] Chapter progression (3 chapters, case star ratings, locked state) — implemented

## CoS Compliance — pass `core`

| CoS | Status | Evidence / note |
|-----|--------|-----------------|
| `core-interaction` | partial | Tap gesture works; 44pt targets met; input blocking works. Missing: interaction-archetype.md; pointer capture not explicit; ParticleRenderer puff orphaned (no red-herring VFX in live session). |
| `canvas` | pass | Scene canvas 688px at 390px viewport; tokens 56pt; hotspot targets 44pt; no HUD overlap; emoji fallbacks distinctive per evidence type. |
| `animated-dynamics` | partial | All GSAP; ECS/visual separation clean; evidence fly + bounce-in wired. Gap: win/loss 8-step sequences, Scooby reactions, and particle effects all tested but orphaned from live GameController. |
| `scoring` | partial | 2 multiplicative dimensions (base × efficiency); continuous range 1000–2000; tests verify striation. Gap: max ratio 2× vs required 3× minimum. |

## Completeness — pass `core`

| Area | Required | Met | Gaps |
|------|----------|-----|------|
| Interaction | 5 | 4 | 1 (archetype doc) |
| Board & Pieces | 4 | 4 | 0 |
| Core Mechanics | 6 | 4 | 2 (score popup, DeductionRenderer wiring) |
| Scoring (base) | 3 | 2 | 1 (score popup) |
| CoS mandatory | 4 | 1 pass, 3 partial | 3 partial CoS |

## Known Issues

- **Critical**: DeductionRenderer orphaned — player cannot complete a case in live game (Deduce! button visible but unresponsive to stage input)
- **Critical**: ParticleRenderer orphaned — red-herring VFX and confetti burst not active in live session
- **Critical**: Win/loss sequences orphaned — no ordered 8-step win ceremony or 7-step loss sequence fires in live game (only scene desaturate fires in `_checkPhaseTransitions`)
- **Critical**: Scoring 2× ratio gap — scoring.md requires 3× expert/beginner minimum; current formula gives 2× max
- **Minor**: interaction-archetype.md document not written
- **Minor**: Score popup at collection location not implemented
- **Minor**: IntroCutscene, ChapterInterstitial, ChapterCompleteScreen all orphaned from navigation graph

## Deferred

All 19 previously orphaned modules (from `integrate.carry_forward.orphan_wiring_blocked`) are carried forward with the exception of the tutorial hand-crafted cases wiring (closed in this stabilize phase). Deferred to secondary pass:
- DeductionRenderer → GameController wiring (full Deduction Phase: ~80 LOC, exceeds stabilize ceiling)
- ScoobyRenderer → GameController wiring (context reactions: ~70 LOC)
- ParticleRenderer → GameController wiring (VFX per tap event: ~40 LOC, multi-site)
- Win/loss sequence builder → GameController wiring (ordered chains: ~60 LOC)
- IntroCutscene / ChapterInterstitial / ChapterCompleteScreen navigation graph wiring
- Scoring 3× ratio: needs a third scoring dimension (disguise-fragment bonus or speed tier)
- Interaction archetype document (new doc: out of scope for stabilize)

## Recommendations

1. **Primary next-pass task**: Wire DeductionRenderer + accuse action to GameController (highest player-completeness impact; ~80 LOC fix).
2. **Wire win/loss GSAP sequences** into GameController phase transitions — replaces the current minimal `_checkPhaseTransitions()` stub.
3. **Add third scoring dimension** (disguise-fragment bonus: +300 pts when Disguise Fragment collected) to bring expert/beginner ratio to 2.3× → or recalibrate formula to caseScore = 500 * (efficiency + 1.0) + 500 * (disguise_bonus) to reach 3× ceiling.
4. **Wire ScoobyRenderer** and ParticleRenderer as dependency-injected renderers initialized in `GameController.init()`.
5. **Create interaction-archetype.md** describing the tap interaction for this game (pointer capture, threshold, feedback description).
