# @servicenow/aiux-components-pagination

## Import

```js
import '@servicenow/aiux-components-pagination';
```


Accessible pagination navigation with page buttons, ellipsis truncation, optional prev/next and first/last controls, arrow-key navigation, and a dots display mode.

## Installation

```bash
pnpm add @servicenow/aiux-components-pagination
```

## Usage

```javascript
import '@servicenow/aiux-components-pagination';
```

```js
html`
  <aiux-pagination-nav
    current-page="1"
    total-pages="10"
    @pagination-page-change=${e => {
      this.currentPage = e.detail.page;
    }}
  ></aiux-pagination-nav>
`;
```

## Properties

| Property        | Attribute         | Type       | Default | Description                                              |
| --------------- | ----------------- | ---------- | ------- | -------------------------------------------------------- |
| `currentPage`   | `current-page`    | `Number`   | `1`     | Current page number (1-based)                            |
| `totalPages`    | `total-pages`     | `Number`   | `1`     | Total number of pages                                    |
| `maxButtons`    | `max-buttons`     | `Number`   | `7`     | Number of page buttons to show (not including prev/next) |
| `showPrevNext`  | `show-prev-next`  | `Boolean`  | `true`  | Show previous/next buttons                               |
| `showFirstLast` | `show-first-last` | `Boolean`  | `false` | Show first/last buttons                                  |
| `size`          | `size`            | `String`   | `'md'`  | Button size: `xs`, `sm`, `md`, `lg`, `xl`                |
| `dots`          | `dots`            | `Boolean`  | `false` | Render dots instead of page numbers                      |
| `onchange`      | —                 | `Function` | `null`  | Callback when page changes                               |

## Events

| Event                    | Detail                               | Description                        |
| ------------------------ | ------------------------------------ | ---------------------------------- |
| `pagination-page-change` | `{ page, previousPage, totalPages }` | Fired when the active page changes |

The event bubbles and is `composed` (crosses shadow DOM). The optional `onchange`
callback is invoked with a single `{ detail }` argument wrapping the same payload.

## Methods

| Method           | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `goToPage(page)` | Navigate to `page` (1-based). No-op if out of range or already active |
| `nextPage()`     | Navigate to the next page (no-op on the last page)                    |
| `previousPage()` | Navigate to the previous page (no-op on the first page)               |
| `firstPage()`    | Navigate to page 1                                                    |
| `lastPage()`     | Navigate to the last page (`totalPages`)                              |

All methods dispatch `pagination-page-change` when they change the active page.
