# The Iridium loop

This repo is set up for **loop engineering**: instead of prompting an agent turn
by turn, you run small systems that prompt the agents for you. The pieces below
already exist in the repo; this directory adds the one that was missing — the
scheduled **heartbeat**.

## The pieces (and where they live)

| Loop pillar    | In this repo                                                              |
| -------------- | ------------------------------------------------------------------------- |
| **Heartbeat**  | `.github/workflows/triage.yml` — scheduled discovery + triage             |
| **Memory**     | **GitHub Issues** (label `triage`) — queryable, merge-safe, outlives any run |
| **Skills**     | `.claude/skills/` — incl. `triage` (the loop's brain) and `iridium-form`  |
| **Sub-agents** | `.claude/agents/` — `staff-engineer`, `security-auditor`, `prisma`, …     |
| **Worktrees**  | `scripts/ralph/ralph.sh` (run in one) + subagent `isolation: worktree`    |
| **Connectors** | GitHub, Linear, context7 MCP servers                                      |
| **Execution**  | `scripts/ralph/` — the autonomous loop that *does* the work               |

**Why Issues and not a state file?** The loop's memory has to be queryable,
merge-safe under parallel runs, and visible to humans. A markdown file is none of
those — the agent would rewrite it whole every run and two runs would collide.
GitHub Issues already gives us all three for free, and the loop is naturally
idempotent because it dedups by *searching open issues* before filing. (If you
later turn on heavy autonomous multi-agent execution and want a dependency
"ready-queue" to feed Ralph, [`beads`](https://github.com/steveyegge/beads) is
the purpose-built upgrade — but Issues is the right call until then.)

## How the heartbeat works

```
schedule (weekday mornings)
        │
        ▼
triage.yml ──runs──▶ /triage skill
                          │
        reads: recent commits · latest CI run · open `triage` issues
                          │
        dedups → files / comments / closes  GitHub issues (label `triage`)
        writes nothing back to the repo
```

Triage **discovers and records only** — it never fixes code or opens PRs.
Execution is a deliberately separate stage so the maker is never the checker.

## Operating it

- **Run it now:** Actions tab → *Triage Loop* → *Run workflow* (`workflow_dispatch`).
- **Run it locally / in a session:** invoke the `triage` skill (`/triage`).
- **See its memory:** the open issues labeled `triage` _are_ the loop's state.
- **Steer it:** open an issue labeled `triage-meta` titled
  "Triage loop — operator notes". The loop reads and obeys it (e.g. "ignore the
  legacy/ dir", "focus on auth"). It is the human steering wheel.
- **Change cadence:** edit the `cron` in `triage.yml`.
- **Turn it off:** delete `triage.yml`, or disable *Triage Loop* in the Actions tab.

## Required setup

The workflow needs an `ANTHROPIC_API_KEY` repository secret. The built-in
`GITHUB_TOKEN` covers reading CI and filing/closing issues.

## A note on cost and quality

Scheduled agents spend tokens whether or not they find anything, so this loop
runs on Sonnet, prefers cheap reads (`git log`, `--log-failed`) over reading the
whole tree, and is capped at 15 minutes per run. It also does not replace you:
every issue it files is a *claim*, and every fix that follows still needs a human
review before it ships. Build the loop — stay the engineer.
