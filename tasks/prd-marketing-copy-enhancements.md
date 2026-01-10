# PRD: Marketing Copy Enhancements

## 1. Introduction/Overview

Enhance Iridium's marketing copy to better communicate the value proposition to indie developers and solo founders building SaaS products. The current messaging is feature-focused; we need to shift to a benefits-focused, problem/solution framing that emphasizes developer experience improvements and time-to-market advantages.

The enhancements will target three key touchpoints: landing page (`app/routes/landing.tsx`), README.md, and documentation home (`docs/README.md`).

## 2. Goals

- Increase conversion from "curious developer" to "trying Iridium" by making the value proposition immediately clear
- Reduce time-to-understanding from ~5 minutes to ~30 seconds with benefit-driven headlines
- Position Iridium as the go-to starter for indie developers who value shipping speed + code quality
- Create messaging that resonates emotionally with solo founders facing choice paralysis and integration fatigue

## 3. User Stories

### US-001: Landing Page Hero Section

**Description:** As an indie developer visiting the landing page, I want to immediately understand how Iridium solves my problems so that I can decide if it's worth exploring further.

**Acceptance Criteria:**

- [ ] Hero headline communicates primary benefit (not features) in 10 words or less
- [ ] Subheadline addresses the core pain point of solo founders (integration overwhelm, decision fatigue)
- [ ] CTA button uses action-oriented, benefit-focused language
- [ ] Copy emphasizes "what you get" over "what it includes"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-002: Landing Page Problem/Solution Section

**Description:** As a solo founder evaluating Iridium, I want to see my specific problems reflected back to me so that I feel understood and confident this tool solves my needs.

**Acceptance Criteria:**

- [ ] New section added between hero and features highlighting 3-4 common developer pain points
- [ ] Each pain point paired with how Iridium specifically solves it
- [ ] Language uses "you" and speaks directly to indie developer experience
- [ ] Includes time/cost quantification where possible (e.g., "Skip 40+ hours of integration work")
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Landing Page Developer Experience Benefits

**Description:** As a developer who values code quality, I want to understand how Iridium improves my daily development experience so that I know I'm not just getting boilerplate.

**Acceptance Criteria:**

- [ ] Feature section reframed to emphasize DX benefits: "patterns that guide", "conventions that prevent mistakes", "tooling that catches errors"
- [ ] At least 3 developer experience benefits highlighted (e.g., type safety, clear patterns, pre-configured tooling)
- [ ] Each benefit includes concrete example of what it prevents or enables
- [ ] Copy avoids generic phrases like "best practices" in favor of specific outcomes
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: README.md Benefit-Driven Introduction

**Description:** As a developer discovering Iridium on GitHub, I want the README to quickly communicate why I should choose this over alternatives so that I don't waste time evaluating the wrong solution.

**Acceptance Criteria:**

- [ ] Opening paragraph rewritten to lead with primary benefit and target audience
- [ ] "Why Iridium?" section added before "Features" section
- [ ] 3-4 key differentiators highlighted (e.g., "Opinionated patterns mean less decision fatigue", "Real features, not just auth boilerplate")
- [ ] "What's Included" section reframed as "What You Get" with benefit statements
- [ ] Maintains technical credibility while emphasizing practical outcomes
- [ ] Typecheck passes (if applicable to documentation changes)

### US-005: Documentation Home Page Messaging

**Description:** As a developer reading the docs, I want to see consistent benefit-driven messaging so that I remain confident in my choice to use Iridium.

**Acceptance Criteria:**

- [ ] `docs/README.md` introduction rewritten to emphasize developer experience benefits
- [ ] Quick start section includes motivational copy about what the developer will accomplish
- [ ] Architecture section emphasizes "why" these patterns help indie developers ship faster
- [ ] Tone remains helpful and encouraging throughout
- [ ] Typecheck passes (if applicable)

### US-006: Call-to-Action Optimization

**Description:** As a developer ready to try Iridium, I want clear, benefit-oriented CTAs so that I'm motivated to take the next step.

**Acceptance Criteria:**

- [ ] Primary CTA language updated from generic "Get Started" to benefit-focused alternative (e.g., "Start Building Your SaaS", "Ship Your MVP Faster")
- [ ] Secondary CTAs updated to reflect specific benefits (e.g., "See the Architecture" → "Explore Battle-Tested Patterns")
- [ ] CTAs consistent across landing page, README, and docs home
- [ ] All CTAs use action verbs and imply positive outcomes
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## 4. Functional Requirements

**FR-1:** The landing page must include a new problem/solution section positioned between the hero and existing features section.

**FR-2:** All three target documents (landing page, README, docs home) must lead with benefit-driven copy that addresses indie developer pain points.

**FR-3:** Feature descriptions must be reframed from "what it is" to "what it enables" using developer-focused language.

**FR-4:** Headlines and subheadlines must follow the formula: [Desired Outcome] + [For Target Audience] + [Key Differentiator].

**FR-5:** Copy must use second-person ("you") when addressing developers and emphasize time savings, reduced complexity, and confidence.

**FR-6:** All CTAs must use benefit-oriented language rather than generic action verbs.

**FR-7:** Technical terms must be preserved where they add credibility but contextualized with plain-language benefits.

## 5. Non-Goals (Out of Scope)

- Creating new visual designs or mockups (this is copy-only)
- Adding testimonials or case studies (no social proof collection at this stage)
- Translating copy to other languages
- A/B testing infrastructure or analytics setup for conversion tracking
- Comparison charts or competitive analysis sections
- Video or multimedia content creation
- SEO optimization or meta description updates (future consideration)
- Blog posts or long-form content marketing
- Email marketing copy or newsletter templates

## 6. Design Considerations

**Visual Hierarchy:**

- Problem/solution section should use contrasting background to create visual break between hero and features
- Consider using DaisyUI alert components with "info" styling for pain point callouts
- Use existing typography scale from design system

**Component Reuse:**

- Leverage existing `Container`, `Section`, `Card` components
- Use DaisyUI badges for benefit highlights (e.g., "⚡ 40+ hours saved")
- Maintain current color scheme and branding

**Content Structure:**

- Keep paragraphs short (2-3 sentences max) for scannability
- Use bullet points for lists of benefits
- Include micro-copy in button hover states if technically feasible

## 7. Technical Considerations

**Dependencies:**

- No new npm packages required
- Changes are copy/content only using existing React components
- Ensure copy doesn't break existing responsive breakpoints
- Maintain accessibility standards (heading hierarchy, alt text for any new icons)

**Data Model:**

- No database changes required

**Performance:**

- Copy changes should not impact page load time
- Ensure new content doesn't significantly increase HTML bundle size

**Integration Points:**

- Landing page changes in `app/routes/landing.tsx`
- README changes in root `README.md`
- Documentation changes in `docs/README.md`
- May require minor adjustments to `docs/GETTING_STARTED.md` for consistency

**Constraints:**

- Must preserve all existing technical accuracy
- Must maintain professional tone while being more conversational
- Must not make claims that can't be substantiated (e.g., specific time savings should be qualified as "typical" or "estimated")

## 8. Success Metrics

**Immediate Validation:**

- Copy passes peer review for clarity and resonance with target audience
- No decrease in technical credibility (feedback from existing users)
- Improved comprehension in informal user testing (5-second test)

**Observable Outcomes:**

- Increased GitHub stars/forks (indirect signal of interest)
- Reduced time-to-first-commit for new users (setup analytics if available)
- Positive community feedback on landing page improvements

**Qualitative Measures:**

- Messaging feels authentic to indie developer experience
- Copy differentiates Iridium without disparaging alternatives
- Balance of technical credibility and accessibility achieved

## 9. Open Questions

1. Should we create a separate "For Agencies" or "For Teams" variant of the landing page, or keep focus solely on indie developers?
2. Do we want to add a "What Iridium Is Not" section to set clear expectations?
3. Should we include estimated time savings with qualifiers (e.g., "Typical setup: 2-4 hours vs 40+ hours from scratch")?
4. Is there appetite for adding a simple testimonial section if we can quickly gather quotes from early users?
5. Should we create a brief "Opinionated Choices" callout box explaining the philosophy behind the stack decisions?

---

**Next Steps After PRD Approval:**

1. Review and refine copy with stakeholder
2. Create copy drafts for each section before implementation
3. Implement changes using existing component system
4. Test responsiveness and accessibility
5. Deploy and monitor for community feedback
