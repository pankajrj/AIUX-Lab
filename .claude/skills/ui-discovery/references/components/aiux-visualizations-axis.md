# Axis

## Import

```js
import '@servicenow/aiux-components-visualizations-axis';
```


Cartesian chart visualization for line, spline, column, bar, area, areaspline, and scatter charts using DataResponse input with configurable axes, legend, tooltip, interactions, and annotations.

## Architecture

The component is built as a layered pipeline. Each layer transforms the input into a more deterministic form, culminating in the chart render. The layers execute sequentially; each depends on the output of the previous.

```
  DataDriven mixin (inherited)
  ┌─────────────────────────────────────────┐
  │  [Properties: data, renderingOverrides] │
  │                    |                    │
  │          Layer 1: Merge Rendering       │
  └────────────────────|────────────────────┘
                       |
  Axis (this component)
  ┌────────────────────|────────────────────┐
  │  [+ Properties: axes, type, legend,    ]│
  │  [  tooltip, interactions              ]│
  │                    |                    │
  │    Layer 2: Resolve Axis Configuration  │
  │                    |                    │
  │          Layer 3: Validate              │
  │                    |                    │
  │          Layer 4: Render                │
  └─────────────────────────────────────────┘
```

1. **Merge Rendering** — handled by the `DataDriven` mixin (base package)
2. **Resolve Axis Configuration** — `src/resolve-axis.ts`
3. **Validate** — `src/validate.ts`
4. **Render** — `src/config/build-options.ts` (orchestrator) + `src/config/build-series.ts` + `src/config/build-tooltip.ts` + `src/config/build-annotations.ts` + `src/axis.ts` (Lit component)

## Quick Start

```html
<aiux-visualizations-axis
  type="line"
  .data="${analyticsData}"
></aiux-visualizations-axis>
```

The component auto-resolves axis mappings from the data when no explicit `axes` definition is provided.

---

## Properties

| Property             | Type                | Attribute | Default  | Description                                                    |
| -------------------- | ------------------- | --------- | -------- | -------------------------------------------------------------- |
| `data`               | `DataResponse`      | —         | —        | V2 DataResponse from analytics query                           |
| `renderingOverrides` | `RenderingOverride` | —         | —        | Per-column rendering overrides (seriesType, dashStyle, colors) |
| `type`               | `string`            | `type`    | `'line'` | Default series type for all value columns                      |
| `axes`               | `AxesDefinition`    | —         | auto     | Explicit axis mapping; auto-resolved when omitted              |
| `legend`             | `LegendDefinition`  | —         | —        | Legend visibility and position                                 |
| `tooltip`            | `TooltipDefinition` | —         | —        | Tooltip behavior: enabled, followCursor, outside, footer       |
| `interactions`       | `InteractionConfig` | —         | —        | Selected-point state (`selectedPoints[]`) for highlighting     |

All object properties are set via Lit property binding (`.prop=${value}`). `type` can also be set as an HTML attribute.

---

## Data Requirements

- **1–2 dimension columns** (categorical or numerical) — mapped to xAxis and optionally stacking
- **At least 1 value column** (numerical) — plotted as series
- Additional value columns with special `meaning` values receive meaning-specific rendering (see below)

---

## `data`

A V2 `DataResponse` object, either manually defined or from an analytics query.

```js
const data = {
  metadata: {
    columns: {
      month:   { type: 'categorical', meaning: 'dimension', order: 0, elements: [...] },
      revenue: { type: 'numerical',   meaning: 'metric',    order: 1, label: 'Revenue' }
    }
  },
  data: [
    ['jan', '1200'],
    ['feb', '1800'],
    // ...
  ],
  rendering: { columns: { month: { role: 'grouping' }, revenue: { role: 'value' } } }
};
```

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
></aiux-visualizations-axis>
```

---

## `type`

The default series type for the chart. Individual columns can override this via `renderingOverrides`.

Accepted values: `line`, `spline`, `column`, `bar`, `area`, `areaspline`, `scatter`

```html
<aiux-visualizations-axis
  type="column"
  .data="${data}"
></aiux-visualizations-axis>
```

---

## `axes` — AxesDefinition

Controls which data columns map to each axis. When omitted the component auto-resolves from the data:

- 0 dimensions → error
- 1 dimension → `xAxis`, no stacking
- 2 dimensions → first (by `order`) = `xAxis`, second = `stacking`
- 3+ dimensions → error

When `axes` is partially provided (e.g. titles without `column`/`columns`), the component auto-resolves the missing parts from the data and deep-merges the user-provided values on top.

```typescript
interface AxesDefinition {
  xAxis?: {
    column?: string; // dimension column ID for the X axis
    title?: string; // optional axis title
    visible?: boolean; // show/hide axis (default: true)
    opposite?: boolean; // render on top instead of bottom (default: false)
    showLine?: boolean; // show axis line (default: true)
    showTicks?: boolean; // show tick marks (default: false)
    showGridlines?: boolean; // show grid lines (default: false)
  };
  yAxis?: Array<{
    columns?: string[]; // value column IDs plotted against this axis
    title?: string;
    visible?: boolean;
    opposite?: boolean; // render on the right side
    showLine?: boolean; // show axis line (default: true)
    showTicks?: boolean; // show tick marks (default: false)
    showGridlines?: boolean; // show grid lines (default: true)
    formattingFromColumn?: string; // derive label formatting from a column
    formatting?: Formatting; // inline formatting for axis labels
  }>;
  stacking?: {
    column?: string; // dimension column ID for series grouping
    title?: string;
  };
  zAxis?: {
    // reserved for future 3D support
    column?: string;
    title?: string;
  };
}
```

Key behaviors:

- This property is **optional**. If not provided, the component infers axis configuration from the data (see [Auto-Configuration](#auto-configuration-summary)).
- `xAxis` and `stacking` reference **dimension** columns (`meaning: 'dimension'`). Dimensions can be either categorical or numerical.
- `yAxis[].columns` reference **value** columns (any column whose `meaning` is not `'dimension'` — e.g., `'metric'`, `'forecast'`, `'trend'`, `'target'`, etc.).
- `zAxis` is reserved for future 3D chart rendering (not for series grouping; that is the role of `stacking`).
- Multiple Y axes are supported, each potentially on different sides of the chart (`opposite`).
- Setting `opposite: true` on `xAxis` moves it to the top of the chart. For `bar` and `column` chart types, all Y axes are automatically reversed so bars grow downward from the top axis.
- Axis tick label formatting follows a priority chain: `formattingFromColumn` (references a column's formatting config) takes priority, then inline `formatting` if defined, otherwise default Highcharts formatting.
- Setting `visible: false` on `xAxis` and all `yAxis` entries creates a sparkline-style chart (no axes, no legend margins, markers disabled).

### Auto-resolved (minimal)

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
></aiux-visualizations-axis>
```

### Explicit mapping

```html
<aiux-visualizations-axis
  type="column"
  .data="${data}"
  .axes=${{
    xAxis: { column: 'month', title: 'Month' },
    yAxis: [{ columns: ['revenue', 'cost'], title: 'Amount ($)' }]
  }}
></aiux-visualizations-axis>
```

### Dual Y axes

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .axes=${{
    xAxis: { column: 'month' },
    yAxis: [
      { columns: ['revenue'], title: 'Revenue' },
      { columns: ['margin'], title: 'Margin %', opposite: true }
    ]
  }}
></aiux-visualizations-axis>
```

### Opposite axes (xAxis on top)

```html
<aiux-visualizations-axis
  type="column"
  .data="${data}"
  .axes=${{
    xAxis: { column: 'month', opposite: true, title: 'Month' },
    yAxis: [{ columns: ['revenue'], title: 'Revenue' }]
  }}
></aiux-visualizations-axis>
```

When `xAxis.opposite` is `true` on a `bar` or `column` chart, the Y axis direction is automatically reversed so that bars extend downward from the top axis.

### Stacked chart

```html
<aiux-visualizations-axis
  type="column"
  .data="${data}"
  .axes=${{
    xAxis: { column: 'month' },
    yAxis: [{ columns: ['count'] }],
    stacking: { column: 'category' }
  }}
></aiux-visualizations-axis>
```

### Sparkline (no visible axes)

Setting `visible: false` on all axes creates a compact inline chart with no axes, no legend margins, and markers disabled.

```html
<aiux-visualizations-axis
  type="areaspline"
  .data="${data}"
  .axes=${{
    xAxis: { column: 'month', visible: false },
    yAxis: [{ columns: ['revenue'], visible: false }]
  }}
  .legend=${{ visible: false }}
></aiux-visualizations-axis>
```

---

## `legend` — LegendDefinition

Controls legend visibility, position, and optional title.

```typescript
interface LegendDefinition {
  visible?: boolean; // show/hide the legend (default: true)
  position?: 'bottom' | 'top' | 'left' | 'right'; // default: 'bottom'
  title?: string; // optional title displayed above the legend items
}
```

### Hidden legend

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .legend=${{ visible: false }}
></aiux-visualizations-axis>
```

### Legend on the right

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .legend=${{ position: 'right' }}
></aiux-visualizations-axis>
```

### Legend with title

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .legend=${{ position: 'bottom', title: 'Metric' }}
></aiux-visualizations-axis>
```

---

## `tooltip` — TooltipDefinition

Controls hover tooltip behavior. The tooltip shows the X dimension label, series value, and any additional columns specified via `tooltipValues` in rendering overrides.

```typescript
interface TooltipDefinition {
  enabled?: boolean; // show tooltip on hover (default: true)
  followCursor?: boolean; // tooltip follows cursor movement (default: false)
  outside?: boolean; // render tooltip outside chart container (default: false)
  footer?: {
    // optional footer below tooltip content
    label: string; // footer text (non-interactive)
    icon?: string; // optional icon identifier
  };
}
```

### Disabled tooltip

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .tooltip=${{ enabled: false }}
></aiux-visualizations-axis>
```

### Follow cursor

```html
<aiux-visualizations-axis
  type="line"
  .data="${data}"
  .tooltip=${{ followCursor: true }}
></aiux-visualizations-axis>
```

---

## Events

| Event                 | When                           | Bubbles / Composed | Detail                     |
| --------------------- | ------------------------------ | ------------------ | -------------------------- |
| `visualization:click` | A data point/series is clicked | Yes / Yes          | `VisualizationClickDetail` |

The `visualization:click` event fires when a user clicks a data point. It crosses the Shadow DOM boundary (`bubbles: true, composed: true`), so listen on the component or any ancestor.

```typescript
interface VisualizationClickDetail {
  columns: Record<string, {label: string; meaning: string}>; // column defs involved in the click, keyed by column name
  values: Record<string, string | number | null>; // clicked dimension + value, keyed by column name
  interactionData: {
    // interaction metadata resolved from data.interactions
    modelEventData: Record<string, unknown>;
    columnEventData: Record<string, unknown>;
    elementEventData: Record<string, Record<string, unknown>>;
  };
  nativeEvent: Event; // original browser event
}
```

```js
html`
  <aiux-visualizations-axis
    type="column"
    .data=${data}
    @visualization:click=${e => console.log(e.detail.values, e.detail.columns)}
  ></aiux-visualizations-axis>
`;
```

---

## `renderingOverrides` — Per-Column Overrides

Inherited from the `DataDriven` mixin. The Axis extends the base schema by adding chart-specific fields to `visualizationDefinition`:

```typescript
{
  columns: {
    [columnId: string]: {
      presentation: {
        visualizationDefinition: {
          seriesType?: 'line' | 'spline' | 'column' | 'bar' | 'area' | 'areaspline' | 'scatter',
          dashStyle?: 'Dash' | 'DashDot' | 'Dot' | 'LongDash' | ... | 'Solid',
          showMarkers?: boolean,
          stepMode?: 'none' | 'left' | 'right'
        },
        // ... inherited fields (tooltipValues, dataTable, formatting, rules)
      }
    }
  }
}
```

- The `seriesType` field determines how a specific value column is plotted, overriding the component-level `type`. For example, a chart with `type="column"` can have one metric rendered as a `line` via this override.
- The `dashStyle` field controls the line dash pattern for line-type series.
- The `showMarkers` field toggles data point markers on a per-series basis.
- The `stepMode` field renders the series as a step line with the given alignment.

### Mixed series types

```html
<aiux-visualizations-axis
  type="column"
  .data="${data}"
  .renderingOverrides=${{
    columns: {
      trend: {
        presentation: {
          visualizationDefinition: { seriesType: 'line' }
        }
      }
    }
  }}
></aiux-visualizations-axis>
```

---

## Meaning-Specific Rendering

The render layer applies visual defaults based on column `meaning`. These are visual defaults — the user can still override them via `renderingOverrides`.

| Meaning             | Rendering                           | Notes                                                                                                                                                                               |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metric`            | Standard series                     | No special treatment. Uses chart `type` or per-column `seriesType` override                                                                                                         |
| `calculation`       | Standard series                     | No special treatment                                                                                                                                                                |
| `forecast` (single) | Same series type, dashed line style | When `dataShape: 'single'`. Color inherited from the parent column (via `column.derivedFrom`)                                                                                       |
| `forecast` (tuple)  | Semi-transparent arearange band     | When `dataShape: 'tuple'`. Same color as parent column but with opacity applied. A dataset will often have both a single and tuple forecast for the same parent series              |
| `trend`             | Solid orange line, thicker width    | Always rendered as `line` type with increased `lineWidth`                                                                                                                           |
| `target`            | Dotted gray step-line series        | Rendered as a `line` series with `step: 'left'`, `dashStyle: 'Dot'`, and gray color. Tracks changes across the X axis (not a plotLine)                                              |
| `confidence`        | Semi-transparent arearange band     | Rendered as an `arearange` series. Color is independent (does not need to match parent). Column `dataShape` is `'tuple'` (low/high bounds)                                          |
| `prediction`        | Semi-transparent arearange band     | Similar to confidence. Column `dataShape` is `'tuple'`                                                                                                                              |
| `change`            | Not plotted                         | Supplementary data — available for tooltips only                                                                                                                                    |
| `changePercentage`  | Not plotted                         | Supplementary data — available for tooltips only                                                                                                                                    |
| `changeReference`   | Not plotted                         | Supplementary data — available for tooltips only                                                                                                                                    |
| `comment`           | Annotation with connector           | Rendered using Highcharts annotations module with `shape: 'connector'`. Anchored to the parent series data point via `derivedFrom` (or first metric if unset). Not a regular series |

---

## Theming

All visual styles are resolved from CSS custom properties at render time, falling back to built-in defaults. Override them on any ancestor element or the component itself.

| CSS Custom Property                  | Default       | Description                          |
| ------------------------------------ | ------------- | ------------------------------------ |
| `--datavis-axis-line-color`          | `#bababb`     | Axis line color                      |
| `--datavis-axis-title-color`         | `#384E55`     | Axis title text color                |
| `--datavis-axis-title-font-size`     | `10px`        | Axis title font size                 |
| `--datavis-categories-color`         | `#384E55`     | Axis category label text color       |
| `--datavis-categories-font-size`     | `0.75rem`     | Axis category label font size        |
| `--datavis-gridline-width`           | `1`           | Grid line width (px)                 |
| `--datavis-bar-border-radius`        | `0`           | Column/bar border radius (px)        |
| `--datavis-marker-line-width`        | `2`           | Data point marker line width         |
| `--datavis-legend-color`             | `#2C323F`     | Legend item text color               |
| `--datavis-legend-font-size`         | `0.75rem`     | Legend item font size                |
| `--datavis-legend-spacing`           | `4`           | Legend symbol padding (px)           |
| `--datavis-legend-title-color`       | `#525252`     | Legend title text color              |
| `--datavis-legend-title-font-size`   | `0.875rem`    | Legend title font size               |
| `--datavis-legend-title-font-weight` | `600`         | Legend title font weight             |
| `--datavis-chart-bg`                 | `transparent` | Chart background color               |
| `--datavis-annotation-color`         | `#999`        | Annotation line and label text color |

### Custom axis styling example

```html
<div style="--datavis-axis-line-color: #e5e7eb; --datavis-gridline-width: 0;">
  <aiux-visualizations-axis
    type="line"
    .data="${data}"
  ></aiux-visualizations-axis>
</div>
```

---

## Auto-Configuration Summary

The component works with minimal configuration. Only `type` and `data` are required.

| `renderingOverrides` | `axes`       | Behavior                                                               |
| -------------------- | ------------ | ---------------------------------------------------------------------- |
| Not provided         | Not provided | Use `data.rendering` as-is. Infer axis mapping from dimensions/values. |
| Provided             | Not provided | Merge overrides with `data.rendering`. Infer axis mapping.             |
| Not provided         | Provided     | Use `data.rendering` as-is. Use explicit axis mapping.                 |
| Provided             | Provided     | Merge overrides with `data.rendering`. Use explicit axis mapping.      |

### Auto-configuration rules (when `axes` is absent)

1. Identify dimension columns and value columns from the merged rendering output.
2. Sort dimensions by their `order` field in `metadata.columns`.
3. Zero dimensions trigger an error: "No dimension column available for xAxis."
4. First dimension becomes `xAxis`.
5. Second dimension (if present) becomes `stacking`.
6. Third or more dimensions trigger an error: "Cannot auto-configure axis chart with more than 2 dimensions. Please provide explicit axes configuration."
7. All value columns are assigned to a single `yAxis`.
8. `zAxis` is never auto-inferred.

---

## Rendering Details

- **Series naming** — `"{stacking element label} - {value column label}"` when stacking is defined. When there is no stacking, the value column label alone is used.
- **Color assignment** — Conditional rules can work in two modes:
  - **Threshold-based** (for value columns): rules with comparison operators (`less`, `greater`, etc.) apply color based on the data point value.
  - **Categorical** (for dimension elements): rules with `operator: 'equal'` and an `operand` matching a dimension element apply color to that element's series.
  - A rule **without an operator or operand** acts as a **default** and its color is applied unconditionally.
  - If multiple rules match, the **last matching rule wins**.
- **X axis** — Categorical dimensions use `xAxis.categories` (built from element labels). Numerical dimensions pass raw numeric X values with no categories (Highcharts handles axis labels automatically).
- **Y axis formatting** — Axis tick label formatting follows a priority chain: `formattingFromColumn` takes priority, then inline `formatting`, otherwise default Highcharts formatting. Both use the full formatting pipeline (precision, abbreviation, separators, unit).
- **Stacking** — When a stacking dimension is present, `plotOptions.series.stacking` is set to `'normal'`. Mode is hardcoded to `'normal'` for now; extensible in the future.
- **Tooltip** — For each series, uses the column's `presentation.tooltipValues` to determine which values to display on hover. Each referenced column's value is formatted using that column's own `formatting` configuration. If `tooltipValues` is not defined, defaults to showing the series' own column value.
- **Error state** — If any layer (2 or 3) produces an error, it propagates to the `Visualization` base class for rendering. The base class handles all error state rendering.

---

## Design Decisions

> Decisions #1 (deep merge semantics) and #2 (column identification via `meaning`) are documented in the base package `README.MD` as they apply to all chart types.

### Stacking mode

Hardcoded to `'normal'` for now. Extensible in the future without breaking changes.

### Meaning-specific rendering

No auto-defaults are applied to the configuration properties. All value columns are configured identically in Layers 1-3. However, the **render layer (Layer 4) contains meaning-specific rendering logic** — see the full table in the Meaning-Specific Rendering section.

### Series naming convention

`"{stacking element label} - {value column label}"` when stacking is defined. When there is no stacking, use the value column label alone.

### Color assignment via rules

Documented in the base package `README.MD` (Color rules section). The rules system handles threshold-based, categorical, and default coloring. Last matching rule wins. Highcharts default palette applies for series without rule-based colors.

### Empty data

Checked in the validation layer (Layer 3). Renders a "No data" error message. Does not render an empty chart.

### zAxis and 3D rendering

Deferred to a future iteration. If `zAxis` is provided, the component displays a "3D charts are not yet supported" error message.
