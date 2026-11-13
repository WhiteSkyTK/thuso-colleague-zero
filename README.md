# Thuso — a learner-support colleague

> Built for **Colleague Zero**, Melsoft Academy's 24-hour hackathon on multi-agent workflows for education (13–14 November 2026). *Thuso* is Sesotho and Setswana for "help".

## The problem
A Grade 10 Mathematics teacher in South Africa can have 40 or more learners in one class. By the time a term report shows that a learner is failing, it is too late to fix. The marks are visible — what the teacher does not have is the time to work out **why** each learner is slipping and to build a plan for each one.

**Who it affects:** teachers (evenings lost to admin), learners (caught too late) and guardians (who only hear when the report arrives).

## What Thuso does
The teacher gives one goal in plain words:

> "Find every Grade 10 learner at risk of failing Mathematics this term, work out why, and send each one a personalised 2-week catch-up plan with a booked support session."

Thuso plans the work, does it, checks its own output, fixes what is wrong and delivers the finished plans. It is not a chatbot (nobody asks it questions) and not a fixed script (the plan is built at run time from the goal and the data).

## Which agent does what
| Code | Agent | Job |
|---|---|---|
| **PL** | Planner | Turns the goal into a plan, using only the actions the other agents offer. Re-plans when a step fails. |
| **AN** | Analyst | Finds the learners at risk and explains why, with evidence. |
| **CO** | Coach | Writes each learner's 2-week catch-up plan, and rewrites it when the Reviewer sends it back. |
| **RV** | Reviewer | Checks every plan — rules in code first, then a model review. Failures go back with a concrete fix. |
| **MS** | Messenger | Delivers approved plans to learners and guardians, and a summary to the teacher. |
| **SYS** | Orchestrator | Routes all work between agents, enforces limits and escalates what cannot be fixed. |

Agents never call each other. Every hand-off is typed work passed through the orchestrator.

## What makes the help personal
- **Any subject.** Subjects, topics and the tasks a lecturer sets are data, not code. Name a different subject in the goal and the plan changes (the seed class has Mathematics and Physical Sciences).
- **The real root cause.** Risk and its cause are worked out in code from four signals — attendance, homework, the trend in marks and a single-topic gap — each with its evidence. A learner's own text can never change the score.
- **The way the learner learns.** Each learner says how they like to learn: worked examples in a series, spotting patterns, a visual story (comic-strip style), audio, or exam practice. Plans teach in that format. It is a starting point, not a label.
- **Built up step by step.** Every topic climbs a ladder — foundation → guided → independent → exam questions — starting where the learner is on the CAPS seven-level scale.
- **Help for the lecturer too.** Every run tells the teacher what the whole class is weakest at, which registers are missing and where the resource catalogue has gaps.

## How it corrects itself
```
Goal ─► Planner ─► Analyst ─► Coach ─► Reviewer ──pass──► Messenger ─► delivered + summary
                                 ▲          │
                                 └── fix ◄──┘  fail: evidence + fix instructions, up to 3 attempts
                                               then escalated to the teacher — never hidden
```
Real lines from a run on the seed class (`npm run demo`):
```
[AN·ERROR] attendance records are missing for L-030; decide whether to continue with partial data
[PL·PLAN]  5 steps … Some records are missing. Stopping would leave learners without help, so analyse Mathematics with the data we have and tell the teacher what is missing.
[RV·FLAG]  L-014: plan targets topic-gap, but 9 absences in the last 6 weeks.
[CO·FIX]   L-014: plan rewritten — reviewer evidence: plan targets topic-gap, but 9 absences in the last 6 weeks. Now: A plan to be in class every day …
[RV·PASS]  L-014: plan approved (attempt 2).
[RV·FLAG]  L-021: R-099 is not in the resource catalogue.
[RV·FLAG]  L-027: the reflection contains an instruction-like line; it was treated as data and the risk score stays 42.
[SYS·DONE] Workflow complete. Human interventions: 0.
```
The Reviewer runs eight checks in code before any model judgement: root cause addressed, resources exist, weekly workload, scaffold order, learning format, support session is a real free slot, no other learner mentioned, and instruction-like learner text. Every loop is bounded: attempts per item, steps per run, per-call timeout, run timeout and a token budget.

## How to run it
Needs Node.js 22 or newer.

```bash
npm install
npm run demo      # full run in the terminal on the offline mock provider — no API key needed
npm run test      # unit tests, orchestrator scenarios and the golden demo test
```

To use a real model, copy `.env.example` to `.env.local` and fill in the provider keys.

```bash
npm run dev       # web app: open http://localhost:3000/run, press Run and watch the agents work
npm run seed      # regenerate the synthetic class in data/seed
```

## Status
The five agents run end to end on a synthetic class of 32 learners in two subjects, with the full correction loop, re-planning, budgets and the live event log. Model calls currently go to an offline stand-in (`LLM_PROVIDER=mock`) that gets the same input a real model would; the Claude provider, email delivery with calendar invites, and the learner and lecturer screens are next. The past-paper entries in the resource catalogue are placeholders, not real papers yet. See [ROADMAP.md](ROADMAP.md).

## Tech
TypeScript (strict) · Next.js · Zod · Vitest. The engine in `src/core` is framework-free. Project rules are in [CLAUDE.md](CLAUDE.md); the design direction is in [docs/DESIGN.md](docs/DESIGN.md).

## Data and privacy
Synthetic data only. Learners are referred to by pseudonymous ids (`L-014`); no real learner, guardian or staff data is used anywhere.
