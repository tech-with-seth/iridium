---
name: ralph
description: "Convert PRDs to prd.json format for the Ralph autonomous agent system. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json."
user-invocable: true
---

# Ralph PRD Converter

Converts existing PRDs to the prd.json format that Ralph uses for autonomous execution.

---

## The Job

Take a PRD (markdown file or text) and convert it to `prd.json` next to the project's `ralph.sh`.

---

## Output Location (do this first)

`ralph.sh` reads `prd.json` from its **own directory** (`SCRIPT_DIR/prd.json`). Writing prd.json anywhere else means the loop will spin against a stale or empty PRD with no error.

Before writing, locate the script:

1. From the project root, search for `ralph.sh`:
    ```bash
    find . -name ralph.sh -not -path '*/node_modules/*' -not -path '*/.git/*'
    ```
2. The conventional location (set up by `tws script add ralph`) is `scripts/ralph/ralph.sh`. Write the PRD to `scripts/ralph/prd.json`.
3. If multiple `ralph.sh` files exist, ask the user which one.
4. If **no** `ralph.sh` exists, stop and tell the user:

    > Ralph is not set up in this project. Run `tws script add ralph` (or copy `ralph.sh`, `CLAUDE.md`, and `prd.json.example` from the ralph repo into `scripts/ralph/`) before generating the PRD.

    Do NOT write `prd.json` to a guessed path.

After writing, archive any pre-existing `prd.json` from a different feature (see "Archiving Previous Runs" below), then confirm the file landed where ralph.sh will read it:

```bash
ls -l "$(dirname $(find . -name ralph.sh | head -1))/prd.json"
```

---

## Output Format

```json
{
    "project": "[Project Name]",
    "branchName": "ralph/[feature-name-kebab-case]",
    "description": "[Feature description from PRD title/intro]",
    "userStories": [
        {
            "id": "US-001",
            "title": "[Story title]",
            "description": "As a [user], I want [feature] so that [benefit]",
            "acceptanceCriteria": [
                "Criterion 1",
                "Criterion 2",
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

### Field reference

- `order` — integer execution order. Lowest runs first. Encodes dependency order, not high/medium/low importance.
- `status` — `"pending"` (not started), `"done"` (Ralph completed it), or `"blocked"` (agent flagged it for human attention).
- `blockedReason` — required text when `status` is `"blocked"`; empty otherwise.
- `notes` — free-form notes carried across iterations.

When you create a fresh PRD, every story starts as `status: "pending"` with empty `blockedReason` and `notes`.

---

## Story Size: The Number One Rule

**Each story must be completable in ONE Ralph iteration (one context window).**

Ralph spawns a fresh Claude Code instance per iteration with no memory of previous work. If a story is too big, the LLM runs out of context before finishing and produces broken code.

### Right-sized stories:

- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

### Too big (split these):

- "Build the entire dashboard" - Split into: schema, queries, UI components, filters
- "Add authentication" - Split into: schema, middleware, login UI, session handling
- "Refactor the API" - Split into one story per endpoint or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

---

## Story Ordering: Dependencies First

Stories execute in `order` (ascending). Earlier stories must not depend on later ones.

**Correct order:**

1. Schema/database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard/summary views that aggregate data

**Wrong order:**

1. UI component (depends on schema that does not exist yet)
2. Schema change

---

## Acceptance Criteria: Must Be Verifiable

Each criterion must be something Ralph can CHECK, not something vague.

### Good criteria (verifiable):

- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Clicking delete shows confirmation dialog"
- "Typecheck passes (`bun run typecheck`)"
- "Tests pass (`bun test`)"

### Bad criteria (vague):

- "Works correctly"
- "User can do X easily"
- "Good UX"
- "Handles edge cases"

### Always include at least one project quality-check criterion

Do NOT hardcode "Typecheck passes" — many projects (Python, Ruby, Go, plain JS) have no typecheck step, and the agent will either fake completion or loop forever. Before generating the PRD, inspect the project root and pick the strongest check available:

| Signal in project root                     | Suggested criterion                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `package.json` with `"typecheck"` script   | ``Typecheck passes (`bun run typecheck`)``                              |
| `package.json` with `"test"` script        | ``Tests pass (`bun test`)``                                             |
| `package.json` with `"lint"` script        | ``Lint passes (`bun run lint`)``                                        |
| `tsconfig.json` but no `typecheck` script  | ``Typecheck passes (`bunx tsc --noEmit`)``                              |
| `pyproject.toml` / `setup.py` + pytest     | ``Tests pass (`pytest`)``                                               |
| `pyproject.toml` with ruff/mypy configured | ``Lint passes (`ruff check .`)``, ``Types pass (`mypy .`)``             |
| `Cargo.toml`                               | ``Build succeeds (`cargo check`)``, ``Tests pass (`cargo test`)``       |
| `Gemfile` + rspec                          | ``Tests pass (`bundle exec rspec`)``                                    |
| `go.mod`                                   | ``Build succeeds (`go build ./...`)``, ``Tests pass (`go test ./...`)`` |
| None of the above                          | `Code compiles / starts without errors`                                 |

Pick the most meaningful check the project actually has. Prefer typecheck > tests > lint > build when multiple apply. Always write the criterion with the **exact command in backticks** so the agent runs the same check you intended.

For stories with testable logic, also include a "Tests pass (`<test command>`)" criterion.

### For stories that change UI, also include:

```
"Verify in browser using the agent-browser skill"
```

Frontend stories are NOT complete until visually verified. Ralph will use the agent-browser skill (CLI: `agent-browser`) to navigate to the page, interact with the UI, and confirm changes work.

---

## Conversion Rules

1. **Each user story becomes one JSON entry**
2. **IDs**: Sequential (US-001, US-002, etc.)
3. **order**: Based on dependency order, then document order (1, 2, 3, ...)
4. **All stories**: `status: "pending"`, `blockedReason: ""`, `notes: ""`
5. **branchName**: Derive from feature name, kebab-case, prefixed with `ralph/`
6. **Always add a project quality-check criterion** to every story (see "Always include at least one project quality-check criterion" above). Include the exact command in backticks so the agent runs it as written.

---

## Splitting Large PRDs

If a PRD has big features, split them:

**Original:**

> "Add user notification system"

**Split into:**

1. US-001: Add notifications table to database
2. US-002: Create notification service for sending notifications
3. US-003: Add notification bell icon to header
4. US-004: Create notification dropdown panel
5. US-005: Add mark-as-read functionality
6. US-006: Add notification preferences page

Each is one focused change that can be completed and verified independently.

---

## Example

**Input PRD:**

```markdown
# Task Status Feature

Add ability to mark tasks with different statuses.

## Requirements

- Toggle between pending/in-progress/done on task list
- Filter list by status
- Show status badge on each task
- Persist status in database
```

**Output prd.json:**

```json
{
    "project": "TaskApp",
    "branchName": "ralph/task-status",
    "description": "Task Status Feature - Track task progress with status indicators",
    "userStories": [
        {
            "id": "US-001",
            "title": "Add status field to tasks table",
            "description": "As a developer, I need to store task status in the database.",
            "acceptanceCriteria": [
                "Add status column: 'pending' | 'in_progress' | 'done' (default 'pending')",
                "Generate and run migration successfully",
                "Typecheck passes (`bun run typecheck`)"
            ],
            "order": 1,
            "status": "pending",
            "blockedReason": "",
            "notes": ""
        },
        {
            "id": "US-002",
            "title": "Display status badge on task cards",
            "description": "As a user, I want to see task status at a glance.",
            "acceptanceCriteria": [
                "Each task card shows colored status badge",
                "Badge colors: gray=pending, blue=in_progress, green=done",
                "Typecheck passes (`bun run typecheck`)",
                "Verify in browser using the agent-browser skill"
            ],
            "order": 2,
            "status": "pending",
            "blockedReason": "",
            "notes": ""
        },
        {
            "id": "US-003",
            "title": "Add status toggle to task list rows",
            "description": "As a user, I want to change task status directly from the list.",
            "acceptanceCriteria": [
                "Each row has status dropdown or toggle",
                "Changing status saves immediately",
                "UI updates without page refresh",
                "Typecheck passes (`bun run typecheck`)",
                "Verify in browser using the agent-browser skill"
            ],
            "order": 3,
            "status": "pending",
            "blockedReason": "",
            "notes": ""
        },
        {
            "id": "US-004",
            "title": "Filter tasks by status",
            "description": "As a user, I want to filter the list to see only certain statuses.",
            "acceptanceCriteria": [
                "Filter dropdown: All | Pending | In Progress | Done",
                "Filter persists in URL params",
                "Typecheck passes (`bun run typecheck`)",
                "Verify in browser using the agent-browser skill"
            ],
            "order": 4,
            "status": "pending",
            "blockedReason": "",
            "notes": ""
        }
    ]
}
```

---

## Archiving Previous Runs

**Before writing a new prd.json, check if there is an existing one from a different feature:**

1. Read the current `prd.json` if it exists
2. Check if `branchName` differs from the new feature's branch name
3. If different AND `progress.txt` has content beyond the header:
    - Create archive folder: `archive/YYYY-MM-DD-feature-name/`
    - Copy current `prd.json` and `progress.txt` to archive
    - Reset `progress.txt` with fresh header

**The ralph.sh script handles this automatically** when you run it, but if you are manually updating prd.json between runs, archive first.

---

## Checklist Before Saving

Before writing prd.json, verify:

- [ ] **Located `ralph.sh`** and resolved the output path to `<dir of ralph.sh>/prd.json` (do not guess — see "Output Location")
- [ ] **Previous run archived** (if prd.json exists with different branchName, archive it first)
- [ ] Each story is completable in one iteration (small enough)
- [ ] Stories are ordered by dependency (schema to backend to UI)
- [ ] Every story has a project-specific quality-check criterion with the exact command in backticks (never bare "Typecheck passes")
- [ ] UI stories have "Verify in browser using the agent-browser skill" as criterion
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] No story depends on a later story
