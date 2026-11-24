# @servicenow/aiux-components-list

## Import

```js
import '@servicenow/aiux-components-list';
```


List package that provides `<aiux-list-connected>` for ServiceNow-backed table, gallery, and kanban views plus `<aiux-gallery-list>` for presentational card-grid rendering with pagination, filtering, sorting, and condition-builder integration.

## ⚠️ Important — sizing and scroll behavior

**Consumers are responsible for setting the height of the list.** Neither `aiux-list` nor `aiux-list-connected` imposes a height on its host — they expand to their container.

- If you give the list a **bounded height** (via flex chain, explicit `height`, or a `calc(100dvh - …)` anchor on an ancestor), overflow is handled **inside the list body** — the list body produces its own vertical scroll while headers, filter bar, and pagination footer stay visible.
- If you **do not** bound the list's height, the list grows to fit its content and the scroll will happen on the outer page (or an ancestor scroll container) instead of inside the list body.

Scroll behavior is a property of the container the consumer provides. Decide up front whether you want the page to scroll or the list body to scroll, and size the list's host accordingly. Common host patterns: `height: 100%` inside a bounded flex column, or `height: calc(100dvh - <top-offset>)` when the list is directly below fixed chrome.

## Components

### `AIUXRecordListPage`

Main connected list component (`<aiux-list-page>`) with context and data
management. It ships a **built-in `static async loader(ctx)`** that resolves URL
sysparms and the `:table` route param, fetches the list data, and publishes it
into `listContext` for SSR hydration — so a page usually only needs to register
the component and render the tag. Do not call a `fetch` method on it directly;
there is no such public API.

```javascript
import {AIUXRecordListPage} from '@servicenow/aiux-components-list';

// AIUXRecordListPage registers <aiux-list-page> and provides its own loader.
// Register it as the page component for a `/:table` route; the built-in loader
// runs automatically and hydrates the list.

render() {
  return html`<aiux-list-page table="incident"></aiux-list-page>`;
}
```

If you need to fetch rows yourself in a custom loader, use
`ListDataManager.fetch` and pass the result to `<aiux-list-connected>` via
`.data` (see [Fetching data with `ListDataManager.fetch`](#fetching-data-with-listdatamanagerfetch) below).

**Features:**

- Automatic data fetching via loader
- Context-based state management
- Sorting and filtering
- Pagination
- Column configuration
- Bulk actions

### `AIUXList`

Core list rendering component (lower-level, `<aiux-list>`). It accepts
`columnDefinitions` / `rowDefinitions` directly and fetches no data itself.
It has no row-click callback prop; cell interactions surface as events (e.g.
`aiux-list:cell-double-clicked`, `aiux-list:cell-edit-submitted`).

```javascript
import {AIUXList} from '@servicenow/aiux-components-list';

<aiux-list
  .columnDefinitions=${columns}
  .rowDefinitions=${rows}
></aiux-list>
```

### `AIUXPagination`

Pagination controls component.

```javascript
import '@servicenow/aiux-components-list';

<aiux-pagination
  .total=${1000}
  .selectedPage=${0}
  .selectedPageSize=${20}
  .pageSizes=${[10, 20, 50, 100]}
  @AIUX_PAGINATION#PAGE_CHANGED=${handlePageChange}
  @AIUX_PAGINATION#PAGE_SIZE_CHANGED=${handlePageSizeChange}
></aiux-pagination>
```

Pages are **0-based**. Both events carry `detail: {value: number}` — the new
page index for `PAGE_CHANGED`, the new page size for `PAGE_SIZE_CHANGED` (which
also resets to page 0).

**Key properties:** `total`, `selectedPage`, `selectedPageSize`, `pageSizes`,
plus `hideGoToFirst` / `hideGoToPrevious` / `hideGoToNext` / `hideGoToLast`,
`hidePageNumbers`, `hidePageSizeControl`, `hideRange`, and
`pageControlType` (`'buttons' | 'input'`).

**Features:**

- Page navigation (first, prev, next, last)
- Page size selection
- Total count display
- Keyboard navigation

### `AIUXRecordListHeader`

Record-list toolbar/header component. It is not the table column header row;
sorting and column resizing are handled by the list body. Use this lower-level
component only when you need to compose the list toolbar yourself.

```javascript
import '@servicenow/aiux-components-list';

<aiux-record-list-header
  heading="Incidents"
  .count=${totalCount}
  .actionNodes=${headerActions}
  .layoutOptionsConfig=${layoutOptionsConfig}
  .groupSortConfig=${groupSortConfig}
  show-refresh-button
></aiux-record-list-header>
```

**Features:**

- Heading and count display
- Header action nodes
- Layout and group-sort controls
- Optional refresh button

### `RecordListContext`

Scoped context API that exposes list state and operations to components consuming the record list.

**Import:**

```javascript
import {RecordListContext} from '@servicenow/aiux-components-list';
```

**Consuming the context:**

```javascript
import {RecordListContext} from '@servicenow/aiux-components-list';

@customElement('my-consumer')
class MyConsumer extends AIUXElement {
  static contextCollections = [RecordListContext];

  render() {
    // Access via getById with the list's context ID
    const context = RecordListContext.getById('list1');

    if (!context) {
      return html`<div>No list context available</div>`;
    }

    return html`
      <div>
        <h3>Current List State</h3>
        <p>Table: ${context.state.table}</p>
        <p>Total Records: ${context.state.rowDefinitions.length}</p>
        <p>Current Page: ${context.state.currentPage}</p>
        <p>Page Size: ${context.state.pageSize}</p>

        <button
          @click=${() => context.api.setPage(context.state.currentPage + 1)}
        >
          Next Page
        </button>
        <button @click=${() => context.api.reload()}>Reload Data</button>
        <aiux-list-connected id="list1" .table="incident"></aiux-list-connected>
      </div>
    `;
  }
}
```

**Context Value Interface:**

```typescript
interface RecordListContextValue {
  // State snapshot (read-only via getters)
  state: {
    table: string; // Table name
    view: string; // View name
    query: string; // User-applied query
    fixedQuery: string; // Fixed query (always applied)
    resolvedQuery: string; // Combined query (query + fixedQuery)
    sortColumns: Array<{column: string; direction: 'asc' | 'desc'}>; // Active sort entries (first = primary)
    groupBy: string; // Group by column
    columnDefinitions: ColumnDefinition[]; // Column configuration
    rowDefinitions: AnyRow[]; // Row data
    currentPage: number; // Current page (0-indexed)
    pageSize: number; // Items per page
    selectedRecords: string[]; // Selected record IDs
    loadingState: 'idle' | 'loading' | 'success' | 'error';
    errorMessage: string; // Error message if loadingState is 'error'
  };

  // API methods
  api: {
    reload: () => Promise<void>; // Reload list data
    setPage: (page: number) => void; // Navigate to page
    setPageSize: (size: number) => void; // Change page size
    setQuery: (query: string) => void; // Update query filter
    sort: (columnKey: string, direction?: 'asc' | 'desc') => void; // Sort by column
    groupBy: (columnKey: string) => void; // Group by column
  };
}
```

## Properties

### `<aiux-list-connected>`

`<aiux-list-connected>` (`AIUXListConnected`) is the connected entry point. Multi-word camelCase properties map to lowercased or explicitly-overridden HTML attributes (Lit lowercases attribute names; several use an explicit `attribute:` override shown below). Object/array properties have no attribute — bind them with `.prop=${...}`.

| Property                  | Attribute                   | Type                                  | Default | Description                                                                                      |
| ------------------------- | --------------------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `table`                   | `table`                     | `string`                              | `''`    | ServiceNow table name (required), e.g. `'incident'`.                                             |
| `view`                    | `view`                      | `string`                              | `''`    | View name. Empty string uses the default view.                                                   |
| `columns`                 | `columns`                   | `string`                              | `''`    | Comma-separated column keys, e.g. `'number,short_description'`. Overrides view-based resolution. |
| `preferenceKey`           | `preference-key`            | `string`                              | `''`    | Namespaces column preferences in `sys_user_preference`. Lowercase alphanumeric, 24–32 chars.     |
| `query`                   | `query`                     | `string`                              | `''`    | Encoded query string. **Reactive** — rebind to re-fetch. Combine clauses with `^`.               |
| `fixedQuery`              | `fixed-query`               | `string`                              | `''`    | Fixed query always AND-ed with `query`.                                                          |
| `groupSort`               | `groupsort`                 | `string`                              | `''`    | Group sort specification.                                                                        |
| `filterOptions`           | (property only)             | `ConditionBuilderFilterOptions`       | `{}`    | Condition-builder / simple-filter configuration (see Simple Filtering below).                    |
| `pageSize`                | `pagesize`                  | `number`                              | `20`    | Rows per page.                                                                                   |
| `enableHighlightedValues` | `enable-highlighted-values` | `boolean`                             | `true`  | Enable highlighted-value badges.                                                                 |
| `showLinks`               | `show-links`                | `boolean`                             | `true`  | When `false`, links/URLs/persons render as plain text.                                           |
| `customActions`           | (property only)             | `object`                              | `{}`    | Custom action handlers.                                                                          |
| `data`                    | (property only)             | `GqlListResponse \| null`             | `null`  | Pre-fetched SSR data from the loader.                                                            |
| `notifications`           | (property only)             | `NotificationsConfig`                 | —       | Controls session-notification display (see Notifications below).                                 |
| `listOptions`             | (property only)             | `ListOptions`                         | `{}`    | Toggles header features, list presentation, and capabilities.                                    |
| `popoverDefinition`       | (property only)             | `PopoverDefinition \| null`           | `null`  | External popover definition for managed cell-editing mode.                                       |
| `layoutConfig`            | (property only)             | `LayoutConfig`                        | —       | Per-layout configuration, e.g. `{gallery: {fields: {...}}}`.                                     |
| `layouts`                 | `layouts`                   | `LayoutType \| LayoutType[] \| 'all'` | —       | Which layouts are available. Multiple values show a layout toggle.                               |
| `parentTable`             | (property only)             | `string`                              | —       | Parent table (related-list mode).                                                                |
| `parentRecordSysId`       | (property only)             | `string`                              | —       | Parent record sys_id (related-list mode).                                                        |
| `relatedListName`         | `related-list-name`         | `string`                              | —       | Related-list name.                                                                               |

### `aiux-list-connected` usage

```html
<aiux-list-connected
  table="incident"
  .query=${this.listQuery}
  fixed-query="active=true"
  .layouts=${['list', 'gallery']}
  .data=${this.loaderData.data}
></aiux-list-connected>
```

## `aiux-gallery-list`

`AIUXGalleryListLit` — a presentational card-grid renderer. It accepts the same `columnDefinitions` / `rowDefinitions` as `aiux-list` and maps columns to card slots via `galleryConfig`. It fetches no data itself; feed it definitions directly (typically produced by `aiux-list-connected`'s gallery layout, or built by hand).

### `<aiux-gallery-list>`

All properties are objects/arrays or a string; bind objects/arrays with `.prop=${...}`.

| Property            | Attribute       | Type                 | Default | Description                                                               |
| ------------------- | --------------- | -------------------- | ------- | ------------------------------------------------------------------------- |
| `columnDefinitions` | (property only) | `ColumnDefinition[]` | `[]`    | Column definitions (same shape as `aiux-list`).                           |
| `rowDefinitions`    | (property only) | `AnyRow[]`           | `[]`    | Row data (standard rows or grouped rows).                                 |
| `galleryConfig`     | (property only) | `GalleryConfig`      | `{}`    | Card slot mappings and display options. Auto-built from columns if empty. |
| `listConfig`        | (property only) | `ListConfig`         | `{}`    | List-level config (locale, timeZone, wrapCellContent).                    |
| `groupConfig`       | (property only) | `GroupConfig`        | —       | Configuration for grouped display (e.g. `expandedGroups`).                |
| `actionConfig`      | (property only) | `ActionConfig`       | —       | Action definitions and row-action configuration.                          |
| `activeRowKey`      | `activerowkey`  | `string`             | —       | Key of the currently active/selected record (e.g. open in side panel).    |

### `aiux-gallery-list` usage

```js
html`
  <aiux-gallery-list
    .columnDefinitions=${this.columns}
    .rowDefinitions=${this.rows}
    .galleryConfig=${{options: {compact: true}}}
    @aiux-gallery-list:card-selected=${this.handleCardSelect}
  ></aiux-gallery-list>
`;
```

### `aiux-gallery-list` events

| Event                                      | Detail                                                     | Fired when                                             |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| `aiux-gallery-list:card-selected`          | `{row, columns, source: 'card'}`                           | A card body is clicked (outside interactive elements). |
| `aiux-gallery-list:card-deselected`        | —                                                          | Empty grid space is clicked (use to clear selection).  |
| `aiux-gallery-list:cell-link-clicked`      | `{row, columns, source: 'cell-link', columnKey, cellData}` | A heading link is clicked.                             |
| `aiux-gallery-list:group-toggle`           | `{groupKey}`                                               | A group chevron is clicked.                            |
| `aiux-gallery-list:context-action-clicked` | `{actionItem, context}`                                    | A card action button is clicked.                       |

All gallery events bubble and are `composed: true`.

## Usage

### Basic List

```html
<aiux-list-page></aiux-list-page>
```

### With Custom Columns

`<aiux-list-page>` has no `columns` property. To override view-based column
resolution, use `<aiux-list-connected>`'s `columns` attribute — a
**comma-separated string** of column keys, not an array of objects:

```html
<aiux-list-connected
  table="incident"
  columns="number,short_description,priority"
></aiux-list-connected>
```

### With Condition Builder

Filtering is configured through the `filterOptions` property (a
`ConditionBuilderFilterOptions`), not standalone boolean/callback props. Set
`mode: 'advanced'` for the full condition builder, or `mode: 'simple'` for the
simple-filter panel (see [Simple Filtering](#simple-filtering) below).

```javascript
import {AIUXRecordListPage} from '@servicenow/aiux-components-list';

<aiux-list-page
  table="incident"
  .query=${this.query}
  .filterOptions=${{mode: 'advanced'}}
></aiux-list-page>
```

### Simple Filtering

Filter list data using the `filterOptions` property with `mode: 'simple'`.

See [Supported filter documentation](https://code.devsnc.com/dev/now-predicate-builder?tab=readme-ov-file#%EF%B8%8F-enabling-basic-filters)

`showGroupBy` and `showSortBy` are **top-level** `ConditionBuilderFilterOptions`
fields (both default to `true`) — not nested inside `simpleFilter`. The list's
reactive query prop is `query`, not `encodedQuery`.

```javascript

<aiux-list-page
  table="incident"
  .query=${this.query}
  .filterOptions=${{
    mode: 'simple',
    showGroupBy: true, // optional (default true)
    showSortBy: true, // optional (default true)
    simpleFilter: {
      encodedQuery: 'state=^priority=',
      title: 'Custom Header title' // optional
    }
  }}
></aiux-list-page>
```

## Loader

`<aiux-list-page>` ships a **built-in `static async loader(ctx)`** — consumers
do not need to write one. It resolves the `:table` route param and the URL
sysparms (see [Query Parameters](#query-parameters)) via `resolveUrlParams`,
calls `ListDataManager.fetch(fetchParams)`, and publishes the result into
`listContext` for SSR hydration. It does not return a
`{table, columns, rows, totalCount}` object; the fetched `GqlListResponse`
travels through the context.

If you need to fetch rows in your own loader (e.g. to feed
`<aiux-list-connected>` directly), call `ListDataManager.fetch` — see
[Fetching data with `ListDataManager.fetch`](#fetching-data-with-listdatamanagerfetch)
below.

## Fetching data with `ListDataManager.fetch`

When you write your own page loader (instead of the default loader above), fetch
rows with `ListDataManager.fetch` and pass the result to `<aiux-list-connected>`
via `.data`:

```js
import {ListDataManager} from '@servicenow/aiux-components-list';

static async loader(ctx) {
  const data = await ListDataManager
    .fetch({table: 'incident', query: ctx.query?.sysparm_query || 'active=true'})
    .catch(() => null);
  return {data};
}
```

**Params** (`ListFetchParams`, a subset of `DataLoadParams`):

| Param     | Type     | Notes                                                        |
| --------- | -------- | ------------------------------------------------------------ |
| `table`   | `string` | Required. ServiceNow table, e.g. `'incident'`.               |
| `query`   | `string` | Encoded query, e.g. `'active=true^state=2'`. Default: all.   |
| `columns` | `string` | Comma-separated column keys, e.g. `'state,priority'`.        |
| `view`    | `string` | View name; `''` for the default view.                        |
| `limit`   | `number` | Max rows (backend default is 20 — raise it for aggregation). |
| `offset`  | `number` | Row offset for paging.                                       |

### Response shape (reading rows yourself)

`fetch` resolves to a `GqlListResponse | null`. Rows live deep in the response,
and each cell's real value/label are **nested** — this is the #1 gotcha:

```js
const rows =
  res?.data?.GlideNowListLayoutComposite_Query?.getNowListLayoutComposite
    ?.nowListLayout?.rowDefinitions?.rows ?? [];

for (const row of rows) {
  // row.cells is an ARRAY of {name, value}; `value` is itself a ListCell.
  const cell = row.cells.find(c => c.name === 'state')?.value;
  if (!cell) continue;
  const raw = cell.metadata?.internalValue ?? cell.value; // DB value — for queries
  const label = cell.label ?? cell.value; // display — for the UI
}
```

> ⚠️ The raw value is `cell.value.metadata.internalValue` and the display label is
> `cell.value.label` — **not** `cell.value`, which is the whole nested `ListCell`
> object (`String(cell.value)` yields `"[object Object]"`). For choice fields
> (state, priority) queries must use the raw integer (`state=2`), never the label.

This is how you build chart buckets from list data — see the
[visualizations README](../visualizations/README.md) for turning these rows into
a `DataResponse` and wiring chart clicks back to a filtered list.

## Filtering from external state

`<aiux-list-connected>`'s `query` is a **reactive** property — rebind `.query`
and the list re-fetches. Combine clauses with `^` (encoded-query AND) to filter
from a chart selection or other page state:

```js
@state() _stateFilter = null;

get _listQuery() {
  const parts = [this.loaderData?.baseQuery || 'active=true'];
  if (this._stateFilter) parts.push(`state=${this._stateFilter}`);
  return parts.join('^');
}

// render(): <aiux-list-connected table="incident" .query=${this._listQuery}></aiux-list-connected>
```

## Route Parameters

- `:table` - Table name to display

## Query Parameters

The built-in loader reads these URL `sysparm_*` parameters (resolved by
`resolveUrlParams`):

- `sysparm_query` — encoded query string (user-applied filter)
- `sysparm_view` — view name (empty uses the default view)
- `sysparm_fixed_query` — fixed query always AND-ed with `sysparm_query`
- `sysparm_group_sort` — group sort specification (e.g. `COUNT`, `COUNTDESC`)
- `sysparm_filter_pinned` — `true` auto-opens the filter/condition builder on load
- `sysparm_show_stream` — `true` auto-opens the activity panel on load
- `sysparm_tiny` — tiny-URL id; resolved via `/api/now/tinyurl/{id}` to the
  full parameter map above

`sysparm_use_tiny` / `sysparm_tiny_guid` may appear inside a resolved tiny-URL
map but are ignored.

## `aiux-list-connected` Events

All public events bubble and are `composed: true`. Common consumer-facing events include the detailed sections below plus:

| Event                                    | Detail                     | Fired when                                        |
| ---------------------------------------- | -------------------------- | ------------------------------------------------- |
| `aiux-list-connected:filter-change`      | `{columnFilters}`          | Column filter state changes.                      |
| `aiux-list-connected:query-updated`      | `{query}`                  | The resolved query changes.                       |
| `aiux-list-connected:group-sort-updated` | `{groupSort}`              | Group-sort selection changes.                     |
| `aiux-list-connected:data-load-start`    | `{table}`                  | A client-side data load starts.                   |
| `aiux-list-connected:data-load-complete` | `{table, data}`            | A client-side data load completes.                |
| `aiux-list-connected:data-load-error`    | `{table, error}`           | A client-side data load fails.                    |
| `aiux-list-connected:cell-edit-saved`    | `{rowKey, columnKey, ...}` | A managed cell edit is written and row refreshed. |

### `aiux-list-connected:selection-changed`

Fired when the set of selected rows changes. Uses an explicit-set pattern: when `selectAll` is `false`, `items` holds the selected row keys; when `selectAll` is `true`, `items` holds the exceptions (deselected rows).

```javascript
detail: {
  items: string[],      // selected row keys, or exceptions when selectAll is true
  selectAll: boolean    // whether "select all" is active
}
```

### `aiux-list-connected:reference-link-clicked`

Fired when a reference/link cell (or reference popover) is activated.

```javascript
detail: {
  referenceTable: string,   // Target record's table
  referenceSysId: string,   // Target record's sys_id
  isPrimaryClick: boolean,  // false for modifier/middle-click
  metadata: Object          // Full source cell-click detail
}
```

### `aiux-list-connected:save-column-width`

Fired when a column width is persisted after a resize.

```javascript
detail: {
  columnKey: string,   // the resized column's key
  width: number,       // final width in pixels
  startWidth: number,  // width before the resize started
  deltaWidth: number   // width change (finalWidth - startWidth)
}
```

### `aiux-list-connected:notification`

Fired after every data load and after an inline-edit write when the GQL
response carries one or more ServiceNow notifications. Empty notification sets
do not dispatch.

```javascript
detail: {
  notifications: Array<{
    // Common values in practice: 'info' | 'warning' | 'error' | 'success'.
    // 'low' | 'moderate' | 'high' are also accepted by PageAlertService and
    // are included for forward compatibility with the ServiceNow
    // notification union.
    type: 'info' | 'warning' | 'error' | 'success' | 'low' | 'moderate' | 'high';
    text: string;
  }>;
}
```

## Notifications

`<aiux-list-connected>` surfaces ServiceNow notifications returned by the list
GQL backend from two sources:

- **Session notifications** — read from
  `data.GlideLayoutDomain_Query.session.notifications` on every list data load.
  On the SSR/hydration path they travel inside the loader `data` payload
  (attached by the data layer), so `<aiux-list-page>` does not thread them
  separately — it has no `notifications` API of its own.
- **Inline-edit notifications** — `infoMessages` / `trivialMessages` returned
  by an inline-edit write are surfaced through the same sink. `errorMessages`
  are also shown in the inline-edit popover banner.

Both sources are transformed to the same `{type, text}` schema and handled
centrally by `ListController` before the public event fires.

By default, notifications are dispatched to `PageAlertService` with a stable
dedup id, so toasts collapse instead of stacking. The behavior is configurable
through the `notifications` property on `<aiux-list-connected>`, mirroring the
shape used by `<aiux-record-provider>`:

| `notifications` value | Display behavior                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `undefined` (default) | Notifications are forwarded to `PageAlertService.add(type, text, {id})` with a stable dedup id per item. |
| `null`                | Display is suppressed. The `aiux-list-connected:notification` event still fires.                         |
| `{onAdd}`             | `onAdd(type, text)` is called for each notification. `PageAlertService` is not invoked.                  |

Regardless of the display mode, the `aiux-list-connected:notification` event
always fires for non-empty notification sets, so external listeners can observe
notifications even when the default display is suppressed.

## Customization

### Row and cell rendering

`AIUXRecordListPage` delegates rendering to `<aiux-list-connected>` and does not call a `renderRow()` override. Prefer the documented configuration surfaces (`columns`, `layoutConfig`, `listOptions`, `customActions`, and gallery/list configuration) instead of subclassing the page to override row markup.

### Custom Actions

Custom actions are supplied via the `customActions` property on
`<aiux-list-connected>` (a `CustomActionConfiguration` with optional
`headerActions` and `listActions`). `<aiux-list-page>` has no `actions` prop.

```javascript
<aiux-list-connected
  table="incident"
  .customActions=${{
    headerActions: [
      /* ListActionsBar.Item entries */
    ],
    listActions: {
      /* per-row ActionConfig */
    }
  }}
></aiux-list-connected>
```

## Dependencies

- **@servicenow/aiux-components-core** - Base classes and utilities
- **@servicenow/aiux-components-condition-builder** - Filter builder
- **@servicenow/aiux-directive-icon** - Icons
- **date-fns** (4.1.0) - Date formatting
- **date-fns-tz** (3.2.0) - Timezone support

## Features

### Filtering

- Condition builder integration
- Encoded query support
- Filter persistence in URL

### Sorting

- Multi-column sorting
- Sort direction indicators
- Keyboard shortcuts

### Pagination

- Configurable page sizes
- Page navigation
- Total count display
- Infinite scroll (`listOptions.infiniteScroll` on `<aiux-list-connected>`) as an alternative to the pagination footer — see [LIST-OPTIONS.md](docs/LIST-OPTIONS.md#infinite-scroll)

### Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

### Performance

- Server-backed pagination via `<aiux-list-connected>` limits the number of rows fetched per page
- Presentational `<aiux-list>` supports windowed (virtualized) rendering of body rows via the `enableVirtualScroll` property — only rows in the visible viewport (plus overscan) are mounted to the DOM. See [PRESENTATION_LIST_API.md](docs/PRESENTATION_LIST_API.md#virtual-scroll--infinite-scroll)
- Optimized re-renders through Lit keyed `repeat(...)` usage

## File Structure

```
list/
├── src/
│   ├── components/
│   │   ├── list-layouts/
│   │   │   └── list/
│   │   │       └── aiux-list.ts
│   │   ├── pagination/
│   │   │   └── aiux-pagination.ts
│   │   ├── header/
│   │   │   └── aiux-record-list-header.ts
│   │   └── list-connected/
│   │       ├── aiux-list-page.ts
│   │       └── aiux-list-connected.ts
│   ├── types/
│   ├── utils/
│   └── index.ts
├── package.json
└── README.md
```

## Testing

```bash
# Run tests
pnpm test

# Run with UI
pnpm test:ui

# Run E2E tests
pnpm test:e2e
```
