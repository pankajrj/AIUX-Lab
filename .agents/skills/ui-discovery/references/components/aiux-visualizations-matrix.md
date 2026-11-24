# Matrix

## Import

```js
import '@servicenow/aiux-components-visualizations-matrix';
```


Matrix heatmap visualization for comparing values across two categorical dimensions, with automatic or explicit axis/value mapping, gradient or categorical legends, optional zero-filled missing cells, and configurable tooltips.

## Architecture

4-layer pipeline (same as AxisChart):

1. **Merge Rendering** — handled by the `DataDriven` mixin (base package)
2. **Resolve Matrix Configuration** — `src/resolve-matrix.ts`
3. **Validate** — `src/validate.ts`
4. **Render** — `src/build-options.ts` (orchestrator) + `src/build-heatmap.ts` + `src/build-tooltip.ts` + `src/matrix.ts` (Lit component)

## Quick Start

```html
<aiux-visualizations-matrix
  .data="${analyticsData}"
  type="heatmap"
></aiux-visualizations-matrix>
```

The component auto-resolves axes and value columns from the data when no explicit `matrix` definition is provided.

---

## Properties

| Property       | Type                     | Attribute   | Default     | Description                                              |
| -------------- | ------------------------ | ----------- | ----------- | -------------------------------------------------------- |
| `data`         | `DataResponse`           | —           | —           | V2 DataResponse from analytics query                     |
| `type`         | `string`                 | `type`      | `'heatmap'` | Chart type (currently only `heatmap`)                    |
| `matrix`       | `MatrixDefinition`       | —           | auto        | Explicit axis/value mapping; auto-resolved when omitted  |
| `legend`       | `MatrixLegendDefinition` | —           | —           | Legend type, position, visibility, and color items       |
| `labels`       | `LabelPlacement`         | `labels`    | `'values'`  | Data label placement: `'values'` or `'none'`             |
| `animated`     | `boolean`                | `animated`  | `false`     | Enable entry animation                                   |
| `showZero`     | `boolean`                | `show-zero` | `false`     | Render missing cells as zero instead of null             |
| `tooltip`      | `TooltipDefinition`      | —           | —           | Tooltip behavior: enabled, followCursor, outside, footer |
| `cellCategory` | `CellCategoryFn`         | —           | —           | Assigns each cell to a named category for coloring       |
| `interactions` | `InteractionConfig`      | —           | —           | Selection state (`selectedPoints`) for clickable cells   |

All object properties (`.data`, `.matrix`, `.legend`, `.tooltip`, `.cellCategory`, `.interactions`) are set via Lit property binding (`.prop=${value}`). Scalar properties (`type`, `labels`, `animated`, `show-zero`) can also be set as HTML attributes.

---

## Data Requirements

- **Exactly 2 dimension columns** (categorical) — mapped to xAxis and yAxis
- **At least 1 value column** (numerical) — drives cell color intensity
- Additional value columns appear in tooltips only

---

## `data`

A V2 `DataResponse` object, either manually defined or from an analytics query. Must contain at least two categorical dimension columns and one numerical value column.

```js
const data = {
  metadata: {
    columns: {
      priority: { type: 'categorical', meaning: 'dimension', order: 0, elements: [...] },
      state:    { type: 'categorical', meaning: 'dimension', order: 1, elements: [...] },
      count:    { type: 'numerical',   meaning: 'metric',    order: 2, label: 'Count' }
    }
  },
  data: [
    ['critical', 'new', '12'],
    ['high',     'progress', '28'],
    // ...
  ],
  rendering: { columns: { priority: { role: 'grouping' }, state: { role: 'grouping' }, count: { role: 'value' } } }
};
```

```html
<aiux-visualizations-matrix .data="${data}"></aiux-visualizations-matrix>
```

---

## `matrix` — MatrixDefinition

Controls which data columns map to each axis and the cell value. When omitted the component auto-resolves from the data based on the following heuristics:

- Dimension with lower `order` → `xAxis`
- Dimension with higher `order` → `yAxis`
- First non-dimension column by `order` → `value`

```typescript
interface MatrixDefinition {
  xAxis: {
    column: string; // column ID for the X categories
    title?: string; // optional axis title displayed alongside the axis
    opposite?: boolean; // place X axis labels on top instead of bottom
  };
  yAxis: {
    column: string; // column ID for the Y categories
    title?: string; // optional axis title displayed alongside the axis
    opposite?: boolean; // place Y axis labels on the right instead of left
  };
  value: {
    column: string; // numerical column ID for cell values
  };
}
```

### Basic explicit mapping

```html
<aiux-visualizations-matrix
  .data=${data}
  .matrix=${{
    xAxis: { column: 'state' },
    yAxis: { column: 'priority' },
    value: { column: 'count' }
  }}
></aiux-visualizations-matrix>
```

### With axis titles

```html
<aiux-visualizations-matrix
  .data=${data}
  .matrix=${{
    xAxis: { column: 'state', title: 'Incident State' },
    yAxis: { column: 'priority', title: 'Priority Level' },
    value: { column: 'count' }
  }}
></aiux-visualizations-matrix>
```

### Opposite axes (labels on top / right)

```html
<aiux-visualizations-matrix
  .data=${data}
  .matrix=${{
    xAxis: { column: 'state', opposite: true },
    yAxis: { column: 'priority', opposite: true },
    value: { column: 'count' }
  }}
></aiux-visualizations-matrix>
```

---

## `legend` — MatrixLegendDefinition

The legend supports two modes: **gradient** (default) and **categorical**. In gradient mode a continuous color bar is shown; in categorical mode discrete color swatches are rendered.

```typescript
// Gradient legend (default)
interface GradientLegend {
  type?: 'gradient'; // defaults to 'gradient'
  visible?: boolean; // show/hide the legend (default: true)
  position?: 'bottom' | 'top' | 'left' | 'right'; // default: 'bottom'
  items?: Record<string, {color: string; label?: string}>; // custom gradient stops
  stopsMode?: 'absolute' | 'relative'; // how stop keys are interpreted
}

// Categorical legend
interface CategoricalLegend {
  type: 'categorical';
  visible?: boolean;
  position?: 'bottom' | 'top' | 'left' | 'right';
  title?: string; // optional title displayed above the legend swatches
  items?: Record<string, {color: string; label?: string}>; // category → color mapping
}
```

The `title` field is supported on **categorical** legends only. It is rendered above the swatch list using `--datavis-legend-title-*` CSS variables. The title is explicitly cleared when removed so stale text is never left behind on update.

### Default gradient (bottom)

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{ position: 'bottom' }}
></aiux-visualizations-matrix>
```

### Legend on the right

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{ position: 'right' }}
></aiux-visualizations-matrix>
```

### Legend on top

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{ position: 'top' }}
></aiux-visualizations-matrix>
```

### Hidden legend

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{ visible: false }}
></aiux-visualizations-matrix>
```

### Gradient with custom color stops (absolute)

Stop keys are **data values**. Useful when the data is known and you want to map specific data values to specific colors.

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{
    type: 'gradient',
    items: {
      '0':   { color: '#22c55e', label: 'Low' },
      '30':  { color: '#a3e635' },
      '60':  { color: '#eab308' },
      '90':  { color: '#f97316' },
      '120': { color: '#dc2626', label: 'High' }
    }
  }}
></aiux-visualizations-matrix>
```

### Gradient with relative stops

Stop keys are **0–1 positions** along the gradient bar rather than data values. Useful when the data varies and you want consistent color distribution regardless of the data range.

```html
<aiux-visualizations-matrix
  .data=${data}
  .legend=${{
    type: 'gradient',
    stopsMode: 'relative',
    items: {
      '0':    { color: '#22c55e', label: 'Min' },
      '0.5':  { color: '#eab308', label: 'Mid' },
      '1':    { color: '#dc2626', label: 'Max' }
    }
  }}
></aiux-visualizations-matrix>
```

### Categorical legend

Used together with `cellCategory` to color cells by discrete categories instead of a continuous gradient. Each key in `items` corresponds to a category key returned by the `cellCategory` function.

```js
const cellCategory = ({value}) =>
  value <= 3 ? 'low' : value <= 6 ? 'medium' : 'high';

const legend = {
  type: 'categorical',
  items: {
    low: {color: '#22c55e', label: 'Low Risk'},
    medium: {color: '#eab308', label: 'Medium Risk'},
    high: {color: '#ef4444', label: 'High Risk'}
  }
};

html`<aiux-visualizations-matrix
  .data=${data}
  .cellCategory=${cellCategory}
  .legend=${legend}
></aiux-visualizations-matrix>`;
```

Item colors support CSS variables, resolved at render time:

```js
items: {
  low:  { color: 'var(--risk-low)',  label: 'Low' },
  high: { color: 'var(--risk-high)', label: 'High' }
}
```

---

## `labels` — LabelPlacement

Controls whether numeric data labels are shown inside each cell.

| Value      | Description                             |
| ---------- | --------------------------------------- |
| `'values'` | Show the formatted cell value (default) |
| `'none'`   | Hide data labels                        |

```html
<!-- Show labels (default) -->
<aiux-visualizations-matrix
  .data="${data}"
  labels="values"
></aiux-visualizations-matrix>

<!-- Hide labels -->
<aiux-visualizations-matrix
  .data="${data}"
  labels="none"
></aiux-visualizations-matrix>
```

In categorical mode, labels display the original numeric value even though the internal point value is mapped to a category index.

---

## `animated`

When `true`, cells animate in on first render with an ease-out bounce effect (800 ms).

```html
<aiux-visualizations-matrix
  .data="${data}"
  animated
></aiux-visualizations-matrix>
```

---

## `showZero` (`show-zero`)

When `true`, cells with no matching data row are rendered with a value of `0` (and colored accordingly) instead of being left as null cells.

In categorical mode this property has no effect — missing cells are always rendered as null since category indices are not meaningful for zero-fill.

```html
<aiux-visualizations-matrix
  .data="${data}"
  show-zero
></aiux-visualizations-matrix>
```

---

## `tooltip` — TooltipDefinition

Controls the hover tooltip behavior. The tooltip shows both dimension labels, the primary cell value, and any additional value columns from the data.

**Matrix tooltips are disabled by default.** When the `tooltip` property is omitted, the component applies `{enabled: false}`, so no tooltip is shown on hover. Provide a `tooltip` object to turn it on (any object that does not set `enabled: false` enables the tooltip).

```typescript
interface TooltipDefinition {
  enabled?: boolean; // show tooltip on hover; enabled when a tooltip object is provided
  followCursor?: boolean; // tooltip follows cursor movement (default: false)
  outside?: boolean; // render tooltip outside chart container (default: false)
  footer?: {
    // optional footer below tooltip content
    label: string; // footer text (non-interactive)
    icon?: string; // optional icon identifier
  };
}
```

### Enabled tooltip

Since tooltips are off by default, pass a `tooltip` object to enable them:

```html
<aiux-visualizations-matrix
  .data=${data}
  .tooltip=${{ enabled: true }}
></aiux-visualizations-matrix>
```

### Disabled tooltip (default)

Omitting `tooltip` has the same effect, but you can also be explicit:

```html
<aiux-visualizations-matrix
  .data=${data}
  .tooltip=${{ enabled: false }}
></aiux-visualizations-matrix>
```

### Render outside chart container

```html
<aiux-visualizations-matrix
  .data=${data}
  .tooltip=${{ outside: true }}
></aiux-visualizations-matrix>
```

### Follow cursor

```html
<aiux-visualizations-matrix
  .data=${data}
  .tooltip=${{ followCursor: true }}
></aiux-visualizations-matrix>
```

---

## `cellCategory` — CellCategoryFn

Assigns each cell to a named category. Used together with a categorical legend (`legend.type: 'categorical'` plus `legend.items`) to color cells by discrete groups instead of a continuous gradient.

```typescript
interface CellCategoryContext {
  x: string; // X dimension element ID
  y: string; // Y dimension element ID
  value: number; // Numeric cell value
}

type CellCategoryFn = (ctx: CellCategoryContext) => string | undefined;
```

When `cellCategory` is set with a categorical legend:

- The continuous gradient colorAxis is replaced with discrete dataClasses
- Each cell's color is resolved by looking up the returned key in `legend.items`
- Returning `undefined` (or a key not in `legend.items`) falls back to the theme's `nullColor`

### Risk heatmap example

```js
const riskCategory = ({value}) => {
  if (value <= 3) return 'low';
  if (value <= 6) return 'medium';
  if (value <= 12) return 'high';
  return 'critical';
};

const legend = {
  type: 'categorical',
  items: {
    low: {color: '#22c55e', label: 'Low Risk'},
    medium: {color: '#eab308', label: 'Medium Risk'},
    high: {color: '#f97316', label: 'High Risk'},
    critical: {color: '#ef4444', label: 'Critical Risk'}
  }
};

html`<aiux-visualizations-matrix
  .data=${riskData}
  .cellCategory=${riskCategory}
  .legend=${legend}
></aiux-visualizations-matrix>`;
```

---

## `interactions` — InteractionConfig

Marks specific cells as selected (highlighted). Cells not in `selectedPoints` are
dimmed. Each selected point identifies a cell by its dimension values (and optional
metric column name).

```typescript
interface SelectedPoint {
  dimensions: Record<string, string | number>; // keys are dimension column names
  metric?: string; // metric column name (all metrics if omitted)
}

interface InteractionConfig {
  selectedPoints?: SelectedPoint[];
}
```

```js
html`<aiux-visualizations-matrix
  .data=${data}
  .interactions=${{
    selectedPoints: [
      {dimensions: {priority: 'critical', state: 'new'}, metric: 'count'}
    ]
  }}
></aiux-visualizations-matrix>`;
```

---

## Events

| Event                 | Detail                                            | Description                                      |
| --------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `visualization:click` | `{columns, values, interactionData, nativeEvent}` | Fired when a cell is clicked (bubbles, composed) |

The `detail` shape (`VisualizationClickDetail`):

```typescript
interface VisualizationClickDetail {
  columns: Record<string, {label: string; meaning: string}>; // clicked columns, keyed by column name
  values: Record<string, string | number | null>; // clicked values (dimensions + value), keyed by column name
  interactionData: InteractionData; // model/column/element event data from data.interactions
  nativeEvent: Event; // original browser event
}
```

Combine with the `interactions` property to build click-to-select behavior:

```js
chart.addEventListener('visualization:click', e => {
  const {values} = e.detail;
  // update chart.interactions.selectedPoints based on the clicked cell
});
```

---

## Theming

All visual styles are resolved from CSS custom properties at render time, falling back to built-in defaults. Override them on any ancestor element or the component itself.

| CSS Custom Property                  | Default                  | Description                       |
| ------------------------------------ | ------------------------ | --------------------------------- |
| `--datavis-tooltip-bg`               | `#FFFFFF`                | Tooltip background                |
| `--datavis-tooltip-header-color`     | `#2C323F`                | Tooltip header text color         |
| `--datavis-tooltip-body-color`       | `#454D5B`                | Tooltip body text color           |
| `--datavis-label-color`              | `#454D5B`                | Data label text color             |
| `--datavis-label-font-size`          | `0.75rem`                | Data label font size              |
| `--datavis-legend-color`             | `#2C323F`                | Legend text color                 |
| `--datavis-legend-font-size`         | `0.75rem`                | Legend font size                  |
| `--datavis-legend-title-color`       | `#525252`                | Categorical legend title color    |
| `--datavis-legend-title-font-size`   | `0.875rem`               | Categorical legend title size     |
| `--datavis-legend-title-font-weight` | `600`                    | Categorical legend title weight   |
| `--datavis-coloraxis-min-color`      | `#FFFFFF`                | Gradient color axis: low end      |
| `--datavis-coloraxis-max-color`      | `#6366F1`                | Gradient color axis: high end     |
| `--datavis-label-badge-bg`           | `rgba(255,255,255,0.65)` | Data label badge background       |
| `--datavis-categories-color`         | `#384E55`                | Axis category label text color    |
| `--datavis-categories-font-size`     | `0.75rem`                | Axis category label font size     |
| `--datavis-axis-title-color`         | `#384E55`                | Axis title text color             |
| `--datavis-axis-title-font-size`     | `10px`                   | Axis title font size              |
| `--datavis-null-color`               | `#F3F4F6`                | Color for null / missing cells    |
| `--datavis-cell-border-radius`       | `6`                      | Cell corner radius (px, unitless) |
| `--datavis-cell-padding`             | `1.5`                    | Cell padding (px, unitless)       |

### Custom color ramp example

```html
<div
  style="--datavis-coloraxis-min-color: #fef3c7; --datavis-coloraxis-max-color: #dc2626;"
>
  <aiux-visualizations-matrix .data="${data}"></aiux-visualizations-matrix>
</div>
```

---

## Heatmap Rendering Details

- **Color axis** — White-to-indigo gradient by default, auto-scaled from data min/max. Fully customizable via `legend.items` stops or CSS variables.
- **Data labels** — Enabled by default, formatted per the value column's rendering configuration.
- **Y-axis** — Reversed (top-to-bottom, like a table).
- **Null cells** — Rendered with `--datavis-null-color`. A dash (`-`) is shown as the data label.
- **Tooltip** — Shows both dimension labels, primary value, and any additional value columns. Fully styled with inline HTML to work correctly inside Shadow DOM.
- **Legend sizing** — The gradient bar is automatically stretched to match the plot area width (horizontal) or height (vertical) via `load`/`redraw` event handlers.
