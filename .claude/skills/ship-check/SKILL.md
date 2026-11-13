---
name: ship-check
description: Final gate before a push to main or the release tag. Runs the CLAUDE.md §16 Definition of Done checks and reports SHIP or DO NOT SHIP.
disable-model-invocation: true
---

Run each step, stop at the first hard failure, and never push or tag unless the user says so.

1. `git status` — on the right branch; nothing staged from `.env*` (except `.env.example`), `node_modules/`, `coverage/`, `.next/`, or images over 1 MB.
2. Secrets: `git grep -nE "sk-[A-Za-z0-9_-]{10,}|BEGIN [A-Z ]*PRIVATE KEY|(api[_-]?key|password|token)\s*[:=]\s*['\"][^'\"]{8,}"` — any real hit is a stop.
3. `npm run check` (lint + typecheck + test) — zero errors, zero warnings.
4. `npm run test:cov` — coverage on `src/core` not lower than `main`.
5. `npm run demo` on `LLM_PROVIDER=mock` — log shows ≥ 1 `FLAG`, ≥ 1 `FIX`, `DONE` and "Human interventions: 0".
6. `npm run build`.
7. `npm audit --audit-level=high`.
8. ROADMAP boxes ticked and docs updated for any changed behaviour.
9. Release only (before 09:00 Saturday): golden demo trace committed in `data/runs/`, README badge green, tag `v1.0.0-hackathon` ready.

Reply with a table (step · result · note), then one line: **SHIP** or **DO NOT SHIP: <main reason>**.
