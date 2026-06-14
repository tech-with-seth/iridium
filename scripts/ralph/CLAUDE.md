# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

> SAFETY: ralph.sh launches you with `--dangerously-skip-permissions`. You can
> read, write, and run anything inside this repository / worktree. Scope your
> actions to this checkout only. Do not touch paths outside the repo and do not
> perform irreversible operations (force-push, branch deletion on remotes,
> dropping databases, calling external paid APIs not required by the story).

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file).
2. Read `progress.txt` (start with the `## Codebase Patterns` section if present).
3. Check the current git branch matches PRD `branchName`. If not, check it out (or create it from the repo's default branch).
4. Pick the user story with the **lowest `order`** whose `status` is `"pending"`. Skip stories with `status` of `"done"` or `"blocked"`.
5. Implement that single user story.
6. Run quality checks (typecheck, lint, tests — whatever this project requires).
7. Update nearby `CLAUDE.md` / `AGENTS.md` files if you discovered reusable patterns (see below).
8. If checks pass, stage everything and commit with message: `feat: [Story ID] - [Story Title]`.
9. Update `prd.json` to set the story's `status` to `"done"`.
10. Append your progress to `progress.txt`.

## PRD schema

```json
{
    "project": "MyApp",
    "branchName": "ralph/feature-name",
    "description": "One-line summary of the feature",
    "userStories": [
        {
            "id": "US-001",
            "title": "Story title",
            "description": "As a ..., I want ... so that ...",
            "acceptanceCriteria": [
                "...",
                "Typecheck passes (`bun run typecheck`)"
            ],
            "order": 1,
            "status": "pending",
            "blockedReason": "",
            "notes": ""
        }
    ]
}
```

- `order` — integer execution order (lowest runs first). Not a priority label.
- `status` — one of `"pending"`, `"done"`, `"blocked"`.
- `blockedReason` — required when `status` is `"blocked"`; empty otherwise.

## When to mark a story `blocked`

If you genuinely cannot make progress (missing credentials, ambiguous spec,
upstream dependency broken, a quality check that has been failing on `main`
since before the run started):

1. Leave any partial work uncommitted or revert it.
2. Set the story's `status` to `"blocked"` and write a concise `blockedReason`.
3. Move on to the next pending story in the same iteration if one exists and is independent.
4. Do not repeatedly retry a story you have just marked blocked.

If every remaining pending story is blocked, write
`.ralph-status.json` (see below) with `{"status": "blocked", "reason": "..."}`
so the loop exits cleanly for a human to triage.

## Completion signal

When all stories in `prd.json` have `status` of `"done"`, write a file at
`.ralph-status.json` (sibling of this CLAUDE.md) containing:

```json
{ "status": "complete" }
```

Do not rely on free-form text in your reply — the ralph.sh loop looks at the
status file, not your stdout. After writing the file you may end your response
normally.

If you cannot proceed and want the loop to stop instead of retrying, write:

```json
{ "status": "blocked", "reason": "short human-readable explanation" }
```

## Progress Report Format

APPEND to `progress.txt` (never replace, always append):

```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

The learnings section is critical — it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** future iterations should know, add it to a `## Codebase Patterns` section at the TOP of `progress.txt` (create it if missing):

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are general and reusable, not story-specific.

## Update CLAUDE.md / AGENTS.md Files

Before committing, check whether nearby agent-instruction files should learn from your changes:

1. Identify directories with edited files.
2. Look for an existing `CLAUDE.md` or `AGENTS.md` in those directories or their parents.
3. Add genuinely reusable knowledge:
    - API patterns or conventions specific to that module
    - Non-obvious requirements or gotchas
    - Cross-file dependencies
    - Testing setup specific to that area

Do not add story-specific implementation details, temporary debugging notes, or anything already in `progress.txt`.

## Quality Requirements

- Each story's acceptance criteria name the quality checks to run, with the exact command in backticks (e.g. ``Typecheck passes (`bun run typecheck`)``). Run **those** commands — do not invent your own.
- If a criterion's command does not exist in this project (e.g. it says `bun test` but there are no tests), update the criterion to match the project's actual command and note the substitution in `progress.txt`. If no reasonable check exists, mark the story `blocked`.
- Do NOT commit broken code.
- Keep changes focused and minimal.
- Follow existing code patterns.

## Browser Testing

For any story whose acceptance criteria include "Verify in browser using the agent-browser skill", use the `agent-browser` CLI (`npm i -g agent-browser` if missing, or `brew install agent-browser`). Typical flow:

1. Start the dev server for this project.
2. `agent-browser open <url>` to load the page.
3. `agent-browser snapshot -i` to capture interactive element refs.
4. Drive the flow (`click`, `fill`, `wait`) and re-snapshot after navigation.
5. Capture a screenshot for the progress log if it adds signal.

If `agent-browser` is not installed and you cannot install it (no network, no permissions), mark the story `blocked` with reason `"agent-browser CLI unavailable"` rather than silently skipping verification.

## Iteration discipline

- Work on ONE story per iteration unless you finish it quickly and another pending story is clearly independent.
- Commit frequently.
- Keep CI green.
- Read the `## Codebase Patterns` section in `progress.txt` before starting.
- If the previous iteration left uncommitted changes that are not yours, stop and write a `blocked` status — do not silently absorb them.
