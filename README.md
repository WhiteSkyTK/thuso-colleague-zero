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

## How it corrects itself
```
Goal ─► Planner ─► Analyst ─► Coach ─► Reviewer ──pass──► Messenger ─► delivered + summary
                                 ▲          │
                                 └── fix ◄──┘  fail: evidence + fix instructions, up to 3 attempts
                                               then escalated to the teacher — never hidden
```
A real line from the run log:
```
00:00:00 [RV·FLAG] L-014: plan targets topic-gap, but 9 absences in 6 weeks.
00:00:00 [CO·FIX] L-014: plan now leads with attendance — reviewer evidence: plan targets topic-gap, but 9 absences in 6 weeks
00:00:00 [RV·PASS] L-014: plan approved (attempt 2).
```
Every loop is bounded: attempts per item, steps per run, per-call timeout, run timeout and a token budget.

## How to run it
Needs Node.js 22 or newer.

```bash
npm install
npm run demo      # full run in the terminal on the offline mock provider — no API key needed
npm run test      # unit tests, orchestrator scenarios and the golden demo test
```

To use a real model, copy `.env.example` to `.env.local` and fill in the provider keys.

## Status
Walking skeleton: the five agents, the orchestrator, the correction loop, re-planning, budgets and the live event log run end to end on the mock provider. Next: seed class data, real model provider, the full set of review checks, email delivery and the live web view. See [ROADMAP.md](ROADMAP.md).

## Tech
TypeScript (strict) · Next.js · Zod · Vitest. The engine in `src/core` is framework-free. Project rules are in [CLAUDE.md](CLAUDE.md); the design direction is in [docs/DESIGN.md](docs/DESIGN.md).

## Data and privacy
Synthetic data only. Learners are referred to by pseudonymous ids (`L-014`); no real learner, guardian or staff data is used anywhere.
