agent: 'agent'
tools: ['search/codebase', 'usages', 'edit', 'new']
description: 'Create a reusable UI component following CVA + DaisyUI standards'

---

# Add UI Component

You are building a reusable UI component that fits seamlessly into the existing design system. Follow the established **CVA + DaisyUI** pattern and reference the canonical guides before writing any code:

- `.github/instructions/component-patterns.instructions.md`
- `.github/instructions/cva.instructions.md`
- `.github/instructions/daisyui.instructions.md`
- `app/components/Button.tsx` and `app/components/TextInput.tsx` (reference implementations)

## Step 1: Clarify Requirements

Ask the user (or deduce from context):

- Component purpose and usage scenarios
- Required variants (visual styles, sizes, statuses)
- Accessibility expectations (labels, ARIA, keyboard support)
- Form-specific behavior (helper text, validation states)
- Expected props API and TypeScript types

Record agreed requirements before writing code.

## Step 2: Audit Existing Components

1. Search for similar components to avoid duplication.
2. Identify shared logic that should be extracted.
3. Document any patterns you will reuse or extend.

## Step 3: Plan the API & Variants

- Define CVA variants for `variant`, `status`, `size`, and any boolean modifiers.
- Map each variant to canonical DaisyUI classes.
- Sketch the prop interface extending the correct native HTML element + `VariantProps<typeof componentVariants>`.
- Decide on additional props (e.g., `helperText`, `error`, `icon`, `loading`).

## Step 4: Implement the Component

Follow these rules:

1. **Location**: Create the component in `app/components/` with PascalCase filename.
2. **CVA Setup**: Declare `componentVariants` with defaults and optional compound variants.
3. **TypeScript**: Export both the component function and `ComponentProps` interface.
4. **className Merging**: Use `cx()` from `~/cva.config` (never `cn`).
5. **Accessibility**: Provide sensible defaults (labels, aria attributes, keyboard focus, semantic markup).
6. **Form Elements**: Support `label`, `required`, `helperText`, `error`, and disabled states as described in the instructions.
7. **Comments**: Add concise comments when logic is non-obvious (per repository coding standards).

## Step 5: Add Stories / Examples

- Provide usage examples or stories that demonstrate each variant.
- Reference existing example patterns in `docs/components.md` or Storybook (if applicable).
- Update `docs/components.md` if this introduces a new pattern.

## Step 6: Testing & Validation

1. Add or update Vitest specs in `app/components/ComponentName.test.tsx` (or equivalent) to cover:
    - Variant rendering
    - Accessibility attributes
    - Conditional states (loading, disabled, error)
2. Run `npm run typecheck` to ensure generated route/component types stay valid.
3. Run `npm test` (or targeted command) and confirm passing results.

## Step 7: Documentation Updates

- Update `.github/instructions/component-patterns.instructions.md` if this component introduces a new standard pattern.
- If new props or conventions affect other components, codify them via `codify.prompt.md`.
- Add usage notes to `docs/components.md` or relevant feature docs.

## Checklist

- [ ] Requirements confirmed and documented
- [ ] No existing component duplicates functionality
- [ ] CVA variants and defaults defined
- [ ] Props interface fully typed
- [ ] Accessibility handled (labels, aria, keyboard)
- [ ] Component placed under `app/components/`
- [ ] Tests added/updated and passing
- [ ] Documentation updated as needed
- [ ] Ready for integration into routes/pages

## Anti-Patterns to Avoid

- ❌ Hardcoding classes instead of using CVA variants
- ❌ Re-implementing existing component behavior without abstraction
- ❌ Skipping accessibility considerations (labels, aria, keyboard)
- ❌ Mutating props or leaking internal state
- ❌ Leaving helper text / error rendering inconsistent with other components

Deliver the component only after every checklist item is satisfied.
