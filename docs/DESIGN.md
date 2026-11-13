# DESIGN.md — Colleague Zero

> 🎨 **Design reminder:** this file is the source of truth for every screen. Reference images live in `docs/design/refs/` — open them before UI work. Take the *principles* from them; never copy their characters, logos, layouts or brand assets.

## 1. Direction in one line
**"A colleague you can watch at work."** A warm, illustrated Johannesburg street in jacaranda season, built from parallax depth layers, sitting above a precise mission-control console that logs every agent action.
Two moods in one product: playful illustration (trust, delight) + exact data (credibility).

## 2. What we take from each reference
| Ref | Save as | Take | Leave |
|---|---|---|---|
| 1 — purple illustrated portfolio | `refs/ref-1-portfolio.jpg` | A two-colour world (soft purple + deep ink), very large thin display type, one friendly flat character, grain texture, a "scroll to step inside" story, uppercase condensed nav | The character and its open-head idea |
| 2 — orange/cream studio site | `refs/ref-2-studio.jpg` | Characters walking across the page carrying signs, a marquee ticker band, loose hand-drawn loops, bold condensed headlines, one hot accent colour | Their characters, cats and lettering |
| 3 — mobile ordering app | `refs/ref-3-mobile-app.jpg` | Mobile card system: hero card, filter chips with icons, cards with corner badges, one strong primary action, bottom nav with a raised centre button | The brand, food imagery and red-on-red palette |

## 3. Tokens
### Colour — CSS variables in `src/styles/tokens.css`, mapped into Tailwind
| Token | Hex | Use |
|---|---|---|
| `--c-jacaranda-50` | #F3F1FD | Page tint, cards on purple |
| `--c-jacaranda-300` | #A79BE8 | Far layers, petals, hover |
| `--c-jacaranda-500` | #6E5FD3 | Primary, Planner — white text passes (≈ 4.9:1) |
| `--c-jacaranda-700` | #4A3E9E | Mid layers, pressed states |
| `--c-ink-900` | #16152B | Text, console background, character bodies |
| `--c-paper` | #FBF6EE | Main background |
| `--c-blush` | #FCE3DA | Warm sections, marquee band |
| `--c-ember-500` | #F0532A | Accent, Reviewer flags — ink text only (white fails) |
| `--c-ember-700` | #C2410C | Accent buttons and text with white (≈ 5.2:1) |
| `--c-teal-500` | #0E9F8E | Analyst — ink text |
| `--c-sun-400` | #F2B53A | Coach, escalations — ink text |
| `--c-leaf-500` | #3BAA5C | Messenger, success — ink text |

Rules: check every text/background pair with a contrast checker (≥ 4.5:1, or ≥ 3:1 for text 24 px and up). Never use colour alone for status — add an icon and a label.

### Type — Google Fonts through `next/font` (all open licence)
- **Display:** Big Shoulders Display — weight 200 for tall, thin hero lines (ref 1); 800 for punchy headlines (ref 2)
- **Body/UI:** DM Sans 400 / 500 / 700
- **Mono** (console, IDs, timers): JetBrains Mono 400 / 600
- Fluid sizes with `clamp()`: body `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`; hero `clamp(3.5rem, 2rem + 9vw, 10rem)`

### Space, shape and motion
- 4-pt spacing scale; 12 px radius on cards, fully rounded chips and the centre button; soft shadows tinted jacaranda, never grey
- UI easing `cubic-bezier(0.22, 1, 0.36, 1)`; durations 150 / 250 / 400 ms; scene loop timings in §5
- Grain: SVG `feTurbulence` noise overlay at about 5% opacity with `pointer-events: none`

## 4. Illustration and characters
- Flat vector, no outlines, at most 4 colours per object; ink-900 bodies with token-coloured clothes; big heads, dot eyes, simple smiles — all original designs.
- One character per agent, each carrying a sign (the ref 2 idea). Sign text comes from `AGENT_META`.

| Agent | Look | Sign | Props |
|---|---|---|---|
| PL Planner | Jacaranda cardigan, clipboard | **PLAN** | Unrolls a route map |
| AN Analyst | Teal jacket, magnifying glass | **FIND** | Bar chart on a tablet |
| CO Coach | Sun-yellow hoodie, backpack of books | **TEACH** | Timetable card |
| RV Reviewer | Ember blazer, glasses, red pen | **CHECK** | Red flag on FAIL, green stamp on PASS |
| MS Messenger | Leaf-green cap and satchel | **SEND** | Drives the school bus |

- Poses: idle, walking (4-frame loop or a CSS bob), working, celebrating; the Reviewer also has flag-up.
- Export optimised SVGs (SVGO) to `public/scene/characters/`.

## 5. Parallax system
### 5.1 The street (hero and run view)
A side-on Johannesburg street. The further away a layer is, the slower it moves: speed ≈ 1 ÷ distance.

| Layer | Content | Speed | Notes |
|---|---|---|---|
| L0 Sky | Gradient, sun or moon | 0 | Static; colour can follow the time of day |
| L1 Far | City skyline with a tall tower, golden mine dumps | 0.1 | Jacaranda-300 silhouettes |
| L2 Mid-far | Rows of jacaranda trees, drifting petals | 0.25 | No more than 20 petal elements |
| L3 Mid | The school: fence, gate, lit staff-room window | 0.5 | The window is the zoom target (§5.2) |
| L4 Near | Road and pavement: school bus, cars, learners, the five agents walking with signs | 1.0 | The main action layer |
| L5 Foreground | Lamp posts, bushes, bins — pre-blurred artwork | 1.4 | Faster than the road for depth; never covers text |

Jacarandas bloom in Johannesburg in October and November — the same weeks as the event. Use that in the pitch.

**Ambient loop (no scroll needed):** each layer is a strip of two identical tiles animated `translateX(0) → translateX(-50%)`, linear, infinite, with duration = `24s ÷ speed` (L1 240 s, L2 96 s, L3 48 s, L4 24 s, L5 ≈ 17 s). Tile seams must line up.

**Scroll parallax (sections):** `translateY = scrollY × (1 − speed)`. Use `animation-timeline: scroll()` inside `@supports`; otherwise one rAF loop reads `scrollY` once per frame and writes a CSS variable.

**Layers are data, not markup** — one component renders any scene:
```ts
// src/components/parallax/streetLayers.ts
export const STREET_LAYERS = [
  { id: 'sky', src: '/scene/l0-sky.svg', speed: 0 },
  { id: 'far', src: '/scene/l1-skyline.svg', speed: 0.1 },
  // …one entry per layer from the table above
] as const satisfies readonly SceneLayer[];
```
`<ParallaxScene layers={STREET_LAYERS} worldSpeed={1} />`

### 5.2 "Step into the staff room" — z-axis zoom on the landing page
Inspired by ref 1's "scroll to step inside". A sticky section about 300vh tall. As you scroll, the camera dollies toward the lit staff-room window: L3 scales 1 → 6 around the window, L4–L5 scale faster and fade out, L0–L2 barely move. The camera passes through the window and the inside fades in — the five agents at their desks with the loop drawn between them (Goal → Plan → Act → Check → Correct → Deliver).
Build it with Motion `useScroll({ target })` + `useTransform` on `scale` and `opacity`, with `transform-origin` on the window. Headline: "Meet Thuso — your newest colleague."

### 5.3 Live relay (run view) — agent events drive the scene
This makes self-correction something judges can *see*:

| Event | What the scene does |
|---|---|
| `PL·PLAN` | Planner raises PLAN, the map unrolls, step markers appear along the road |
| `AN·ACT` / `CO·ACT` | A work packet (a folder with the learner ID) moves to that agent, who switches to "working" |
| `RV·FLAG` | Reviewer raises the red flag; **the whole world slows to 0.25×**; the packet slides back to the Coach with the reason in a speech bubble |
| `CO·FIX` | Coach rewrites; the packet returns to the Reviewer |
| `RV·PASS` | Green stamp; the world returns to 1× |
| `MS·DONE` | The bus pulls away with envelopes, a burst of petals, the world runs at 1.6× and then settles |
| `SYS·ESCALATE` | The packet drops into a "Needs a human" tray with a sun-yellow highlight |

Implementation: a pure, tested `sceneReducer(state, event)`; the component applies `worldSpeed` with `Animation.updatePlaybackRate()` on every running layer animation so speed changes are smooth. Show one featured packet at a time; the console shows everything.

### 5.4 Small touches
- Pointer tilt on cards: a 2–6 px shift per depth layer; off on touch devices
- Marquee band (ref 2) with live numbers from the last run, e.g. "32 learners analysed · 7 plans delivered · 2 mistakes caught and fixed · 0 human interventions"; pauses on hover and focus
- Optional day/night sky that follows the clock (it is an overnight hackathon)

## 6. Screens
1. **Landing `/`** — street hero with the walking agents and the headline; marquee band; the staff-room zoom; the loop explained in six cards; CTA "Watch it work".
2. **Run `/run`** — goal box (pre-filled, editable, three preset variations); relay scene on top; console below in mono on ink, e.g. `00:06:51 [RV·FLAG] L-014: plan targets algebra, but 9 absences in 6 weeks.`; agent chips (code, name, status); "Step x of y"; "Human interventions: 0"; a REPLAY label in replay mode.
3. **Results `/runs/[id]`** — summary card; filter chips (All · At risk · Fixed by reviewer · Escalated · Sent); learner cards with corner badges (ref 3); each card opens its review history with before/after and the reason.
4. **Plan `/runs/[id]/learners/[learnerId]`** — print-friendly 2-week plan: sessions, topics, resources, messages sent.
5. **Mobile** — bottom nav (Home · Runs · raised **Run** button · Learners · Settings); the scene drops to three layers (L1, L3, L4).

## 7. Components (one per file)
`ParallaxScene`, `SceneLayer`, `AgentCharacter`, `WorkPacket`, `StaffRoomZoom`, `Marquee`, `LiveRunConsole`, `ConsoleLine`, `AgentChip`, `StepCounter`, `RunSummaryCard`, `LearnerCard`, `StatusBadge`, `FilterChips`, `GoalInput`, `BottomNav`, `PauseMotionButton`

## 8. Motion, accessibility and performance rules
- `prefers-reduced-motion: reduce` → no loops, no zoom (a cross-fade instead), world speed 0; events show as state changes and icons.
- A visible **pause motion** button for any animation that runs longer than 5 seconds (WCAG 2.2.2); remember the choice per viewer.
- Animate only `transform` and `opacity`; `will-change` only while animating; no layout reads inside the animation loop.
- Pause scenes when off-screen (`IntersectionObserver`) or when the tab is hidden.
- No scroll-jacking — native scrolling only. No sound by default.
- Decorative layers get `aria-hidden="true"`. The console is `role="log"`; announce only FLAG, FIX, ESCALATE and DONE to screen readers so it doesn't flood them. Visible focus styles; everything works with a keyboard.
- Budget: the hero scene's assets stay under ~300 KB; SVGs optimised; below-the-fold images lazy-loaded; Lighthouse ≥ 90.
