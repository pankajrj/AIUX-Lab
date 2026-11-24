---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-resizable-panes'
  - rule: aiux_prefix_for_custom_elements
    identifiers:
      - aiux-resizable-pane-group
      - aiux-resizable-pane
      - aiux-resizable-pane-handle
---
# @servicenow/aiux-resizable-panes

## Import

```js
import '@servicenow/aiux-resizable-panes';
```


Two adjacent content regions with a draggable, keyboard-operable separator between them, for dense workspaces: list + form, detail + activity stream, side-by-side comparisons.

Three custom elements: `aiux-resizable-pane-group` (the orchestrator), `aiux-resizable-pane` (a content region), and `aiux-resizable-pane-handle` (the separator). Importing the package root registers all three and named-exports their classes. There is no default export and no public controller.

Not for: navigation or tab-like region switching, a single collapsible drawer (use a disclosure or drawer), three or more same-axis regions, or a general flex/grid wrapper.

## Installation

```bash
pnpm add @servicenow/aiux-resizable-panes
```

```js
import '@servicenow/aiux-resizable-panes';
```

## Storybook

Stories are available from the repo root:

```bash
pnpm storybook
```

They cover the horizontal and vertical layouts, collapsible panes, and the `Nested` / `NestedCollapsible` compositions.

## Usage

```html
<aiux-resizable-pane-group label="Record workspace">
  <aiux-resizable-pane id="list" default-size="30%" min-size-px="240" label="Record list">
    <!-- your content -->
  </aiux-resizable-pane>
  <aiux-resizable-pane-handle id="list-form-divider"></aiux-resizable-pane-handle>
  <aiux-resizable-pane id="form" label="Record form">
    <!-- your content -->
  </aiux-resizable-pane>
</aiux-resizable-pane-group>
```

Read the live size from the `layout-changed` event, never from an attribute:

```js
group.addEventListener('aiux-resizable-pane-group:layout-changed', (event) => {
  savePreference(event.detail.sizes); // [{id, percent, pixels, collapsed}, …]
});
```

To restore a saved layout, set `default-size` **before** first render. The component is uncontrolled, so re-pushing a size later would fight the user.

### Composition rules

The group inspects its direct children. Supported shapes:

- Empty: nothing renders.
- A single `aiux-resizable-pane`: it fills the group, with no operable handle.
- Exactly `pane`, `handle`, `pane`.

Every managed child needs an **authored, document-unique `id`**. There are no generated IDs. Whitespace and comments are ignored, and nested groups are independent because only direct children are inspected.

Any other shape (wrong order, missing handle, unsupported child, missing or duplicate `id`) puts the group into a **content-preserving unmanaged fallback**: your content stays visible, but managed layout and separator interaction are off. The fallback is not silent: it logs one deduplicated error naming the offending element and the reason.

### Sizing the group

The group fills its container's block size in both orientations, so a bounded ancestor is all it needs and the separator spans the full cross axis with no consumer CSS.

If every ancestor is auto-height, the group falls back to being content-sized. That is correct for a page-scroll layout (tall panes, the page scrolls, the grip stays reachable), but a `vertical` group then has nothing to divide, and a `horizontal` group's separator is only as tall as its tallest pane's content. Give it a height when that is not what you want:

```css
aiux-resizable-pane-group {
  height: 60vh;
}
```

### Retheming the separator

Set the **thickness** on the handle element (it is the space subtracted from the resize axis). The `separator` part is the hook for colour.

```css
aiux-resizable-pane-handle {
  inline-size: 4px; /* horizontal group; use block-size when vertical */
}
aiux-resizable-pane-handle::part(separator) {
  background-color: rebeccapurple;
}
```

The grip and the collapse buttons overflow the handle rather than widening it, so a larger affordance never steals layout space from the panes.

## Properties

### `aiux-resizable-pane-group`

| Property       | Attribute       | Type                         | Default        | Description                                                                                                                                     |
| -------------- | --------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`  | `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Axis the panes lay out and resize along; reflected. Resize axis only, not a responsive-stacking control.                                        |
| `disabled`     | `disabled`      | `boolean`                    | `false`        | Disables all resize interaction and removes the separator from the tab order; reflected.                                                        |
| `keyboardStep` | `keyboard-step` | `number`                     | `5`            | Percentage points a focused separator moves per Arrow press. Must satisfy `0 < step <= 100`; an invalid runtime value keeps the last valid one. |
| `label`        | `label`         | `string`                     | `''`           | Accessible name for the group. Blank means no group landmark.                                                                                   |

### `aiux-resizable-pane`

Sizing is a single declarative baseline. `defaultSize` is the uncontrolled initial split and the value a pane resets or expands back to; it is applied at initialization and reset only.

| Property         | Attribute         | Type                                      | Default               | Description                                                                                                                                                                   |
| ---------------- | ----------------- | ----------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `id`              | `string`                                  | **required**          | Authored, document-unique identity used for state, events, and ARIA.                                                                                                          |
| `defaultSize`    | `default-size`    | `number` or `%`/`px` string               | auto / equal split    | Baseline size at initialization and reset. If only one pane sets it, that pane takes it and the other takes the residual. Read the live size from events, not this attribute. |
| `minSizePct`     | `min-size-pct`    | `number` `0`–`100` or `%`                 | unset                 | Proportional floor. Combined with `minSizePx` by taking the **larger**.                                                                                                       |
| `minSizePx`      | `min-size-px`     | `number` or `px` string                   | unset                 | Absolute pixel floor. With neither floor set, the floor is `0`.                                                                                                               |
| `maxSizePct`     | `max-size-pct`    | `number` `0`–`100` or `%`                 | unset                 | Proportional cap. Combined with `maxSizePx` by taking the **smaller**.                                                                                                        |
| `maxSizePx`      | `max-size-px`     | `number` or `px` string                   | unset                 | Absolute pixel cap. With neither cap set, the cap is the full axis.                                                                                                           |
| `collapsible`    | `collapsible`     | `boolean`                                 | `false`               | Capability gate: whether the pane may collapse at all. When `true`, the component renders this pane's collapse/expand button.                                                 |
| `collapsedSize`  | `collapsed-size`  | `number` or `%`/`px` string               | `0`                   | Size the pane occupies while collapsed. **Exempt from all four bounds.**                                                                                                      |
| `resizeBehavior` | `resize-behavior` | `'preserve-relative' \| 'preserve-pixel'` | `'preserve-relative'` | How the pane reacts when the group container resizes: keep its ratio, or keep its exact pixels.                                                                               |
| `label`          | `label`           | `string`                                  | `''`                  | Accessible name for the pane; also names its collapse/expand control and its scrollable content region.                                                                       |

### `aiux-resizable-pane-handle`

| Property | Attribute | Type     | Default      | Description                                                         |
| -------- | --------- | -------- | ------------ | ------------------------------------------------------------------- |
| `id`     | `id`      | `string` | **required** | Authored, document-unique separator identity.                       |
| `label`  | `label`   | `string` | `''`         | Accessible name for the separator. Blank uses a localized fallback. |

### Unit grammar

| Form               | Meaning                                         |
| ------------------ | ----------------------------------------------- |
| `200`              | 200 pixels                                      |
| `'200px'`          | 200 pixels                                      |
| `'50%'`            | 50% of the group's available axis               |
| `'2rem'`, `'10vh'` | **invalid**, falls back to the default          |
| `'200'` (unitless) | **invalid** for `defaultSize` / `collapsedSize` |

A unitless value is valid on the four bound properties (`min-size-px="240"`, `min-size-pct="20"`) because the unit is already in the property name. It is rejected on `defaultSize` and `collapsedSize`, where it would be ambiguous between pixels and a proportion.

Bounds are expressed **per unit** so a pane can hold a proportional and an absolute bound at once. `minSizePct: 20` with `minSizePx: 240` means never below 20% of the axis _and_ never below 240px. If the effective minimum exceeds the effective maximum, the minimum wins.

## Events

The group emits a single event: `aiux-resizable-pane-group:layout-changed`, a non-cancelable, bubbling, composed `CustomEvent`. It fires once per committed layout change from any source. `sizes` is always the applied, clamped result, never a rejected request.

```ts
interface LayoutChangedEventDetail {
  sizes: PaneSize[]; // applied, clamped result
  source: 'pointer' | 'keyboard' | 'collapse-control' | 'property' | 'orientation' | 'composition';
}

interface PaneSize {
  id: string;
  percent: number; // 0–100 share of the group
  pixels: number; // applied pixel size
  collapsed: boolean;
}
```

**Read everything from `sizes`.** Collapse/expand is the per-pane `collapsed` flag; the live size is `pixels`/`percent`. Diff against the previous `sizes` you received if you need "what changed" — the component does not carry a `previousSizes`, and one boundary move always changes both panes.

**One event per gesture.** A whole drag gesture produces one `layout-changed` on release, not one per frame; a rolled-back or net-zero gesture produces none. Keyboard input is a discrete atomic commit. A container resize commits and reports `source: 'property'`.

There is deliberately no live per-frame drag stream, no separate collapse/expand or constraint-recovery event, and no correlation id in this version — the surface is intentionally minimal and can grow additively if a real need appears.

## Interactions

### Keyboard (focused, enabled separator)

| Key                  | Effect                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| Arrow along the axis | Move the separator one `keyboardStep` in that **physical** direction   |
| Home / End           | Primary pane to its feasible minimum / maximum                         |
| Enter                | Toggle the primary pane if collapsible, else the collapsible neighbour |

The **first pane in DOM order is primary** (visually left in LTR, right in RTL); `aria-valuenow` and Home/End track it. Arrows move the separator in their named physical direction, so under RTL a physical-left press grows the primary pane.

### Pointer drag

A drag starts anywhere on the separator (line or grip) and release commits the final position; Escape cancels and restores the starting layout.

Within 8px of an exact 50/50 the boundary snaps to centre (leaving that radius commits the actual position).

### Collapse

`collapsible` is the capability gate. When `true`, the pane may collapse by the built-in button, `Enter`, or drag-to-collapse, and the component renders its own collapse/expand button for that pane; when `false`, the pane never collapses and no button renders.

The last visible pane can never be collapsed. A collapsed pane's content becomes `inert` and `hidden` and focus moves out of it; a non-zero `collapsedSize` reserves structure only. Expanding restores the last expanded size, then `defaultSize`, then an equal split.

**Drag-to-collapse** applies to collapsible panes only: dragging more than 24px below the effective minimum snaps to `collapsedSize`; dragging back out past the effective minimum plus 24px re-expands (the gap prevents boundary flicker). A non-collapsible pane always clamps at its effective minimum. Keyboard collapse is unaffected by these thresholds.

**A pane with no declared minimum can be resized to zero** while still being _expanded_ (its floor is `0`). Its content is then concealed like a collapsed pane's, but `collapsed` stays `false`. Track visibility from the reported size (a zero `pixels`, or `collapsed`), and declare a minimum if you want a floor above zero.

Once a boundary is committed, a container resize reconciles it through `resizeBehavior`; setting `defaultSize` (or a bound) afterward still re-derives the layout.

## Content overflow

The pane's content box is contained by the component, so a pane never grows past its allotted axis no matter how large its content is. Presentation defaults to `overflow: auto`, so "shrink the pane, content scrolls" is zero-config and content is never silently clipped.

Restyle through the `content` part alone:

```css
/* Clip instead of scrolling */
aiux-resizable-pane::part(content) {
  overflow: hidden;
}
```

While scrollable, that part is keyboard-focusable and carries the pane `label` as its accessible name; overriding it to `hidden` or `visible` removes the scroll container and that affordance with it.

## Nesting

Groups nest with no extra API. A group inspects only its **direct** children, so an inner group inside a pane is ordinary content, not part of the outer composition. Each group resizes, collapses, and emits events independently. See the `Nested` and `NestedCollapsible` stories.

## Responsive layout

`orientation` selects the resize axis. Collapsing to a stacked, non-resizing flow at narrow widths is **consumer-owned**: the component never observes its own width, owns breakpoint values, or emits a responsive event. Reach the stacked presentation with your own container query; see [`example/page.js`](./example/page.js) in this package's repository source for the recipe (a dev-only demo, not part of the published `files`).

## CSS parts

Styling goes through parts plus platform tokens; the component ships no visual opinions of its own and exposes no CSS custom properties.

| Part               | Element | Description                                                                |
| ------------------ | ------- | -------------------------------------------------------------------------- |
| `frame`            | group   | The outer group box.                                                       |
| `layout`           | group   | The flex container the panes and handle lay out in.                        |
| `content`          | pane    | The content box; owns overflow (default `auto`).                           |
| `separator`        | handle  | The full-length separator line; its thickness is what consumes axis space. |
| `grip`             | handle  | The visible drag affordance at the centre of the separator.                |
| `collapse-control` | handle  | A built-in collapse/expand button.                                         |

`resize-trigger`, `resize-surface`, and `resize-command` are reserved for the non-drag command surface, which is not yet implemented (see _Limitations_).

## Accessibility

The component implements the WAI-ARIA **Window Splitter** pattern and meets WCAG 2.2 AA except SC 2.5.7 (see _Limitations_). Separator semantics, keyboard operation, focus management, live-region announcements, target size, RTL mirroring, forced colors, and localization are all owned by the component and verified against real screen readers. You do not implement any of it.

**The one thing you have to do is set `label`.** Semantics are opt-in on a meaningful name:

- A group with no `label` exposes no group landmark.
- A pane with no `label` is not a `region`, and its scrollable content area has no accessible name.
- A handle with no `label` falls back to a localized default, which is usually worth overriding when a page has more than one separator.

Control names derive from the pane `label` (`Collapse {label}` / `Expand {label}`), so a vague pane name produces a vague button name.

Collapse-control icons resolve their direction at commit time, so a runtime `dir` change updates them on the next commit rather than immediately.

## Limitations

- **The non-drag single-pointer control, and with it WCAG 2.2 SC 2.5.7 (Dragging Movements).** Keyboard operation works, but keyboard alone does not satisfy 2.5.7. This is the one criterion the component does not currently meet.
- **An imperative `size` command.** Sizing is uncontrolled-only, so a saved layout must be available at render time. Async or late restore is not possible yet.
- **Three or more same-axis panes**, built-in persistence, a controlled `collapsed` property, and per-control name overrides.

## Dependencies

| Package                            | Kind | Why                                                    |
| ---------------------------------- | ---- | ------------------------------------------------------ |
| `lit`                              | peer | Component base (`^3.3.2`).                             |
| `@servicenow/aiux-components-core` | peer | `AIUXElement` base class and `getLogger`.              |
| `@servicenow/aiux-directive-icon`  | peer | The `icon()` directive for the collapse control glyph. |
| `@lit/localize`                    | peer | `msg()` for every user-facing string.                  |
