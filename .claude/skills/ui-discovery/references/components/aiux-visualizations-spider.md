# Spider

## Import

```js
import '@servicenow/aiux-components-visualizations-spider';
```


Spider/radar visualization for comparing one or more numerical series across categorical axes, with configurable legend, tooltip, labels, marker display, polygon styling, and gradient series colors.

## Architecture

The component is built as a layered pipeline. Each layer transforms the input into a more deterministic form, culminating in the chart render.

```
  DataDriven mixin (inherited)
  ┌─────────────────────────────────────────┐
  │  [Properties: data, renderingOverrides] │
  │                    |                    │
  │          Layer 1: Merge Rendering       │
  └────────────────────|────────────────────┘
                       |
  Spider (this component)
  ┌────────────────────|────────────────────┐
  │  [+ Properties: axes, legend, tooltip, ]│
  │  [  animated, labels, gradient, ...    ]│
  │                    |                    │
  │    Layer 2: Resolve Axis Configuration  │
  │                    |                    │
  │          Layer 3: Validate              │
  │                    |                    │
  │          Layer 4: Render                │
  └─────────────────────────────────────────┘
```

1. **Merge Rendering** — handled by the `DataDriven` mixin (base package)
2. **Resolve Axis Configuration** — `resolveAxes()` from the axis package
3. **Validate** — `validateAxisConfig()` from the axis package
4. **Render** — `src/build-spider.ts` (chart config builder) + `src/spider-utils.ts` (theme, tooltip, background polygon) + `src/spider.ts` (Lit component)

## Quick Start

```html
<aiux-visualizations-spider
  .data="${analyticsData}"
></aiux-visualizations-spider>
```

The component auto-resolves axis mappings from the data when no explicit `axes` definition is provided.

---

## Properties

| Property                | Type                     | Attribute                 | Default   | Description                                                         |
| ----------------------- | ------------------------ | ------------------------- | --------- | ------------------------------------------------------------------- |
| `data`                  | `DataResponse`           | —                         | —         | V2 DataResponse from analytics query                                |
| `renderingOverrides`    | `RenderingOverride`      | —                         | —         | Per-column rendering overrides                                      |
| `axes`                  | `ResolvedAxesDefinition` | —                         | auto      | Explicit axis mapping; auto-resolved when omitted                   |
| `legend`                | `LegendDefinition`       | —                         | —         | Legend visibility and position                                      |
| `tooltip`               | `TooltipDefinition`      | —                         | —         | Tooltip behavior: enabled, footer, follow cursor, outside rendering |
| `animated`              | `boolean`                | `animated`                | `false`   | Enable chart animations                                             |
| `labels`                | `SpiderLabelPlacement`   | `labels`                  | `'none'`  | Data value labels (`'value'` or `'none'`)                           |
| `backgroundColor`       | `string`                 | `background-color`        | `#E8F4FA` | Polygon background fill color                                       |
| `fillOpacity`           | `number`                 | `fill-opacity`            | `0.08`    | Area fill transparency (0–1)                                        |
| `markerEnabled`         | `boolean`                | `marker-enabled`          | `false`   | Show data point markers                                             |
| `gridLineColor`         | `string`                 | `grid-line-color`         | `#D6E4ED` | Radial grid line color                                              |
| `tooltipShowPercentage` | `boolean`                | `tooltip-show-percentage` | `false`   | Show percentage in tooltips                                         |
| `gradientColors`        | `string[]`               | —                         | —         | Hex colors for gradient fill                                        |
| `gradientAngle`         | `number`                 | `gradient-angle`          | `0`       | Gradient direction in degrees (0–360)                               |

All object properties are set via Lit property binding (`.prop=${value}`). Primitive properties can also be set as HTML attributes.

---

## Data Requirements

- **1 categorical dimension column** — defines the radial spokes (categories). Must have an `elements` array with `{id, label}` objects.
- **At least 1 numerical value column** — each becomes a filled area series.
- Columns with meaning `change`, `changePercentage`, or `changeReference` are excluded from series rendering.
- Sparse data is supported — missing category-value combinations render as `null`.

---

## `axes` — ResolvedAxesDefinition

Controls which data columns map to each axis. When omitted the component auto-resolves from the data using the axis package's `resolveAxes()`.

### Auto-resolved (minimal)

```html
<aiux-visualizations-spider .data="${data}"></aiux-visualizations-spider>
```

### Explicit mapping

```html
<aiux-visualizations-spider
  .data="${data}"
  .axes=${{
    xAxis: { column: 'category', title: 'Categories' },
    yAxis: [{ columns: ['score', 'benchmark'] }]
  }}
></aiux-visualizations-spider>
```

---

## `legend` — LegendDefinition

Controls legend visibility and position.

```typescript
interface LegendDefinition {
  visible?: boolean;
  position?: 'bottom' | 'top' | 'left' | 'right';
}
```

### Hidden legend

```html
<aiux-visualizations-spider
  .data="${data}"
  .legend=${{ visible: false }}
></aiux-visualizations-spider>
```

---

## `tooltip` — TooltipDefinition

Controls hover tooltip behavior. The tooltip shows the series name, value, and optionally a percentage.

```typescript
interface TooltipDefinition {
  enabled?: boolean;
  footer?: {
    label: string;
    icon?: string;
  };
  followCursor?: boolean;
  outside?: boolean;
}
```

---

## Gradient Fills

Apply a gradient fill to the area series by providing an array of hex colors and an angle:

```html
<aiux-visualizations-spider
  .data="${data}"
  .gradientColors=${['#0ab8d9', '#632adb']}
  gradient-angle="90"
  fill-opacity="0.3"
></aiux-visualizations-spider>
```

- Hex colors are converted to rgba with the specified `fillOpacity` applied.
- Stops are distributed evenly across the gradient.
- Angle: 0° = left-to-right, 90° = top-to-bottom.

---

## Spider Badge

The package also exports and registers `<aiux-visualizations-spider-badge>`, a pentagon-shaped rating badge used for spider/radar score labels.

```html
<aiux-visualizations-spider-badge
  label="Good"
  variant="good"
></aiux-visualizations-spider-badge>
```

| Property  | Attribute | Type                 | Default     | Description                                  |
| --------- | --------- | -------------------- | ----------- | -------------------------------------------- |
| `label`   | `label`   | `string`             | `''`        | Text displayed inside the pentagon badge     |
| `variant` | `variant` | `SpiderBadgeVariant` | `'neutral'` | Color variant for the border, fill, and text |

Allowed `variant` values: `critical`, `poor`, `fair`, `good`, `excellent`, `neutral`.

---

## Theming

All visual styles are resolved from CSS custom properties at render time, falling back to built-in defaults. Override them on any ancestor element or the component itself.

| CSS Custom Property             | Default   | Description            |
| ------------------------------- | --------- | ---------------------- |
| `--datavis-label-outside-color` | `#5A6570` | Spoke label text color |
| `--datavis-legend-color`        | `#5A6570` | Legend item text color |
| `--datavis-legend-font-size`    | `0.75rem` | Legend item font size  |

Note: `backgroundColor` and `gridLineColor` are set via component properties rather than CSS custom properties.

### Custom styling example

```html
<div style="--datavis-legend-color: #333; --datavis-legend-font-size: 1rem;">
  <aiux-visualizations-spider .data="${data}"></aiux-visualizations-spider>
</div>
```

---

## Rendering Details

- **Chart type** — Highcharts polar area chart with `gridLineInterpolation: 'polygon'`.
- **Background** — Custom SVG polygon path cloned from the outermost yAxis grid line, drawn in a render callback to avoid z-index issues.
- **Series** — One invisible background series (for polygon sizing) plus one `area` series per value column.
- **Grid** — Radial polygon grid with 4 tick marks by default. The yAxis max is auto-calculated and rounded up to the nearest tick interval.
- **Pane** — 70% of container size.
- **Spacing** — `[10, 30, 15, 30]` (top, right, bottom, left).
- **Labels** — When `labels="value"`, data values are displayed at each point with a distance of 20px from the spoke axis.

---

## Design Decisions

### 1. Polar area chart over dedicated radar module

The spider chart reuses Highcharts' built-in polar chart support (`chart.polar: true`) with `area` series rather than requiring a separate Highcharts module. This keeps the bundle size minimal.

### 2. Background polygon via render callback

The background polygon is drawn as a custom SVG element in a Highcharts render callback rather than using a pane background. This ensures the polygon clips correctly to the grid shape and renders behind all series.

### 3. Axis resolution reuse

Spider reuses `resolveAxes()` and `validateAxisConfig()` from the axis package to avoid duplicating dimension/value column resolution logic.

### 4. Excluded column meanings

Columns with meaning `change`, `changePercentage`, or `changeReference` are supplementary data not suitable for spider chart visualization and are silently excluded from series rendering.
