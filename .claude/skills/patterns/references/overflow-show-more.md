# Overflow — Show More / View All Strategy

A trigger that either navigates to a full view (link) or expands the container to reveal hidden items (button). Used when a bounded preview shows a subset and the complete content lives elsewhere or can be revealed in place. For when this strategy applies vs. other overflow strategies, see `@compositions/overflow-spec.md` § 2 Strategy Taxonomy.

---

## Anatomy

```
┌─────────────────────────────────────────────┐
│  Item 1                                     │
│  Item 2                                     │
│  Item 3                                     │
│                                             │
│  [ View all (12) → ]  or  [ Show more ▼ ]  │  ← Trigger
└─────────────────────────────────────────────┘
```

Two sub-variants:

**View All (navigational):** Links to a separate page or panel containing the full list. The trigger is an `<a>` element.

**Show More (in-place expansion):** Expands the current container to reveal hidden items. The trigger is a `<button>` element with `aria-expanded`.

---

## Trigger — View All

| Attribute | Value                            | Notes                              |
| --------- | -------------------------------- | ---------------------------------- |
| Element   | `<a href="...">`                 | Navigational — goes to a full view |
| Label     | `"View all"` or `"View all (N)"` | Count is optional but helpful      |
| ARIA      | None special                     | Standard link semantics suffice    |

**Treatment:** `btn btn-ghost btn-sm` or plain text link — consuming composition decides. Typically right-aligned in a section header row or below the last visible item.

---

## Trigger — Show More

| Attribute       | Value                         | Notes                                            |
| --------------- | ----------------------------- | ------------------------------------------------ |
| Element         | `<button>`                    | In-place expansion — not navigation              |
| `aria-expanded` | `"false"` / `"true"`          | Tracks whether hidden items are visible          |
| `aria-controls` | `[container-id]`              | Points to the container holding the hidden items |
| Label           | `"Show more"` → `"Show less"` | Toggles with state                               |

**Treatment:** `btn btn-ghost btn-sm` or text-only — consuming composition decides. Positioned below the last visible item.

---

## Show More / View All constraints

- **Minimum hidden count: ≥ 1.** The trigger only appears when there are hidden items. If all items fit, no trigger renders.
- **Count is recommended.** Showing the total ("View all (12)") sets expectations. Omitting it is acceptable but less informative.
- **No partial expansion.** Show More reveals ALL hidden items in one action, not incrementally. If the list is too long for full expansion, use View All (navigate to a dedicated view) instead.

---

## Show More HTML reference

```html
<!-- Section header with View All link -->
<div class="flex items-center justify-between mb-4">
  <h3 class="text-sm font-semibold text-text-primary">Notifications</h3>
  <a href="/notifications" class="aiux-btn aiux-btn-ghost aiux-btn-sm">
    View all (24)
    <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
      <!-- right arrow -->
    </svg>
  </a>
</div>
<div>
  <!-- 3 visible notification items -->
</div>

<!-- In-place Show More -->
<div id="comment-list">
  <!-- 3 visible comments -->
  <div id="hidden-comments" hidden>
    <!-- remaining comments -->
  </div>
</div>
<button
  aria-expanded="false"
  aria-controls="hidden-comments"
  class="aiux-btn aiux-btn-ghost aiux-btn-sm w-full mt-2"
>
  Show more
</button>
```

---

## Content rules

- **View All includes count when available.** "View all (12)" is better than "View all" alone.
- **Show More / Show Less labels are exact.** Use these phrases — not "Expand", "Collapse", "See more", "See all".

---

## Accessibility

- **View All:** Standard link semantics. No special ARIA beyond `<a href>`.
- **Show More:** `aria-expanded="false"/"true"` on the toggle button. `aria-controls` pointing to the hidden content container.

---

## Validation Checks

Stable check IDs for structured reporting. Each references a section above.

| #     | Check                              | Spec section                       | Description                                                   |
| ----- | ---------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| SV-01 | View All uses `<a>`                | § Trigger — View All               | Navigational trigger is a link, not a button.                 |
| SV-02 | Show More uses `<button>`          | § Trigger — Show More              | In-place expansion is a button, not a link.                   |
| SV-03 | `aria-expanded` on Show More       | § Trigger — Show More              | Button tracks `"false"`/`"true"`.                             |
| SV-04 | `aria-controls` links to container | § Trigger — Show More              | Points to the hidden content container's `id`.                |
| SV-05 | Label toggles                      | § Trigger — Show More              | "Show more" → "Show less" on expand.                          |
| SV-06 | Trigger hidden when all visible    | § Show More / View All constraints | No trigger if all items already fit.                          |
| SV-07 | Count included (recommended)       | § Trigger — View All               | "View all (N)" preferred over bare "View all".                |
| SV-08 | Full expansion (not incremental)   | § Show More / View All constraints | Show More reveals ALL hidden items, not a few more at a time. |

---

## Resolution Guidance

### SV-01: Show More uses `<a>` instead of `<button>`

```html
<!-- Before (wrong — in-place expansion shouldn't navigate) -->
<a href="#" onclick="expand()">Show more</a>

<!-- After (correct) -->
<button
  aria-expanded="false"
  aria-controls="hidden-items"
  class="aiux-btn aiux-btn-ghost aiux-btn-sm"
>
  Show more
</button>
```
