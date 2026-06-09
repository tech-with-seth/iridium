# The Iridium loop

This repo is set up for **loop engineering**: instead of prompting an agent turn
by turn, you run small systems that prompt the agents for you. The pieces below
already exist in the repo; this directory adds the one that was missing — the
scheduled **heartbeat** — and the durable **memory** the loop runs on.

## The pieces (and where they live)

| Loop pillar    | In this repo                                                              |
| -------------- | ------------------------------------------------------------------------- |
| **Heartbeat**  | `.github/workflows/triage.yml` — scheduled discovery + triage             |
| **Memory**     | `docs/loop/state.md` — survives between runs; the agent forgets, it doesn't |
| **Skills**     | `.claude/skills/` — incl. `triage` (the loop's brain) and `iridium-form`  |
| **Sub-agents** | `.claude/agents/` — `staff-engineer`, `security-auditor`, `prisma`, …     |
| **Worktrees**  | `scripts/ralph/ralph.sh` (run in one) + subagent `isolation: worktree`    |
| **Connectors** | GitHub, Linear, context7 MCP servers                                      |
| **Execution**  | `scripts/ralph/` — the autonomous loop that *does* the work               |

## How the heartbeat works

```
schedule (weekday mornings)
        │
        ▼
triage.yml ──runs──▶ /triage skill
                          │
        reads: recent commits · latest CI run · open issues
                          │
        writes: docs/loop/state.md   (durable memory)
        files:  GitHub issues labeled `triage`   (actionable work)
```

Triage **discovers and records only** — it never fixes code or opens PRs.
Execution is a deliberately separate stage so the maker is never the checker.

## Operating it

- **Run it now:** Actions tab → *Triage Loop* → *Run workflow* (`workflow_dispatch`).
- **Run it locally / in a session:** invoke the `triage` skill (`/triage`).
- **Steer it:** edit the `Operator notes` section of `docs/loop/state.md`. The
  loop reads and obeys it (e.g. "ignore the legacy/ dir", "focus on auth").
- **Change cadence:** edit the `cron` in `triage.yml`.
- **Turn it off:** delete `triage.yml`, or disable *Triage Loop* in the Actions tab.

## Required setup

The workflow needs an `ANTHROPIC_API_KEY` repository secret. The built-in
`GITHUB_TOKEN` covers issue filing and committing `state.md`.

## A note on cost and quality

Scheduled agents spend tokens whether or not they find anything, so this loop
runs on Sonnet, prefers cheap reads (`git log`, `--log-failed`) over reading the
whole tree, and is capped at 15 minutes per run. It also does not replace you:
every issue it files is a *claim*, and every fix that follows still needs a human
review before it ships. Build the loop — stay the engineer.
