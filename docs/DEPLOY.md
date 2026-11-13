# Deploying Thuso (Neon + Claude + Vercel)

About 15 minutes. You do the sign-ups and paste the secrets yourself; nothing secret goes in git.

**Live now:** <https://thuso-colleague-zero.vercel.app> (Vercel project `whiteskytk/thuso-colleague-zero`, connected to GitHub, so every push to `main` deploys).

## 1. Database — Neon (free)
- **Production (Vercel)** gets `DATABASE_URL` from the Neon–Vercel integration on the project.
- **Local** is linked to Neon project `shiny-unit-78806510` (branch `production`) through `neon.ts` and the git-ignored `.neon` file:
  ```bash
  npm i -g neon     # the Neon CLI
  neon login        # browser sign-in, once
  neon env pull     # writes DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED into .env.local
  ```
  `neon env pull` removes keys it did not produce (for example `NEON_AI_GATEWAY_TOKEN`), so back up `.env.local` first.
- Either way, the first page load creates the tables and seeds the demo school (Grades 10–12, 96 synthetic learners, staff). Nothing else to run.

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
Done for this repo with the CLI:
```bash
npm i -g vercel
vercel login                 # device sign-in in the browser
vercel link --yes --project thuso-colleague-zero
vercel env add NAME production   # value on stdin; repeat for the variables in steps 2–3
vercel deploy --prod
```
Node.js 24 comes from `package.json`. `.vercelignore` keeps `.env*` and build folders out of uploads. To switch the live agents to Claude once the account has credit: in Vercel → Settings → Environment Variables set `LLM_PROVIDER=anthropic`, then redeploy. Gemini (`OPENAI_COMPAT_*`) is then the automatic fallback.

## Checks after deploying
- `/login` → Teacher → change a mark → "Saved … marks".
- `/run?grade=11` → Run → the log streams, ends with `Human interventions: 0`.
- If the run page says the colleague could not start, check the `LLM_*` variables in Vercel.
