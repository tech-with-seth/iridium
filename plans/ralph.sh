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
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi
  
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
