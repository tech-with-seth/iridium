# Ralph: Autonomous PRD Execution

Ralph is an autonomous AI agent loop that implements user stories from a PRD one at a time. Each iteration spawns a fresh Claude instance with clean context, ensuring focused, high-quality implementations.

## Overview

Ralph automates the tedious work of implementing PRD user stories. You create the PRD, Ralph does the coding—story by story, with quality checks between each.

**The workflow:**

```text
/prd command → Markdown PRD + JSON automation file → Run ralph task → Done
```

## Quick Start

### 1. Create a PRD

Use the `/prd` command in VS Code Copilot Chat:

```text
/prd add user notifications feature
```

Copilot will:

1. Ask 3-5 clarifying questions
2. Generate `tasks/prd-user-notifications.md` (documentation)
3. Generate `plans/prd.json` (automation)
4. Reset `plans/progress.txt` (fresh log)

### 2. Run Ralph

**VS Code:**

```text
Cmd+Shift+P → "Tasks: Run Task" → "ralph"
```

**Terminal:**

```bash
./plans/ralph.sh 10  # 10 iterations max
```

### 3. Watch It Work

Ralph will:

1. Create/checkout branch: `ralph/user-notifications`
2. Pick highest priority story where `passes: false`
3. Implement the story
4. Run `npm run typecheck`
5. Commit if checks pass
6. Update `prd.json` to mark story as `passes: true`
7. Append learnings to `progress.txt`
8. Repeat until all stories pass

## Key Files

| File | Purpose |
|------|---------|
| `plans/ralph.sh` | The bash loop that spawns fresh Claude instances |
| `plans/prd.json` | User stories with `passes` status (the task list) |
| `plans/progress.txt` | Append-only learnings for future iterations |
| `.github/prompts/prd.prompt.md` | PRD generator prompt (used by `/prd` command) |
| `.github/instructions/ralph.instructions.md` | Instructions given to each Claude instance |

## Writing Good PRDs

### Story Sizing: The #1 Rule

**Each story must be completable in ONE iteration (one context window).**

Ralph spawns a fresh Claude instance per iteration with no memory of previous work. If a story is too big, Claude runs out of context and produces broken code.

#### Right-sized stories ✅

- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list
- Update copy/content in a specific section

#### Too big (split these) ❌

- "Build the entire dashboard" → Split into: schema, queries, UI components, filters
- "Add authentication" → Split into: schema, middleware, login UI, session handling
- "Refactor the API" → Split into one story per endpoint

**Rule of thumb:** If you can't describe the change in 2-3 sentences, it's too big.

### Dependency Ordering

Stories execute in priority order. Earlier stories must NOT depend on later ones.

**Correct order:**

1. Schema/database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard/summary views that aggregate data

**Wrong order:**

1. UI component (depends on schema that doesn't exist yet)
2. Schema change

### Acceptance Criteria

Every criterion must be something Ralph can CHECK, not vague.

**Good (verifiable):**

- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Clicking delete shows confirmation dialog"
- "Typecheck passes"

**Bad (vague):**

- "Works correctly"
- "Good UX"
- "Handles edge cases"

**Required criteria:**

- Every story: `Typecheck passes`
- UI stories: `Verify in browser using dev-browser skill`

## prd.json Format

```json
{
  "project": "Iridium",
  "branchName": "ralph/feature-name",
  "description": "Feature description",
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

**Fields:**

- `branchName`: Auto-derived from PRD filename (`prd-feature.md` → `ralph/feature`)
- `priority`: Lower = earlier execution (1 runs first)
- `passes`: Set to `true` by Ralph after successful implementation
- `notes`: Ralph may add implementation notes here

## Monitoring Progress

### Check story status

```bash
cat plans/prd.json | jq '.userStories[] | {id, title, passes}'
```

### View learnings

```bash
cat plans/progress.txt
```

### Check git history

```bash
git log --oneline -10
```

## Debugging

### Ralph exits immediately

**Cause:** `prd.json` is empty or missing stories.

**Fix:** Run `/prd` command to generate a populated PRD.

### Story keeps failing

**Cause:** Story is too big or has unclear acceptance criteria.

**Fix:**

1. Split into smaller stories
2. Make acceptance criteria more specific
3. Check `progress.txt` for error details

### Quality checks fail

Ralph won't commit broken code. If typecheck fails:

1. Check `progress.txt` for the error
2. Ralph will attempt to fix in the same iteration
3. If it can't fix, the iteration ends without committing

## Archiving

Ralph automatically archives previous runs when you start a new feature (different `branchName`). Archives are saved to `plans/archive/YYYY-MM-DD-feature-name/`.

## How It Works

```text
┌─────────────────────────────────────────────────────────────┐
│                      ralph.sh loop                          │
├─────────────────────────────────────────────────────────────┤
│  for each iteration:                                        │
│    1. Check prd.json has stories                            │
│    2. Pipe ralph.instructions.md to Claude CLI              │
│    3. Claude reads prd.json, picks next story               │
│    4. Claude implements story, runs typecheck               │
│    5. If pass: commit, update prd.json passes=true          │
│    6. Claude appends learnings to progress.txt              │
│    7. If all stories pass: output <promise>COMPLETE</promise>│
│    8. Loop continues or exits based on completion signal     │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** Each iteration is a fresh Claude instance. The only memory between iterations is:

- Git history (commits from previous iterations)
- `progress.txt` (learnings and context)
- `prd.json` (which stories are done)

## Best Practices

1. **Review the PRD before running Ralph** - Catch issues before automation
2. **Start with small max_iterations** - Use `./plans/ralph.sh 3` to test
3. **Check progress.txt regularly** - Contains valuable debugging info
4. **Keep stories focused** - One clear change per story
5. **Include typecheck in every story** - Prevents broken code propagation

## Related Documentation

- [Build Your First Feature](./build-your-first-feature.md) - Manual feature building guide
- [Development Workflow](./development.md) - Day-to-day development practices
- [Testing](./testing.md) - Quality assurance patterns
