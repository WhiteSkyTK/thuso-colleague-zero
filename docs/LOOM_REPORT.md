# Loom progress report — outline (3–4 minutes, due Friday midnight)

1. **The problem (20 s).** Teachers with 30–40 learners can't spot everyone who is slipping, work out *why*, and build a plan in time. Judges asked: different learning styles, every subject, real root causes.
2. **What works now (90 s) — show it.**
   - Landing page: Jacaranda Street, five agents carrying their signs.
   - `/login` → **Teacher**: Grade 10 Maths, 7 learners at risk, each with a root cause (attendance, homework, falling marks, one weak topic) and how they learn best. Change a mark in the mark sheet → saved to the database.
   - **Let Thuso write the plans** → live run: Planner → Analyst → Coach → Reviewer flags a mistake (the street slows down) → Coach fixes → Messenger delivers. *Human interventions: 0.* Thuso the mascot narrates.
   - Sign in as **Learner** (Refilwe): what's holding her back (9 absences), resources in her formats (visual story, worked examples), tasks, DBE past papers, **where her marks can take her** (APS and pathways).
   - **Principal**: Grades 10–12 side by side.
3. **How it's built (40 s).** Five agents with one role each; a Reviewer with eight deterministic checks plus judgement; bounded retries; Claude with structured outputs; Neon Postgres; sign-in per role; CI on every push; SonarCloud clean.
4. **Still outstanding (30 s).** Hosting on Vercel with the real Claude key; email + calendar invites for booked sessions; replay mode for venue Wi-Fi; a quiz/past-paper practice flow.
