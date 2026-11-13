# Deploying Thuso (Neon + Claude + Vercel)

About 15 minutes. You do the sign-ups and paste the secrets yourself; nothing secret goes in git.

## 1. Database — Neon (free)
1. Go to <https://neon.tech>, sign in with GitHub, create a project (region: closest to South Africa, e.g. Frankfurt).
2. Copy the **connection string** (starts with `postgresql://`, ends with `?sslmode=require`).
3. Locally: put it in `.env.local` as `DATABASE_URL=...`, then `npm run dev`. The first page load creates the tables and seeds the demo school (Grades 10–12, 96 synthetic learners, staff). Nothing else to run.

## 2. AI — Claude
In `.env.local` (and later in Vercel):
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=<your key from console.anthropic.com>
LLM_MODEL_REASONING=claude-sonnet-5-5
LLM_MODEL_FAST=claude-haiku-5-5
```
Leave `LLM_PROVIDER=mock` to run without a key (the offline stand-in; the demo still works).

## 3. Accounts
```
ADMIN_PASSWORD=<12+ characters, only you know it>   # creates admin@school.example.org
DEMO_PASSWORD=<optional; default thuso-demo-2026>     # learners, teachers, principal
```
The admin is only created when the database is first seeded, so set `ADMIN_PASSWORD` before step 1's first page load (or in Vercel before the first visit).

## 4. Hosting — Vercel (free)
1. <https://vercel.com> → sign in with GitHub → **Add New… → Project** → import `WhiteSkyTK/thuso-colleague-zero`.
2. Framework: Next.js (detected). Node.js: 24 (from `package.json`).
3. **Environment Variables**: add every value from steps 1–3.
4. **Deploy**. Every push to `main` deploys again.
5. Open the URL → **Open the school portal** → click **Learner**, **Teacher** or **Principal**.

## Checks after deploying
- `/login` → Teacher → change a mark → "Saved … marks".
- `/run?grade=11` → Run → the log streams, ends with `Human interventions: 0`.
- If the run page says the colleague could not start, check the `LLM_*` variables in Vercel.
