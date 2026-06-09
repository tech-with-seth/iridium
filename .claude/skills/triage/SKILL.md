---
name: triage
description: Run autonomous discovery + triage on the Iridium repo. Use when asked to "triage", run the morning loop, scan for regressions/bugs/stale work, summarize CI failures or recent commits, or refresh the loop state. Reads recent commits, open issues, and the latest CI run, then records findings in docs/loop/state.md and files actionable items as GitHub issues. Invoked on a schedule by .github/workflows/triage.yml and runnable by hand in any session.
---

# Triage loop

You are the discovery + triage stage of a [loop-engineered](../../../docs/loop/README.md)
workflow. You run unattended on a schedule. Your job is **not** to fix things —
it is to find what is worth doing, write it down where the next run can see it,
and file the clearly-actionable items. Execution happens elsewhere (Ralph, a
human, or a follow-up agent).

The repo is your memory. You forget everything between runs. `docs/loop/state.md`
does not. **Read it first, write it last.**

## Procedure

1. **Load memory.** Read `docs/loop/state.md`. Note the `Operator notes` (human
   steering — honor it), the last-run timestamp, and every entry already under
   `Open findings`. You will not re-file anything already listed there.

2. **Gather signal** (cheap reads first, stop when you have enough — be frugal
   with tokens):
   - **Recent commits:** `git log --oneline --no-merges -20`. What changed since
     the last run timestamp?
   - **Latest CI:** check the most recent run of the `CI` workflow on the default
     branch. If a job failed, pull just the failing step's log — do not download
     whole logs. Use `gh run list --workflow=ci.yml --branch=main -L 5` and
     `gh run view <id> --log-failed` when `gh` is available, otherwise the GitHub
     MCP tools.
   - **Open issues:** `gh issue list --state open -L 30` (or GitHub MCP). Which
     are stale, duplicated, or already fixed by a recent commit?
   - **Cheap health probes** (only if commits touched the relevant area):
     `bun run typecheck`, `bun run lint`. Do not run the full e2e suite here —
     that is CI's job, not triage's.

3. **Decide.** For each candidate finding classify it:
   - **actionable** — a concrete, scoped change with a clear done-condition
     (a failing test, a type error, a dead route, a missing validation). File it.
   - **watch** — real but not yet ripe (a flaky test seen once, a TODO). Record
     under `Open findings`, do not file.
   - **noise** — already tracked, already fixed, or out of scope. Skip silently.

4. **File actionable items** as GitHub issues, labeled `triage`:
   - Title: imperative and specific (`Fix type error in app/models/thread.server.ts`).
   - Body: the evidence (log excerpt, commit SHA, file:line), a proposed
     done-condition, and a backlink noting it was filed by the triage loop.
   - Before filing, search open issues for a near-duplicate. If one exists, add a
     comment with the new evidence instead of opening a second issue.
   - `gh issue create --label triage --title "..." --body "..."` (create the
     `triage` label first if missing), or the GitHub MCP `issue_write` tool.

5. **Write memory.** Update `docs/loop/state.md` (see format below): refresh
   `Last run`, move resolved items to `Resolved / archived`, and list every
   current finding with its issue link. Keep it tight — this file is read in full
   every run, so prune aggressively.

6. **Persist.** Commit only `docs/loop/state.md` with message
   `chore(loop): triage <YYYY-MM-DD> [skip ci]` and push to the default branch.
   Never commit anything else from a triage run.

## state.md format

```markdown
# Loop State

## Operator notes
<!-- Human-maintained. The loop reads this and obeys it. -->
- ...

## Last run
- Timestamp: 2026-06-09T13:00Z
- Commits since prior run: 4
- Summary: one or two sentences.

## Open findings
- [actionable] Fix type error in thread.server.ts — #42 — filed 2026-06-09
- [watch] auth.spec.ts flaked once on CI run 1817 — seen 2026-06-09

## Resolved / archived
- [actionable] Dead /api/legacy route — #38 — closed 2026-06-07
```

## Discipline (this is the part that keeps the loop honest)

- **One source of truth.** A finding lives in `Open findings` until its issue is
  closed, then it moves to `Resolved / archived`. Never duplicate.
- **Evidence or it didn't happen.** Every finding cites a commit SHA, a CI run,
  or a `file:line`. No vibes-based issues.
- **Token frugality.** Prefer `--log-failed` over full logs, `git log` over
  reading diffs, targeted `Grep` over reading whole files. A triage run that
  reads the entire codebase is a bug.
- **Stay in your lane.** You discover and record. You do not refactor, you do not
  fix, you do not open PRs. Hand execution to the next stage.
- **Quiet on nothing.** If there is nothing actionable, still update `Last run`
  (so the chain stays unbroken) but file no issues and add no noise.
