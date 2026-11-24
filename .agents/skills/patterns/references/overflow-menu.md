# Overflow — Menu Strategy

The most common overflow strategy for action compositions. A trigger button opens a popover panel containing actions that don't fit inline. For when this strategy applies vs. other overflow strategies, see `@compositions/overflow-spec.md` § 2 Strategy Taxonomy.

---

## Anatomy

```
┌─────────────────┐
│ ⋮  [Label]      │  ← Trigger button (visual treatment set by consuming composition)
└────────┬────────┘
         │ popover anchor
         ▼
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ [icon]  Action One  │ │ ← Menu item (role="menuitem")
│ ├─────────────────────┤ │
│ │ [icon]  Action Two  │ │
│ ├─────────────────────┤ │
│ │ [icon]  Action Three│ │
│ └─────────────────────┘ │
└─────────────────────────┘
  role="menu", popover="auto"
  bg-base-100, border-base-300
  rounded-xl, shadow-lg
```

---

## Trigger button

The trigger is a `<button>` element. Its visual treatment (size, variant, shape) is inherited from the consuming composition — the overflow spec does not prescribe it. The trigger's ARIA contract is universal:

| Attribute       | Value                | Notes                                               |
| --------------- | -------------------- | --------------------------------------------------- |
| `aria-haspopup` | `"true"`             | Announces that activation opens a menu              |
| `aria-expanded` | `"false"` / `"true"` | Tracks panel open state. Must update on open/close. |
| `aria-controls` | `[panel-id]`         | Points to the panel element's `id`                  |

**Icon:** Vertical ellipsis (three dots, stacked). SVG uses `fill="currentColor"` to inherit the trigger's text color.

**Label:** The trigger is icon-only by default — no text label. Icon-only triggers MUST have `aria-label` (e.g., `aria-label="More"`). Consuming compositions may add a text label alongside the icon when space allows and the context benefits from explicit labeling, but this is the exception, not the default.

---

## Panel

The panel uses the native Popover API (`popover="auto"`). This provides light-dismiss (clicking outside closes), top-layer rendering (no z-index management), and `::backdrop` support.

| Property  | Value    | Notes                                         |
| --------- | -------- | --------------------------------------------- |
| `popover` | `"auto"` | Native Popover API — light-dismiss, top-layer |
| `role`    | `"menu"` | APG Menu pattern — for action menus           |
| `id`      | unique   | Referenced by trigger's `aria-controls`       |

**Not `role="listbox"`:** The menu contains actions (things the user does), not options (values the user selects). Listbox is for value selection (combobox, select). Menu is for actions. This follows the daisy-a11y-corrections.md § Dropdown guidance: "APG Menu or Combobox depending on use case (actions vs selection)."

---

## Panel tokens

**Surface:**

| Element          | Class                    | Notes                            |
| ---------------- | ------------------------ | -------------------------------- |
| Panel background | `bg-base-100`            | Primary surface — theme-aware    |
| Panel border     | `border border-base-300` | Subtle boundary                  |
| Panel overflow   | `overflow-hidden`        | Clips content to rounded corners |

**Radius:**

| Element | Class        | Value                                                 |
| ------- | ------------ | ----------------------------------------------------- |
| Panel   | `rounded-xl` | 16px — nested radius, NOT parent `rounded-3xl` (24px) |

The panel is a nested element inside a composition container. Nested elements use the smaller radius tier. Using `rounded-3xl` is a violation.

**Sizing:**

| Property  | Class / Value   | Notes                                                           |
| --------- | --------------- | --------------------------------------------------------------- |
| Min width | `min-w-[200px]` | Prevents narrow menus with truncated labels                     |
| Max width | None prescribed | Menu grows to fit content. Consuming composition may constrain. |

**Shadow:**

| Element | Class       | Notes                                                                                                       |
| ------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Panel   | `shadow-lg` | Elevation above the parent surface. Popover API renders in top layer, but shadow provides visual depth cue. |

---

## Menu item anatomy

Each item is a `<button>` element with `role="menuitem"`.

```
┌──────────────────────────────────────────────┐
│  [icon 16px]   Label text                    │
│  gap-2.5       text-sm, font-normal          │
│                text-text-primary             │
└──────────────────────────────────────────────┘
  Full-width, left-aligned
  px-4 py-2
  hover:bg-base-200
  active:bg-base-300
  cursor-pointer
```

**Item classes:**

```
flex items-center gap-2.5 w-full px-4 py-2
text-sm font-normal text-text-primary text-left
cursor-pointer bg-transparent border-0
transition-all duration-150
hover:bg-base-200 active:bg-base-300
```

**Item icon:** Optional. When present: 16×16px SVG, `aria-hidden="true"`, uses `currentColor` to inherit `text-text-primary`. Every item in a menu should follow the same pattern — all with icons or all without. Mixed icon/no-icon items within one menu is a violation.

**Item element:** Always `<button>` with `role="menuitem"`. Not `<a>`, not `<div>`. Menu items represent actions the user performs. If an item navigates, the consuming composition may use `<a role="menuitem" href="...">` — but `<button>` is the default.

**Destructive items:** Add `text-error` to override `text-text-primary`. No other visual differentiation (no `bg-error`, no icon color change). The label communicates severity ("Delete", "Remove permanently").

| Item Type   | Text Class          | Notes                                                                 |
| ----------- | ------------------- | --------------------------------------------------------------------- |
| Standard    | `text-text-primary` | Default for all items                                                 |
| Destructive | `text-error`        | Red text only. Label must clearly communicate the destructive action. |

**Disabled items:** `aria-disabled="true"` (not `disabled` attribute, because `role="menuitem"` items need to remain focusable for arrow key navigation). Visually: `opacity-40`, `pointer-events: none`.

---

## Menu sections (grouped items)

When a menu contains logically distinct groups (e.g., edit actions vs. sharing actions), use `role="group"` with `aria-label` and a visual separator.

```html
<div popover="auto" role="menu" id="overflow-panel" class="...">
  <div role="group" aria-label="Edit actions">
    <button role="menuitem">Rename</button>
    <button role="menuitem">Duplicate</button>
  </div>
  <div class="border-t border-base-300 my-1"></div>
  <div role="group" aria-label="Sharing">
    <button role="menuitem">Copy link</button>
    <button role="menuitem">Share</button>
  </div>
</div>
```

**Separator:** `border-t border-base-300 my-1` — a 1px horizontal line with 4px vertical margin. Purely visual; no ARIA role needed (the `role="group"` boundaries handle semantics).

---

## Menu constraints

- **Minimum item count: ≥ 2.** A single-item overflow menu is a violation. If only one action would overflow, keep it inline or merge it with another control. Hard rule — no exceptions.
- **Item consistency:** All items in a menu follow the same anatomy (all icon+label or all label-only). Mixed presentation is a violation.
- **No nested menus.** Overflow menus do not contain sub-menus. If the action set is complex enough to need hierarchy, the consuming composition should restructure (e.g., use a dialog instead).
- **No form controls inside the menu.** Toggles, checkboxes, radio buttons do not belong in `role="menu"`. If the consuming composition needs stateful options, use `role="menuitemcheckbox"` or `role="menuitemradio"` — but these are selection patterns, not action patterns, and should be evaluated carefully against the Listbox or Menu Button APG patterns.

---

## Menu keyboard navigation

_Source: WAI-ARIA APG Menu Button pattern + daisy-a11y-corrections.md § Dropdown_

**Opening the menu:**

| Key                           | Action                                      |
| ----------------------------- | ------------------------------------------- |
| `Enter` or `Space` on trigger | Opens menu, moves focus to first `menuitem` |
| `ArrowDown` on trigger        | Opens menu, moves focus to first `menuitem` |
| `ArrowUp` on trigger          | Opens menu, moves focus to last `menuitem`  |

**Inside the menu:**

| Key                 | Action                                                                       |
| ------------------- | ---------------------------------------------------------------------------- |
| `ArrowDown`         | Focus next `menuitem`. Wraps from last to first.                             |
| `ArrowUp`           | Focus previous `menuitem`. Wraps from first to last.                         |
| `Home`              | Focus first `menuitem`                                                       |
| `End`               | Focus last `menuitem`                                                        |
| `Enter` or `Space`  | Activates focused `menuitem`, closes menu                                    |
| `Escape`            | Closes menu, returns focus to trigger                                        |
| `Tab`               | Closes menu, moves focus to next focusable element in page order             |
| Printable character | Moves focus to next item whose label starts with that character (type-ahead) |

**Focus management:**

1. **On open:** Focus moves from trigger into the menu panel. First item receives focus (or last, if opened with `ArrowUp`).
2. **On close (Escape):** Focus returns to the trigger button. Always. No exceptions.
3. **On close (item activation):** Focus returns to the trigger button after the action executes.
4. **On close (light-dismiss):** Focus returns to the trigger button. The Popover API's light-dismiss handles closing; the implementation must still manage the focus return.
5. **Trap context:** Focus does NOT trap inside the menu (unlike modals). `Tab` exits the menu and continues normal page tab order. Arrow keys are confined to menu items.

---

## Menu HTML reference

**Minimal correct structure:**

```html
<!-- Trigger -->
<button
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="overflow-panel-1"
  popovertarget="overflow-panel-1"
  class="[classes inherited from consuming composition]"
>
  <svg aria-hidden="true" width="16" height="16" fill="currentColor">
    <!-- vertical ellipsis dots -->
  </svg>
  More
</button>

<!-- Panel -->
<div
  popover="auto"
  role="menu"
  id="overflow-panel-1"
  class="bg-base-100 border border-base-300 rounded-xl
            min-w-[200px] overflow-hidden shadow-lg"
>
  <button
    role="menuitem"
    tabindex="-1"
    class="flex items-center gap-2.5 w-full px-4 py-2
                 text-sm font-normal text-text-primary text-left
                 cursor-pointer bg-transparent border-0
                 transition-all duration-150
                 hover:bg-base-200 active:bg-base-300"
  >
    <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
      ...
    </svg>
    Action label
  </button>
  <button
    role="menuitem"
    tabindex="-1"
    class="flex items-center gap-2.5 w-full px-4 py-2
                 text-sm font-normal text-text-primary text-left
                 cursor-pointer bg-transparent border-0
                 transition-all duration-150
                 hover:bg-base-200 active:bg-base-300"
  >
    <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
      ...
    </svg>
    Another action
  </button>
</div>
```

**Note:** `tabindex="-1"` on all menu items. JavaScript manages focus via roving focus (setting `tabindex="0"` on the active item and `-1` on all others as arrow keys move).

**With grouped sections and destructive item:**

```html
<div
  popover="auto"
  role="menu"
  id="overflow-panel-2"
  class="bg-base-100 border border-base-300 rounded-xl
            min-w-[200px] overflow-hidden shadow-lg"
>
  <div role="group" aria-label="Actions">
    <button
      role="menuitem"
      tabindex="-1"
      class="flex items-center gap-2.5 w-full px-4 py-2
                   text-sm font-normal text-text-primary text-left
                   cursor-pointer bg-transparent border-0
                   transition-all duration-150
                   hover:bg-base-200 active:bg-base-300"
    >
      <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
        ...
      </svg>
      Edit
    </button>
    <button
      role="menuitem"
      tabindex="-1"
      class="flex items-center gap-2.5 w-full px-4 py-2
                   text-sm font-normal text-text-primary text-left
                   cursor-pointer bg-transparent border-0
                   transition-all duration-150
                   hover:bg-base-200 active:bg-base-300"
    >
      <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
        ...
      </svg>
      Duplicate
    </button>
  </div>
  <div class="border-t border-base-300 my-1"></div>
  <div role="group" aria-label="Destructive">
    <button
      role="menuitem"
      tabindex="-1"
      class="flex items-center gap-2.5 w-full px-4 py-2
                   text-sm font-normal text-error text-left
                   cursor-pointer bg-transparent border-0
                   transition-all duration-150
                   hover:bg-base-200 active:bg-base-300"
    >
      <svg aria-hidden="true" width="16" height="16" stroke="currentColor">
        ...
      </svg>
      Delete
    </button>
  </div>
</div>
```

---

## Content rules

- **Menu item labels** follow `@components/references/button.md` § Content rules for verb-first, action-descriptive language. "More info" and "Click here" are violations.
- **Labels ≤ 4 words.** Menu items are terse. Long descriptions signal the wrong pattern (consider a dialog or disclosure).
- **Consistent grammatical form.** All items in a menu use the same voice: all imperative ("Edit", "Duplicate", "Delete") or all noun-phrase ("Copy link", "Share settings"). Don't mix.
- **No truncation in menus.** If labels truncate inside the menu, the menu is too narrow or the labels are too long. Fix the labels.
- **Trigger label:** `"More"` is the default. Consuming compositions may override.

---

## Accessibility

_Source: WAI-ARIA APG Menu Button pattern + daisy-a11y-corrections.md (§ Dropdown, § Menu, § Tabs)_

- **ARIA pattern:** APG Menu Button. Trigger: `aria-haspopup="true"`, `aria-expanded`. Panel: `role="menu"`. Children: `role="menuitem"`. Specifically for action menus — not for value selection (Combobox/Listbox).
- **Keyboard:** Full keyboard model per § Menu keyboard navigation. Arrow keys navigate items, Escape closes and returns focus, Enter/Space activates.
- **Focus management:** Focus moves into menu on open, returns to trigger on close. See § Menu keyboard navigation > Focus management for all close scenarios.
- **Screen reader announcement:** Trigger announces as "More, menu button" (or similar). When expanded: "More, menu button, expanded". Items announce as "[Label], menu item, [position] of [total]".
- **Decorative icons:** Menu item icons use `aria-hidden="true"`.
- **Disabled items:** `aria-disabled="true"` (not `disabled` attribute) so items remain focusable for arrow key navigation. Visual: `opacity-40`, `pointer-events: none`.
- **Live region:** Not needed. Menu content is static once opened.

---

## Validation Checks

Stable check IDs for structured reporting. Each references a section above.

### Structural checks

| #     | Check                         | Spec section        | Description                                                                                                                                        |
| ----- | ----------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| MS-01 | Trigger is a button           | § Trigger button    | Trigger element is `<button>`, not `<div>`, `<a>`, or `<span>`.                                                                                    |
| MS-02 | Panel uses Popover API        | § Panel             | Panel has `popover="auto"`. Not CSS-only visibility toggle, not `display:none`/`display:block`.                                                    |
| MS-03 | Panel has `role="menu"`       | § Panel             | Panel uses `role="menu"`, NOT `role="listbox"`, `role="dialog"`, or no role.                                                                       |
| MS-04 | Items have `role="menuitem"`  | § Menu item anatomy | Every actionable child has `role="menuitem"`. Not `role="option"`, not `role="button"`.                                                            |
| MS-05 | Items are `<button>` elements | § Menu item anatomy | Menu items use `<button role="menuitem">`. Exception: navigational items may use `<a role="menuitem">`.                                            |
| MS-06 | Minimum 2 items               | § Menu constraints  | Panel contains ≥ 2 `menuitem` elements. Single-item overflow is a violation.                                                                       |
| MS-07 | No nested menus               | § Menu constraints  | No `role="menu"` inside another `role="menu"`.                                                                                                     |
| MS-08 | No form controls in menu      | § Menu constraints  | No `<input>`, `<select>`, `<textarea>`, toggle, or checkbox. Exception: `role="menuitemcheckbox"` / `role="menuitemradio"` if explicitly required. |

### ARIA checks

| #     | Check                                  | Spec section                    | Description                                                                                  |
| ----- | -------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| MA-01 | `aria-haspopup="true"`                 | § Trigger button                | Trigger has `aria-haspopup="true"`.                                                          |
| MA-02 | `aria-expanded` tracks state           | § Trigger button                | Trigger has `aria-expanded="false"` when closed, `"true"` when open. Present in both states. |
| MA-03 | `aria-controls` links trigger to panel | § Trigger button                | Trigger `aria-controls` matches panel `id`.                                                  |
| MA-04 | `id` on panel                          | § Panel                         | Panel has a unique `id`.                                                                     |
| MA-05 | Decorative icons hidden                | § Menu item anatomy             | Icons have `aria-hidden="true"`.                                                             |
| MA-06 | Icon-only trigger has `aria-label`     | § Trigger button                | If no visible text, `aria-label` is required.                                                |
| MA-07 | Disabled items use `aria-disabled`     | § Menu item anatomy             | Not `disabled` attribute — items must remain focusable for arrow keys.                       |
| MA-08 | Groups labeled                         | § Menu sections (grouped items) | `role="group"` sections have `aria-label`.                                                   |

### Keyboard checks

| #     | Check                              | Spec section                                  | Description                                                        |
| ----- | ---------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| MK-01 | Enter/Space opens menu             | § Menu keyboard navigation > Opening          | Opens and focuses first item.                                      |
| MK-02 | ArrowDown on trigger opens         | § Menu keyboard navigation > Opening          | Opens and focuses first item.                                      |
| MK-03 | ArrowUp on trigger opens to last   | § Menu keyboard navigation > Opening          | Opens and focuses last item.                                       |
| MK-04 | ArrowDown navigates forward        | § Menu keyboard navigation > Inside the menu  | Wraps from last to first.                                          |
| MK-05 | ArrowUp navigates backward         | § Menu keyboard navigation > Inside the menu  | Wraps from first to last.                                          |
| MK-06 | Escape closes and returns focus    | § Menu keyboard navigation > Focus management | Focus returns to trigger.                                          |
| MK-07 | Enter/Space activates item         | § Menu keyboard navigation > Inside the menu  | Activates and closes.                                              |
| MK-08 | Tab exits menu                     | § Menu keyboard navigation > Inside the menu  | Closes menu, focus not trapped.                                    |
| MK-09 | Focus returns on all close methods | § Menu keyboard navigation > Focus management | Escape, activation, light-dismiss all return focus to trigger.     |
| MK-10 | Roving tabindex                    | § Menu HTML reference                         | `tabindex="-1"` on all items except focused item (`tabindex="0"`). |

### Token checks

| #     | Check                          | Spec section                    | Description                                                                   |
| ----- | ------------------------------ | ------------------------------- | ----------------------------------------------------------------------------- |
| MV-01 | Panel `bg-base-100`            | § Panel tokens > Surface        | Not `bg-white`, not hardcoded.                                                |
| MV-02 | Panel `border border-base-300` | § Panel tokens > Surface        | Not `border-gray-200`, not hardcoded.                                         |
| MV-03 | Panel `rounded-xl`             | § Panel tokens > Radius         | 16px nested radius. NOT `rounded-3xl` (24px parent).                          |
| MV-04 | Panel `shadow-lg`              | § Panel tokens > Shadow         | Elevation cue present.                                                        |
| MV-05 | Item `hover:bg-base-200`       | § Menu item anatomy             | Not hardcoded hover.                                                          |
| MV-06 | Item `active:bg-base-300`      | § Menu item anatomy             | Not hardcoded active.                                                         |
| MV-07 | Item text color                | § Menu item anatomy             | Standard: `text-text-primary`. Destructive: `text-error`. No other overrides. |
| MV-08 | Item `text-sm font-normal`     | § Menu item anatomy             | Not `font-semibold`, not `text-xs`.                                           |
| MV-09 | Icon consistency               | § Menu item anatomy             | All-with-icons or all-without. No mix.                                        |
| MV-10 | Separator tokens               | § Menu sections (grouped items) | `border-t border-base-300 my-1`. Not `<hr>`, not hardcoded.                   |

### Content checks

| #     | Check                    | Spec section                            | Description                                      |
| ----- | ------------------------ | --------------------------------------- | ------------------------------------------------ |
| MT-01 | Labels ≤ 4 words         | § Content rules                         | Longer labels suggest wrong pattern.             |
| MT-02 | Labels describe actions  | § Content rules                         | "More info" and "Click here" are violations.     |
| MT-03 | Consistent grammar       | § Content rules                         | All imperative or all noun-phrase. No mix.       |
| MT-04 | No truncation in menu    | § Content rules                         | Labels must not truncate.                        |
| MT-05 | Destructive labels clear | § Menu item anatomy > Destructive items | `text-error` items clearly communicate severity. |

---

## Resolution Guidance

### MS-03: Wrong role on panel

```html
<!-- Before (wrong — listbox is for value selection) -->
<div popover="auto" role="listbox">
  <!-- After (correct — menu is for actions) -->
  <div popover="auto" role="menu" id="overflow-panel"></div>
</div>
```

### MS-05: Items using `<a>` instead of `<button>`

```html
<!-- Before (wrong) -->
<a role="menuitem" href="#" onclick="doAction()">Edit</a>

<!-- After (correct) -->
<button
  role="menuitem"
  tabindex="-1"
  class="flex items-center gap-2.5 w-full px-4 py-2
               text-sm font-normal text-text-primary text-left
               cursor-pointer bg-transparent border-0
               transition-all duration-150
               hover:bg-base-200 active:bg-base-300"
>
  Edit
</button>
```

### MS-06: Single-item overflow

If only one action would overflow, don't use an overflow menu. Either keep the action inline (adjust `max_visible` in the consuming composition) or combine it with another control. A one-item menu adds a click with no benefit.

### MA-02: Missing or static `aria-expanded`

```html
<!-- Before (wrong — removed when closed) -->
<button aria-haspopup="true">More</button>

<!-- After (correct — always present, tracks state) -->
<button
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="overflow-panel"
>
  More
</button>
```

### MV-03: Radius too large

```html
<!-- Before (wrong — rounded-3xl is parent radius 24px) -->
<div popover="auto" role="menu" class="... rounded-3xl">
  <!-- After (correct — rounded-xl is nested radius 16px) -->
  <div popover="auto" role="menu" class="... rounded-xl"></div>
</div>
```

### MK-06/MK-09: Focus doesn't return to trigger on close

The most common keyboard failure. On Escape, light-dismiss, or item activation, focus MUST return to the trigger:

```js
panel.addEventListener('toggle', e => {
  if (e.newState === 'closed') {
    triggerButton.focus();
  }
});
```
