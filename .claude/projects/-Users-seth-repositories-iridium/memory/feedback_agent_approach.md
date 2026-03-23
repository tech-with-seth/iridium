---
name: Agent building approach validated
description: When creating Claude Code agents, the batch approach (build new + port existing in one pass) with sonnet for specialists and opus for architecture was approved
type: feedback
---

When building a set of Claude Code agents, creating all files in parallel (new agents + ported agents from .github/agents/) in a single pass is the right call — no need to split into separate steps.

**Why:** User confirmed with "Good Claude" after building 2 new agents + porting 6 from GitHub format in one batch.

**How to apply:** When agent creation tasks come up, batch the work. Use `model: sonnet` for specialist agents and `model: opus` for architecture-level agents (staff-engineer). Always follow the single-line YAML description format with `\n` literals.
