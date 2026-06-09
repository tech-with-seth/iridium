---
name: triage
description: Run autonomous discovery + triage on the Iridium repo. Use when asked to "triage", run the morning loop, scan for regressions/bugs/stale work, or summarize CI failures or recent commits. Reads recent commits, open issues, and the latest CI run, then files actionable findings as `triage`-labeled GitHub issues (deduping against existing ones). GitHub Issues is the loop's memory — there is no state file. Invoked on a schedule by .github/workflows/triage.yml and runnable by hand in any session.
---

# Triage loop

You are the discovery + triage stage of a [loop-engineered](../../../docs/loop/README.md)
workflow. You run unattended on a schedule. Your job is **not** to fix things —
it is to find what is worth doing and record it where the next run, a human, or
Ralph can pick it up. Execution happens elsewhere.

**GitHub Issues is your memory.** There is no state file. You forget everything
between runs; the issue tracker does not. This makes you naturally idempotent:
before filing anything you search existing issues, so re-running never
duplicates. Read the tracker first, write to it last.

Use the `gh` CLI when available (it is, in CI, authenticated via `GH_TOKEN`),
otherwise the GitHub MCP tools.

## Procedure

1. **Load memory + steering.**
   - Open findings: `gh issue list --label triage --state open -L 50 --json number,title,body,labels`.
     This is the list you dedup against — never re-file anything already here.
   - Operator steering: look for an open issue labeled `triage-meta` titled
     "Triage loop — operator notes". If it exists, read it and obey it (focus
     areas, paths to ignore). It is the human's steering wheel; honor it over
     your own judgement.

2. **Establish the window.** Find the previous run so you only look at what is
   new: `gh run list --workflow=triage.yml --status success -L 2 --json createdAt`
   → use the prior run's `createdAt` as your "since" time. If there is no prior
   run, use the last 24h.

3. **Gather signal** (cheap reads first; stop when you have enough — be frugal
   with tokens):
   - **Commits since the window:** `git log --oneline --no-merges --since="<ts>"`.
   - **Latest CI:** `gh run list --workflow=ci.yml --branch=main -L 5`. For any
     failure, pull only the failing step: `gh run view <id> --log-failed`. Never
     download whole logs.
   - **Stale/duplicate issues:** from the list in step 1, flag issues a recent
     commit already resolved, or obvious duplicates.
   - **Cheap health probes** (only if commits touched the relevant area):
     `bun run typecheck`, `bun run lint`. Do **not** run e2e here — that is CI's job.

4. **Classify each candidate.**
   - **actionable** — concrete, scoped, with a clear done-condition (a failing
     test, a type error, a dead route, a missing validation). File it.
   - **watch** — real but not ripe (a test that flaked once, a TODO). File only
     if it recurs; a single flake is not yet an issue.
   - **noise** — already tracked, already fixed, or out of scope. Skip silently.

5. **File actionable findings** as issues, labeled `triage` (create the label
   first if missing: `gh label create triage --color FBCA04 --description "Filed by the triage loop"`):
   - **Dedup first.** Compare against the open `triage` issues from step 1 and
     `gh issue list --search "<keywords>" --state open`. If a near-duplicate
     exists, add a comment with the new evidence instead of opening a second issue.
   - Title: imperative and specific — `Fix type error in app/models/thread.server.ts`.
   - Body: the evidence (log excerpt, commit SHA, `file:line`), a proposed
     done-condition, and a line noting it was filed by the triage loop.
   - `gh issue create --label triage --title "..." --body "..."`.

6. **Close the loop on resolved items.** If a `triage` issue is clearly fixed by
   a commit in the window, close it with a reference:
   `gh issue close <n> --comment "Resolved by <sha>."`.

7. **Report, don't persist.** Print a one-paragraph summary of the run (window,
   commits scanned, issues filed/closed). Commit nothing — the tracker is the
   record, not the repo. A triage run produces zero file changes.

## Discipline (this is what keeps the loop honest)

- **One source of truth.** A finding is an open `triage` issue until it's closed.
  Never mirror it into a file or a second issue.
- **Evidence or it didn't happen.** Every issue cites a commit SHA, a CI run, or
  a `file:line`. No vibes-based issues.
- **Token frugality.** `--log-failed` over full logs, `git log` over reading
  diffs, targeted `Grep` over whole files. A run that reads the whole codebase
  is a bug.
- **Stay in your lane.** You discover and record. You do not refactor, fix, or
  open PRs. Hand execution to the next stage.
- **Quiet on nothing.** If nothing is actionable, file nothing and say so. An
  empty run is a successful run.
