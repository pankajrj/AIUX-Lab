# `@servicenow/aiux-checklist`

## Import

```js
import '@servicenow/aiux-checklist';
```


A Lit web component providing a sorted, checkable item list with optional editing, prefixes, links, loading state, and empty state. Migrated from the Seismic/Snabbdom `now-checklist`.

## Installation

```bash
pnpm add @servicenow/aiux-checklist
```

## Usage

```javascript
import '@servicenow/aiux-checklist';
```

```html
<aiux-checklist
  .checklistData="${items}"
  prefix-type="numeric"
  allow-editing
></aiux-checklist>
```

### Handling events

```javascript
import type {ChecklistItemClickedDetail} from '@servicenow/aiux-checklist';

el.addEventListener('aiux-checklist:item-clicked', (e: CustomEvent<ChecklistItemClickedDetail>) => {
  const {itemId, checked, item} = e.detail;
  // update your data source
});
```

## API

### `<aiux-checklist>`

#### Properties / Attributes

| Property               | Attribute              | Type                                  | Default                   | Description                                                                                                                                                                |
| ---------------------- | ---------------------- | ------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checklistData`        | `checklist-data`       | `ChecklistItem[]`                     | `[]`                      | **Controlled.** Array of checklist items. Sorted by `order` on each render. The component does not mutate this — update it from mutation events to reflect changes.        |
| `prefixType`           | `prefix-type`          | `'none' \| 'numeric' \| 'alphabetic'` | `'none'`                  | Label prefix rendered before each item. **`'alphabetic'` wraps at 26 items** (index 26 repeats `A.`); prefixes lose uniqueness beyond that. Intended for short lists only. |
| `size`                 | `size`                 | `'sm' \| 'md'`                        | `'md'`                    | Controls input and checkbox sizing.                                                                                                                                        |
| `opensWindow`          | `opens-window`         | `boolean`                             | `false`                   | When true, item links open in a new tab (`target="_blank"`).                                                                                                               |
| `headerTitle`          | `header-title`         | `string`                              | `''`                      | Optional heading rendered above the checklist body (both populated and empty states), followed by a divider. Omitted entirely when empty.                                |
| `emptyStateTitle`      | `empty-state-title`    | `string`                              | `'No items added yet'`    | Heading shown in the empty state.                                                                                                                                          |
| `emptyStateMsg`        | `empty-state-msg`      | `string`                              | `''`                      | Optional sub-text shown below the empty state heading.                                                                                                                     |
| `allowEditing`         | `allow-editing`        | `boolean`                             | `false`                   | Enables inline edit, full edit modal, delete, and footer input.                                                                                                            |
| `hideBorder`           | `hide-border`          | `boolean`                             | `false`                   | Removes the card frame (background, border, radius, padding) for hosts that already provide their own container.                                                            |
| `showLoadingSpinner`   | `show-loading-spinner` | `boolean`                             | `false`                   | Replaces list body with a loading spinner.                                                                                                                                 |
| `disableAddLink`       | `disable-add-link`     | `boolean`                             | `false`                   | Hides the Add link control for link-less items in the single-item full-edit panel.                                                                                          |
| `checklistEditOptions` | (none)                 | `ChecklistEditOptions`                | all `false`               | Controls which edit option checkboxes appear in the full edit modal. Property-only (no attribute).                                                                         |

#### Config Properties

Set via the platform Config Editor (`configSchema`), not as HTML attributes.

| Property                 | Type      | Label                | Default     | Description                                                          |
| ------------------------ | --------- | -------------------- | ----------- | ---------------------------------------------------------------------- |
| `configPrefixType`       | `String`  | Prefix Type          | `undefined` | Overrides `prefixType`: `'none'`, `'numeric'`, or `'alphabetic'`.       |
| `configSize`             | `String`  | Size                 | `undefined` | Overrides `size`: `'sm'` or `'md'`.                                     |
| `configOpensWindow`      | `Boolean` | Opens Window         | `undefined` | Overrides `opensWindow`. Opens item links in a new browser tab.        |
| `configHeaderTitle`      | `String`  | Header Title         | `undefined` | Overrides `headerTitle`. Optional heading displayed above the checklist body. |
| `configEmptyStateTitle`  | `String`  | Empty State Title    | `undefined` | Overrides `emptyStateTitle`. Heading displayed in the empty state.     |
| `configEmptyStateMsg`    | `String`  | Empty State Message  | `undefined` | Overrides `emptyStateMsg`. Sub-text displayed below the empty-state heading. |
| `configAllowEditing`     | `Boolean` | Allow Editing        | `undefined` | Overrides `allowEditing`. Enables add / inline-edit / full-edit / delete functionality. |
| `configHideBorder`       | `Boolean` | Hide Border          | `undefined` | Overrides `hideBorder`. Removes the card frame. |
| `configDisableAddLink`   | `Boolean` | Disable Add Link     | `undefined` | Overrides `disableAddLink`. Hides the Add link control for link-less items in the single-item full-edit panel. |

#### Events

All events bubble and are composed (cross Shadow DOM boundaries).

| Event                                 | Detail type                      | Description                                                                      |
| ------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `aiux-checklist:item-clicked`      | `ChecklistItemClickedDetail`     | Fired when a checkbox is toggled.                                                                                                                          |
| `aiux-checklist:item-link-clicked` | `ChecklistItemLinkClickedDetail` | Fired when an item link is clicked (navigation prevented unless `opens-window`).                                                                           |
| `aiux-checklist:item-added`        | `ChecklistItemAddedDetail`       | Fired when a new item is submitted via the footer input.                                                                                                   |
| `aiux-checklist:item-edited`       | `ChecklistItemEditedDetail`      | Fired when a single item is saved via inline or full edit.                                                                                                 |
| `aiux-checklist:all-items-edited`  | `ChecklistAllItemsEditedDetail`  | Fired once when Apply is used in bulk "Edit all" mode, after every item passes validation. `detail.items` is the full updated list in order. No per-item `item-edited` events are fired for a bulk apply. |
| `aiux-checklist:item-deleted`      | `ChecklistItemDeletedDetail`     | Fired when a single item is deleted via the per-item trash button.                                                                                         |
| `aiux-checklist:all-items-deleted` | `ChecklistAllItemsDeletedDetail` | Fired once when "Delete all" is used. `detail.items` contains all removed items. No per-item `item-deleted` events are fired for a delete-all.             |
| `aiux-checklist:all-items-selected` | `ChecklistAllItemsSelectedDetail` | Fired once when "Select all" (kebab menu) is used. `detail.items` is every item with `checked` set to `true`. No per-item `item-clicked` events are fired.  |
| `aiux-checklist:list-reordered`    | `ChecklistListReorderedDetail`   | Fired when a pointer drag or keyboard reorder is committed. `detail.checklistData` is the full reordered array; `detail.delta` describes what moved.       |

## Types

```typescript
interface ChecklistItem {
  itemId: string;
  checked: boolean;
  label?: string;
  order?: number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  errorMsgForLabel?: string;
  link?: ChecklistItemLink | null;
}

interface ChecklistItemLink {
  url: string;
  text?: string;
  errorMsgForLink?: string;
}

interface ChecklistEditOptions {
  required: boolean; // show "Required" toggle in full edit modal
  disabled: boolean; // show "Disabled" toggle in full edit modal
  readonly: boolean; // show "Read only" toggle in full edit modal
  invalid: boolean; // show "Invalid" toggle in full edit modal
}

// Event detail types
interface ChecklistItemClickedDetail {
  checked: boolean;
  itemId: string;
  item: ChecklistItem;
}
interface ChecklistItemLinkClickedDetail {
  itemId: string;
  link: ChecklistItemLink;
  item: ChecklistItem;
}
interface ChecklistItemAddedDetail {
  item: ChecklistItem;
}
interface ChecklistItemEditedDetail {
  item: ChecklistItem;
}
interface ChecklistItemDeletedDetail {
  item: ChecklistItem;
}
interface ChecklistAllItemsDeletedDetail {
  items: ChecklistItem[];
}
interface ChecklistAllItemsSelectedDetail {
  items: ChecklistItem[];
}

interface ChecklistReorderDelta {
  /** Index the dragged item was at before the reorder (in the sorted array). */
  reorderedFromIndex: number;
  /** Index the dragged item occupies after the reorder. */
  reorderedToIndex: number;
  /** Indices of items that shifted up to fill the gap. */
  movedUp: number[];
  /** Indices of items that shifted down to fill the gap. */
  movedDown: number[];
  /** All items whose `order` value changed, with the updated `order`. */
  updatedItems: ChecklistItem[];
}

interface ChecklistListReorderedDetail {
  /** Full reordered checklist array. Apply this back to `checklist-data` to make the reorder visible. */
  checklistData: ChecklistItem[];
  delta: ChecklistReorderDelta;
}
```

## Editing modes

When `allow-editing` is set:

- **Inline edit** — double-click a label to edit it in place. `Enter` commits, `Escape` or blur cancels.
- **Full edit modal**: click the pencil icon to open an expanded form with label, link, and option toggles. The Link text/URL fields are always shown (no separate "Add link" step); leaving both empty on Apply clears the link (`link: null`). Which state-toggle checkboxes appear is controlled by `checklistEditOptions`, rendered as a 2-column grid of compact (`xs`) checkboxes. Cancel/Apply are the only actions in the panel; delete is not available here (see below).
- **Footer input** — type a label and press `Enter` to append a new item.
- **Delete**: the per-item trash icon (shown on row hover/focus in read mode, not inside the full-edit panel) fires `aiux-checklist:item-deleted`; "Delete all" via the footer kebab menu fires a single `aiux-checklist:all-items-deleted` (with all removed items in `detail.items`), not per-item events.
- **Select all**: the footer kebab menu also offers "Select all", which marks every item `checked` and fires a single `aiux-checklist:all-items-selected` (with all items, now checked, in `detail.items`), not per-item `item-clicked` events.
- **Edit all** (the footer kebab menu also offers "Edit all", listed above "Select all") opens **every** item's full-edit panel at once, stacked vertically with a divider between panels, replacing the normal item list. A single Cancel/Apply pair at the bottom controls the whole batch (there are no per-item buttons in this mode): **Apply** validates every panel and, only if all pass, commits them together in one `aiux-checklist:all-items-edited` event (carrying the full updated list) and exits back to the normal list; if any item is invalid the commit is blocked, the offending panels stay highlighted, and focus moves to the first invalid field. **Cancel** discards all unsaved edits and exits. The footer add-item input and per-item drag/gripper handles are not rendered while in this mode.
- **Reorder** — when `allow-editing` is set each item shows a grip handle. See [Reordering](#reordering) below.

## Reordering

When `allow-editing` is set, each item exposes a grip handle on the left edge. Users can reorder items by pointer drag or keyboard.

### Pointer drag

Click and drag any grip handle to a new position. Releasing the pointer commits the reorder and fires `aiux-checklist:list-reordered`.

### Keyboard reorder

1. Tab to the grip handle for the item you want to move.
2. Press **Enter** or **Space** to "grab" the item (the handle announces that it is grabbed).
3. Press **ArrowUp** or **ArrowDown** to move the item one position at a time.
4. Press **Enter** or **Space** to commit the new position and fire `aiux-checklist:list-reordered`.
5. Press **Escape** to cancel and return the item to its original position.

### Controlled reorder

`aiux-checklist` is a controlled component: it does not apply the reorder internally. When `aiux-checklist:list-reordered` fires, apply `event.detail.checklistData` back to the `checklist-data` property so the new order is reflected in the UI.

```typescript
import type {ChecklistListReorderedDetail} from '@servicenow/aiux-checklist';

el.addEventListener('aiux-checklist:list-reordered', (e: CustomEvent<ChecklistListReorderedDetail>) => {
  this.items = e.detail.checklistData;
});
```

## Data ownership model

`aiux-checklist` is a **strictly controlled** component. `checklistData` is the sole source of truth: the component normalises and renders it on every `willUpdate` cycle. User actions (toggle, add, edit, delete) fire events but **do not mutate internal state** — the UI only updates when the parent passes a new `checklistData` value.

**What this means in practice:** you must handle every mutation event and update your data store. The component will reflect those changes on the next `checklistData` binding.

> **Array reference identity:** Lit's change detection compares property values by reference. Mutating an existing array in place (e.g. `items.push(...)` or `items[0].checked = true`) and re-assigning the same reference will **not** trigger a re-render. Always return a new array (e.g. `[...this.items, newItem]` or `this.items.map(...)`) so Lit sees a changed value.

Treat every event as a command and update the source data accordingly:

```javascript
el.addEventListener('aiux-checklist:item-clicked', e => {
  const {itemId, checked} = e.detail;
  this.items = this.items.map(it =>
    it.itemId === itemId ? {...it, checked} : it
  );
});

el.addEventListener('aiux-checklist:item-added', e => {
  this.items = [...this.items, e.detail.item];
});

el.addEventListener('aiux-checklist:item-edited', e => {
  this.items = this.items.map(it =>
    it.itemId === e.detail.item.itemId ? e.detail.item : it
  );
});

el.addEventListener('aiux-checklist:item-deleted', e => {
  this.items = this.items.filter(it => it.itemId !== e.detail.item.itemId);
});

// all-items-deleted fires once for a "Delete all" (no per-item events)
el.addEventListener('aiux-checklist:all-items-deleted', () => {
  this.items = [];
});

// all-items-selected fires once for a "Select all" (no per-item events)
el.addEventListener('aiux-checklist:all-items-selected', e => {
  this.items = e.detail.items;
});

// list-reordered: apply detail.checklistData to make the reorder visible
el.addEventListener('aiux-checklist:list-reordered', e => {
  this.items = e.detail.checklistData;
});
```

## Dependencies

| Package                                           | Role                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `@servicenow/aiux-components-core`                | `AIUXElement` base class, Tailwind/DaisyUI styles                                     |
| `@servicenow/aiux-components-icon`                | `sn-aiux-icon` used for link, edit, delete icons                                      |
| `@servicenow/aiux-components-empty-state-content`  | `aiux-empty-state-content` renders the empty state (heading, body text, illustration) |
| `@servicenow/aiux-controller-aria-live`           | Aria live region announcements for screen readers                                     |
| `lit` _(peer)_                                    | Reactive rendering                                                                     |

## File structure

```
checklist/
├── src/
│   ├── checklist.ts            # aiux-checklist (public component)
│   ├── checklist-item.ts       # aiux-checklist-item (internal, not public API)
│   ├── controllers/
│   │   ├── ChecklistController.ts
│   │   └── ChecklistItemController.ts
│   ├── types/
│   │   └── checklist.types.ts
│   ├── styles/
│   │   └── checklist.styles.ts
│   ├── utils/
│   │   └── checklist-utils.ts
│   └── index.ts                # Public re-exports
├── test/
│   ├── checklist.test.ts
│   ├── ChecklistController.test.ts
│   ├── checklist-item.test.ts
│   ├── checklist-utils.test.ts
│   └── checklist.styles.test.ts
├── index.js
├── package.json
└── README.md
```

## Testing

```bash
# Run all checklist tests
pnpm --filter @servicenow/aiux-checklist test

# Or from package directory
pnpm test
```

## Internal component

`aiux-checklist-item` is registered as a custom element but is **not part of the public API**. It is rendered exclusively by `aiux-checklist` via prop drilling and internal events. Do not use it directly.

Its `forceFullEdit` property (`attribute: false`, boolean, default `false`) is internal-only: when set, the item renders its full-edit panel unconditionally, seeding the edit buffer from its current `item` if not already seeded. `aiux-checklist` sets this on every item while in "Edit all" bulk mode (see [Editing modes](#editing-modes) above); it has no attribute and is not intended to be set directly by a consumer.
