---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-components-loader'
---

# @servicenow/aiux-components-loader

## Import

```js
import '@servicenow/aiux-components-loader';
```


SSR-safe loading indicator for AIUX applications with a CSS radial-dot animation by default, optional Lottie animation, size variants, label text, and a ServiceNow footer option.

By default it renders a lightweight CSS radial-dot animation (no JavaScript animation library required). When an `animationConfig` is supplied it lazy-loads [`lottie-web`](https://github.com/airbnb/lottie-web) and renders a Lottie animation instead. An optional "Works with ServiceNow" footer can be shown beneath the animation.

## When to use

`<aiux-loader>` is a spinner-style indeterminate indicator, not a skeleton. Per the `avoid_daisyui_loading` design guidance, prefer content-shaped `aiux-skeleton` placeholders for loading states where the eventual layout is known — they communicate what will appear and reduce perceived wait time. Reach for `<aiux-loader>` when a skeleton does not fit:

- Initial app/route boot or full-screen "setting things up" states, where no content shape is known yet.
- Indeterminate background work (e.g. a Lottie brand animation) with no predictable completion layout.
- A small inline spinner during a button action (use a small `size`) — the explicit exception in the guidance.

Do **not** use it as a generic replacement for skeletons on list/card/table content areas.

## Installation

```bash
pnpm add @servicenow/aiux-components-loader
```

## Usage

```js
import '@servicenow/aiux-components-loader';
```

```html
<!-- Default radial-dot loader -->
<aiux-loader size="md"></aiux-loader>

<!-- With a label -->
<aiux-loader size="lg" label="Fetching your data"></aiux-loader>

<!-- With the ServiceNow footer -->
<aiux-loader label="Setting things up" show-footer></aiux-loader>

<!-- Lottie animation (config set as a property, not an attribute) -->
<aiux-loader id="anim" size="xl"></aiux-loader>
<script type="module">
  document.getElementById('anim').animationConfig = {
    path: '/aiux/assets/core/animations/spinner.json'
  };
</script>
```

## API

### Properties / Attributes

| Property          | Attribute     | Type             | Default | Description                                                                                                                                                                                                                                                |
| ----------------- | ------------- | ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`            | `size`        | `String`         | `'md'`  | Size variant: `4xs`, `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`. In the CSS radial-dot loader (no `animationConfig`), `xs`/`sm` render at the same footprint as `4xs`/`3xs` since the 7-dot ring has no room to grow smaller without dots overlapping; the Lottie container continues to scale independently at every size. |
| `label`           | `label`       | `String \| null` | `null`  | Optional text label shown below the animation. Also used as the `aria-label`. As a special case, the exact value `'Loading...'` is styled smaller (`text-sm font-normal`); any other label renders at `text-lg`.                                           |
| `showFooter`      | `show-footer` | `Boolean`        | `false` | When set, renders the "Works with ServiceNow" footer.                                                                                                                                                                                                      |
| `animationConfig` | —             | `Object \| null` | `null`  | Property-only. A [lottie-web](https://github.com/airbnb/lottie-web) config (e.g. `path`, `animationData`). When set, a Lottie animation replaces the CSS radial loader. `renderer`/`loop`/`autoplay` default to `svg`/`true`/`true` and can be overridden. |

### CSS parts

| Part    | Description            |
| ------- | ---------------------- |
| `label` | The text label element |

### Accessibility

- The animation container is `aria-hidden`; the wrapper exposes `role="status"`, `aria-busy="true"`, and `aria-live="polite"`.
- The `aria-label` defaults to a localized "Loading" string, or the provided `label`.
- The radial-dot animation freezes for users with `prefers-reduced-motion: reduce`.

### Theming

The radial dots fill with the `--color-loader-custom` token (defined in `@servicenow/aiux-components-core` theme variables, defaulting to `--color-text-primary`). Override it on an ancestor to recolor the loader.

## Related components

- `aiux-skeleton` (utility class from `@servicenow/aiux-components-core`) — preferred over `<aiux-loader>` for content-shaped loading placeholders. See "When to use" above.
- `<aiux-empty-state-content>` — for the terminal "no results / nothing to show" state after loading completes.

## Testing

```bash
pnpm --filter @servicenow/aiux-components-loader test
```
