# @servicenow/aiux-controller-focus

## Import

```js
import {FocusController} from '@servicenow/aiux-controller-focus';
```


A standalone, Lit-compatible controller package for focus behaviour in elements with shadow roots, providing `FocusController` for auto-focus delegation and a lightweight trap toggle, and `FocusTrapController` for overlay-oriented focus trapping with container scoping, custom focus order, and an explicit activate/deactivate lifecycle.

## Features

- **Auto-focus delegation** (`FocusController`) — when `host.focus()` is called, focus is immediately re-delegated to the first focusable element inside the shadow root. Focus is never stolen on page load.
- **Simple focus trapping** (`FocusController`) — when `trap` is `true`, Tab and Shift+Tab cycle through focusable shadow-root descendants rather than leaving the component.
- **Screen-reader isolation** (`FocusController`) — when the trap is active, all direct children of `<body>` that are not the host are given `aria-hidden="true"`, mirroring the pattern used by native `<dialog>`.
- **Overlay-oriented trapping** (`FocusTrapController`) — a separate class purpose-built for modals/drawers/popovers: scoped to explicit containers (not just the host's own shadow root), supports custom focus ordering, per-activation initial-focus overrides, previous-focus capture/restore, and correctly hands off between nested traps (e.g. a popover opened from inside a modal).

## `FocusController` vs `FocusTrapController`

Both live in this package, but they're not the same mechanism. Use `FocusController`'s `trap` option for the simple case — a component that only ever traps focus within its own shadow root. Reach for `FocusTrapController` directly when you need any of: scoping the trap to a specific container other than the whole host (`getContainers`), a custom focus order (`getFocusableElements`), an explicit `activate()`/`deactivate()` lifecycle (rather than a boolean property), or correct behavior when traps can nest (e.g. a popover opened from inside a modal). `FocusTrapController` is the one re-exported by the `@servicenow/aiux-controllers` umbrella; `FocusController` is not — see the umbrella package's own README for why.

## Installation

```bash
pnpm add @servicenow/aiux-controller-focus
```

## Usage

### Auto-focus delegation

```js
import {LitElement, html} from 'lit';
import {FocusController} from '@servicenow/aiux-controller-focus';

class MyCard extends LitElement {
  _focus = new FocusController(this);

  render() {
    return html`
      <input type="text" placeholder="Name" />
      <button>Save</button>
    `;
  }
}
```

Calling `myCard.focus()` lands on the `<input>` inside the shadow root.

### Focus trapping (modal pattern)

```js
import {LitElement, html} from 'lit';
import {FocusController} from '@servicenow/aiux-controller-focus';

class MyModal extends LitElement {
  _focus = new FocusController(this, {trap: true});

  render() {
    return html`
      <div role="dialog" aria-modal="true">
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    `;
  }
}
```

While the modal is visible, Tab/Shift+Tab stay within the component and sibling body children are hidden from screen readers.

### Toggling the trap at runtime

```js
class MyDrawer extends LitElement {
  _focus = new FocusController(this);

  open() {
    this._focus.trap = true;
    this.focus();
  }

  close() {
    this._focus.trap = false;
  }
}
```

### Standalone (no Lit host)

```js
import {FocusController} from '@servicenow/aiux-controller-focus';

const ctrl = new FocusController(myElement, {trap: true});
ctrl.hostConnected();

// later:
ctrl.destroy();
```

### `FocusTrapController` (overlay pattern)

```js
import {LitElement, html} from 'lit';
import {FocusTrapController} from '@servicenow/aiux-controller-focus';

class MyDialog extends LitElement {
  _focusTrap = new FocusTrapController(this, {
    getContainers: () => {
      const dialog = this.renderRoot?.querySelector('dialog');
      return dialog ? [dialog] : [this];
    }
  });

  open() {
    this._focusTrap.activate();
  }

  close() {
    this._focusTrap.deactivate();
  }

  render() {
    return html`
      <dialog>
        <button @click=${this.close}>Cancel</button>
        <button @click=${this.close}>Confirm</button>
      </dialog>
    `;
  }
}
```

Unlike `FocusController`'s boolean `trap` property, `FocusTrapController` is activated/deactivated explicitly — call `activate()` when the overlay opens and `deactivate()` when it closes (`hostDisconnected` also calls `deactivate()` automatically, so an overlay removed from the DOM while open still restores focus correctly).

## API

### `new FocusController(host, options?)`

| Parameter      | Type          | Description                                                             |
| -------------- | ------------- | ----------------------------------------------------------------------- |
| `host`         | `HTMLElement` | The host element. Pass a Lit `ReactiveControllerHost` to auto-register. |
| `options.trap` | `boolean`     | Start with focus trapping active. Default: `false`.                     |

### Properties

| Property | Type      | Description                                                                                                                              |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `trap`   | `boolean` | Get or set trap state at runtime. Setting `true` applies `aria-hidden` to sibling body children immediately; setting `false` removes it. |

### Methods

| Method               | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| `hostConnected()`    | Attach listeners. Called automatically by Lit.                                     |
| `hostDisconnected()` | Remove listeners and release `aria-hidden`. Called automatically by Lit.           |
| `destroy()`          | Full teardown — calls `hostDisconnected` and removes the controller from the host. |

### `new FocusTrapController(host, options?)`

| Parameter                     | Type                                    | Description                                                                                                                                          |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                          | `ReactiveControllerHost & HTMLElement`  | The host element. Auto-registers via `host.addController(this)` when present.                                                                       |
| `options.getContainers`        | `() => Array<HTMLElement \| ShadowRoot>` | Elements the trap scopes to. Defaults to the host's `renderRoot`/`shadowRoot` (or the host itself if neither exists).                                |
| `options.getFocusableElements` | `() => HTMLElement[]`                   | Custom focus order. When omitted, focusables are collected from `getContainers()` in DOM order, piercing shadow DOM.                                 |
| `options.initialFocus`         | `() => HTMLElement \| null`             | Default focus target on `activate()`. Overridable per-call via `activate({initialFocus})`. Falls back to the first focusable element, then `fallbackFocus`. |
| `options.trapFocus`            | `boolean \| (() => boolean)`            | When `false`, Tab cycling and the focus-redirect listener are not installed — autofocus and previous-focus restore still run. Evaluated per `activate()`. Default: `true`. |
| `options.fallbackFocus`        | `() => HTMLElement \| null`             | Last-resort focus target when no focusable elements exist. Defaults to the host.                                                                     |

### Properties

| Property | Type      | Description                             |
| -------- | --------- | ------------------------------------------ |
| `active` | `boolean` | Read-only. Whether the trap is currently active. |

### Methods

| Method                            | Description                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `activate(overrides?)`               | Captures the currently focused element, installs listeners (if `trapFocus` resolves truthy), and moves focus to the resolved initial target. No-op when already active. `overrides.initialFocus` takes priority over the constructor option for this call only. |
| `deactivate()`                       | Removes listeners and restores focus to whatever was focused before `activate()`. No-op when not active. Called automatically by `hostDisconnected()`. |

## Focusable element heuristic

The controller targets elements matching:

```
a[href], area[href], button:not([disabled]),
details > summary:first-of-type,
input:not([disabled]), select:not([disabled]),
textarea:not([disabled]),
[contenteditable]:not([contenteditable="false"]),
[tabindex]:not([tabindex="-1"])
```

Elements with a `[hidden]` ancestor or an `offsetParent` of `null` (not visible) are excluded.

## Demo

```bash
pnpm --filter @servicenow/aiux-controller-focus dev
```

## Tests

```bash
pnpm --filter @servicenow/aiux-controller-focus test
```
