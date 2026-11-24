# @servicenow/aiux-directive-tooltip

## Import

```js
import {tooltip} from '@servicenow/aiux-directive-tooltip';
```


A Lit element directive that attaches tooltip show/hide behaviour directly to a trigger element. It creates a single shared `<div role="tooltip">` per root and positions it relative to the trigger.

## Installation

```bash
pnpm add @servicenow/aiux-directive-tooltip
```

## Usage

```js
import {html, render} from 'lit';
import {tooltip} from '@servicenow/aiux-directive-tooltip';

// Inside a Lit template (LitElement or standalone render)
render(
  html`<button ${tooltip({content: 'Save file'})}>Save</button>`,
  document.body
);
```

The directive must be applied as an **element binding** using `${}` syntax — not as an attribute or property binding.

## Options

| Option      | Type                                                  | Default     | Description                                                                                                                                                                                                                                                                         |
| ----------- | ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`   | `string`                                              | `''`        | Tooltip text                                                                                                                                                                                                                                                                        |
| `positions` | `Array<string \| {target: string, content?: string}>` | `undefined` | Candidate positions evaluated in order by the fit engine. **Omit this in most cases** — the fit engine automatically selects the best side based on viewport constraints. Only set this when you have a specific layout requirement. See [Position syntax](#position-syntax) below. |
| `offset`    | `number`                                              | `8`         | Gap in px between trigger and tooltip                                                                                                                                                                                                                                               |
| `showDelay` | `number`                                              | `0`         | ms before tooltip opens                                                                                                                                                                                                                                                             |
| `hideDelay` | `number`                                              | `0`         | ms before tooltip closes                                                                                                                                                                                                                                                            |
| `root`      | `ShadowRoot \| Document`                              | `document`  | Root to append the tooltip element to                                                                                                                                                                                                                                               |
| `ref`       | `(instance: TooltipDirective \| null) => void`        | —           | Called with the directive instance once attached, and with `null` when detached                                                                                                                                                                                                     |

## Reactive updates

Because the directive participates in Lit's render cycle, options are updated on every re-render. The tooltip repositions and updates its content automatically when options change while it is visible:

```js
// Changing content re-renders the open tooltip immediately
render(
  html`<button ${tooltip({content: currentContent})}>Hover</button>`,
  container
);
```

## Programmatic control

The directive instance exposes `show()` and `hide()` methods. Use the `ref` callback to get a clean reference without accessing Lit internals:

```js
let instance = null;

render(
  html`<button
    ${tooltip({
      content: 'Hi',
      ref: dir => {
        instance = dir;
      }
    })}
  >
    Target
  </button>`,
  container
);

instance.show(0); // show immediately
instance.hide(500); // hide after 500 ms
```

The `ref` callback is called once when the directive first attaches to an element, and again with `null` when it detaches. It is **not** called on subsequent re-renders where the element is unchanged.

## ARIA

- The tooltip element has `role="tooltip"`.
- The trigger element receives `aria-describedby` pointing to the tooltip element's id while the tooltip is visible.

## Peer dependencies

```json
{
  "lit": "^3.0.0"
}
```

## Demo

```bash
pnpm --filter @servicenow/aiux-directive-tooltip dev
```

## Tests

```bash
pnpm --filter @servicenow/aiux-directive-tooltip test
pnpm --filter @servicenow/aiux-directive-tooltip test --coverage
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

- **Side:** `top`, `bottom`, `center` (for left/right)
- **Alignment:** `start`, `center`, `end`

Common values: `top-center`, `bottom-center`, `center-start`, `center-end`, `top-start`, `bottom-end`, etc.

```js
// Try below first, then above
render(
  html`<button
    ${tooltip({
      content: 'Save',
      positions: [
        {target: 'bottom-center', content: 'top-center'},
        {target: 'top-center', content: 'bottom-center'}
      ]
    })}
  >
    Save
  </button>`,
  container
);
```
