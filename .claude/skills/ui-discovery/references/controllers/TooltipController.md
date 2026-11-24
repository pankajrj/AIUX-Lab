# @servicenow/aiux-controller-tooltip

## Import

```js
import {TooltipController} from '@servicenow/aiux-controller-tooltip';
```


A standalone, Lit-compatible tooltip controller. No external component dependencies — it creates a plain `<div role="tooltip">` element and manages show/hide scheduling, positioning, ARIA linking, and live content updates.

## When to use

Use this controller when a single tooltip instance needs to serve **multiple trigger elements** imperatively — a toolbar where every button gets a tooltip via one shared `TooltipController` and repeated `addTrigger()` calls, or any non-Lit-render context (plain DOM, no `html` template) where there's no per-render binding point.

Use `@servicenow/aiux-directive-tooltip` (the `tooltip()` directive) instead when a **single trigger** is bound declaratively inside a Lit template — `${tooltip({content: '...'})}` on one element. The directive is simpler for the common one-trigger-per-template case; reach for this controller only when you need the imperative multi-trigger API (`addTrigger`/`removeTrigger`) or are working outside a Lit render cycle.

## Installation

```bash
pnpm add @servicenow/aiux-controller-tooltip
```

## API

### `new TooltipController(hostOrOptions, options?)`

| Argument        | Type                                       | Description                                                                                         |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `hostOrOptions` | `ReactiveControllerHost \| TooltipOptions` | Pass a Lit host to register as a `ReactiveController`, or pass options directly for standalone use. |
| `options`       | `TooltipOptions`                           | Required when first arg is a Lit host; optional otherwise.                                          |

### `TooltipOptions`

| Property    | Type                                                  | Default     | Description                                                                                                                                                                                                                                                                                                                     |
| ----------- | ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`   | `string`                                              | `''`        | Tooltip text.                                                                                                                                                                                                                                                                                                                   |
| `positions` | `Array<string \| {target: string, content?: string}>` | `undefined` | Candidate positions evaluated in order by the fit engine. **Omit this in most cases** — the fit engine automatically selects the best side based on viewport constraints. Only set this when you have a specific layout requirement that the automatic behaviour cannot satisfy. See [Position syntax](#position-syntax) below. |
| `offset`    | `number`                                              | `8`         | Gap in px between trigger and tooltip.                                                                                                                                                                                                                                                                                          |
| `showDelay` | `number`                                              | `0`         | ms before tooltip opens.                                                                                                                                                                                                                                                                                                        |
| `hideDelay` | `number`                                              | `0`         | ms before tooltip closes.                                                                                                                                                                                                                                                                                                       |
| `root`      | `ShadowRoot \| Document`                              | `document`  | Root to append the tooltip element to. Use the host's `shadowRoot` to scope the tooltip inside shadow DOM.                                                                                                                                                                                                                      |

### Instance properties

All `TooltipOptions` fields are readable/writable as instance properties after construction. Updating `content` while the tooltip is visible immediately reflects the new text.

### Methods

| Method                       | Description                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addTrigger(el, overrides?)` | Register a trigger element. Attaches hover/focus listeners and a `MutationObserver`. Per-trigger `overrides` take precedence over controller-level options; element attributes take highest precedence. |
| `removeTrigger(el)`          | Unregister a trigger element and remove all listeners.                                                                                                                                                  |
| `show(triggerEl, delay?)`    | Programmatically show the tooltip anchored to `triggerEl`.                                                                                                                                              |
| `hide(delay?)`               | Programmatically hide the tooltip.                                                                                                                                                                      |
| `destroy()`                  | Remove all triggers, cancel pending timers, and disconnect the observer.                                                                                                                                |

### Element attributes (per-trigger overrides)

When set on a trigger element these take highest precedence over both per-trigger overrides and controller-level options.

| Attribute         | Description                    |
| ----------------- | ------------------------------ |
| `tooltip-content` | Tooltip text for this trigger. |
| `tooltip-offset`  | Offset in px for this trigger. |

---

## Usage

### Standalone (no Lit host)

```js
import {TooltipController} from '@servicenow/aiux-controller-tooltip';

const tooltip = new TooltipController({
  content: 'Save file',
  showDelay: 300
});

tooltip.addTrigger(document.querySelector('#save-btn'));
```

### Multiple triggers sharing one controller

```js
const tooltip = new TooltipController();

document.querySelectorAll('[data-has-tooltip]').forEach(el => {
  tooltip.addTrigger(el);
});
```

Each trigger can carry its own `tooltip-content` attribute:

```html
<button tooltip-content="Bold" data-has-tooltip>B</button>
<button tooltip-content="Italic" data-has-tooltip>I</button>
```

### Per-trigger overrides

```js
tooltip.addTrigger(primaryBtn, {content: 'Submit form'});
tooltip.addTrigger(cancelBtn, {content: 'Cancel', showDelay: 500});
```

### With a Lit host (`ReactiveController`)

```js
import {LitElement, html} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {TooltipController} from '@servicenow/aiux-controller-tooltip';

class MyToolbar extends LitElement {
  _btnRef = createRef();

  _tooltip = new TooltipController(this, {
    content: 'Save file',
    showDelay: 300,
    root: this.shadowRoot ?? document
  });

  firstUpdated() {
    if (this._btnRef.value) {
      this._tooltip.addTrigger(this._btnRef.value);
    }
  }

  render() {
    return html`<button ${ref(this._btnRef)}>Save</button>`;
  }
}

customElements.define('my-toolbar', MyToolbar);
```

### Scoping to shadow DOM

Pass the host's `shadowRoot` as `root` so the tooltip element lives inside the shadow tree and is not affected by document-level stacking contexts:

```js
const tooltip = new TooltipController(this, {
  content: 'Help',
  root: this.shadowRoot
});
```

### Programmatic show/hide

```js
tooltip.show(triggerEl); // show immediately
tooltip.show(triggerEl, 500); // show after 500 ms
tooltip.hide(); // hide immediately
tooltip.hide(200); // hide after 200 ms
```

### Dynamic content

```js
tooltip.content = 'Updated text'; // reflects immediately if tooltip is open
```

### Cleanup

```js
tooltip.removeTrigger(el); // remove one trigger
tooltip.destroy(); // tear down everything
```

---

## Position syntax

> **You almost never need to set `positions`.**  
> The fit engine tries all four sides and picks the one with the best viewport fit automatically. Only set this when your specific layout requires a fixed placement.

When you do need to override positioning, `positions` accepts an array of candidate positions tried in order. The fit engine selects the first that fits entirely within the viewport, or the best-fitting one if none fit completely.

Each entry may be one of:

| Form             | Example                                              | Description                                        |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Long-form string | `'bottom-center top-center'`                         | `<target-origin> <content-origin>`                 |
| Shorthand string | `'bottom-start'`                                     | Target origin only; content origin is auto-derived |
| Object (full)    | `{ target: 'bottom-center', content: 'top-center' }` | Explicit target and content origins                |
| Object (short)   | `{ target: 'bottom-start' }`                         | Target origin only; content origin is auto-derived |

Origins use the format `<side>-<alignment>`:

- **Side:** `top`, `bottom`, `center` (for left/right), `center` (for inline axis)
- **Alignment:** `start`, `center`, `end`

Common values: `top-center`, `bottom-center`, `center-start`, `center-end`, `top-start`, `bottom-end`, etc.

```js
// Force tooltip to always appear below (no fallback)
tooltip.addTrigger(el, {
  content: 'Save',
  positions: ['bottom-center top-center']
});

// Try below first, then above
tooltip.addTrigger(el, {
  content: 'Save',
  positions: [
    {target: 'bottom-center', content: 'top-center'},
    {target: 'top-center', content: 'bottom-center'}
  ]
});
```
