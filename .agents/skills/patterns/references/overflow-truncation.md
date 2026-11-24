# Overflow — Truncation + Expand Strategy

Content is clipped at a defined boundary with an inline toggle to reveal the full text. Used for continuous prose, not discrete items. For when this strategy applies vs. other overflow strategies, see `@compositions/overflow-spec.md` § 2 Strategy Taxonomy.

---

## Anatomy

```
┌─────────────────────────────────────────────┐
│ This is a long description that provides    │
│ context about the record. It continues for  │
│ several lines but we only show the first... │
│ [Show more]                                 │
└─────────────────────────────────────────────┘

     ↓ after expand ↓

┌─────────────────────────────────────────────┐
│ This is a long description that provides    │
│ context about the record. It continues for  │
│ several lines but we only show the first    │
│ three. Here is the rest of the content      │
│ that was previously hidden from view.       │
│ [Show less]                                 │
└─────────────────────────────────────────────┘
```

---

## Trigger

| Attribute       | Value                         | Notes                                  |
| --------------- | ----------------------------- | -------------------------------------- |
| Element         | `<button>`                    | In-place toggle — not navigation       |
| `aria-expanded` | `"false"` / `"true"`          | Tracks whether full content is visible |
| Label           | `"Show more"` → `"Show less"` | Toggles with state                     |

**Treatment:** Inline text button. `text-sm font-medium text-primary cursor-pointer` — no border, no background. Positioned immediately after the truncated text or on a new line below.

---

## Truncation method

Use CSS `line-clamp` (via Tailwind `line-clamp-[N]`) for the collapsed state. JavaScript toggles between clamped and unclamped on button click.

```
Collapsed: line-clamp-3 (or consuming composition's line count)
Expanded:  line-clamp-none
```

---

## Truncation + Expand constraints

- **Only for prose.** Do not truncate discrete items (buttons, links, cards). If items are discrete, use Menu, Show More, or Scroll instead.
- **Minimum visible content.** The collapsed state must show enough text to be meaningful — at least 2 lines. Single-line truncation with "Show more" adds a click for minimal benefit.
- **Expand is instant.** No animation on expand/collapse. The content height changes immediately. Animation creates layout shift that disrupts reading position.
- **Screen reader announcement.** When `aria-expanded` changes, the toggle button's label change ("Show more" → "Show less") is sufficient. No `aria-live` region needed.

---

## Truncation + Expand HTML reference

```html
<div>
  <p id="description-text" class="text-sm text-text-primary line-clamp-3">
    This is a long description that provides context about the record. It
    continues for several lines but we only show the first three lines in the
    collapsed state. Here is the rest of the content that was previously hidden
    from view.
  </p>
  <button
    aria-expanded="false"
    aria-controls="description-text"
    class="text-sm font-medium text-primary cursor-pointer
                 bg-transparent border-0 p-0 mt-1
                 hover:underline"
  >
    Show more
  </button>
</div>
```

---

## Content rules

- **Ellipsis.** The truncated text should end with `…` (CSS `line-clamp` handles this automatically).

---

## Accessibility

- **Toggle:** `aria-expanded` on the button. Label change ("Show more" → "Show less") is sufficient announcement. No `aria-live` needed.

---

## Validation Checks

Stable check IDs for structured reporting. Each references a section above.

| #     | Check                        | Spec section                      | Description                                                                                               |
| ----- | ---------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| TE-01 | Toggle is `<button>`         | § Trigger                         | Not `<a>`, not `<span>`.                                                                                  |
| TE-02 | `aria-expanded` tracks state | § Trigger                         | `"false"` when collapsed, `"true"` when expanded.                                                         |
| TE-03 | Label toggles                | § Trigger                         | "Show more" → "Show less".                                                                                |
| TE-04 | Applied to prose only        | § Truncation + Expand constraints | Not applied to discrete items (buttons, links, cards).                                                    |
| TE-05 | Minimum 2 visible lines      | § Truncation + Expand constraints | Collapsed state shows ≥ 2 lines. Single-line truncation is a violation.                                   |
| TE-06 | Uses `line-clamp`            | § Truncation method               | CSS `line-clamp-[N]`, not JavaScript height calculation or manual `text-overflow: ellipsis` on multiline. |
| TE-07 | No animation                 | § Truncation + Expand constraints | Expand/collapse is instant. No height transition.                                                         |
