# Overflow — Design Spec

## 1. Overview

Overflow governs what happens when content exceeds its container's visible capacity. This spec defines the four overflow strategies and the classification layer that determines which strategy applies. Strategy-specific mechanics (anatomy, ARIA contracts, keyboard models, tokens, and constraints) live in per-strategy pattern files — see § 2 Strategy Taxonomy for the mapping. This spec does NOT govern which strategy a composition uses — that is an **overflow policy** decision owned by the consuming composition (see `references/action-set-spec.md`, `references/contextual-actions-spec.md`, future tab-group spec, etc.). An agent reading this spec can classify any overflow situation correctly; it loads the relevant pattern file to generate the implementation.

## 2. Strategy Taxonomy

| Strategy                 | Mechanism                                                 | Hidden content                                  | ARIA pattern                             | When appropriate                                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Menu**                 | Trigger opens a popover panel of actions                  | Fully hidden until triggered                    | APG Menu Button                          | Action groups with discrete, activatable items (action-sets, contextual-actions, row actions)                                                                                      |
| **Show More / View All** | Trigger navigates to a full view or expands the container | Hidden behind navigation or collapsed container | Link or button (no special ARIA pattern) | Bounded previews where a complete list exists elsewhere (card quick links, notification lists, dashboard widgets)                                                                  |
| **Scroll**               | Horizontal or vertical scroll with indicators             | Visible but requires scrolling to reach         | None beyond native scroll semantics      | Continuous content where all items are peers and no item should be privileged by visibility (carousels, horizontal chip bars — but NOT tabs, per daisy-a11y-corrections.md § Tabs) |
| **Truncation + Expand**  | Content truncates with an inline toggle                   | Clipped with a reveal control                   | `aria-expanded` on toggle                | Long-form text or descriptions where partial preview is useful (record descriptions, comment bodies, AI-generated summaries)                                                       |

### Strategy selection guidance

The consuming composition's spec declares which strategy to use. These heuristics help when writing that policy:

- **Are the hidden items actions the user performs?** → Menu
- **Does a complete view exist at another URL or in an expanded state?** → Show More / View All
- **Are items homogeneous peers where position doesn't imply priority?** → Scroll (with caution — see `@patterns/SKILL.md` § Scroll constraints)
- **Is the content continuous text, not discrete items?** → Truncation + Expand
- **Does daisy-a11y-corrections.md or APG prescribe a specific strategy for this component type?** → Follow that guidance. Example: Tabs must use Menu for overflow, not Scroll (daisy-a11y-corrections.md § Tabs).

### Per-strategy pattern files

Once a strategy is selected, load the corresponding pattern file for implementation details:

Each pattern file contains anatomy, ARIA contracts, keyboard models, tokens, constraints, HTML references, content rules, accessibility notes, validation checks, and resolution guidance specific to that strategy. Pattern files are self-contained — load only the one matching the task.

## 3. Scope Boundary

This spec covers classification (the four overflow strategies and when each applies). Strategy-specific mechanics live in per-strategy pattern files under `patterns/`.

It does **not** cover:

- **Overflow policy** (which strategy a composition uses, which items overflow, trigger position within a group) — see the consuming composition's spec (`references/action-set-spec.md`, `references/contextual-actions-spec.md`, future tab-group spec, etc.)
- **Trigger visual treatment** (size, variant, shape) — inherited from the consuming composition's design language
- **Individual button styling** — see button component sheet (`@components/SKILL.md`)
- **Value selection menus** (combobox, listbox, select) — different ARIA pattern; not overflow
- **Per-strategy implementation** (anatomy, ARIA contracts, keyboard models, tokens, constraints) — see the relevant `overflow-*.md` pattern file

The referencing direction is one-way: consuming compositions (action-set, contextual-actions, data-table toolbar, header actions, tab-group, card quick links, etc.) reference this spec for overflow classification, then load the relevant `overflow-*.md` pattern file for implementation mechanics. Pattern files reference only the button component sheet (`@components/SKILL.md`) for individual button rules.
