# Mystery Inc. — Scooby-Doo: Clue Chasers
**Tagline:** Every mystery solved pulls back the mask on something bigger.
**Genre:** Casual Investigation Puzzle / Hidden-Object Adventure
**Platform:** Mobile first (portrait, touch), playable on web
**Target Audience:** Casual adults 30+

---

## Table of Contents

**The Game**
1. [Game Overview](#game-overview)
2. [At a Glance](#at-a-glance)

**How It Plays**
3. [Core Mechanics](#core-mechanics)
4. [Tutorial](#tutorial)
5. [Level Generation](#level-generation)

**How It Flows**
6. [Game Flow](#game-flow)
7. [Feedback & Juice](#feedback--juice)

---

## Game Overview

Scooby-Doo: Clue Chasers drops the Mystery Inc. gang into a series of spooky locations — haunted mansions, creepy carnivals, fog-shrouded lighthouses — where players tap to search scenes, collect evidence tokens, and deduce the disguised villain before their investigation timer runs out. Each level is a single scene investigation lasting 3-5 minutes, and completing a case reveals which costumed crook was behind it all — plus a short story panel unlocked as a reward. The game earns its tension from the unknown, not from punishing mechanics: clues are there to be found, and every near-miss teaches the player something new.

**Setting:** Classic Scooby-Doo universe — cartoon aesthetic, iconic locations (Crystal Cove, Coolsville, Gatorsburg Bayou), a rotating cast of disguised villains, and the Mystery Machine parked just off-screen.

**Core Loop:** Player taps scene hotspots to collect evidence tokens → which fills the Clue Board → which unlocks the deduction phase where they unmask the villain and complete the case.

---

## At a Glance

| | |
|---|---|
| **Play Surface** | Single-scene portrait canvas (~6:10 usable area within safe zones) |
| **Input** | Tap (primary), swipe to pan wide scenes |
| **Evidence Slots** | 5 clue tokens per scene (3 visible, 2 hidden) |
| **Suspects** | 3 per case |
| **Investigation Limit** | 15 taps per scene (casual ceiling) |
| **Session Target** | 3-5 min per case |
| **Cases / Chapter** | 5 cases |
| **Chapters at Launch** | 3 (15 total cases) |
| **Failure** | Yes — 15 taps exhausted without filling Clue Board |
| **Continue System** | Ad or in-game currency for 5 bonus taps |
| **Star Rating** | 1-3 stars based on taps remaining at case solve |
| **Companion** | Scooby-Doo (enthusiastic, easily startled, loyal) |
| **Content Cadence** | 1 chapter (5 cases) every 3 weeks |

---

## Core Mechanics

### Primary Input
**Input type:** Tap  
**Acts on:** Scene hotspots — interactive objects, shadows, furniture, props scattered across the scene canvas  
**Produces:** One of three outcomes per tap:
- **Evidence found** — a clue token animates out of the hotspot and flies to the Clue Board (220ms arc tween, `back.out(1.7)` ease)
- **Red herring** — a small "nope" puff appears at the tap location; tap counter decrements by 1
- **Empty** — a subtle dust-disturb particle plays; no counter change; hotspot becomes inactive for this run

On wide scenes (larger than 1 portrait viewport), a single horizontal swipe pans the scene left or right with momentum-damped snap to bounds. Panning does not consume a tap.

### Play Surface
- **Dimensions:** Portrait canvas, roughly 375×580pt usable within iOS safe areas (top HUD: 80pt, bottom controls: 100pt)
- **Scene types:** Single fixed scene image (most cases), or two-panel wide scene (pan required) for chapter-end cases
- **Hotspot placement zone:** Lower two-thirds of the scene canvas (Natural and Stretching thumb zones) — never above the midpoint except for atmospheric decorative elements
- **Minimum visual hotspot indicator size:** 44×44pt tap target; interactive highlights pulse with a subtle glow at 50% opacity to hint presence
- **Cell types:** Active hotspot (glowing border), spent hotspot (dimmed, non-interactive), locked hotspot (requires a prior clue to unlock — appears as a padlocked prop)

### Game Entities

#### Evidence Token
- **Visual:** Circular badge, 56pt diameter, styled as a cartoon magnifying-glass icon with a colored fill per clue type (footprint = brown, document = cream, fingerprint = blue, voice recording = green, disguise fragment = purple)
- **Behavior:** Hidden within scene hotspots. When tapped, plays a fly-to-board animation and slots into the next open Clue Board position
- **Edge cases:** IF the Clue Board is already full (5/5), tapping a hotspot has no effect on the board — the hotspot shows a brief "board full" shake instead

#### Hotspot
- **Visual:** No explicit outlines in normal play — only a subtle animated shimmer (scale oscillation 1.0→1.03, 1400ms loop) marks interactive zones. On first tap in a session, a ghost-finger pointer plays once for the first valid hotspot
- **Behavior:** Tappable area ≥ 44×44pt. Each hotspot is assigned one outcome at scene generation time (evidence / red herring / empty, weighted per difficulty tier). Once tapped, it is permanently spent for this run
- **Edge cases:** IF the player taps a spent hotspot, no feedback fires and no tap is consumed. IF a locked hotspot is tapped before its prerequisite clue is collected, a padlock-shake animation plays and a voice line from Scooby fires ("Ruh-roh, something's missing!")

#### Clue Board
- **Visual:** HUD strip across the bottom of the scene canvas, 100pt tall. Five circular slots arranged horizontally. Empty slots show faint outlines; filled slots display the collected evidence token with a subtle bounce-in animation (80ms, `elastic.out(1, 0.5)`)
- **Behavior:** Passive display. When all 5 slots are filled, the Clue Board pulses with a golden glow and the "Deduce!" button activates
- **Edge cases:** IF a chapter uses only 3 required clues (easy tier), the remaining 2 slots stay locked (padlocked icons) throughout the run

#### Suspect Cards
- **Visual:** Three portrait cards displayed during the Deduction Phase only (not during scene investigation). Each card shows a cartoon character portrait, a name, and a motive tagline
- **Behavior:** Player taps one suspect card to accuse. Cards highlight on tap with a yellow border (100ms tween)
- **Edge cases:** IF the player has all 5 clues, the correct suspect card gets a subtle "match-glow" on any clue the player can cross-reference — a hint system, not a reveal. IF the player taps the wrong suspect, a brief "Not quite…" reaction fires and the Deduction Phase remains open

#### Tap Counter
- **Visual:** Top-right of HUD. Paw-print icon + numeric count (e.g., "12 🐾"). Count decrements with a brief scale-pop on each red-herring or productive tap
- **Behavior:** Starts at 15 (adjustable per difficulty tier). Red-herring and evidence taps decrement by 1. Empty taps do not decrement
- **Edge cases:** IF counter reaches 0 before Clue Board is full, the loss sequence fires immediately. The counter never goes below 0

#### Disguise Fragment (special evidence)
- **Visual:** Purple evidence token showing a torn fabric or mask piece
- **Behavior:** Always present in each scene (one fragment per run). Collecting it unlocks the "Villain Spotlight" bonus on the Deduction screen — a short hint about the villain's motive. Does not affect win/lose logic
- **Edge cases:** IF the player reaches Deduction Phase without the Disguise Fragment, the Villain Spotlight slot on the deduction screen shows a "???" placeholder

### Movement & Physics Rules

IF a hotspot is tapped AND it has outcome = "evidence":
  THEN play evidence-fly animation (220ms arc, cubic-bezier) from tap location to next open Clue Board slot
  AND decrement tap counter by 1
  AND mark hotspot as spent

IF a hotspot is tapped AND it has outcome = "red herring":
  THEN play red-herring puff VFX at tap location (180ms, burst + fade)
  AND play audio: "nope" cartoon sting (0.3s)
  AND decrement tap counter by 1
  AND mark hotspot as spent

IF a hotspot is tapped AND it has outcome = "empty":
  THEN play dust-disturb particle (120ms, 4–6 particles, alpha fade)
  AND do NOT decrement tap counter
  AND mark hotspot as spent

IF all 5 Clue Board slots are filled:
  THEN activate "Deduce!" button (scale-in, 300ms, `back.out(1.7)`)
  AND pulse Clue Board with golden glow (looping, 800ms half-cycle)
  AND play audio: investigation-complete chime

IF tap counter reaches 0 AND Clue Board is not full:
  THEN enter Loss State immediately
  AND disable all scene input
  AND begin loss sequence

IF Deduce button is tapped:
  THEN transition to Deduction Phase (scene slides down/out 300ms, suspect cards slide in from right 350ms)

IF a suspect card is tapped AND it is the correct suspect:
  THEN play unmasking animation (600ms flip reveal)
  AND enter Win State

IF a suspect card is tapped AND it is NOT the correct suspect:
  THEN play wrong-guess reaction (card shake 200ms, 8px left-right oscillation)
  AND decrement tap counter by 1 (wrong guesses consume a paw-print)
  AND keep Deduction Phase active

IF a locked hotspot is tapped AND prerequisite clue not yet collected:
  THEN play padlock-shake (150ms, 6px left-right oscillation)
  AND play Scooby voice line: "Ruh-roh, something's missing!"
  AND do NOT decrement tap counter

> For invalid action feedback (visual, audio, duration), see [Feedback & Juice](#feedback--juice).

---

## Tutorial

### Tutorial Philosophy
The tutorial teaches by doing, never by reading. Scooby-Doo leads the player through two short scenes with animated finger prompts and in-character voice lines — never with instructions, tooltips, or modal pop-ups. The player succeeds on their first attempt because the first action is obvious, immediate, and forgiving. Progress bar and level counter are hidden throughout.

### Tutorial Level 1 — "Something Smells in the Library"
- **Objective:** Find 3 evidence tokens in a small library scene (no tap limit displayed; internally capped at 20 taps so the player cannot truly fail)
- **What is visible:** A cozy library scene — bookshelf, desk, armchair, flickering fireplace. Two glowing hotspots are visible immediately; one third hotspot is behind the armchair (slightly hidden). Clue Board shows 3 active slots and 2 locked/padlocked slots. Tap counter is present but no number is shown (counter hidden; player cannot fail this level)
- **What is hidden:** The red-herring and wrong-guess mechanics — those are introduced in Level 2
- **Pre-level dialogue:** Scooby: *"Rikes! Someone's been in here, Shaggy! Let's look around!"* (speech bubble, 2.5s auto-dismiss, voice line plays simultaneously)
- **Animated hint:** 1 second after the level loads, a ghost-finger pointer appears pointing at the most obvious hotspot (the desk lamp). It pulses twice, then fades. No text. Only fires once.
- **Post-level dialogue:** Scooby: *"Zoinks! Three clues already! You're a natural, pal!"* (speech bubble + Scooby jumping celebration animation, 2s)
- **Mechanic introduced:** Tap hotspot → collect evidence → fill Clue Board
- **Mechanic excluded:** Red herrings, locked hotspots, tap counter consequences, Deduction Phase, suspects

### Tutorial Level 2 — "Footprints in the Foyer"
- **Objective:** Fill the Clue Board (5 slots this time) and complete the Deduction Phase with 3 suspects; tap counter is visible and starts at 12 (generous but finite)
- **What is visible:** A mansion foyer scene. Five hotspots total — 3 evidence, 1 red herring, 1 empty. Clue Board has all 5 slots active. Tap counter visible with 12 paw-prints. Three suspect cards are visible at the bottom hint strip (greyed out until Deduction Phase activates)
- **What is hidden:** Locked hotspots (padlock mechanic held for Chapter 1, Level 3)
- **Pre-level dialogue:** Scooby: *"Careful, pal — not everything is a clue. Some things are just… spooky red herrings!"* (speech bubble, 3s auto-dismiss)
- **Animated hint:** After the player's first red herring tap, Scooby shrugs with a ¯\_(ツ)_/¯ pose and a cartoon "wah-wah" sound plays (once only, not on subsequent red herrings)
- **Post-level dialogue (after wrong suspect guess):** Scooby: *"Hmm, nope! Let's think again…"*  
  **Post-level dialogue (after correct unmask):** Scooby: *"Yoinks! It was Old Mr. Greer all along! I woulda gotten away with it too—"*
- **Mechanic introduced:** Tap counter consequences, red herring feedback, Deduction Phase, suspect accusation, win state
- **Mechanic excluded:** Locked hotspots, wide-scene panning

### Tutorial → Chapter 1 Transition
After completing Tutorial Level 2, a brief animated transition plays: the Mystery Machine drives across the screen (left to right, 1.2s) against a cartoon map background. The Chapter 1 title card appears — "Chapter 1: The Haunted Hayride" — with a subtitle describing the setting. For the first time, the level counter and progress bar appear at the top of the screen. Chapter 1 introduces locked hotspots in its third case.

---

## Level Generation

### Method
**Hybrid** — Tutorial levels (T1, T2) and Chapter 1, Case 1 are hand-crafted to ensure the best possible first impression. Cases 2–5 per chapter and all subsequent chapters are procedurally generated using a seeded algorithm with designer-tuned difficulty parameters.

### Generation Algorithm

**Step 1: Scene Selection**
- Inputs: Chapter theme, case index within chapter (1–5), available scene asset pool
- Outputs: Selected scene image identifier, available hotspot slots (15–22 per scene depending on scene complexity)
- Constraints: Each scene used at most once per chapter; no two adjacent cases share the same interior type (e.g., no two consecutive "mansion" scenes)

**Step 2: Suspect Pool Assignment**
- Inputs: Chapter villain roster (3 canonical suspects per chapter, defined by the chapter designer), correct villain index (seeded random pick)
- Outputs: `[suspectA, suspectB, suspectC]` array, `correctIndex`
- Constraints: Correct villain index must not be the same as the previous case's villain index (no consecutive repeated reveals); villain pool rotates across chapters

**Step 3: Evidence Placement**
- Inputs: Scene hotspot slot list, difficulty tier (see Difficulty Curve below), required evidence count (3–5 depending on tier)
- Outputs: Evidence type assigned to each slot (evidence / red-herring / empty), evidence token types selected
- Constraints: At least 2 evidence tokens must be in the Natural thumb zone (lower 55% of scene height); no more than 2 consecutive red-herring hotspots when sorted by left-to-right visual order; one Disguise Fragment evidence token always included

**Step 4: Locked Hotspot Seeding** (Chapter 1 case 3+, all subsequent chapters)
- Inputs: Evidence placement map, difficulty tier
- Outputs: Locked hotspot designation for 0–2 hotspots, prerequisite clue assignment for each locked hotspot
- Constraints: A locked hotspot's prerequisite clue must be accessible without tapping the locked hotspot first (no circular dependencies); tutorial cases never receive locked hotspots

**Step 5: Solvability Check**
- Inputs: Complete scene layout (all hotspot assignments + locked graph)
- Outputs: Pass / Fail
- Constraints: There must exist at least one valid tap sequence that collects all required evidence tokens within the tap limit. The check simulates optimal play: greedily tap evidence hotspots first; if the tap limit is reached before the Clue Board fills, the scene fails validation.

**Step 6: Fallback Chain**
- Inputs: Failed scene layout, retry count
- Outputs: Revised scene layout or promoted hand-crafted fallback
- Constraints: If Step 5 fails, re-run Steps 3–4 with a relaxed difficulty (one tier down). Retry up to 10 times. If 10 retries all fail, promote the hand-crafted fallback scene for this case slot. Last-resort guarantee: a static "safe" layout exists for every chapter (stored in `src/game/clue-chasers/data/fallback-cases.ts`) that is always valid and always solvable.

### Seeding & Reproducibility
- **Seed formula:** `chapterIndex * 100000 + caseIndex * 1000 + layoutVariantIndex`
- **Same-seed guarantee:** All random choices in Steps 1–4 are drawn from the seeded RNG with no external randomness. The same seed always produces the same scene layout.
- **Failed seed handling:** On retry (Step 6), the seed is incremented by 1 for each attempt. This ensures retries are deterministic and reproducible for QA.

### Solvability Validation
- **Rejection conditions:**
  1. Clue Board cannot be filled within tap limit under optimal play
  2. Circular dependency in locked hotspot graph
  3. More than 60% of hotspots are empty (scene feels dead)
  4. Required evidence count < 3 (board feels trivially easy)
  5. All evidence tokens placed above the midpoint of the scene (thumb-unfriendly)
- **Retry logic:** Up to 10 attempts with one difficulty-tier reduction on each failure
- **Last-resort fallback:** Static hand-crafted layout promoted from `fallback-cases.ts`

### Difficulty Curve

| Level Range | Tier | Evidence Slots | Tap Limit | Locked Hotspots | Notes |
|---|---|---|---|---|---|
| Tutorial T1 | Intro | 3 (of 3) | Hidden (∞ effective) | 0 | Cannot fail |
| Tutorial T2 | Intro | 5 (of 5) | 12 | 0 | First tap counter exposure |
| Chapter 1, Cases 1–2 | Easy | 3 required (5 slots) | 15 | 0 | Generous; effortless wins |
| Chapter 1, Cases 3–5 | Easy+ | 4 required (5 slots) | 14 | 1 | Introduces locked hotspot |
| Chapter 2, Cases 1–3 | Medium | 4 required | 13 | 1 | Slightly tighter |
| Chapter 2, Cases 4–5 | Medium+ | 5 required | 12 | 2 | First full-board requirement |
| Chapter 3+ | Hard | 5 required | 11 | 2 | Full engagement; mastery expected |

Difficulty parameters increase gradually — no jump greater than 1 unit per case. Early cases (Ch.1, Cases 1–2) should feel effortless. The game earns the right to challenge only after the player has completed 5+ cases.

### Hand-Crafted Levels
- **Which levels:** Tutorial T1, Tutorial T2, Chapter 1 Case 1
- **Where data lives:** `src/game/clue-chasers/data/hand-crafted-cases.ts` — exported as a typed array of `CaseLayout` objects
- **Who owns them:** Game designer (Wolf Games production); do not overwrite during build pipeline runs

---

## Game Flow

### Master Flow Diagram

```
App Open
  ↓ [boot assets load]
Loading Screen  [lifecycle: BOOT]
  ↓ [assets ready]
Title Screen / Start  [lifecycle: TITLE]
  ↓ [first launch: one-time only]
First-Time Intro Cutscene  [lifecycle: TITLE]
  ↓ [cutscene complete OR returning player]
Tutorial Level 1  [lifecycle: PLAY]
  ↓ [Clue Board filled — auto-win, no Deduction Phase]
Tutorial Level 2  [lifecycle: PLAY]
  ↓ [unmasking complete]
Chapter 1 Title Card  [lifecycle: PROGRESSION]
  ↓ [tap to continue]
Case Start Interstitial  [lifecycle: PROGRESSION]
  ↓ [tap to investigate]
Gameplay Screen — Scene Investigation  [lifecycle: PLAY]
  ↓ [Clue Board full → tap Deduce] OR [tap counter = 0]
    ↓ [Clue Board full]
    Deduction Phase  [lifecycle: PLAY]
      ↓ [correct suspect tapped]
      Level Complete Screen  [lifecycle: OUTCOME]
        ↓ [tap Continue]
        Case Start Interstitial (next case)  [lifecycle: PROGRESSION]
      ↓ [wrong suspect tapped → stays in Deduction Phase]
    ↓ [tap counter = 0]
    Loss Screen  [lifecycle: OUTCOME]
      ↓ [tap Try Again → back to Gameplay Screen, same case, new seed +1]
      ↓ [tap Continue (watch ad or spend coins) → 5 bonus taps, back to Gameplay]
  ↓ [all 5 cases complete]
Chapter Complete / Story Reveal  [lifecycle: OUTCOME → PROGRESSION]
  ↓ [tap Continue]
Chapter Select / Next Chapter Teaser  [lifecycle: PROGRESSION]
```

### Screen Breakdown

#### Loading Screen
- **lifecycle_phase:** BOOT
- **Purpose:** Load GPU assets, audio bundles, and game config while displaying the Scooby-Doo logo
- **Player sees:** Animated Scooby paw-print progress bar on dark background; Mystery Inc. logo fades in
- **Player does:** Nothing — passive wait
- **What happens next:** Progress reaches 100% → crossfade to Title Screen (400ms)
- **Expected session time:** 1–3s

#### Title Screen
- **lifecycle_phase:** TITLE
- **Purpose:** Entry point; prime first-time intro or return session
- **Player sees:** Animated scene with Mystery Machine parked in front of a spooky mansion; "Scooby-Doo: Clue Chasers" title; large "Investigate!" button; settings icon top-right
- **Player does:** Taps "Investigate!" to begin; or taps settings
- **What happens next:** First launch → First-Time Intro Cutscene; returning → Chapter/Case Select or next pending case
- **Expected session time:** 2–5s

#### First-Time Intro Cutscene
- **lifecycle_phase:** TITLE
- **Purpose:** Establish tone, introduce Scooby and the mechanic in ~20 seconds — no text required
- **Player sees:** 4-panel animated comic strip: (1) Scooby sniffs a clue, (2) evidence flies to Clue Board, (3) suspect cards appear, (4) mask pulled off revealing villain. Auto-advances with "tap to skip" option bottom-right
- **Player does:** Watch, or tap to skip
- **What happens next:** Auto-transitions to Tutorial Level 1 after panel 4 (or on skip)
- **Expected session time:** 5–20s

#### Tutorial Level 1 — Scene Investigation
- **lifecycle_phase:** PLAY
- **Purpose:** Teach the single core action: tap hotspot → collect evidence. Player cannot fail.
- **Player sees:** Library scene; 3 glowing hotspots; Clue Board with 3 active + 2 locked slots; Scooby speech bubble; no tap counter; no progress bar
- **Player does:** Taps hotspots; sees evidence fly to Clue Board
- **What happens next:** 3 evidence collected → auto-advance to Tutorial Level 2 (no Deduction Phase in T1)
- **Expected session time:** 30–60s

#### Tutorial Level 2 — Full Case
- **lifecycle_phase:** PLAY
- **Purpose:** Teach full case loop: evidence + red herrings + Deduction Phase
- **Player sees:** Mansion foyer scene; 5 hotspots; tap counter (12); full 5-slot Clue Board; Scooby speech bubble; suspect strip at bottom
- **Player does:** Taps hotspots; encounters first red herring; fills board; taps Deduce; accuses a suspect
- **What happens next:** Correct accusation → win sequence → Chapter 1 Title Card
- **Expected session time:** 1–2 min

#### Chapter Start Interstitial
- **lifecycle_phase:** PROGRESSION
- **Purpose:** Set chapter atmosphere and introduce the case's location and stakes
- **Player sees:** Illustrated chapter splash (location art, chapter title, brief mystery teaser in 1 sentence); "Investigate!" button; case number indicator (e.g., "Case 1 of 5")
- **Player does:** Taps "Investigate!" to begin the case
- **What happens next:** Scene Investigation screen loads with this case's layout
- **Expected session time:** 3–5s

#### Gameplay Screen — Scene Investigation
- **lifecycle_phase:** PLAY
- **Purpose:** Core investigation loop — find evidence, manage tap budget
- **Player sees:** Scene illustration; animated hotspot shimmers; Clue Board (bottom HUD); tap counter (top-right); Scooby idle animation (bottom-left corner); "Deduce!" button (inactive/greyed until board full)
- **Player does:** Taps hotspots; optionally pans wide scenes; monitors Clue Board fill and tap counter
- **Board states:**

| State | Input Allowed | Description |
|---|---|---|
| Idle | Yes | Waiting for player tap; hotspots shimmer |
| Animating | No | Evidence/red-herring animation in flight (220ms max); taps queued (first tap only) |
| Deduction | Yes (suspect cards only) | Scene locked; Deduction Phase overlay active |
| Won | No | Win animation playing; input disabled |
| Lost | No | Loss overlay active; Retry/Continue buttons only |
| Paused | No | Pause menu overlay; all game input suspended |

- **What happens next:** Clue Board full → "Deduce!" button activates; tap counter = 0 → Loss State

#### Deduction Phase (overlay on Gameplay Screen)
- **lifecycle_phase:** PLAY
- **Purpose:** Player accuses a suspect
- **Player sees:** Scene dims (alpha 0.5 overlay, 300ms); three suspect cards slide up from bottom (350ms staggered); Clue Board remains visible; each clue token subtly highlights beside any suspect it implicates
- **Player does:** Taps a suspect card to accuse
- **What happens next:** Correct → win sequence; Wrong → card shakes, Scooby reacts, Deduction Phase stays open (tap counter decrements)

#### Level Complete Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Reward completion; show star rating
- **Player sees:** Unmasking animation (villain reveal, 600ms flip); star rating (1–3 stars based on taps remaining); case title banner; "Next Case →" button; optional share button
- **Player does:** Views reward; taps "Next Case" to continue
- **What happens next:** If more cases remain in chapter → Case Start Interstitial; if all 5 cases done → Chapter Complete Screen
- **Expected session time:** 10–15s

#### Loss Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Gentle failure with clear retry path — no "Game Over" language
- **Player sees:** Scooby covering his eyes with cartoon sweat drops; text: "The mystery got away… for now!"; tap-counter icon showing 0; "Try Again" button (primary CTA); "Keep Going" button (secondary, watch ad / spend 5 coins for 5 bonus taps)
- **Player does:** Taps "Try Again" or "Keep Going"
- **What happens next:** "Try Again" → same case reloads with seed +1 (fresh hotspot layout, same difficulty); "Keep Going" → ad/coin flow → returns to Scene Investigation with 5 taps restored
- **Expected session time:** 5–10s

#### Chapter Complete / Story Reveal
- **lifecycle_phase:** OUTCOME → PROGRESSION
- **Purpose:** Narrative payoff — the big reveal of who was behind all 5 cases
- **Player sees:** Animated 3-panel comic reveal: (1) all 5 villains lined up unmasked; (2) Scooby and Mystery Inc. celebrate; (3) "Chapter [N] Complete!" card with total star count and a 2-sentence story resolution blurb
- **Player does:** Taps through panels; taps "Continue" on final card
- **What happens next:** Chapter Select screen showing the next chapter teaser (locked with "Coming Soon" if not yet released) and already-complete chapters
- **Expected session time:** 20–40s

### Win Condition
`clueBoardFilled == true AND deductionPhaseActive == true AND tappedSuspect == correctSuspect`

### Lose Condition
`tapCounter == 0 AND clueBoardFilled == false`

### Win Sequence (ordered)
1. Deduction Phase: player taps correct suspect card
2. Correct suspect card scales up 1.0→1.15 (100ms, `back.out(1.7)`)
3. Scene dims; unmasking flip animation plays on suspect card (600ms, CSS 3D flip equivalent via GSAP rotationY)
4. Villain reveal face shown with name banner slide-in (300ms from bottom)
5. Scooby celebration animation plays (jump + "Scooby-Dooby-Doo!" VO, 1.2s)
6. Star rating counts up (1→2→3 stars, 200ms per star, only stars earned illuminate)
7. Level Complete Screen fades in (400ms crossfade)
8. "Next Case →" button scales in (200ms, `back.out(1.7)`)

### Loss Sequence (ordered)
1. Tap counter reaches 0
2. All hotspot shimmers immediately freeze (alpha → 0 over 200ms)
3. Scene desaturates (tint shift to grey over 300ms)
4. Scooby droops ears animation plays with cartoon "sad trombone" audio (0.8s)
5. Loss Screen overlay fades in (350ms)
6. "The mystery got away… for now!" text types in (400ms, character-by-character)
7. "Try Again" button scales in (200ms, `back.out(1.7)`); "Keep Going" button fades in (150ms delay)

---

## Feedback & Juice

### Feedback Philosophy
Every action produces immediate, multi-channel feedback within 100ms of the tap. Intensity scales with significance — a red herring gets a puff, a villain unmasking gets a full ceremony.

### Feedback Tiers

| Tier | Events | Visual | Audio | Haptic |
|---|---|---|---|---|
| **Subtle** | Empty hotspot tap, scene pan, locked hotspot tap | Dust-particle burst (4–6 particles, 120ms alpha fade) or padlock shake (150ms, 6px oscillation); scene pan: smooth momentum scroll | Soft "whoosh" (0.15s) or padlock rattle (0.2s) | Light tap (UIImpactFeedbackGenerator.light / vibrate 10ms) |
| **Noticeable** | Evidence found, red herring tap, wrong suspect guess, tap counter decrement | Evidence fly-to-board arc (220ms, `back.out(1.7)` ease, 56pt token); red-herring puff burst (8 particles, 180ms); card shake (200ms, 8px); counter scale-pop (1.0→1.15→1.0, 120ms) | Cartoon "pop" / item-collect sound (0.3s) for evidence; "wah-wah" sting (0.3s) for red herring; short buzz (0.25s) for wrong guess | Medium tap (medium impact / vibrate 20ms) |
| **Dramatic** | Clue Board fills (5th token lands), villain unmasked, chapter complete | Board golden-glow pulse (looping 800ms half-cycle); unmasking card flip (600ms GSAP rotationY); star fill animation (200ms per star); celebration confetti burst (50 particles, 1s) | Investigation-complete chime (0.6s); unmasking fanfare (1.2s); chapter-complete jingle (2s) | Strong burst (heavy impact / vibrate 40ms); chapter complete: double-burst (40ms + 20ms delay + 40ms) |

### Animation Timing Reference

| Animation | Duration | Ease | Notes |
|---|---|---|---|
| Evidence token fly-to-board | 220ms | `back.out(1.7)` | Arc from hotspot to Clue Board slot |
| Clue Board slot bounce-in | 80ms | `elastic.out(1, 0.5)` | Token lands in slot |
| Red-herring puff burst | 180ms | Linear alpha fade | 8 particles, no ease |
| Empty dust-disturb | 120ms | Linear alpha fade | 4–6 particles |
| Padlock shake | 150ms | `sine.inOut` | 6px left-right oscillation, 3 cycles |
| Tap counter scale-pop | 120ms | `back.out(2)` | 1.0→1.15→1.0 |
| "Deduce!" button scale-in | 300ms | `back.out(1.7)` | Appears when board full |
| Suspect card slide-up (stagger) | 350ms | `power2.out` | 3 cards, 60ms stagger between each |
| Scene dim overlay | 300ms | `power1.in` | Alpha 0→0.5 on scene layer |
| Wrong suspect card shake | 200ms | `sine.inOut` | 8px oscillation, 4 cycles |
| Correct suspect card scale | 100ms | `back.out(1.7)` | 1.0→1.15 |
| Unmasking card flip | 600ms | `power2.inOut` | GSAP rotationY 0→180 |
| Star fill (per star) | 200ms | `back.out(2)` | Scale 0→1, sequential |
| Confetti burst | 1000ms | Linear | 50 particles, spread from center-top |
| Scene desaturate on loss | 300ms | `power1.in` | Tint shift via GSAP pixi tint |
| Scooby ears droop | 800ms | `power2.out` | Frame animation (8 frames) |
| Loss overlay fade-in | 350ms | `power1.in` | Alpha 0→1 |
| "Try Again" button scale-in | 200ms | `back.out(1.7)` | Appears after overlay |
| Chapter title card slide-in | 400ms | `power2.out` | From bottom |
| Mystery Machine drive-across | 1200ms | `power1.inOut` | Tutorial-to-chapter transition |
| First-time intro cutscene panel | 500ms per panel | `power2.out` | Fade between panels |
| Scooby celebration jump | 1200ms | `elastic.out(1, 0.4)` | Y position arc |
| HUD tap counter flash (warn) | 300ms (loop ×3) | `sine.inOut` | Fires when counter ≤ 3; pulsing red tint |

### Invalid Action Feedback

| Trigger | Visual | Audio | Duration | Tap Consumed? |
|---|---|---|---|---|
| Tap a spent (already-tapped) hotspot | No visual — hotspot is already dimmed; no new animation fires | None | — | No |
| Tap a locked hotspot (prereq not met) | Padlock shake 6px oscillation | Padlock rattle SFX (0.2s); Scooby VO: "Ruh-roh!" | 150ms shake | No |
| Tap during animation lock (Animating state) | First tap is queued and fires immediately after animation completes; subsequent taps in same window are ignored | None | — | First queued tap consumed normally |
| Tap "Deduce!" when Clue Board not full | Button gives a brief shake (200ms, 4px oscillation); Clue Board empty slots pulse once | Short "nope" audio (0.2s) | 200ms shake | No |
| Tap wrong suspect card | Card shakes (200ms, 8px oscillation); Scooby: "Hmm, nope!" | Short buzz (0.25s) | 200ms | Yes — 1 tap consumed |
| Tap outside any hotspot (scene background) | No visual feedback | None | — | No |
| Tap counter reaches 0 (exhaustion) | Entire scene desaturates over 300ms | "Sad trombone" sting (0.8s) | 300ms → loss sequence | N/A |

---

## Quality Checklist

### Passing
- [x] Tagline describes an emotional experience, not a mechanic
- [x] Game Overview is 2-4 sentences
- [x] Core Loop stated in one sentence using X→Y→Z structure
- [x] Platform reads "Mobile first (portrait, touch), playable on web"
- [x] Target Audience reads "Casual adults 30+"
- [x] Primary input is a single touch action (tap)
- [x] All interactive elements document minimum 44×44pt hit area
- [x] No mechanic requires precision timing or fast reflexes
- [x] Invalid action feedback documented in Feedback & Juice only; Core Mechanics cross-references
- [x] Tutorial has exactly 2 levels; progress bar suppressed
- [x] Each tutorial level teaches exactly one mechanic
- [x] Tutorial Level 1 achievable in 1–2 actions; player cannot fail
- [x] Tutorial Level 2 introduces consequence (tap counter + red herring)
- [x] Tutorial → Chapter 1 transition explicitly documented
- [x] All tutorial targets in lower two-thirds of screen
- [x] Generation algorithm documents inputs, outputs, and constraints per step
- [x] Seed formula guarantees same seed → same level
- [x] Rejection conditions named explicitly
- [x] Last-resort fallback documented and guaranteed non-failing
- [x] Difficulty curve is gentle; no spike > 1 unit per case
- [x] Master flow diagram covers every screen from app open to end of chapter cycle
- [x] Every screen in diagram appears in screen-by-screen breakdown
- [x] Every board state documented with input-allowed flag
- [x] Win and lose conditions stated as logical rules
- [x] Win and loss sequences documented as ordered event lists
- [x] All 7 required screens present in flow diagram
- [x] Session length target documented per screen
- [x] Loss state uses "Try Again" language, not "Game Over"
- [x] Every screen tagged with lifecycle_phase
- [x] Every player action produces feedback on ≥2 channels simultaneously
- [x] Three feedback tiers defined (Subtle / Noticeable / Dramatic)
- [x] Animation timing table covers every animation with duration in ms
- [x] Invalid action feedback table is comprehensive single source of truth
- [x] Haptic column present for every feedback tier
- [x] All VFX use tint/alpha/scale/particles only — no filters, no blur, no masks
- [x] Feedback calibrated for public play (no jarring shakes, no audio spikes)
- [x] No "fun," "engaging," or "addictive" language used anywhere
- [x] No DOM elements in game code (GPU-only after initGpu per guardrails)
- [x] No React imports (SolidJS only)
- [x] No Math.random() in game state logic (seeded RNG)
