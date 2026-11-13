---
name: next-task
description: Pick up the next ROADMAP task, plan it, build it with tests, verify and commit. Use when starting work on a task.
disable-model-invocation: true
argument-hint: [task-id]
---

Task: $ARGUMENTS — if empty, take the first unchecked task in the earliest unfinished phase of ROADMAP.md.

1. Read the task in ROADMAP.md and the CLAUDE.md sections it touches. For UI work, read docs/DESIGN.md and look at docs/design/refs/.
2. Mark the task `[~]` in ROADMAP.md.
3. If it will take more than ~30 minutes or touches the architecture, write a short plan (files, tests, risks) and wait for approval.
4. Create a branch `feat/<task-id>-<short-name>` (or `fix/…`, `chore/…`, `docs/…`).
5. Build in small steps. Write or update tests with the code. Run `npm run check` after each step and fix failures before moving on.
6. Check every item in CLAUDE.md §16 Definition of Done.
7. Mark the task `[x]`, update docs whose behaviour changed, and commit with a Conventional Commit that includes the task ID.
8. Report in five lines or fewer: what changed, test results, anything left over, and the suggested next task.
