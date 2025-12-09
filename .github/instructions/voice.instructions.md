# Voice & Tone Guidelines

This document defines the voice and marketing communication style for Iridium. These guidelines help maintain a consistent, welcoming, and enthusiastic brand presence across all documentation, marketing materials, and user-facing content.

## Core Voice Principles

Iridium's voice is:

1. **Helpful & Light** - We're here to make your life easier, not add complexity
2. **Positively Enthusiastic** - We celebrate what's possible, not what's limiting
3. **Humbly Passionate** - We love what we do, but we're always learning alongside you
4. **Grounded in Reality** - Practical solutions for real developers, not theoretical perfection

## The Iridium Personality

Think of Iridium as **the encouraging mentor you wish you had**:

- **Knowledgeable without being condescending** - We know the patterns that work, and we're excited to share them
- **Enthusiastic without being overwhelming** - We're genuinely excited about clean architecture, but we keep it practical
- **Confident without being arrogant** - We've built this with care, but we know it can always improve
- **Honest without being negative** - We acknowledge trade-offs while focusing on solutions

## Writing Style Guidelines

### Always

 **Focus on possibilities** - "You can build auth in minutes" not "Don't struggle with auth"
 **Celebrate what works** - Highlight the value and potential of each pattern
 **Be conversational** - Write like you're explaining to a friend over coffee
 **Show genuine excitement** - When something is genuinely cool, let it show!
 **Acknowledge the journey** - "We've all been there" beats "Don't make this mistake"
 **Empower the reader** - "You'll be able to..." instead of "You must..."
 **Stay practical** - Real examples, real problems, real solutions

### Never

L **Use negative framing** - Avoid "Don't", "Can't", "Won't", "Avoid", "Never" when possible
L **Create fear or anxiety** - No "this will break" or "you'll regret it"
L **Sound condescending** - No "Obviously" or "Everyone knows"
L **Be overly corporate** - Skip the buzzwords and marketing speak
L **Oversell or hype** - Stay grounded in what Iridium actually delivers
L **Sound arrogant** - We're building together, not teaching down

## Tone by Context

### Documentation (Technical)

**Tone:** Clear, helpful, encouraging

```markdown
 GOOD:
"Iridium uses config-based routing, which gives you complete control over your
route structure. You can organize routes by feature, create nested layouts,
and maintain clean file organization without fighting with file-naming conventions."

L AVOID:
"You MUST use config-based routing. File-based routing is a nightmare and will
cause problems. Don't even think about using flat route conventions."
```

### Marketing Copy

**Tone:** Enthusiastic, welcoming, authentic

```markdown
 GOOD:
"Ready to build? Iridium ships with everything you need: authentication that
just works, type-safe routing from day one, and patterns that grow with your app.
Let's create something remarkable together."

L AVOID:
"Iridium is the ULTIMATE React Router 7 starter. Stop wasting time with inferior
solutions. Join thousands of developers who've already made the switch."
```

### Error Messages & Warnings

**Tone:** Helpful, solution-focused, calm

```markdown
 GOOD:
"Looks like the route types haven't been generated yet. Run `npm run typecheck`
to get everything synced up. This happens automatically when you start the dev
server, so you're all set for next time!"

L AVOID:
"ERROR: Missing types. This is critical and will break everything. You should
have run typecheck first. Your build will fail."
```

### README & Getting Started

**Tone:** Welcoming, exciting, clear

```markdown
 GOOD:
"Welcome to Iridium! This starter is designed to help you ship fast while
maintaining the patterns that scale. We've put together auth, routing, and
validation so you can focus on what makes your app unique."

L AVOID:
"This is a React Router 7 starter. Follow the setup instructions carefully
to avoid problems. Make sure you read all documentation before starting."
```

## Vocabulary Guidelines

### Words We Love

Use these to convey enthusiasm and helpfulness:

- **"You can"** / **"You'll be able to"** - Empowering
- **"Let's"** - Collaborative
- **"Ready to"** - Encouraging action
- **"Designed to help"** - Purpose-driven
- **"We've built"** - Ownership with humility
- **"Works beautifully with"** - Celebrating compatibility
- **"Grows with your app"** - Long-term thinking
- **"Makes it simple to"** - Removing friction
- **"Potential"** / **"Possibilities"** - Forward-looking

### Words We Minimize

Reduce or eliminate these:

- **"Must"** / **"Required"** � Use "You'll need" or "We recommend"
- **"Never"** / **"Don't"** � Reframe positively: "We suggest" or "Works best when"
- **"Wrong"** / **"Bad"** � Use "Alternative approach" or "Consider this instead"
- **"Obviously"** / **"Clearly"** � Just explain it; what's clear to us may not be to everyone
- **"Just"** / **"Simply"** � Skip the diminishing language; respect the reader's effort
- **"Should"** � Use "Consider" or "We recommend"

## Pattern Examples

### Before & After: Technical Documentation

L **Before (Too Strict):**

```markdown
## Critical Rule: Route Type Imports

You MUST NEVER use relative paths for route type imports. This will break
TypeScript and cause build failures. Always use `./+types/routeName`.

Don't do this:
import type { Route } from "../+types/dashboard"; // WRONG!

Do this instead:
import type { Route } from "./+types/dashboard"; // CORRECT!
```

 **After (Helpful & Encouraging):**

```markdown
## Route Type Imports Pattern

Iridium's type generation creates route types relative to each file, which keeps
everything organized and TypeScript happy. You'll want to use `./+types/routeName`
for your imports:

// This pattern keeps types clean and reliable
import type { Route } from "./+types/dashboard";

When TypeScript can't find the types, it usually means they need to be generated.
Running `npm run typecheck` will get you back on track!
```

### Before & After: Marketing Copy

L **Before (Overselling):**

```markdown
Iridium is the most advanced, feature-complete, enterprise-grade React Router 7
starter on the market. Stop wasting time with other solutions that will let you
down. Join the revolution.
```

 **After (Authentic & Enthusiastic):**

```markdown
Iridium brings together the patterns we've found most valuable building production
React Router 7 apps. Auth that works, type-safety that scales, and a structure
that grows with your ideas. We're excited to see what you'll build!
```

### Before & After: Error Guidance

L **Before (Creating Anxiety):**

```markdown
## ERROR: Form Submission Failed

You probably forgot to validate on the server. This is a critical security issue
that will expose your app to attacks. Never trust client-side validation alone.
This mistake could cost you.
```

 **After (Solution-Focused):**

```markdown
## Form Validation Pattern

Iridium validates forms on both client and server using the same Zod schema.
The client gives users instant feedback, while the server ensures security.
Here's how to set up both sides:

[Clear example with code]

This pattern gives you the best of both worlds: great UX and solid security!
```

## Special Considerations

### Technical Accuracy

Being positive doesn't mean being vague. We maintain technical precision while staying encouraging:

 **GOOD:**

```markdown
The model layer provides a clean separation between your business logic and
data access. You'll find this pattern makes testing easier and helps your
codebase scale gracefully as features grow.
```

### Acknowledging Complexity

When something is genuinely complex, we acknowledge it while building confidence:

 **GOOD:**

```markdown
BetterAuth integration involves several moving parts: session management, cookie
handling, and middleware patterns. We've set this up with care, and the patterns
guide shows you exactly how each piece fits together. Take your time with this
sectionit's the foundation that makes everything else straightforward.
```

### Discussing Trade-offs

We're honest about limitations while focusing on solutions:

 **GOOD:**

```markdown
We've kept Iridium lean by focusing on core patterns. While billing and
multi-tenancy aren't included out of the box, the architecture supports adding
them when your app is ready to grow in that direction. The horizontal slice
pattern makes this kind of expansion natural.
```

## Brand Voice in Different Channels

### GitHub README

**Tone:** Welcoming, clear, actionable

Focus on:

- Quick value proposition
- Getting started steps
- What's included and why it matters
- Invitation to explore

### Documentation

**Tone:** Educational, encouraging, thorough

Focus on:

- Clear explanations with examples
- The "why" behind each pattern
- Practical guidance
- Building confidence

### Code Comments

**Tone:** Helpful, context-providing

Focus on:

- Why, not just what
- Edge cases explained
- References to relevant patterns
- Future developer clarity

### Commit Messages

**Tone:** Clear, professional, purposeful

Focus on:

- What changed and why
- Impact on developers
- Clear categorization (feat, fix, docs, etc.)

## Quality Checklist

Before publishing any content, verify:

- [ ] Is the tone welcoming and encouraging?
- [ ] Does it focus on what's possible rather than what's prohibited?
- [ ] Have I removed unnecessary negative language?
- [ ] Is the enthusiasm genuine and grounded?
- [ ] Would I want to read this as a new developer?
- [ ] Does it respect the reader's intelligence and time?
- [ ] Is technical accuracy maintained while staying approachable?
- [ ] Does it build confidence rather than create anxiety?

## Examples from the Codebase

###  Great Examples

**From CLAUDE.md:**

> "Iridium is now a small, opinionated starter for React Router 7 apps."

_Why it works:_ Clear positioning, humble ("small"), confident ("opinionated")

**From horizontal-slice.instructions.md:**

> "The horizontal slice enables these vertical slices"

_Why it works:_ Focuses on potential and enablement, not restrictions

### <� Opportunities to Improve

**Current:**

> "L NEVER do this in routes:"

**Could be:**

> "The model layer handles this beautifully:"

**Current:**

> "You MUST use the singleton Prisma client"

**Could be:**

> "The singleton Prisma client keeps connections efficient:"

## Voice Evolution

Iridium's voice will grow with the project:

- **Listen** to how the community talks about Iridium
- **Adapt** language that resonates while staying authentic
- **Refine** patterns that work, adjust what doesn't
- **Stay humble** about what we don't know yet
- **Celebrate** wins from the community

## Summary

Iridium's voice is your enthusiastic, knowledgeable friend who's excited to build great software together. We:

- **Celebrate possibilities** over pointing out problems
- **Build confidence** rather than creating anxiety
- **Stay grounded** while showing genuine enthusiasm
- **Focus on solutions** instead of dwelling on mistakes
- **Respect developers** by being clear, helpful, and authentic

When in doubt, ask yourself: "Would this make a developer excited to use Iridium, or would it make them anxious?" Always lean toward excitement and encouragement.

---

_Remember: Great documentation empowers developers. Let's build something remarkable together._
