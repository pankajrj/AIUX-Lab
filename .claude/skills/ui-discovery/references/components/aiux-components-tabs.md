---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-components-tabs'
  - rule: event_name_namespaced_with_component
    identifiers:
      - tab-change
---
# @servicenow/aiux-components-tabs

## Import

```js
import '@servicenow/aiux-components-tabs';
```


A flexible tab navigation component using button elements for WCAG-compliant tab navigation, with icon support, animated panel transitions, and DaisyUI styling.

Ported from karuna's `components/tabs` and rewritten to TypeScript. Handler logic lives in `TabGroupController` (`src/controllers/TabGroupController.ts`); class-string building lives in pure, independently tested helpers (`src/utils/tab-group-helpers.ts`).

## Component Name

`<aiux-tab-group>`

## Features

- Button-based tabs (WCAG-compliant)
- Multiple style variants (default, boxed, bordered, lifted)
- Multiple sizes (xs, sm, md, lg, xl)
- Tab placement (top, bottom)
- Start/end icons per tab (`iconStart`, `iconEnd`)
- Icon-only tabs with tooltip + accessible label
- Full-width evenly distributed tabs (`stretch`)
- Disabled tabs support
- Optional tab content sections
- Animated panel slide/fade transitions (honors `reduced-motion`)
- Pre-selected active tab
- Tab change events
- Programmatic tab switching
- Keyboard accessible (Arrow keys, roving tabindex)
- ARIA attributes for accessibility
- Theme-compatible via DaisyUI

## Installation

This package is published to the internal ServiceNow Nexus registry.

```bash
pnpm add @servicenow/aiux-components-tabs
```

## Usage

```html
<aiux-tab-group id="myTabs"></aiux-tab-group>
<script type="module">
  document.getElementById('myTabs').tabs = [
    {id: 'tab1', label: 'Profile', content: 'Profile content'},
    {id: 'tab2', label: 'Settings', content: 'Settings content'}
  ];
</script>
```

## Properties

Because Lit maps camelCase properties to lowercase/kebab-case attributes, the HTML attribute name differs from the JS property name for `defaultActiveTab` and `tablistLabel` (both use an explicit `attribute:` override). Set `tabs` as a JS property (it is an array). `activeTab` has no attribute at all; it is JS-property binding only.

| Property           | Attribute       | Type    | Default   | Description                                                            |
| ------------------ | --------------- | ------- | --------- | ---------------------------------------------------------------------- |
| `tabs`             | `tabs`          | Array   | `[]`      | Array of tab objects (see Tab Object Structure). Set as a JS property. |
| `defaultActiveTab` | `active-tab`    | String  | First tab | ID of the initially active tab. Only used on first render; later changes ignored. |
| `activeTab`        | none            | String  | `''`      | Controlled active tab id. Every change re-syncs the tab-group, even after mount, but a direct user click always wins over a stale binding. |
| `variant`          | `variant`       | String  | `''`      | Style variant: `'boxed'`, `'bordered'`, `'lifted'`, or default (empty) |
| `placement`        | `placement`     | String  | `'top'`   | Tab placement: `'top'` or `'bottom'`                                   |
| `size`             | `size`          | String  | `'md'`    | Tab size: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`                       |
| `stretch`          | `stretch`       | Boolean | `false`   | When `true`, tabs fill the full width and distribute evenly            |
| `tablistLabel`     | `tablist-label` | String  | `''`      | Accessible label for the tablist (maps to `aria-label` on the tablist) |

`reduced-motion` is a plain host attribute (checked via `hasAttribute`), not a Lit property. Set it with `element.toggleAttribute('reduced-motion', true)` or the HTML attribute directly; it shortens the panel transition and its animation duration.

## Tab Object Structure

```typescript
interface Tab {
  label?: string; // Tab label text. Omit for an icon-only tab.
  id?: string; // Optional - unique identifier (falls back to a generated id if omitted)
  content?: unknown; // Optional - string or Lit TemplateResult shown when the tab is active
  disabled?: boolean; // Optional - whether the tab is disabled. Default false.
  iconStart?: IconNameWithVariant; // Optional - icon name rendered before the label
  iconEnd?: IconNameWithVariant; // Optional - icon name rendered after the label
  title?: string; // Optional - tooltip text for icon-only tabs (also used as AT fallback)
  ariaLabel?: string; // Optional - explicit accessible label for icon-only tabs
}
```

`content` accepts either a string or a Lit `TemplateResult`. For icon-only tabs (no `label`), provide `title` or `ariaLabel` so the tab has a tooltip and an accessible name; `title` takes precedence when both are set.

## Events

### `aiux-tab-group:tab-change`

Fired when the active tab changes. Bubbles and is `composed` (crosses Shadow DOM boundaries).

**Event Detail:**

```typescript
{
  id: string; // Tab id
  label?: string; // Tab label
  index: number; // Tab index
  previousTab: string; // Previous tab id
}
```

### `tab-change` (deprecated)

A backward-compatible, unnamespaced alias of `aiux-tab-group:tab-change`, dispatched with the identical detail payload and the same `bubbles`/`composed` options. Retained from the karuna original; it will be removed in a future release, so listen for `aiux-tab-group:tab-change` instead.

## Methods

### `switchToTab(tabId)`

Programmatically switch to a specific tab. A no-op if the target tab is disabled or cannot be resolved.

- **Parameters:** `tabId` (`string | number`) - tab id or index
- **Example:** `element.switchToTab('profile')` or `element.switchToTab(1)`

### `getActiveTab()`

Get the currently active tab object.

- **Returns:** `Tab | undefined`
- **Example:** `const activeTab = element.getActiveTab()`

## Dependencies

| Package                                  | Relationship      | Why                                                  |
| ----------------------------------------- | ----------------- | ----------------------------------------------------- |
| `lit`                                    | peerDependency     | Runtime singleton, owned by the host shell            |
| `@servicenow/aiux-components-core`       | peerDependency     | `AIUXElement` base class                             |
| `@servicenow/aiux-directive-icon`        | peerDependency     | `icon()` directive for `iconStart`/`iconEnd`         |
| `@servicenow/aiux-directive-tooltip`     | peerDependency     | `tooltip()` directive for icon-only tab tooltips     |

## DaisyUI Classes Used

These are the brand-prefixed DaisyUI classes the component applies internally (the repo uses the `aiux-` prefix).

### Container Classes

- `aiux-tabs` - Base container class (on the `role="tablist"` element)
- `aiux-tabs-box` - Boxed style variant (`variant="boxed"`)
- `aiux-tabs-border` - Bordered style variant (`variant="bordered"`)
- `aiux-tabs-lift` - Lifted style variant (`variant="lifted"`)
- `aiux-tabs-bottom` - Places tabs below content (`placement="bottom"`)
- `aiux-tabs-xs`, `aiux-tabs-sm`, `aiux-tabs-lg`, `aiux-tabs-xl` - Size variants (`md` needs no class)

### Tab Item Classes

- `aiux-tab` - Individual tab item (button element)
- `aiux-tab-active` - Active tab state (automatically applied)
- `aiux-tab-disabled` - Disabled tab state

### Panel Class

- `aiux-tab-content` - Content panel element (custom-styled, drives the animated slide/fade transition)

## Usage Examples

### Boxed tabs with disabled item

```html
<aiux-tab-group id="boxedTabs" variant="boxed"></aiux-tab-group>
<script type="module">
  document.getElementById('boxedTabs').tabs = [
    {label: 'Active', id: 'active'},
    {label: 'Disabled', id: 'disabled', disabled: true},
    {label: 'Another', id: 'another'}
  ];
</script>
```

### Icons and an accessible tablist label

```html
<aiux-tab-group id="iconTabs" variant="boxed" tablist-label="Main sections"></aiux-tab-group>
<script type="module">
  document.getElementById('iconTabs').tabs = [
    {label: 'Home', id: 'home', iconStart: 'home-outline'},
    {label: 'Alerts', id: 'alerts', iconEnd: 'bell-outline'},
    // Icon-only tab: no label, provide title/ariaLabel for tooltip + AT name
    {id: 'settings', iconStart: 'cog-outline', title: 'Settings'}
  ];
</script>
```

### Programmatic control

```html
<aiux-tab-group id="controlledTabs" variant="lifted"></aiux-tab-group>
<button onclick="document.getElementById('controlledTabs').switchToTab('tab2')">Switch to Tab 2</button>

<script type="module">
  document.getElementById('controlledTabs').tabs = [
    {label: 'Tab 1', id: 'tab1'},
    {label: 'Tab 2', id: 'tab2'},
    {label: 'Tab 3', id: 'tab3'}
  ];
</script>
```

## Accessibility

- `role="tablist"` on the container, `role="tab"` on each tab, `role="tabpanel"` on each panel
- `aria-selected` for active state, native `disabled` attribute for disabled tabs
- `aria-controls` linking tabs to panels, `aria-labelledby` linking panels back to their tab
- Arrow key keyboard navigation with roving tabindex, disabled tabs skipped
- Focus moves to the newly-activated tab button after a keyboard switch

## Notes

- Uses button elements for tab switching (WCAG-compliant pattern)
- Tab panels use the custom `aiux-tab-content` class, which drives the animated slide/fade transition between panels
- Styling is DaisyUI-based (theme-compatible) plus a `static styles` block for panel-transition keyframes and variant tweaks
- Panel transitions honor the `reduced-motion` host attribute (shortens the transition timer and the panel animation duration)
- Keyboard navigation moves relative to the component's own active-tab state, not to whichever tab button currently has DOM focus

## Development

```bash
pnpm install
pnpm test              # unit tests
pnpm test:functional    # browser-mode functional tests (Playwright)
pnpm test:all           # both
pnpm lint
```
