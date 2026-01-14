---
alwaysApply: true
---

# Git Workflow & Merge Strategy

## Overview

This document establishes the **canonical git workflow and merge strategy** for this project. Following these patterns prevents branch divergence, merge conflicts, and lost work.

## Branch Philosophy

**`dev` is the source of truth.** All active development happens on `dev`. The `main` branch is a stable snapshot promoted from `dev` for releases.

```
dev  ← Primary development branch (source of truth)
  ↓
main ← Stable release branch (promoted from dev)
```

## Core Principles

1. **Work exclusively on `dev`** - Never work directly on `main`
2. **Single direction flow** - Changes flow from `dev` → `main`, not bidirectionally
3. **Fast-forward merges only** - Keep history linear and clean
4. **No simultaneous work** - Never commit to both branches in parallel

## Recommended Workflow

### Daily Development (Primary Pattern)

```bash
# Work exclusively on dev
git checkout dev

# Make changes, commit frequently
git add .
git commit -m "feat: add user profile page"

# Push to remote
git push origin dev
```

### Promoting Dev to Main (Release)

When ready to release stable changes from `dev` to `main`:

```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Switch to main and fast-forward to dev
git checkout main
git merge --ff-only dev

# If fast-forward fails, main has diverged (see troubleshooting below)
```

**What is `--ff-only`?**
- Fast-forward only merge - no merge commit created
- Only succeeds if `main` has no unique commits
- Keeps history linear and clean
- **Fails safely** if branches have diverged

```bash
# Push to remote
git push origin main

# Return to dev
git checkout dev
```

### ✅ CORRECT: Feature Branch Pattern (Advanced)

For larger features or collaborative work:

```bash
# Create feature branch from dev
git checkout dev
git checkout -b feature/user-authentication

# Work on feature
git add .
git commit -m "feat: implement login form"

# Merge back to dev when complete
git checkout dev
git merge feature/user-authentication

# Delete feature branch
git branch -d feature/user-authentication

# Push dev
git push origin dev

# Periodically promote to main
git checkout main
git merge --ff-only dev
git push origin main
```

## Common Scenarios

### Scenario 1: Main and Dev Have Diverged

**Problem:** Someone accidentally worked on both branches simultaneously.

**Symptoms:**
```bash
git checkout main
git merge --ff-only dev
# fatal: Not possible to fast-forward, aborting.
```

**Solution:** Make `main` conform to `dev` (since `dev` is source of truth):

```bash
# Check what's different
git log main..dev --oneline  # Commits in dev but not main
git log dev..main --oneline  # Commits in main but not dev

# If main has no important unique commits, reset it to dev
git checkout main
git reset --hard dev

# Force push to remote (use --force-with-lease for safety)
git push origin main --force-with-lease

# Return to dev
git checkout dev
```

**⚠️ Warning:** `--force-with-lease` is safer than `--force` because it fails if someone else pushed to `main` since your last fetch.

### Scenario 2: Need to Backport a Fix from Main

**Rare scenario** - If an emergency fix was made on `main`:

```bash
# Immediately sync it to dev
git checkout main
git pull origin main

git checkout dev
git merge main  # Use merge (not rebase) to preserve context
git push origin dev
```

### Scenario 3: Accidental Commit to Main

**If you accidentally committed to `main`:**

```bash
# Don't push! Cherry-pick to dev instead
git log main --oneline -1  # Note the commit hash

git checkout dev
git cherry-pick <commit-hash>
git push origin dev

# Reset main back to match origin
git checkout main
git reset --hard origin/main
```

## Merge vs Rebase

### When to Use Merge (Recommended for Most Cases)

```bash
# ✅ Use merge for:
git merge main              # Syncing branches
git merge feature/my-work   # Incorporating feature branches
git merge --ff-only dev     # Promoting dev to main
```

**Advantages:**
- Preserves complete history
- Shows when and why branches were integrated
- Safe - doesn't rewrite history
- Standard Git workflow

### When to Use Rebase (Advanced Users Only)

```bash
# ⚠️ Use rebase carefully for:
git rebase dev  # Updating feature branch with latest dev changes
```

**Only rebase if:**
- Working on a private feature branch (not pushed to remote)
- Want to clean up commits before merging
- Understand the risks of rewriting history

**Never rebase if:**
- ❌ Branch is pushed to remote
- ❌ Other people are using the branch
- ❌ Working on `main` or `dev`

## Anti-Patterns to Avoid

### ❌ Working on Both Branches Simultaneously

**BAD:**
```bash
# Day 1
git checkout main
git commit -m "add navbar"
git push origin main

# Day 2
git checkout dev
git commit -m "add navbar"  # Duplicate work!
git push origin dev

# Result: Branches diverged with duplicate commits
```

**GOOD:**
```bash
# Always work on dev only
git checkout dev
git commit -m "add navbar"
git push origin dev

# Promote to main when ready
git checkout main
git merge --ff-only dev
git push origin main
```

### ❌ Using `--force` Instead of `--force-with-lease`

**BAD:**
```bash
git push origin main --force  # Might overwrite others' work!
```

**GOOD:**
```bash
git push origin main --force-with-lease  # Fails safely if remote changed
```

### ❌ Merging Main into Dev with Conflicts

**BAD:**
```bash
git checkout dev
git merge main
# CONFLICT... spend hours resolving
```

**GOOD:**
```bash
# If main and dev diverged, make main conform to dev:
git checkout main
git reset --hard dev
git push origin main --force-with-lease
```

### ❌ Using Bidirectional Merges

**BAD:**
```bash
# Merge main → dev, then dev → main, creating merge commit loops
git checkout dev
git merge main

git checkout main
git merge dev

# Result: Tangled history with unnecessary merge commits
```

**GOOD:**
```bash
# Single direction: dev → main only
git checkout main
git merge --ff-only dev
```

## Visual History Examples

### ✅ GOOD: Clean Linear History

```
* 1f4bca4 (HEAD -> dev, origin/main, origin/dev, main) feat: add docker entrypoint
* 83b3427 refactor: remove profile API route
* 208f3c2 feat: add navbar and tabs
* 2b84951 feat: update environment variables
```

All branches point to the same commit. History is linear and easy to follow.

### ❌ BAD: Diverged Branches

```
* 1f4bca4 (HEAD -> dev, origin/dev) feat: add docker entrypoint
| * b657eb3 (origin/main, main) feat: remove unused import
| * 208f3c2 feat: add navbar
|/
* 2b84951 feat: update environment variables
```

Branches have diverged with duplicate work. Requires force push to fix.

## Emergency Procedures

### Fix 1: Diverged Branches (Dev is Correct)

```bash
# 1. Verify dev is correct
git log dev --oneline -5

# 2. Reset main to match dev
git checkout main
git reset --hard dev

# 3. Force push with safety check
git push origin main --force-with-lease

# 4. Return to dev
git checkout dev
```

### Fix 2: Diverged Branches (Main is Correct)

**Rare scenario** - Only if `main` has critical fixes not in `dev`:

```bash
# 1. Verify main is correct
git log main --oneline -5

# 2. Reset dev to match main
git checkout dev
git reset --hard main

# 3. Force push with safety check
git push origin dev --force-with-lease
```

### Fix 3: Accidentally Pushed to Wrong Branch

```bash
# 1. Cherry-pick commits to correct branch
git checkout dev  # Correct branch
git cherry-pick <commit-hash>
git push origin dev

# 2. Reset wrong branch
git checkout main  # Wrong branch
git reset --hard origin/main
git push origin main --force-with-lease
```

## Checking Branch Status

### View Divergence

```bash
# Commits in dev but not in main
git log main..dev --oneline

# Commits in main but not in dev
git log dev..main --oneline

# Visual graph of recent history
git log --oneline --graph --all --decorate -10
```

### Check if Fast-Forward is Possible

```bash
# Try to merge with --ff-only (won't actually merge if it fails)
git checkout main
git merge --ff-only dev --no-commit
git merge --abort  # Abort the test merge
```

## Best Practices

1. **Commit frequently on `dev`** - Small, focused commits are easier to manage
2. **Write descriptive commit messages** - Follow conventional commits format
3. **Pull before push** - Always `git pull origin dev` before pushing
4. **Promote to main periodically** - Don't let `dev` get too far ahead
5. **Use `--force-with-lease`** - Never use bare `--force`
6. **Check status before operations** - Use `git log` to understand current state
7. **Communicate with team** - Coordinate before force pushing shared branches

## Quick Reference

```bash
# Normal development
git checkout dev
git pull origin dev
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin dev

# Promote dev to main
git checkout main
git merge --ff-only dev
git push origin main
git checkout dev

# Fix diverged branches (dev is source of truth)
git checkout main
git reset --hard dev
git push origin main --force-with-lease
git checkout dev

# Check branch status
git log main..dev --oneline          # Commits ahead in dev
git log dev..main --oneline          # Commits ahead in main
git log --oneline --graph --all -10  # Visual history
```

## Related Documentation

- React Router: `.github/instructions/react-router.instructions.md`
- CRUD Pattern: `.github/instructions/crud-pattern.instructions.md`
- Component Patterns: `.github/instructions/component-patterns.instructions.md`
