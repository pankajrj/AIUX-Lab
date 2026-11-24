# Overflow — Scroll Strategy

Items remain in the DOM and are reachable by scrolling. A scroll container with optional indicators (arrows, fade gradients) signals that more content exists off-screen. For when this strategy applies vs. other overflow strategies, see `@compositions/overflow-spec.md` § 2 Strategy Taxonomy.

---

## Anatomy

```
      ← ┌─────────────────────────────────────┐ →
         │ [Item 1] [Item 2] [Item 3] [Item 4]│[Item 5] [Item 6]
         └─────────────────────────────────────┘
         ← scroll indicator     scroll indicator →
```

---

## Structure

| Property        | Value                   | Notes                                                                            |
| --------------- | ----------------------- | -------------------------------------------------------------------------------- |
| Container       | `overflow-x-auto`       | Horizontal scroll. Vertical scroll uses `overflow-y-auto`.                       |
| Scroll behavior | `scroll-smooth`         | Optional. Smooth scrolling for programmatic scroll (arrow buttons).              |
| Scroll snap     | `snap-x snap-mandatory` | Optional. Snap to item boundaries on freeform scroll. Children use `snap-start`. |

---

## Scroll indicators

Optional arrow buttons at each end of the scroll container. They appear only when scroll is possible in that direction.

| Element          | Treatment                              | ARIA                                                  |
| ---------------- | -------------------------------------- | ----------------------------------------------------- |
| Left/up arrow    | `btn btn-ghost btn-sm btn-circle`      | `aria-label="Scroll left"` (or appropriate direction) |
| Right/down arrow | `btn btn-ghost btn-sm btn-circle`      | `aria-label="Scroll right"`                           |
| Fade gradient    | CSS `mask-image` gradient at each edge | Decorative — no ARIA needed                           |

Arrow buttons are `<button>` elements (not links). They programmatically scroll the container by one viewport width (or one item width, depending on the consuming composition's policy).

---

## Scroll constraints

- **Use with caution.** Scroll overflow hides content behind a physical gesture. Items pushed off-screen receive less attention than visible items, which creates an implicit priority hierarchy even when items are intended as equal peers.
- **Never for tabs.** The daisy-a11y-corrections.md § Tabs explicitly states: "Use menu for overflow, not horizontal scrolling." Tab overflow must use the Menu strategy.
- **Always provide indicators.** A scrollable container with no visual affordance (no arrows, no fade, no scrollbar) is a violation. The user must be able to discover that more content exists.
- **Keyboard accessible.** Arrow keys (Left/Right or Up/Down) must scroll the container when it has focus, OR each item inside must be individually focusable and arrow-key navigable (roving tabindex).

---

## Scroll HTML reference

```html
<div class="relative">
  <!-- Left indicator (shown when scrollLeft > 0) -->
  <button
    class="aiux-btn aiux-btn-ghost aiux-btn-sm aiux-btn-circle absolute left-0 top-1/2 -translate-y-1/2 z-10"
    aria-label="Scroll left"
  >
    <svg aria-hidden="true"><!-- left arrow --></svg>
  </button>

  <!-- Scroll container -->
  <div
    class="overflow-x-auto scroll-smooth snap-x snap-mandatory
              flex gap-2 px-8"
    role="group"
    aria-label="[content description]"
  >
    <div class="snap-start shrink-0">[Item 1]</div>
    <div class="snap-start shrink-0">[Item 2]</div>
    <div class="snap-start shrink-0">[Item 3]</div>
    <!-- more items -->
  </div>

  <!-- Right indicator (shown when more content exists to the right) -->
  <button
    class="aiux-btn aiux-btn-ghost aiux-btn-sm aiux-btn-circle absolute right-0 top-1/2 -translate-y-1/2 z-10"
    aria-label="Scroll right"
  >
    <svg aria-hidden="true"><!-- right arrow --></svg>
  </button>
</div>
```

---

## Accessibility

- **Indicators:** Arrow buttons need `aria-label` describing the scroll direction.
- **Container:** `role="group"` with `aria-label` if items are semantically related. If each item is independently focusable, use roving tabindex.
- **No ARIA live on scroll.** Scroll position changes are user-initiated and don't need announcement.

---

## Validation Checks

Stable check IDs for structured reporting. Each references a section above.

| #     | Check                           | Spec section         | Description                                                                                                                            |
| ----- | ------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SC-01 | Not used for tabs               | § Scroll constraints | Tab overflow must use Menu, not Scroll (daisy-a11y-corrections.md § Tabs).                                                             |
| SC-02 | Indicators present              | § Scroll constraints | Scrollable container has at least one visual affordance: arrow buttons, fade gradient, or visible scrollbar. No indicator = violation. |
| SC-03 | Arrow buttons have `aria-label` | § Scroll indicators  | `aria-label` describes direction (e.g., "Scroll left").                                                                                |
| SC-04 | Arrow buttons are `<button>`    | § Scroll indicators  | Not `<a>`, not `<div>`.                                                                                                                |
| SC-05 | Keyboard scroll accessible      | § Scroll constraints | Arrow keys scroll the container when focused, OR each item is individually focusable via roving tabindex.                              |
| SC-06 | Container has semantic grouping | § Accessibility      | `role="group"` with `aria-label` if items are semantically related.                                                                    |

---

## Resolution Guidance

### SC-01: Scroll used for tab overflow

```
Tabs must not use horizontal scrolling for overflow (daisy-a11y-corrections.md § Tabs).
Remediate by replacing the scroll container with a Menu overflow:
- Add a "More" trigger at the end of the visible tabs
- Move overflowing tabs into a role="menu" popover
- Reference overflow-menu.md for the menu's structure
```
