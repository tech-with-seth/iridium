#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [max_iterations]

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"
INSTRUCTIONS_FILE="$REPO_ROOT/.github/instructions/ralph.instructions.md"

# Fail fast if the instructions file is missing.
if [ ! -f "$INSTRUCTIONS_FILE" ]; then
  echo "Error: instructions file not found at $INSTRUCTIONS_FILE"
  exit 1
fi

# Fail fast if prd.json is missing or has no user stories
if [ ! -f "$PRD_FILE" ]; then
  echo "Error: prd.json not found at $PRD_FILE"
  echo ""
  echo "To create a PRD, use the /prd command in VS Code Copilot Chat."
  echo "Example: /prd add user notifications feature"
  exit 1
fi

STORY_COUNT=$(jq '.userStories | length' "$PRD_FILE" 2>/dev/null || echo "0")
if [ "$STORY_COUNT" -eq 0 ]; then
  echo "Error: prd.json has no user stories."
  echo ""
  echo "The PRD file exists but contains no stories to implement."
  echo "Use the /prd command to generate a PRD with user stories."
  echo "Example: /prd add user notifications feature"
  exit 1
fi

echo "Found $STORY_COUNT user stories in prd.json"

# Get branch name from PRD
BRANCH_NAME=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
if [ -z "$BRANCH_NAME" ]; then
  echo "Error: prd.json missing branchName field"
  exit 1
fi

# Ensure we're on the correct branch (shell handles this, not Claude)
CURRENT_GIT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_GIT_BRANCH" != "$BRANCH_NAME" ]; then
  echo "Switching to branch: $BRANCH_NAME"
  git fetch origin 2>/dev/null || true
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    git checkout "$BRANCH_NAME"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
  else
    echo "Creating new branch: $BRANCH_NAME from main"
    git checkout main
    git pull origin main
    git checkout -b "$BRANCH_NAME"
  fi
fi
echo "Working on branch: $(git branch --show-current)"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")
  
  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    # Archive the previous run
    DATE=$(date +%Y-%m-%d)
    # Strip "ralph/" prefix from branch name for folder
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"
    
    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"
    
    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"
  
  # Run Claude Code with the Ralph instructions
  OUTPUT=$(cat "$INSTRUCTIONS_FILE" | claude --dangerously-skip-permissions --model opus 2>&1 | tee /dev/stderr)
  CLAUDE_STATUS=$?
  if [ $CLAUDE_STATUS -ne 0 ]; then
    echo "Warning: Claude command failed with exit code $CLAUDE_STATUS. Continuing..."
  fi
  
  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    # Verify all stories actually pass before accepting completion
    INCOMPLETE=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE" 2>/dev/null || echo "999")
    if [ "$INCOMPLETE" -gt 0 ]; then
      echo ""
      echo "Warning: COMPLETE signal received but $INCOMPLETE stories still have passes: false"
      echo "Continuing to next iteration..."
      sleep 2
      continue
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✅ Ralph completed all $STORY_COUNT stories!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Branch: $BRANCH_NAME"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: git log --oneline -10"
    echo "  2. Push branch: git push origin $BRANCH_NAME"
    echo "  3. Create PR: gh pr create"
    echo ""
    exit 0
  fi
  
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
