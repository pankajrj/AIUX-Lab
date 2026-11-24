# @servicenow/aiux-directive-lottie

## Import

```js
import {lottieAnimation} from '@servicenow/aiux-directive-lottie';
```


Lit element-position directive for rendering Lottie animations with slug-based asset resolution, lazy `lottie-web` loading, and imperative playback control.

> **Platform availability**: This package is available for off-glide experiences that depend on Karuna. On-glide distribution (AINPX / ServiceNow platform) is not yet supported — this is being explored as part of the broader `aiux-component-library` roadmap.

## Installation

```bash
pnpm add @servicenow/aiux-directive-lottie
```

`lit` is a peer dependency and must be installed separately.

## Exports

| Export                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `lottieAnimation`       | Element directive for multi-colour Lottie animations              |
| `LottieDirective`       | Directive class (for `ref` typing and subclassing)                |
| `animatedIcon`          | Themed wrapper that forces `currentColor` for single-colour icons |
| `AnimatedIconDirective` | Icon directive class                                              |
| `fetchAnimation`        | Pre-fetch or cache-prime an animation JSON by slug                |

## Usage

### Basic animation

```javascript
import {html} from 'lit';
import {lottieAnimation} from '@servicenow/aiux-directive-lottie';

render() {
  return html`
    <div class="w-20 h-20"
      ${lottieAnimation({animation: 'ai-sparkle', size: 'md', autoplay: true, loop: true})}
    ></div>
  `;
}
```

The directive resolves the slug to `/aiux/assets/core/animations/${slug}-${size}.json` (or `${slug}.json` when `size` is omitted).

### Themed icon (single-colour)

`animatedIcon` injects a scoped `<style>` inside the rendered SVG that overrides fills and strokes with `currentColor`, so the icon inherits the surrounding text colour:

```javascript
import {animatedIcon} from '@servicenow/aiux-directive-lottie';

render() {
  return html`
    <span class="text-primary w-6 h-6 inline-block"
      ${animatedIcon({animation: 'ai-sparkle', size: 'sm', autoplay: true})}
    ></span>
  `;
}
```

Use `animatedIcon` for single-colour icons. Use `lottieAnimation` for multi-colour illustrated animations where each element has its own colour.

### Imperative control

Pass a `ref` callback to receive the directive instance for `play()`, `pause()`, `reverse()`, and `loop()`:

```javascript
html`
  <div
    ${lottieAnimation({
      animation: 'confetti',
      autoplay: false,
      ref: inst => (this._lottie = inst)
    })}
  ></div>
`;
// later:
this._lottie.play();
this._lottie.reverse();
this._lottie.loop(true);
```

The `ref` is called after lottie's `DOMLoaded` event, and with `null` on disconnect.

## Options

| Property    | Type                                          | Default                       | Description                                                                                                        |
| ----------- | --------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `animation` | `string`                                      | required                      | Slug identifying the animation JSON asset                                                                          |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'xl'`                | — (`'md'` for `animatedIcon`) | Size variant. Appended to slug: `${slug}-${size}.json`                                                             |
| `autoplay`  | `boolean`                                     | `false`                       | Start playing immediately after load                                                                               |
| `loop`      | `boolean`                                     | `false`                       | Loop the animation continuously                                                                                    |
| `renderer`  | `'svg' \| 'canvas' \| 'html'`                 | `'svg'`                       | Lottie renderer type                                                                                               |
| `ref`       | `(instance: LottieDirective \| null) => void` | —                             | Directive instance with `play()`, `pause()`, `reverse()`, `loop()`. Called after `DOMLoaded`, `null` on disconnect |
| `aria`      | `{label?: string}`                            | —                             | If `label` is set, the SVG gets `role="img"` + `aria-label`. Otherwise `aria-hidden="true"` is applied             |

## Otto Loader

The Otto branded loader (`otto-loader`) ships as a single `md`-size asset. Omit `size` and the directive defaults to `'md'`, resolving `otto-loader-md.json` automatically.

```javascript
import {animatedIcon} from '@servicenow/aiux-directive-lottie';

render() {
  return html`
    <div class="w-16 h-16"
      ${animatedIcon({animation: 'otto-loader', autoplay: true, loop: true, aria: {label: 'Loading'}})}
    ></div>
  `;
}
```

**Sizing** — the SVG fills 100% of its container. If the container doesn't get dimensions from its layout context, set them explicitly (e.g. `w-8 h-8` for 32×32, `w-16 h-16` for 64×64).

**Theming** — the animation inherits `currentColor`, so set `color` on the host element:

```javascript
// Brand green
html`<div
  class="w-16 h-16 text-[#62D84E]"
  ${animatedIcon({
    animation: 'otto-loader',
    autoplay: true,
    loop: true,
    aria: {label: 'Loading'}
  })}
></div>`;

// Primary token
html`<div
  class="w-16 h-16 text-primary"
  ${animatedIcon({
    animation: 'otto-loader',
    autoplay: true,
    loop: true,
    aria: {label: 'Loading'}
  })}
></div>`;
```

## Accessibility

- When `aria.label` is provided, the SVG receives `role="img"` and `aria-label`.
- Without a label, the SVG is marked `aria-hidden="true"` (decorative).
- When the user has `prefers-reduced-motion: reduce` enabled, the animation freezes on the first frame instead of autoplaying (WCAG 2.3.3).

## Animation caching

`fetchAnimation` uses an in-memory cache. Concurrent requests for the same slug share a single fetch. Failed fetches (404, network error) cache `null` to prevent retry storms. A page reload clears the cache.

```javascript
import {fetchAnimation} from '@servicenow/aiux-directive-lottie';

// Pre-fetch an animation to warm the cache
await fetchAnimation('ai-sparkle', {size: 'md'});
```

## Error handling

| Scenario                 | Behaviour                                |
| ------------------------ | ---------------------------------------- |
| Missing animation        | Container stays empty, warning logged    |
| `lottie-web` fails       | Container stays empty, warning logged    |
| Network error            | Resolves `null`, caches to prevent retry |
| Element removed mid-load | Fetch aborted, no orphaned animations    |

## Storybook

```bash
cd components && pnpm storybook
# Navigate to Directives / Lottie Animation
```

Stories cover: interactive playground, autoplay variants, size resolution, imperative control, ARIA attributes, themed icon colouring, missing animation graceful degradation, and reduced-motion behaviour.

## Testing

```bash
cd directives/lottie && pnpm test
```
