# @servicenow/aiux-directive-lazy-image

## Import

```js
import {lazyImage} from '@servicenow/aiux-directive-lazy-image';
```


Lit directive for rendering images with performance best practices: native lazy loading, async decoding, and required dimensions to prevent Cumulative Layout Shift (CLS).

## Installation

```bash
pnpm add @servicenow/aiux-directive-lazy-image
```

## Usage

```js
import {lazyImage} from '@servicenow/aiux-directive-lazy-image';
import {html} from 'lit';

// Platform image — relative paths are prefixed with /core/images/
html`${lazyImage({
  src: 'empty-state.png',
  alt: 'No results found',
  width: 320,
  height: 240
})}`;

// App-specific image — absolute paths are passed through
html`${lazyImage({
  src: '/aict/public/illustration.png',
  alt: 'Welcome to AICT',
  width: 640,
  height: 480
})}`;

// Above-fold image — eager loading with high fetch priority
html`${lazyImage({
  src: 'hero-banner.png',
  alt: 'Dashboard overview',
  width: 1280,
  height: 400,
  eager: true
})}`;
```

## Options

| Option   | Type    | Required | Default | Description                                                   |
| -------- | ------- | -------- | ------- | ------------------------------------------------------------- |
| `src`    | string  | yes      | —       | Image path. Relative paths prefixed with `/core/images/`.     |
| `alt`    | string  | yes      | —       | Alt text for accessibility.                                   |
| `width`  | number  | yes      | —       | Intrinsic width in px. Prevents layout shift.                 |
| `height` | number  | yes      | —       | Intrinsic height in px. Prevents layout shift.                |
| `eager`  | boolean | no       | `false` | Skip lazy loading, add `fetchpriority="high"` for above-fold. |
| `class`  | string  | no       | —       | CSS classes to apply to the `<img>` element.                  |

## Rendered output

**Default (lazy):**

```html
<img
  src="/core/images/empty-state.png"
  alt="No results found"
  width="320"
  height="240"
  loading="lazy"
  decoding="async"
/>
```

**Eager (above-fold):**

```html
<img
  src="/core/images/hero-banner.png"
  alt="Dashboard overview"
  width="1280"
  height="400"
  fetchpriority="high"
  decoding="async"
/>
```

## SSR compatibility

Fully SSR-safe. The directive outputs only static HTML attributes — no browser APIs are used in `render()`.

## Testing

```bash
pnpm test
```
