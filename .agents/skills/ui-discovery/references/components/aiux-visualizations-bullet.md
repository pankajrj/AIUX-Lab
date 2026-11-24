# Bullet

## Import

```js
import '@servicenow/aiux-components-visualizations-bullet';
```


Bullet chart visualization for comparing a metric against a target or range, with min/max bounds, rule-based coloring, optional animation, and DataResponse-driven labels and values.

## Architecture

The component uses a split architecture where the outer component owns the data pipeline and the inner component owns the Highcharts rendering lifecycle.

```
  DataDriven mixin (inherited)
  ┌─────────────────────────────────────────┐
  │  [Properties: data, renderingOverrides] │
  │                    |                    │
  │          Layer 1: Merge Rendering       │
  └────────────────────|────────────────────┘
                       |
  Bullet (outer component)
  ┌────────────────────|────────────────────┐
  │  [+ Properties: min, max, animated    ]│
  │                    |                    │
  │          Layer 2: Validate              │
  │                    |                    │
  │          Layer 3: Process               │
  │                    |                    │
  └────────────────────|────────────────────┘
                       |
  BulletBar (inner delegate)
  ┌────────────────────|────────────────────┐
  │  [scoreData, rules, min, max          ]│
  │                    |                    │
  │   HTML header (label + fraction)        │
  │                    |                    │
  │   Layer 4: Build Highcharts Config      │
  │                    |                    │
  │   Highcharts lifecycle (mixin)          │
  └─────────────────────────────────────────┘
```

1. **Merge Rendering** — handled by the `DataDriven` mixin (base package)
2. **Validate** — `src/process-bullet-data.ts` (`validateBulletData()`)
3. **Process** — `src/process-bullet-data.ts` (`processBulletData()`)
4. **Render** — `src/bullet-bar-utils.ts` (`buildBarConfig()`) + `src/build-bullet.ts` (`buildBulletConfig()`) + `src/bullet-bar.ts` (Lit component with Highcharts mixin)

## Quick Start

```html
<aiux-visualizations-bullet
  .data="${analyticsData}"
></aiux-visualizations-bullet>
```

---

## Properties

| Property             | Type                | Attribute  | Default | Description                                    |
| -------------------- | ------------------- | ---------- | ------- | ---------------------------------------------- |
| `data`               | `DataResponse`      | —          | —       | V2 DataResponse from analytics query           |
| `renderingOverrides` | `RenderingOverride` | —          | —       | Per-column rendering overrides (colors, rules) |
| `min`                | `number`            | `min`      | `0`     | Chart minimum value                            |
| `max`                | `number`            | `max`      | `100`   | Chart maximum value                            |
| `animated`           | `boolean`           | `animated` | `false` | Enable chart animations                        |
| `tooltip`            | `TooltipDefinition` | —          | —       | Tooltip config (enable/disable, custom text)   |

All object properties are set via Lit property binding (`.prop=${value}`). Primitive properties can also be set as HTML attributes.

---

## Data Requirements

- **At least 1 metric column** with `meaning: 'metric'` and `groupedBy: []` (grand total, no grouping). Provides the primary numeric value.
- **Optional target column** with `meaning: 'target'`. When present, a target marker is rendered on the bar and the fraction displays as `value/target`.

When no target column is present, the fraction displays as `value/max`.

---

## Data Processing

The data pipeline extracts a `BulletData` object from the `DataResponse`:

```typescript
interface BulletData {
  label: string; // Column label for display
  value: number; // Numeric metric value
  formattedValue: string; // Formatted display text
  target: {
    value: number;
    formattedValue: string;
  } | null; // Optional target marker
}
```

**Processing steps:**

1. `validateBulletData()` — ensures the data has at least one metric column with a grand-total row.
2. `processBulletData()` — extracts the metric value, label, formatted value, and optional target from the data response.

---

## Rendering Output

The component renders a header with label and fraction text, followed by a Highcharts bullet bar:

```
┌──────────────────────────────────────┐
│  Label                    42/100     │  ← HTML header
│  ████████████░░░░░░░░░░░░░░░░░░░░░  │  ← Highcharts bullet bar
│  0                            100    │  ← HTML min/max range labels
└──────────────────────────────────────┘
```

- The **label** displays the metric column label.
- The **fraction** displays `value/target` or `value/max` (raw numeric values).
- The **bar** shows the current value as a filled bar against a gray track, with an optional target marker.
- The **range labels** display the `min` and `max` values below the bar.

---

## Color Rules

Color is applied to the bullet bar via rendering rules from `renderingOverrides`, using **stop-based threshold coloring**. Rules are not matched one at a time; instead they are compiled into an ordered set of color stops across the `min`–`max` range (`mapRulesToStops`), and the current value's color is looked up from those stops (`resolveValueColor`):

1. **Threshold rules** (a rule with an `operator` and numeric `operand`) are sorted by `operand` ascending. Each threshold color applies to the segment **below** that threshold (and above the previous threshold).
2. **The default rule** (a rule with no `operator`/`operand`) applies to everything **above the last threshold**.
3. The **current value's color** is resolved from the last stop whose normalized position is `<=` the value's normalized position on the range.

The `operator` is only used to identify a rule as a threshold vs. the default — the direction (`less`, `greater`, etc.) does not change the segmentation. Order the thresholds by their `operand` values, ascending, to get predictable bands.

```html
<aiux-visualizations-bullet
  .data="${data}"
  min="0"
  max="100"
  .renderingOverrides=${{
    columns: {
      score: {
        presentation: {
          rules: [
            { operator: 'less', operand: '50', applies: { color: '#ef4444' } },
            { operator: 'less', operand: '80', applies: { color: '#f59e0b' } },
            { applies: { color: '#22c55e' } }
          ]
        }
      }
    }
  }}
></aiux-visualizations-bullet>
```

With `min="0"` and `max="100"`, the rules above produce three bands: red for values `0–50`, amber for `50–80`, and green (the default) for `80–100`. A value of `42` resolves to red; `65` resolves to amber; `90` resolves to green.

---

## Theming

Visual styles are resolved from CSS custom properties at render time, falling back to built-in defaults. Override them on any ancestor element or the component itself.

### Highcharts bar theme (resolved via `resolveBulletTheme()`)

| CSS Custom Property            | Default   | Description              |
| ------------------------------ | --------- | ------------------------ |
| `--datavis-bullet-bar-height`  | `20`      | Bullet bar height (px)   |
| `--datavis-bullet-track-color` | `#E5E7EB` | Background track color   |
| `--datavis-bullet-title-color` | `#2C323F` | Label text color         |
| `--datavis-bullet-value-color` | `#6B7280` | Fraction text color      |
| `--datavis-target-color`       | `#2C323F` | Target marker line color |

### Header CSS variables (applied directly in component styles)

| CSS Custom Property                | Default   | Description               |
| ---------------------------------- | --------- | ------------------------- |
| `--datavis-bullet-title-font-size` | `14px`    | Label font size           |
| `--datavis-bullet-value-font-size` | `12px`    | Fraction font size        |
| `--bullet-chart-height`            | `28px`    | Chart container height    |
| `--datavis-bullet-tick-color`      | `#2C323F` | Min/max range label color |

### Custom styling example

```html
<div
  style="--datavis-bullet-title-color: #1e293b; --datavis-bullet-track-color: #f1f5f9;"
>
  <aiux-visualizations-bullet .data="${data}"></aiux-visualizations-bullet>
</div>
```

---

## Accessibility

The component provides accessibility support via `buildBulletA11yOptions()`:

- ARIA labels describe the chart value, range, and optional target.
- Keyboard navigation is enabled within the Highcharts instance.
- A live region (`aria-live="polite"`) in the outer component announces dynamic updates to screen readers.

---

## Design Decisions

### 1. Two-component architecture

The outer `<aiux-visualizations-bullet>` owns the `DataDriven` data pipeline (validation, processing, error rendering), while the inner `<aiux-visualizations-bullet-bar>` owns the Highcharts lifecycle. This separation allows the data layer to be tested independently of Highcharts rendering.

### 2. No Highcharts mixin on outer component

Unlike most other visualization components, the outer Bullet component does not use the `Highcharts` mixin directly. It extends `DataDriven(Visualization)` only. The Highcharts mixin is applied to the inner `BulletBar` delegate, keeping the data pipeline decoupled from the rendering engine.

### 3. HTML header over Highcharts labels

The label and fraction text are rendered as plain HTML above the chart rather than using Highcharts data labels. This gives full CSS control over typography and avoids Highcharts' label positioning limitations for small chart heights.

### 4. Inverted bullet chart

The Highcharts bullet chart is rendered with `chart.inverted: true` to produce a horizontal bar. The chart container has a fixed height (`--bullet-chart-height: 28px`) to keep the bar compact.
