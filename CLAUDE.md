# CLAUDE.md — Colleague Zero

> **🎨 DESIGN REMINDER — read before any UI work**
> The look and feel lives in [`docs/DESIGN.md`](docs/DESIGN.md): an illustrated Johannesburg street in jacaranda season built from **parallax depth layers** (far layers move slow, near layers move fast), a "step into the staff room" z-axis zoom, and a live agent console. Reference images are in `docs/design/refs/` — open them first. UI that ignores DESIGN.md is not done.

You are the lead engineer of a team competing in **Colleague Zero** (Melsoft Academy · 24-hour hackathon · 13–14 Nov 2026 · prize R10 000).
Read order: this file → `ROADMAP.md` (plan and tasks) → `docs/DESIGN.md` (any UI) → `docs/HACKATHON_BRIEF.md` (event context). This file holds the rules for every session.

---

## 1. What we are building

A **digital colleague for education**: a team of AI agents that takes a goal, **plans** the work, **acts** with tools and data, **checks** its own output, **fixes** what is wrong and **delivers** finished work to real people.
**Not a chatbot** (waits for questions). **Not a fixed script** (same steps every time, breaks on surprises).

### Project card — default concept, confirm at kickoff (ROADMAP §Decisions D1)
| | |
|---|---|
| Working name | **Thuso** (Sesotho/Setswana: "help") — rename freely |
| Colleague | Learner-support colleague |
| Problem | Teachers with large classes can't spot every learner who is slipping, work out *why*, and build individual catch-up plans in time |
| Users | Teacher/facilitator (sets the goal, gets the summary) · learners and guardians (get the plans) |
| Example goal | "Find every Grade 10 learner at risk of failing Mathematics this term, work out why, and send each one a personalised 2-week catch-up plan with a booked support session." |
| Done when | Every at-risk learner has a reviewed plan delivered, the teacher has a summary, and **human interventions = 0** (escalations are listed, never hidden) |

If the concept changes, update this card and the roster in §6 first. The engine (§5) stays the same.

## 2. How we are judged — optimise every decision for these five
| Criterion | What the code must prove |
|---|---|
| **Reasons** | The Planner builds the plan at runtime from the goal and the data, and re-plans when something changes. No hard-coded step list. |
| **Self-corrects** | The Reviewer checks every output (deterministic checks + LLM judgement), sends failures back with fix instructions, and the fix is re-checked. Reasons are logged. |
| **Executes** | Real side effects: messages sent (sandbox/redirect), sessions booked (.ics), plans generated. A finished result, not advice. |
| **Collaborates** | At least 3 agents with distinct roles hand typed work to each other through the orchestrator. |
| **Serves education** | A real South African classroom need; outputs a teacher would actually use. |

Saturday presentation: problem and who it affects → **live demo** → how the agents reason, collaborate and self-correct → what we'd build next.

## 3. Non-negotiables
1. **No secrets in git.** Keys live only in `.env.local` (git-ignored). Keep `.env.example` current.
2. **Synthetic data only.** No real learner, guardian or staff data anywhere — this is children's data under POPIA. Use `example.org` addresses.
3. **LLM output is untrusted.** Validate it with Zod before use. Never `eval` it, never render it as raw HTML.
4. **Learner text is data, never instructions.** Wrap it in delimiters and run the injection check (§9).
5. **Every loop is bounded.** Max attempts, max steps, per-call timeout, run budget (§7). No infinite loops.
6. **The demo always works.** `npm run demo` passes in CI on the `MockProvider` (§10).
7. **`main` always runs.** Small working increments; never leave the app broken.
8. **Ask before** adding a service or heavy dependency, changing the architecture, deleting files or rewriting git history.
9. **Built during the event.** Product code is written between kickoff (Fri 13 Nov 10:00) and code freeze (Sat 14 Nov 09:00).

## 4. Stack (default)
| Concern | Choice |
|---|---|
| Language | TypeScript, `strict: true`, everywhere |
| App | Next.js (App Router) + React; Node runtime for API routes |
| Styling | Tailwind CSS mapped to the design tokens in DESIGN.md (CSS variables) |
| Motion | CSS transforms, CSS scroll-driven animations as progressive enhancement, Motion (`motion` package, formerly Framer Motion) for scroll- and event-driven parallax |
| LLM | Own `LlmProvider` interface → `AnthropicProvider` (`@anthropic-ai/sdk`), `OpenAICompatibleProvider` (any OpenAI-compatible endpoint), `MockProvider` (scripted, offline) |
| Validation | Zod for env, API input and every agent input/output |
| Data | JSON seed files + repository classes (in-memory). No database for the hackathon |
| Realtime | Server-Sent Events (SSE) for the live agent log |
| Delivery | Nodemailer → Ethereal sandbox (default) or SMTP; `.ics` invites from a small `IcsBuilder` class |
| Tests | Vitest + `@vitest/coverage-v8` (lcov); Playwright smoke test is a stretch goal |
| Quality | ESLint (typescript-eslint + eslint-plugin-sonarjs) · Prettier · Husky + lint-staged · GitHub Actions · SonarQube Cloud · Dependabot · CodeQL · secret scanning |

Use the installed versions' docs and type definitions. Don't guess APIs or invent package names; if unsure, read the types in `node_modules` or ask.

## 5. Architecture

### 5.1 The loop
```
Goal ─► Planner ─► Workers (tools + data) ─► Reviewer ──pass──► Messenger ─► Delivered + summary
                        ▲                       │
                        └───── fix ◄── fail ────┘   (fixInstructions; attempt ≤ RUN_MAX_ATTEMPTS)
   attempt > max            ─► ESCALATE: item flagged for a human in the summary (never silently dropped)
   step failed / data missing / systemic issue ─► Planner re-plans
```

### 5.2 Folder structure
```
src/
  core/                    # framework-free engine — must NOT import React, Next.js or src/app
    domain/                # entities, value objects, Zod schemas (types via z.infer)
    agents/                # Agent.ts (base) + one file per agent
    orchestrator/          # Orchestrator.ts, RunContext.ts, Budget.ts, Concurrency.ts
    tools/                 # Tool.ts (interface), ToolRegistry.ts, one file per tool
    checks/                # deterministic review checks — pure functions
    llm/                   # LlmProvider.ts, AnthropicProvider, OpenAICompatibleProvider, MockProvider, LlmCache
    prompts/               # one prompt file per agent (versioned)
    events/                # AgentEvent types, EventBus.ts, TraceRecorder.ts
    repositories/          # interfaces + JSON implementations
    delivery/              # EmailSender, IcsBuilder, DeliveryPolicy
    config/                # env.ts (Zod-validated), constants.ts (AGENT_META, limits)
    createColleague.ts     # composition root: wires everything with constructor injection
  app/                     # Next.js routes — thin: validate input, call core, stream events
    api/runs/route.ts                  # POST: start a run
    api/runs/[id]/stream/route.ts      # GET: SSE event stream
  components/              # one component per file: parallax/, live-run/, learners/, ui/
  hooks/  lib/  styles/
scripts/demo.ts            # headless demo run (npm run demo)
data/seed/                 # synthetic learners, assessments, attendance, reflections, resources, calendar
data/runs/                 # saved run traces for replay (git-ignored except the golden demo trace)
tests/                     # mirrors src/core; fixtures/ holds scripted LLM responses
docs/                      # HACKATHON_BRIEF, DESIGN, ARCHITECTURE, DEMO_SCRIPT, design/refs/
```
Dependency rule: `app` and `components` depend on `core`, never the reverse. Each file has one responsibility and one main export so it can be reused elsewhere.

### 5.3 Core types (`src/core/domain`)
- `Goal { id, text, constraints, createdAt }`
- `Plan { goalId, steps: PlanStep[], rationale }` · `PlanStep { id, agent: AgentCode, action, input, successCriteria: string[], dependsOn: string[] }`
- `WorkItem<T> { id, stepId, subjectId, payload: T, attempt, history: Revision[] }`
- `CheckResult { checkId, passed, severity: 'error' | 'warn', evidence, fixHint }`
- `ReviewVerdict { status: 'pass' | 'fail', issues: CheckResult[], fixInstructions? }`
- `AgentEvent { runId, seq, ts, agent: AgentCode, level: EventLevel, message, itemId?, data?, tokens?, ms? }`
- `RunSummary { goal, stepsCompleted, stepsTotal, itemsDelivered, fixes, escalations, humanInterventions, durationMs, tokens, estCost }`
- `AgentCode = 'PL' | 'AN' | 'CO' | 'RV' | 'MS' | 'SYS'`
- `EventLevel = 'INFO' | 'PLAN' | 'ACT' | 'FLAG' | 'FIX' | 'PASS' | 'WARN' | 'ERROR' | 'ESCALATE' | 'DONE'`

Log line format (mirrors the organisers' demo): `00:06:51 [RV·FLAG] L-014: plan targets algebra, but 9 absences in 6 weeks.`

### 5.4 Classes and patterns
| Piece | Pattern | Rule |
|---|---|---|
| `abstract class Agent<I, O>` | Template Method | `execute()` handles timing, budget, errors and events; subclasses implement only `protected run(input, ctx)` |
| `Orchestrator` | Mediator | Owns routing, retries, parallelism, budgets and re-planning. Agents never call each other |
| `Tool<I, O>` + `ToolRegistry` | Command + Registry | `name`, `description`, `inputSchema`, `execute()`. Each agent gets only the tools it needs |
| `LlmProvider` | Strategy | `complete()` and `completeStructured<T>(schema, …)`; chosen by `LLM_PROVIDER` |
| `EventBus` | Observer | Agents publish; the SSE route and `TraceRecorder` subscribe |
| Repositories | Repository | `LearnerRepository`, `AssessmentRepository`, `AttendanceRepository`, `ResourceCatalog` interfaces + JSON implementations |
| `DeliveryPolicy` | Strategy | `sandbox` (Ethereal) · `redirect` (everything to `DEMO_RECIPIENT`) · `live` |
| `createColleague()` | Composition root | The only place that calls `new` on dependencies |

Adding an agent or tool = add a class and register it. Never grow a `switch` in the orchestrator.

## 6. Agent roster (default concept)
| Code | Agent | Job | Tools | Model tier |
|---|---|---|---|---|
| PL | Planner | Goal + data overview → `Plan`; re-plans on failure or missing data | `getClassOverview` | reasoning |
| AN | Analyst | Computes risk in code, then explains *why* per learner with evidence | `getLearnerRecords`, `computeRisk` | reasoning |
| CO | Coach | Writes the 2-week catch-up plan and messages per at-risk learner | `getResources`, `getSchoolCalendar` | reasoning |
| RV | Reviewer | Runs `checks/*` first, then an LLM rubric review; returns `ReviewVerdict` | read-only access to outputs | reasoning, temperature 0 |
| MS | Messenger | Sends learner and guardian messages, books sessions (.ics), sends the teacher summary | `sendEmail`, `createInvite` | fast |
| SYS | Orchestrator | Run lifecycle events (start, budget, escalate, done) | — | — |

Model IDs come from env (`LLM_MODEL_REASONING`, `LLM_MODEL_FAST`), never hard-coded.

## 7. Agent design rules
1. **One role per agent.** Its prompt lives in `src/core/prompts/<agent>.md`: role, goal, inputs, output schema, rules, one or two examples.
2. **Structured output only.** Use the provider's structured-output or forced tool-call feature and validate with Zod. On failure: one repair retry that includes the validation error, then fail the step.
3. **Deterministic before generative.** Scores, averages, trends, counts, dates and coverage are computed in code. The LLM explains, judges and writes.
4. **Specific reviews.** Every `fail` names the item, the check, the evidence and a concrete fix. "Improve quality" is not feedback.
5. **Log every fix with its reason**, e.g. `[CO·FIX] L-014 plan now starts with attendance — reviewer evidence: 9 absences in 6 weeks`.
6. **Bounded autonomy** (values from env): attempts per item, steps per run, per-call timeout, run timeout, token budget. On breach: escalate, report, stop cleanly.
7. **Temperature** 0–0.2 for planning, scoring and review; ≤ 0.7 for writing messages.
8. **Grounded.** Agents may only cite resources that exist in `ResourceCatalog`; the Reviewer rejects unknown IDs.
9. **Parallel where independent.** Per-learner items run concurrently with a limit (`LLM_CONCURRENCY`).
10. **Cache in dev and demo.** Hash of provider + model + prompt + input → stored response (`LLM_CACHE=on`). Real runs can switch it off.
11. **Narrate.** Every meaningful step emits an `AgentEvent`; the live log is part of the product and the pitch.
12. **Humans are the exception path**, not a step. Target: "Human interventions: 0".

## 8. Coding standards
**OOP and SOLID.** One reason to change per class (S). Extend by adding classes (O). Every `Agent`, `Tool` and `LlmProvider` is substitutable (L). Small interfaces (I). Depend on interfaces and inject through constructors (D). Prefer composition over inheritance beyond the single `Agent` base class.

**DRY, KISS, YAGNI.** One source of truth for types (Zod → `z.infer`), constants (`AGENT_META`: code, name, colour token, sign text), prompts, limits and design tokens. Extract on the second repetition; don't build abstractions nobody uses yet.

**Style**
- One main export per file; `PascalCase` file names for classes and components (`ReviewerAgent.ts`, `LiveRunLog.tsx`), `camelCase` for other modules (`riskScore.ts`).
- `camelCase` functions and variables, `PascalCase` types, `UPPER_SNAKE_CASE` constants; booleans start with `is/has/can/should`.
- Named exports only, except where Next.js requires a default export.
- No `any` (use `unknown` + narrowing), no `@ts-ignore`, no unexplained non-null `!`.
- Functions ≤ ~30 lines, files ≤ ~200 lines, cognitive complexity ≤ 15 (Sonar S3776), ≤ 3 parameters (otherwise an options object).
- Early returns; no nested ternaries, magic numbers or strings, commented-out code or `console.log` (emit events or use the logger).
- Errors: typed `AppError` subclasses; never swallow; always `await` or return promises.
- Comments explain *why*; TSDoc on public classes and methods.
- Prettier formats; ESLint passes with zero warnings.

**Performance and efficiency**
- Bounded parallel LLM calls; send only the fields a prompt needs; the smallest model that passes review; cache; stream progress.
- No N+1 repository calls; checks are pure and fast.
- Server Components by default; `"use client"` only where needed; `next/font` and `next/image`; lazy-load below-the-fold scenes.
- Animate only `transform` and `opacity`; one rAF loop; pause scenes off-screen and in hidden tabs.
- Landing page Lighthouse ≥ 90 for Performance and Accessibility.

## 9. Security
**OWASP Top 10 for LLM Applications (2025)**
- *Prompt injection* — learner text goes inside `<learner_text>…</learner_text>`; prompts state it is data; `injectionCheck` flags instruction-like content (`[RV·FLAG]`) and the item is processed without obeying it.
- *Improper output handling* — validate, escape, never execute model output; React escaping only, no `dangerouslySetInnerHTML`.
- *Excessive agency* — per-agent tool allow-lists; Messenger can only message recipients from the repository; no tool deletes data; `DELIVERY_MODE` defaults to `sandbox`.
- *Sensitive information disclosure* — send pseudonymous IDs and minimal fields to the LLM; no PII in logs or events; a check blocks any message that mentions another learner.
- *System prompt leakage* — no secrets or internal URLs in prompts.
- *Unbounded consumption* — budgets, timeouts, max input size, rate limit on `POST /api/runs`.

**Web and supply chain:** Zod-validate all API input · security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`) in the Next.js config · no wildcard CORS · env validated once at startup, failing fast with a clear message · errors never leak stack traces · `npm audit --audit-level=high` in CI · Dependabot, CodeQL, GitHub secret scanning and push protection on · GitHub Actions pinned to released versions.

## 10. Testing
- Tests ship with every change to `src/core`. Target **≥ 80% coverage on new code** (SonarQube Cloud quality gate).
- Unit: every check, tool, repository and agent (agents with `MockProvider` scripted responses).
- Orchestrator scenarios: pass first time · fail → fix → pass · fail × max → escalate · injection flagged · timeout · budget exceeded · re-plan on missing data.
- **Golden demo test** `tests/demo.scenario.test.ts`: full run on the seed data with `MockProvider`; asserts ≥ 1 `FLAG`, ≥ 1 `FIX`, every at-risk learner delivered, `DONE`, and `humanInterventions === 0`.
- UI: keep logic in hooks and pure functions (e.g. the scene reducer) and test those.

## 11. CI, GitHub and SonarQube Cloud
- **Pipeline** (`.github/workflows/ci.yml`, on push and PR): `npm ci` → lint → typecheck → `test:cov` → build → SonarQube scan → `npm audit`.
- **SonarQube Cloud** (formerly SonarCloud): CI-based analysis with `SonarSource/sonarqube-scan-action` pinned to its latest release — the old `sonarcloud-github-action` is deprecated. In SonarQube Cloud → Administration → Analysis Method, switch **Automatic Analysis OFF** or coverage won't import. `SONAR_TOKEN` is a GitHub Actions secret.
- `sonar-project.properties`: `sonar.organization`, `sonar.projectKey`, `sonar.sources=src`, `sonar.tests=tests`, `sonar.javascript.lcov.reportPaths=coverage/lcov.info` (covers TS too), exclusions for `data/**` and generated files. Exclude only presentational UI from coverage, never `src/core`.
- **Quality gate:** the default "Sonar way" on new code. Fix issues rather than marking them "won't fix"; any accepted issue gets a reason in the PR. Review every security hotspot. Badge in the README.
- **Git:** repo created at kickoff. Branches `feat/<task-id>-short-name`, `fix/…`, `chore/…`, `docs/…`. Conventional Commits with the task ID: `feat(reviewer): reject unknown resource ids (S1-05)`. Small PRs, squash-merge, CI must pass. Never force-push `main`. Never commit `.env*` (except `.env.example`), `node_modules`, `coverage` or images over 1 MB. Tag `v1.0.0-hackathon` before code freeze.

## 12. Commands
```bash
npm run dev         # local dev server
npm run lint        # ESLint (incl. sonarjs rules)
npm run typecheck   # tsc --noEmit
npm run test        # Vitest
npm run test:cov    # coverage → coverage/lcov.info (read by SonarQube Cloud)
npm run demo        # headless demo run (tsx scripts/demo.ts), prints the agent log
npm run build
npm run check       # lint + typecheck + test — run before every commit
```
Task S0-02 creates these scripts. Keep this list in sync with `package.json`.

## 13. Config (`.env.example`)
```bash
LLM_PROVIDER=anthropic            # anthropic | openai-compatible | mock
ANTHROPIC_API_KEY=
LLM_MODEL_REASONING=claude-sonnet-5-5
LLM_MODEL_FAST=claude-haiku-5-5
OPENAI_COMPAT_BASE_URL=
OPENAI_COMPAT_API_KEY=
OPENAI_COMPAT_MODEL=
RUN_MAX_ATTEMPTS=3
RUN_MAX_STEPS=25
LLM_CALL_TIMEOUT_MS=60000
RUN_TIMEOUT_MS=600000
RUN_TOKEN_BUDGET=400000
LLM_CONCURRENCY=4
LLM_CACHE=on
RISK_THRESHOLD=40
PLAN_MAX_HOURS_PER_WEEK=4
DELIVERY_MODE=sandbox             # sandbox | redirect | live
DEMO_RECIPIENT=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## 14. Demo rules
- The UI "Run" button and `npm run demo` run the same scenario on the seed class (Grade 10 Mathematics, 32 learners). The goal box accepts variations (grade, subject, threshold) so judges can watch the plan change.
- The seed data contains genuine hard cases (ROADMAP §Demo data spec). The Reviewer must catch them through its real checks — **never** hard-code a fake flag.
- Every run saves a trace to `data/runs/<id>.json`. `?replay=<id>` replays it at real speed with a visible **REPLAY** label — insurance against venue Wi-Fi.
- Record a backup screen video of a full run before code freeze.

## 15. How you work (Claude Code)
1. Start each session from `ROADMAP.md`: take the task you're given or the first unchecked task in the current phase. Teammates start one with `/next-task <task-id>`.
2. Anything bigger than ~30 minutes or touching the architecture: plan first (Plan Mode) — files to touch, tests to add — and wait for approval.
3. Work in small steps; run `npm run check` after each; never claim something works without running it.
4. After a feature, use the `code-reviewer` subagent. Before merging anything that touches tools, prompts, API routes, delivery or dependencies, use `security-auditor`. Before a push to `main`, run the `ship-check` skill.
5. In the same commit: tick the ROADMAP box and update docs whose behaviour changed (README, ARCHITECTURE, this file).
6. If the brief changes at kickoff, update `docs/HACKATHON_BRIEF.md` and §1–2 of this file first.
7. Keep context lean: `/clear` between unrelated tasks; reference big files by path instead of pasting them.
8. Blocked for 20 minutes? Stop, report what you tried, and propose the simpler path from ROADMAP §Cut list.

## 16. Definition of Done
- [ ] Works end to end in the running app or the demo script
- [ ] `npm run check` green; coverage not lower
- [ ] No new SonarQube Cloud issues (or each one justified)
- [ ] Agent work emits events that show in the live log
- [ ] UI work: keyboard, labels, contrast ≥ 4.5:1, reduced motion, pause control (DESIGN.md §8)
- [ ] ROADMAP box ticked, docs updated, Conventional Commit pushed
