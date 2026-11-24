# @servicenow/aiux-controller-roving-tabindex

## Import

```js
import {RovingTabIndexController} from '@servicenow/aiux-controller-roving-tabindex';
```


A standalone, Lit-compatible controller that implements the roving tabindex pattern for a group of peer items inside a host element.

## What it does

The roving tabindex pattern makes a widget a **single Tab stop**. Only the active item has `tabindex="0"`; all others are `tabindex="-1"`. Arrow keys move focus within the group; Tab/Shift+Tab leave it entirely. The last focused item is remembered so Tab-back always returns to the correct position.

## When to use

Use this controller for a flat list of peer items that form one logical unit:

- Radio button groups
- Toolbars
- Tab lists
- Segmented controls
- Listboxes / option groups

## When not to use

- A form with mixed input types (each field should be individually Tab-reachable)
- A list where each item contains multiple interactive controls
- Any widget where items need to be individually reachable via Tab

## Installation

```bash
pnpm add @servicenow/aiux-controller-roving-tabindex
```

## Usage

### Basic (standalone)

```js
import {RovingTabIndexController} from '@servicenow/aiux-controller-roving-tabindex';

const ctrl = new RovingTabIndexController(groupEl, {
  selector: '[role="radio"]'
});
ctrl.hostConnected();
```

### With a Lit host

```js
import {LitElement} from 'lit';
import {RovingTabIndexController} from '@servicenow/aiux-controller-roving-tabindex';

class RadioGroup extends LitElement {
  _roving = new RovingTabIndexController(this, {
    selector: '[role="radio"]',
    orientation: 'both'
  });
}
```

### Horizontal toolbar

```js
const ctrl = new RovingTabIndexController(toolbarEl, {
  selector: 'button',
  orientation: 'horizontal'
});
ctrl.hostConnected();
```

### Vertical list

```js
const ctrl = new RovingTabIndexController(listEl, {
  selector: '[role="option"]',
  orientation: 'vertical'
});
ctrl.hostConnected();
```

### Menu with wrapping

```js
const ctrl = new RovingTabIndexController(menuEl, {
  selector: '[role="menuitem"]:not([disabled])',
  orientation: 'vertical',
  wrap: true
});
ctrl.hostConnected();
```

## API

### `new RovingTabIndexController(host, options)`

| Parameter             | Type                                    | Description                                                                                               |
| --------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `host`                | `HTMLElement \| ReactiveControllerHost` | The host element. Pass a Lit host to auto-register; pass a plain element for standalone use.              |
| `options.selector`    | `string`                                | **Required.** CSS selector identifying the managed items. Queried from light DOM first, then shadow root. |
| `options.orientation` | `'horizontal' \| 'vertical' \| 'both'`  | Which arrow keys move focus. Default: `'both'`.                                                           |
| `options.wrap`        | `boolean`                               | Wrap from last item to first (and vice versa) on arrow keys. Default: `false`.                            |

### Properties

| Property      | Type     | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| `activeIndex` | `number` | Index of the currently active (tabindex="0") item. Read-only. |

### Methods

| Method               | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `focus(index)`       | Programmatically move focus to the item at `index`. Clamps to valid range.                             |
| `refresh()`          | Re-queries items from the host. Call after dynamic DOM changes that add or remove items.               |
| `hostConnected()`    | Queries items, applies tabindexes, attaches listeners. Called automatically when used with a Lit host. |
| `hostDisconnected()` | Removes listeners and restores original tabindex values.                                               |
| `destroy()`          | Calls `hostDisconnected()` and removes the controller from the host.                                   |

### Keyboard behaviour

| Key                 | Action                                  |
| ------------------- | --------------------------------------- |
| `ArrowRight`        | Next item (`horizontal` and `both`)     |
| `ArrowLeft`         | Previous item (`horizontal` and `both`) |
| `ArrowDown`         | Next item (`vertical` and `both`)       |
| `ArrowUp`           | Previous item (`vertical` and `both`)   |
| `Home`              | First item                              |
| `End`               | Last item                               |
| `Tab` / `Shift+Tab` | Leave the group (not intercepted)       |

By default, arrow keys stop at the first and last item. Set `wrap: true` to wrap from the last item back to the first (and vice versa) — useful for menus and other cyclic widgets per WAI-ARIA APG.

## Demo

```bash
pnpm --filter @servicenow/aiux-controller-roving-tabindex dev
```

## Tests

```bash
pnpm --filter @servicenow/aiux-controller-roving-tabindex test
```
