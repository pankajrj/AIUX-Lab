# Composition Component

## Import

```js
import '@servicenow/aiux-components-visualizations-composition';
```


## Overview

Composition visualization for pie, donut, and semi-donut charts that render proportional segments from a DataResponse with one dimension for slice labels and one metric for slice values.

`Composition` inherits `data` and `renderingOverrides` from the `DataDriven` mixin, which also handles the merge rendering layer (Layer 1), chart lifecycle, and error state rendering. See the base package documentation for details on those shared concerns.

## Properties

| JS property             | HTML attribute            | Type                             | Default     |
| ----------------------- | ------------------------- | -------------------------------- | ----------- |
| `type`                  | `type`                    | `CompositionType`                | `'pie'`     |
| `legend`                | — (property only)         | `LegendDefinition`               | `undefined` |
| `dataLabels`            | — (property only)         | `DataLabelsConfig`               | `undefined` |
| `sort`                  | `sort`                    | `SortOrder`                      | `'none'`    |
| `animated`              | `animated`                | `Boolean`                        | `false`     |
| `tooltip`               | — (property only)         | `TooltipDefinition`              | `undefined` |
| `tooltipShowPercentage` | `tooltip-show-percentage` | `Boolean`                        | `true`      |
| `centerContent`         | `centercontent`           | `CompositionCenterContentConfig` | `undefined` |

`legend`, `dataLabels`, and `tooltip` are declared `attribute: false` — set them only as JS properties (`.legend=${...}`). `centerContent` is an object; bind it with `.centerContent=${...}`.

> **Inherited from DataDriven mixin:** `data`, `renderingOverrides`, `interactions` — see the base package `README.MD` for full documentation of these properties. `interactions` (`InteractionConfig`, JS property only — bind with `.interactions`) drives render-affecting interaction state; when `interactions.selectedPoints` is non-empty, `allowPointSelect` is enabled and matching slices render in a selected state.

### `type`

The chart variant. Determines the visual shape.

| Value        | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `pie`        | Standard pie chart — full circle, no inner hole              |
| `donut`      | Full-circle ring with a fixed inner hole (80% inner size)    |
| `semi-donut` | Half-circle ring (180°, from -90° to 90°) with an inner hole |

Default: `'pie'`

### `legend`

An object matching the `LegendDefinitionSchema` (from `@servicenow/aiux-components-visualizations-base`). Controls legend visibility, position, and optional title.

```typescript
{
  visible?: boolean,    // Whether to show the legend (default: true)
  position?: 'bottom' | 'right' | 'left' | 'top',  // Legend placement (default: 'bottom')
  title?: string        // Optional title displayed above the legend items
}
```

Example — hide the legend: `.legend=${{visible: false}}`
Example — legend on the right with title: `.legend=${{position: 'right', title: 'Browser'}}`

### `dataLabels`

Controls the data labels rendered outside each slice. Labels always appear outside the pie (Highcharts auto-shrinks the chart to fit them). When `dataLabels` is `undefined` or all flags are falsy, labels are hidden.

```typescript
interface DataLabelsConfig {
  showLabels?: boolean; // Show the slice name ({point.name})
  showValues?: boolean; // Show the raw metric value ({point.y})
  showPercentage?: boolean; // Show the percentage ({point.percentage:.0f}%)
}
```

Each flag is independent — any combination is valid. The final format string is composed as follows:

| `showLabels` | `showValues` | `showPercentage` | Format                                              |
| ------------ | ------------ | ---------------- | --------------------------------------------------- |
| ✓            |              |                  | `{point.name}`                                      |
| ✓            | ✓            |                  | `{point.name}: {point.y}`                           |
| ✓            |              | ✓                | `{point.name}: {point.percentage:.0f}%`             |
| ✓            | ✓            | ✓                | `{point.name}: {point.y} ({point.percentage:.0f}%)` |
|              | ✓            |                  | `{point.y}`                                         |
|              |              | ✓                | `{point.percentage:.0f}%`                           |
|              | ✓            | ✓                | `{point.y} ({point.percentage:.0f}%)`               |

Example — show name and percentage: `.dataLabels=${{showLabels: true, showPercentage: true}}`
Example — show all three: `.dataLabels=${{showLabels: true, showValues: true, showPercentage: true}}`

Default: `undefined` (no labels)

### `sort`

Sort order for slices.

Accepted values: `'descending'`, `'ascending'`, `'none'`

Default: `'none'`

### `animated`

Enable entry animation (800ms easeOutBounce).

Default: `false`

### `centerContent`

Controls the content displayed in the center hole of `donut` and `semi-donut` charts. Ignored for `pie`.

Uses `CenterContentConfig` from `@servicenow/aiux-components-visualizations-base` — a discriminated union on `mode`:

| Mode       | Behaviour                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `'custom'` | Shows static `label` and/or `value` strings                                                             |
| `'data'`   | Automatically shows the sum of all slice values as the center value, with the metric column label below |
| `'hidden'` | Hides any previously rendered center content                                                            |

`'rules'` mode is **not supported** on composition charts (no threshold rules context).

```typescript
// Show custom text
.centerContent=${{ mode: 'custom', value: '64', label: 'Total issues' }}

// Show total from data
.centerContent=${{ mode: 'data' }}

// Hide center content
.centerContent=${{ mode: 'hidden' }}
```

Additional options available on `custom` and `data` modes:

| Option     | Type                             | Default    | Description                                    |
| ---------- | -------------------------------- | ---------- | ---------------------------------------------- |
| `size`     | `'small' \| 'medium' \| 'large'` | `'medium'` | Font-size tier — maps to CSS custom properties |
| `inverted` | `boolean`                        | `false`    | Render value above label                       |

**Donut** uses `--datavis-composition-donut-center-*` CSS variables (full ring).
**Semi-donut** uses `--datavis-composition-semi-donut-center-*` CSS variables (half ring).

### `tooltip`

An object matching the `TooltipDefinitionSchema` (from `@servicenow/aiux-components-visualizations-base`). Controls tooltip behavior.

```typescript
{
  enabled?: boolean;      // Whether to show the tooltip (default: true)
  followCursor?: boolean; // Whether tooltip follows cursor (default: false)
  outside?: boolean;      // Render tooltip outside chart container (default: false)
  footer?: {              // Optional footer below tooltip content
    label: string;        // Footer text (non-interactive)
    icon?: string;        // Optional icon identifier
  };
}
```

### `tooltip-show-percentage`

| Attribute                 | Type    | Default | Description                |
| ------------------------- | ------- | ------- | -------------------------- |
| `tooltip-show-percentage` | Boolean | `true`  | Show percentage in tooltip |

This remains a standalone attribute because it is specific to composition charts (not shared across chart types).

## Theming

All visual styles are resolved from CSS custom properties at render time, falling back to built-in defaults.

### Slice and chart colors

| CSS Custom Property                     | Default                         | Description             |
| --------------------------------------- | ------------------------------- | ----------------------- |
| `--datavis-qualitative-0` through `-31` | NOW Datavis palette (32 colors) | Per-index slice colors  |
| `--datavis-tooltip-bg`                  | `#FFFFFF`                       | Tooltip background      |
| `--datavis-tooltip-header-color`        | `#2C323F`                       | Tooltip label text      |
| `--datavis-tooltip-body-color`          | `#454D5B`                       | Tooltip value text      |
| `--datavis-label-outside-color`         | `#454D5B`                       | Data label text         |
| `--datavis-label-inside-color`          | `#FFFFFF`                       | Inside label text       |
| `--datavis-segment-border-color`        | `#FFFFFF`                       | Border between segments |
| `--datavis-composition-corner-radius`   | `0px`                           | Segment corner rounding |

### Legend

| CSS Custom Property                  | Default    | Description              |
| ------------------------------------ | ---------- | ------------------------ |
| `--datavis-legend-color`             | `#2C323F`  | Legend item text color   |
| `--datavis-legend-font-size`         | `0.75rem`  | Legend item font size    |
| `--datavis-legend-title-color`       | `#525252`  | Legend title text color  |
| `--datavis-legend-title-font-size`   | `0.875rem` | Legend title font size   |
| `--datavis-legend-title-font-weight` | `600`      | Legend title font weight |

### Center content — donut (full ring)

| CSS Custom Property                                         | Default    | Description                   |
| ----------------------------------------------------------- | ---------- | ----------------------------- |
| `--datavis-composition-donut-label-color`                   | `#454D5B`  | Center label text color       |
| `--datavis-composition-donut-value-color`                   | `#2C323F`  | Center value text color       |
| `--datavis-composition-donut-center-value-large-font-size`  | `3rem`     | Value font size (large tier)  |
| `--datavis-composition-donut-center-label-large-font-size`  | `1rem`     | Label font size (large tier)  |
| `--datavis-composition-donut-center-value-medium-font-size` | `2.25rem`  | Value font size (medium tier) |
| `--datavis-composition-donut-center-label-medium-font-size` | `0.875rem` | Label font size (medium tier) |
| `--datavis-composition-donut-center-value-small-font-size`  | `1.875rem` | Value font size (small tier)  |
| `--datavis-composition-donut-center-label-small-font-size`  | `0.75rem`  | Label font size (small tier)  |
| `--datavis-composition-donut-center-spacing`                | `0.25rem`  | Gap between label and value   |
| `--datavis-composition-donut-center-label-font-weight`      | `400`      | Label font weight             |
| `--datavis-composition-donut-center-value-font-weight`      | `400`      | Value font weight             |

### Center content — semi-donut (half ring)

| CSS Custom Property                                              | Default    | Description                   |
| ---------------------------------------------------------------- | ---------- | ----------------------------- |
| `--datavis-composition-semi-donut-label-color`                   | `#454D5B`  | Center label text color       |
| `--datavis-composition-semi-donut-value-color`                   | `#2C323F`  | Center value text color       |
| `--datavis-composition-semi-donut-center-value-large-font-size`  | `3rem`     | Value font size (large tier)  |
| `--datavis-composition-semi-donut-center-label-large-font-size`  | `1.125rem` | Label font size (large tier)  |
| `--datavis-composition-semi-donut-center-value-medium-font-size` | `2.25rem`  | Value font size (medium tier) |
| `--datavis-composition-semi-donut-center-label-medium-font-size` | `1rem`     | Label font size (medium tier) |
| `--datavis-composition-semi-donut-center-value-small-font-size`  | `1.875rem` | Value font size (small tier)  |
| `--datavis-composition-semi-donut-center-label-small-font-size`  | `0.875rem` | Label font size (small tier)  |
| `--datavis-composition-semi-donut-center-spacing`                | `0.25rem`  | Gap between label and value   |
| `--datavis-composition-semi-donut-center-label-font-weight`      | `400`      | Label font weight             |
| `--datavis-composition-semi-donut-center-value-font-weight`      | `500`      | Value font weight             |

## Events

| Event                 | When                   | Bubbles / Composed | Detail                     |
| --------------------- | ---------------------- | ------------------ | -------------------------- |
| `visualization:click` | A pie slice is clicked | Yes / Yes          | `VisualizationClickDetail` |

The `visualization:click` event fires when a user clicks a slice. It crosses the Shadow DOM boundary (`bubbles: true, composed: true`), so listen on the component or any ancestor.

```typescript
interface VisualizationClickDetail {
  columns: Record<string, ClickColumnInfo>; // column definitions involved in the click
  values: Record<string, string | number | null>; // clicked values keyed by column name
  interactionData: InteractionData; // metadata from data.interactions (if any)
  nativeEvent: Event; // original browser event
}
```

```js
html`
  <div
    @visualization:click=${e => {
      const {values, interactionData} = e.detail;
      console.log('Clicked slice values:', values);
    }}
  >
    <aiux-visualizations-composition
      .data=${data}
    ></aiux-visualizations-composition>
  </div>
`;
```

## Architecture

The component follows the same layered pipeline as other visualization components:

```
  DataDriven mixin (inherited)
  ┌─────────────────────────────────────────┐
  │  [Properties: data, renderingOverrides] │
  │                    |                    │
  │          Layer 1: Merge Rendering       │
  └────────────────────|────────────────────┘
                       |
  Composition (this component)
  ┌────────────────────|────────────────────┐
  │  [+ Properties: type, legend, tooltip,  ]│
  │  [  dataLabels, sort, centerContent, etc.]│
  │                    |                    │
  │    Layer 2: Resolve Composition         │
  │                    |                    │
  │          Layer 3: Validate              │
  │                    |                    │
  │          Layer 4: Build                 │
  └─────────────────────────────────────────┘
```

### Layer 1: Merge Rendering (DataDriven mixin)

Handled by the base class. Produces a complete rendering map where every column has a deterministic rendering entry.

### Layer 2: Resolve Composition

**File:** `src/resolve-composition.ts`

Auto-infers dimension and metric columns from the data:

- Uses the first dimension column (by `order`) for slice labels
- Uses the first metric column (by `order`) for slice values
- Throws `ChartError` if no dimension or metric column is found

### Layer 3: Validate

**File:** `src/validate.ts`

Validates that:

1. Data is not empty
2. Referenced columns exist in metadata
3. Dimension column has `meaning: 'dimension'`
4. Metric column is not a dimension

### Layer 4: Build

**File:** `src/build-options.ts`

Converts resolved config + data into a Highcharts pie configuration:

1. **Data points** — Iterates rows, extracts label via `getElementLabel()` and value via `getNumericValue()`. Applies rules-based coloring via `evaluateRules()`.
2. **Series config** — Sets `innerSize` and `startAngle`/`endAngle` based on chart type.
3. **Center content** — For donut/semi-donut types with `centerContent`, injects a `chart.events.render` callback that uses `chart.renderer.label()` to draw styled HTML text centered in the donut hole. Font sizes are driven by CSS custom properties keyed to the `size` tier. Donut uses `--datavis-composition-donut-center-*`; semi-donut uses `--datavis-composition-semi-donut-center-*`. Always emits a cleanup event (even when hidden) to remove any previously rendered label on update.
4. **Tooltip** — Uses a custom HTML formatter (no Highcharts SVG chrome) for Shadow DOM compatibility. All styling is inline in the HTML.
5. **Data labels** — `getDataLabels()` builds a Highcharts format string from the three independent boolean flags in `DataLabelsConfig`. Labels are always placed outside the chart; the `size` property is intentionally omitted from non-semi-donut series so Highcharts auto-shrinks the pie to fit outside labels without clipping. Semi-donut adjusts its center Y-position to `70%` (from `75%`) when labels are enabled to leave clearance at the legend edge.
6. **Legend, colors, accessibility** — Configured from component properties and theme colors.

### Color Rules

The component supports per-slice coloring driven by `rendering.columns[metric].rules` in the DataResponse, using `evaluateRules()` from the base package. Rules with operators (`less`, `greater`, `equal`, etc.) are evaluated against each slice's numeric value. Last matching rule wins. When a rule provides a color, it overrides the palette color for that slice.

## File Structure

```
components/visualizations/composition/
  README.md               # This document
  package.json
  index.js                # Version selector
  src/
    index.ts                # Barrel exports
    types.ts                # Zod schemas and TypeScript types
    composition.ts          # Lit web component (Highcharts(DataDriven(Visualization)))
    resolve-composition.ts  # Layer 2: Column resolution
    validate.ts             # Layer 3: Validation
    build-options.ts        # Layer 4: Highcharts options builder
    build-a11y-options.ts   # Accessibility (screen-reader) options builder
    get-point-description.ts # Per-point accessible description
    composition.stories.js  # Storybook stories
    composition-empty.stories.js # Empty-state stories
  test/
    helpers.js / helpers.ts # Shared test fixtures
    build-options.test.ts
    build-a11y-options.test.ts
    composition.test.ts
    composition.a11y.test.ts
    interactions.test.ts
    resolve-composition.test.js
    validate.test.js
    types.test.js
    get-point-description.test.js
```

## Usage

```html
<aiux-visualizations-composition
  .data="${dataResponse}"
  type="donut"
  .legend=${{position: 'right', title: 'Category'}}
  .tooltip=${{enabled: true}}
  .centerContent=${{mode: 'custom', value: '255', label: 'Total issues'}}
  .dataLabels=${{showLabels: true, showPercentage: true}}
  sort="descending"
  tooltip-show-percentage
></aiux-visualizations-composition>
```

## Existing Codebase Integration

### Patterns Followed

- **Component base class:** Uses `Highcharts(DataDriven(Visualization))` mixin composition from `@servicenow/aiux-components-visualizations-base`
- **Chart lifecycle:** Managed by the `Highcharts` mixin via `createOrUpdateChart()`. Composition builds `ChartConfig` and passes it to the base class.
- **Data utilities:** Uses `resolveColumns`, `filterByMeaning`, `getCellValue`, `getNumericValue`, `getElementLabel` from `@servicenow/aiux-components-visualizations-base`
- **Rules:** Uses `evaluateRules` from `@servicenow/aiux-components-visualizations-base` for conditional coloring
- **SSR safety:** Handled by the `Visualization` base class. Color and theme resolution guards with `isServer` check.
- **Custom element registration:** `@customElement('aiux-visualizations-composition')`

### Exports

The component and relevant types are exported from `src/index.ts`.
