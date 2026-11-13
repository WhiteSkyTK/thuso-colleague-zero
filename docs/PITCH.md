# Idea pitch — Thuso (Presentation 1, Fri 12:30)

One person pitches live, then the host asks questions. Aim for **90 seconds**; say it out loud twice before 12:30.

## The pitch (read it, then say it in your own words)

**1. The problem (20 s)**
"A Grade 10 Maths teacher in South Africa can have 40 or more learners in one class. By the time the term report shows a learner is failing, it is too late to fix. The teacher can see the marks — but has no time to work out *why* each learner is slipping and build a plan for each one."

**2. Who it affects (10 s)**
"Teachers lose evenings to admin. Learners who could have been caught early fall through. Guardians only hear when the report arrives."

**3. Our colleague (25 s)**
"Meet **Thuso** — Sesotho for 'help'. Thuso is a learner-support colleague. The teacher gives one goal: *'Find every Grade 10 learner at risk of failing Maths this term, work out why, and send each one a 2-week catch-up plan with a booked support session.'* Thuso does the whole job and reports back."

**4. How the agents work together (25 s)**
"Five agents, one loop:
- the **Planner** reads the goal and the class data and builds the plan,
- the **Analyst** scores every learner and explains why each one is at risk,
- the **Coach** writes each catch-up plan,
- the **Reviewer** checks every plan against the evidence and sends bad ones back,
- the **Messenger** emails the learner and guardian, books the session and sends the teacher a summary."

**5. The self-correction moment (10 s)**
"Example: the Coach gives learner 14 an algebra plan. The Reviewer sees 9 absences in 6 weeks — the real problem is attendance — and sends it back. The Coach fixes it, and the reason is logged. Human interventions: zero."

## Likely questions — short answers
| Question | Answer |
|---|---|
| Why is this not a chatbot? | Nobody asks it questions. It takes a goal, does the work and delivers finished plans and emails. |
| Why is it not a fixed script? | The Planner builds the plan at run time from the goal and the data. Change the goal (subject, grade, threshold) and the plan changes. It re-plans when data is missing. |
| How does it catch its own mistakes? | Two layers: checks in code (attendance, workload, real resources, dates, privacy) and then an AI review. Failed work goes back with a concrete fix, up to 3 attempts, then it is flagged for the teacher — never hidden. |
| What about learner privacy? | Synthetic data only for the hackathon. The AI sees learner IDs, not names. Built with POPIA in mind. |
| What does it deliver? | Emails to learner and guardian, a calendar invite for the support session, a printable plan, and a teacher summary. |
| Why this idea and not marking? | Marking finds who is failing. Thuso acts on it — it finds out why and gets help to the learner while there is still time. |
| What is the tech? | TypeScript, Next.js, Claude for reasoning, a live event log so you can watch every agent decision. |

## One-line version (if time is cut)
"Thuso is a team of five AI agents that finds learners at risk, works out why, writes each one a catch-up plan, checks its own work and delivers it — with no human stepping in."
