# Arc Component

## Import

```js
import '@servicenow/aiux-components-visualizations-arc';
```


## Overview

Arc visualization component for single-value gauge and dial charts with min/max ranges, optional rule-based zone coloring, gradient arcs, animated rendering, and configurable center content.

- **Gauge** renders a semi-circular (180 degrees) Highcharts `solidgauge` chart with a colored value arc, optional outer ring zone segments derived from rules, and centered data labels.
- **Dial** renders a full-circle (360 degrees) Highcharts `solidgauge` chart with an optional gradient arc and no outer ring zones. By default it shows the column label and formatted value in the center (`centerContent` defaults to `data` mode). Set `centerContent: {mode: 'rules'}` to show a rules-derived badge pill instead.

The component inherits `data` and `renderingOverrides` from the `DataDriven` mixin, which handles the merge rendering layer (Layer 1). The `Highcharts` mixin manages the chart lifecycle, and the `Visualization` base class handles error state rendering. See the base and highcharts package documentation for details on those shared concerns.

Arc uses the `Highcharts` mixin from `@servicenow/aiux-components-visualizations-highcharts`, which manages the Highcharts chart lifecycle (create, update, destroy) automatically.

## Usage

```js
import '@servicenow/aiux-components-visualizations-arc';
```

```js
// Gauge (default)
html`<aiux-visualizations-arc
  .data=${dataResponse}
  type="gauge"
  min="0"
  max="100"
></aiux-visualizations-arc>`;

// Dial with a gradient value arc and rules-mode center badge
html`<aiux-visualizations-arc
  .data=${dataResponse}
  type="dial"
  start-angle="270"
  .gradient=${{startColor: '#22c55e', endColor: '#16a34a'}}
  .centerContent=${{mode: 'rules', size: 'medium'}}
></aiux-visualizations-arc>`;
```

`data` is a `DataResponse` object (see the base package). Object/array-valued
properties (`data`, `gradient`, `centerContent`, `renderingOverrides`) must be
set as Lit property bindings (`.prop=${...}`), not string attributes.

## Properties

> **Inherited from DataDriven mixin:** `data`, `renderingOverrides`, `interactions` -- see the base package `README.MD` for full documentation of these properties, including tooltip behavior, label resolution, color rules, and the `interactions` (`InteractionConfig`) contract that drives click drill-down metadata.

### `type` (optional)

The visualization type to render. Determines the rendering path.

Accepted values:

- `gauge` -- semi-circular Highcharts solidgauge (180 degrees, default)
- `dial` -- full-circle Highcharts solidgauge (360 degrees)

### `min` (optional)

The minimum value for the gauge/dial range. Default: `0`.

### `max` (optional)

The maximum value for the gauge/dial range. Default: `100`.

### `animated` (optional)

Enables Highcharts entry animation for gauge/dial. Default: `false`. When true, the value arc animates from zero to the current value with `duration: 800` and `easing: 'easeOutQuad'`.

### `showNumbers` (optional)

HTML attribute: `show-numbers`. Controls whether tick numbers and rule zone labels are shown on the gauge. Default: `true`. When `false`, hides all axis tick labels and the zone connector labels. Applies to gauge only — dial never shows tick numbers.

### `centerContent` (optional)

Controls what is displayed in the center of the arc. Accepts a `CenterContentConfig` object (defined in `@servicenow/aiux-components-visualizations-base`). Defaults to `mode: 'data'` with `size: 'medium'`.

```typescript
type CenterContentConfig =
  | {mode: 'data'; size?: Size; inverted?: boolean}
  | {mode: 'rules'; size?: Size; inverted?: boolean}
  | {mode: 'hidden'}
  | {
      mode: 'custom';
      size?: Size;
      inverted?: boolean;
      label?: string;
      value?: string;
    };

type Size = 'small' | 'medium' | 'large';
```

#### `mode`

| Mode               | Center label                      | Center value                                              |
| ------------------ | --------------------------------- | --------------------------------------------------------- |
| `'data'` (default) | Column label from `arcData.label` | Formatted metric value                                    |
| `'rules'`          | Label from the matching rule zone | Formatted metric value (gauge); colored badge pill (dial) |
| `'custom'`         | `centerContent.label ?? ''`       | `centerContent.value ?? ''`                               |
| `'hidden'`         | _(nothing rendered)_              | _(nothing rendered)_                                      |

For `'rules'` mode, zone lookup is **position-based** — the first threshold the value falls below determines the zone (same approach as gauge arc coloring). This correctly handles sequential `< threshold` zones regardless of whether rules have colors.

#### `size`

Controls the font-size tier for the center label and value, mapped to CSS custom properties:

| Size       | Value font CSS var                                      | Label font CSS var                                      |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `'large'`  | `--datavis-{gauge\|dial}-center-value-large-font-size`  | `--datavis-{gauge\|dial}-center-label-large-font-size`  |
| `'medium'` | `--datavis-{gauge\|dial}-center-value-medium-font-size` | `--datavis-{gauge\|dial}-center-label-medium-font-size` |
| `'small'`  | `--datavis-{gauge\|dial}-center-value-small-font-size`  | `--datavis-{gauge\|dial}-center-label-small-font-size`  |

#### `inverted`

When `true`, the value is rendered above the label (or badge). Default: `false` (label above value). Does not apply to `'hidden'` mode.

#### `label` / `value` (custom mode only)

Pre-formatted strings used when `mode` is `'custom'`. If omitted, the respective field renders as an empty string.

### `startAngle` (optional)

HTML attribute: `start-angle`. Where the dial arc begins, expressed as a clockwise angle in degrees (0–360). Only applies when `type` is `'dial'`. Default: `270`.

| Value | Clock position             |
| ----- | -------------------------- |
| `0`   | Right (3 o'clock)          |
| `90`  | Bottom (6 o'clock)         |
| `180` | Left (9 o'clock)           |
| `270` | Top (12 o'clock) — default |

Internally the value is converted to Highcharts' solidgauge convention (where 0 = top) via `hcAngle = startAngle - 270`. The pane spans a full 360° from there.

### `gradient` (optional)

An optional linear gradient for the dial value arc. Only applies when `type` is `'dial'`. When provided, the gradient takes precedence over any rule-based arc color.

```typescript
{
  startColor: string; // CSS color for gradient start
  endColor: string; // CSS color for gradient end
}
```

## Events

Arc dispatches no custom events of its own. Clicking the arc surfaces the inherited **`visualization:click`** event (bubbles, composed) from the base/Highcharts layer. Arc has a single data point (the metric value), so the payload carries that point plus any drill-down metadata configured via the `interactions` property. Listen on an ancestor:

```js
html`<div
  @visualization:click=${e => {
    const {nativeEvent, ...detail} = e.detail;
    // detail includes the clicked point value + interaction metadata
  }}
>
  <aiux-visualizations-arc .data=${data} type="gauge"></aiux-visualizations-arc>
</div>`;
```

See the base package `README.MD` for the full `visualization:click` detail shape.

## Architecture

Arc extends `Highcharts(DataDriven(Visualization))` with `super([HighchartsMore, HighchartsSolidGauge])`, following the composable mixin pattern. The `Highcharts` mixin manages the chart lifecycle automatically.

```
Arc (extends Highcharts(DataDriven(Visualization))) -- data pipeline owner + Highcharts config builder
  |-- Properties: type, data, renderingOverrides, min, max, animated, gradient, showNumbers, centerContent, startAngle
  |-- Constructor: super([HighchartsMore, HighchartsSolidGauge])
  |-- shouldChartUpdate: rebuild when min/max/type/animated/gradient/interactions/showNumbers/centerContent/data/renderingOverrides change
  |-- buildChartConfig():
  |     gauge --> validateArc + processArc + resolveGaugeTheme --> buildGaugeConfig(ArcData)
  |     dial  --> validateArc + processArc + resolveDialTheme --> buildDialConfig(ArcData)
  |-- Theme resolution: getComputedStyle(this) guarded by isServer
  +-- Highcharts mixin handles chart create/update/destroy
```

### Data Flow

```
                    +-------------------------------------------+
                    |      <aiux-visualizations-arc>             |
                    |   Highcharts(DataDriven(Vis.))             |
                    |                                           |
                    |  data --> merge --> validate --> process   |
                    |                                           |
                    |  buildChartConfig()                       |
                    |    gauge --> resolveGaugeTheme -->         |
                    |              buildGaugeConfig              |
                    |    dial  --> resolveDialTheme -->          |
                    |              buildDialConfig               |
                    |                                           |
                    |  Highcharts mixin handles                 |
                    |  create/update/destroy                     |
                    +-------------------------------------------+
```

### Layer 1: Merge Rendering (DataDriven mixin)

Handled by the base class. See the base package `README.MD` for full details.

The Arc receives a **complete rendering map** where every column in `metadata.columns` has a deterministic rendering entry. All downstream layers can rely on this completeness.

### Layer 2: Validate

**Input:** Merged data (from Layer 1), `min`, `max`
**Output:** Throws on failure, returns void on success.

#### `validateArc(data, min, max)`

1. **No data:** If `data.data` is an empty array, throw `'No data available'`.
2. **Score column exists:** A metric column with empty `groupedBy` (grand total) must exist. Otherwise throw `'No score metric found'`.
3. **Grand total row exists:** At least one data row must have a truthy value in the grand total metric column. Otherwise throw `'No grand total row found in data'`.
4. **Numeric value:** The score value must parse as a number via `getNumericValue`. Otherwise throw `'Score value is not a valid number'`.
5. **Range validity:** `min` must be strictly less than `max`. Otherwise throw `ChartError('Arc min (${min}) must be less than max (${max})')`.

### Layer 3: Process

**Input:** Validated merged data
**Output:** `ArcData` + Highcharts config

#### `processArc(data)` -- arc data extraction

Extracts only the three fields arc needs from the `DataResponse` into an `ArcData` object:

1. **value:** Finds the grand total metric column, extracts the numeric value.
2. **formattedValue:** Formats the value via `formatNumber` using the column's rendering formatting.
3. **label:** Uses `column.label ?? column.key`.

#### `buildGaugeConfig(scoreData, rules, options)` -- gauge-specific

Builds a semi-circular (180 degrees) Highcharts solidgauge config:

- **Outer ring:** `stopsToZoneSeries` at `outerRadius: '112%', innerRadius: '105%'` -- colored zone series with rounded endpoints and gaps between segments (`ZONE_GAP_FRACTION = 0.025`).
- **Inner arc (value):** Single `solidgauge` series, `innerRadius` derived from `arcWidth`, radius `'100%'`, `rounded: true`. Color set on the point (not series) via `resolveValueColor`.
- **Pane:** `center: ['50%', '75%']`, `startAngle: -90`, `endAngle: 90`.
- **Y axis:** `tickPositions: [min, max]` with label distance 30.
- **Data labels:** Centered HTML with label in 13px and formatted value in 28px bold.

#### `buildDialConfig(scoreData, rules, options)` -- dial-specific

Builds a full-circle (360 degrees) Highcharts solidgauge config:

- **No outer ring zones** -- unlike gauge, rules do not produce colored arc segments.
- **Value arc:** Single `solidgauge` series with optional gradient on the point color object. The gradient format uses Highcharts' `{ linearGradient, stops }` notation.
- **Center content:** Controlled by `centerContent` (see property docs). Default mode is `'data'` (label + value). Set `mode: 'rules'` to show a colored badge pill — color and label are resolved by zone using `resolveApplyingRuleApplies` (position-based, not last-matching-wins). Badge rendering: label + color → colored pill; label only (no color) → plain text at `labelFontSize`; no label → badge hidden.
- **Pane:** `center: ['50%', '50%']`. The pane angles are derived from `startAngle` via `hcAngle = startAngle - 270`, `endAngle = hcAngle + 360`. Default (`startAngle: 270`) → `pane.startAngle: 0, pane.endAngle: 360`.
- **Y axis:** Labels disabled.
- **Data labels:** Center content HTML built by `buildCenterContentHtml` (data/custom/hidden modes) or inline badge renderer (rules mode).

#### Rules-to-stops pipeline (gauge only)

`mapRulesToStops(rules, min, max)` converts rendering rules into ordered `[normalizedPosition, color]` pairs for the gauge outer ring:

- Rules with a color but no operator/operand are treated as defaults (placed at the end).
- Threshold rules are sorted by operand ascending and normalized to `[0, 1]`.
- Each stop marks the START of a color segment.

`resolveValueColor(stops, value, min, max)` finds the color for the current value -- the last stop whose position is `<= normalizedValue`.

### Layer 4: Render

**Input:** ChartConfig from buildChartConfig
**Output:** Highcharts chart rendered by the `Highcharts` mixin

The `Highcharts` mixin handles all rendering. Its `willUpdate()` calls `shouldChartUpdate()` and `buildChartConfig()`, then `updated()` calls `createOrUpdateChart()`. On disconnection, the chart is destroyed automatically.

#### Error state rendering

If `buildChartConfig()` throws, the Highcharts mixin catches the error and routes it to `setError(e)` on the `Visualization` base class, which clears `_chartConfig` and renders the error fallback UI.

## Theming via CSS Custom Properties

Gauge and dial styling is controlled through CSS custom properties on the host element. These are read from `getComputedStyle(this)` at render time (guarded by `isServer` from Lit), with SSR-safe fallback defaults.

### Gauge theme properties

| CSS Custom Property                | Type   | Default    | Description                                           |
| ---------------------------------- | ------ | ---------- | ----------------------------------------------------- |
| `--datavis-gauge-arc-width`        | number | `25` (px)  | Value arc thickness                                   |
| `--datavis-gauge-track-color`      | color  | `#E5E7EB`  | Background track                                      |
| `--datavis-gauge-tick-color`       | color  | `#2C323F`  | Tick labels and zone label connector text color       |
| `--datavis-gauge-label-color`      | color  | `#2C323F`  | Center label text color                               |
| `--datavis-gauge-label-font-size`  | string | `1.125rem` | Center label font size                                |
| `--datavis-gauge-value-color`      | color  | `#2C323F`  | Center value text color                               |
| `--datavis-gauge-value-font-size`  | string | `3rem`     | Center value font size                                |
| `--datavis-gauge-label-offset`     | number | `-80`      | Vertical offset (px) for center data labels           |
| `--datavis-gauge-connector-length` | number | `0.1`      | Zone label connector line length (fraction of radius) |

### Gauge center content properties

These variables control the center label/value when `centerContent` is set. Each size tier maps to a separate variable pair so they can be tuned independently.

| CSS Custom Property                             | Default                | Description                               |
| ----------------------------------------------- | ---------------------- | ----------------------------------------- |
| `--datavis-gauge-center-value-large-font-size`  | `--font-size-5xl`      | Value font size for `size: 'large'`       |
| `--datavis-gauge-center-label-large-font-size`  | `--font-size-lg`       | Label font size for `size: 'large'`       |
| `--datavis-gauge-center-value-medium-font-size` | `--font-size-4xl`      | Value font size for `size: 'medium'`      |
| `--datavis-gauge-center-label-medium-font-size` | `--font-size-base`     | Label font size for `size: 'medium'`      |
| `--datavis-gauge-center-value-small-font-size`  | `--font-size-3xl`      | Value font size for `size: 'small'`       |
| `--datavis-gauge-center-label-small-font-size`  | `--font-size-sm`       | Label font size for `size: 'small'`       |
| `--datavis-gauge-center-large-label-offset`     | `-80`                  | Vertical offset (px) for `size: 'large'`  |
| `--datavis-gauge-center-medium-label-offset`    | `-70`                  | Vertical offset (px) for `size: 'medium'` |
| `--datavis-gauge-center-small-label-offset`     | `-60`                  | Vertical offset (px) for `size: 'small'`  |
| `--datavis-gauge-center-spacing`                | `--space-sm`           | Gap between label and value               |
| `--datavis-gauge-center-label-font-weight`      | `--font-weight-normal` | Font weight for the label                 |
| `--datavis-gauge-center-value-font-weight`      | `--font-weight-medium` | Font weight for the value                 |

### Dial theme properties

| CSS Custom Property               | Type   | Default    | Description                                           |
| --------------------------------- | ------ | ---------- | ----------------------------------------------------- |
| `--datavis-dial-arc-width`        | number | `20` (px)  | Value arc thickness                                   |
| `--datavis-dial-track-color`      | color  | `#E5E7EB`  | Background track                                      |
| `--datavis-dial-tick-color`       | color  | `#2C323F`  | Tick label text color                                 |
| `--datavis-dial-label-color`      | color  | `#2C323F`  | Center label text color                               |
| `--datavis-dial-label-font-size`  | string | `0.875rem` | Center label font size                                |
| `--datavis-dial-value-color`      | color  | `#2C323F`  | Center value text color                               |
| `--datavis-dial-value-font-size`  | string | `2.25rem`  | Center value font size                                |
| `--datavis-dial-connector-length` | number | `0.1`      | Zone label connector line length (fraction of radius) |

### Dial center content properties

| CSS Custom Property                            | Default                | Description                               |
| ---------------------------------------------- | ---------------------- | ----------------------------------------- |
| `--datavis-dial-center-value-large-font-size`  | `--font-size-5xl`      | Value font size for `size: 'large'`       |
| `--datavis-dial-center-label-large-font-size`  | `--font-size-base`     | Label font size for `size: 'large'`       |
| `--datavis-dial-center-value-medium-font-size` | `--font-size-4xl`      | Value font size for `size: 'medium'`      |
| `--datavis-dial-center-label-medium-font-size` | `--font-size-sm`       | Label font size for `size: 'medium'`      |
| `--datavis-dial-center-value-small-font-size`  | `--font-size-3xl`      | Value font size for `size: 'small'`       |
| `--datavis-dial-center-label-small-font-size`  | `--font-size-xs`       | Label font size for `size: 'small'`       |
| `--datavis-dial-center-large-label-offset`     | `-40`                  | Vertical offset (px) for `size: 'large'`  |
| `--datavis-dial-center-medium-label-offset`    | `-30`                  | Vertical offset (px) for `size: 'medium'` |
| `--datavis-dial-center-small-label-offset`     | `-30`                  | Vertical offset (px) for `size: 'small'`  |
| `--datavis-dial-center-spacing`                | `--space-sm`           | Gap between label/badge and value         |
| `--datavis-dial-center-label-font-weight`      | `--font-weight-normal` | Font weight for the label / badge text    |
| `--datavis-dial-center-value-font-weight`      | `--font-weight-normal` | Font weight for the value                 |

The `arcWidth` is converted to a Highcharts `innerRadius` percentage via `arcWidthToInnerRadius()`, which uses a 150px reference radius and clamps the result between 5% and 40% of the radius.

## Data Requirements

Both types require the same base data shape from `DataResponse`:

### Required columns

| Column `meaning` | `groupedBy`  | Description                           |
| ---------------- | ------------ | ------------------------------------- |
| `metric`         | `[]` (empty) | The primary score value (grand total) |

Arc only reads the metric column from the DataResponse. Optional columns like `target`, `change`, and `changePercentage` are score-card concerns and are not used by arc.

## Highcharts Mixin

Arc uses the `Highcharts` mixin from `@servicenow/aiux-components-visualizations-highcharts`, which manages the chart lifecycle automatically. The required Highcharts modules are passed to the constructor:

```typescript
constructor() {
  super([HighchartsMore, HighchartsSolidGauge]);
}
```

The `Highcharts` mixin manages the full chart lifecycle:

- **Create/Update:** The component calls `createOrUpdateChart(config)` in `updated()`. The mixin creates the chart on the first call and updates it on subsequent calls.
- **Destroy:** When the component disconnects, the mixin destroys the chart automatically.

No manual chart lifecycle management is needed in the Arc component.

## Existing Codebase Integration

### Patterns to Follow

- **Component base class:** Extends `Highcharts(DataDriven(Visualization))` using composable mixins from `@servicenow/aiux-components-visualizations-base` and `@servicenow/aiux-components-visualizations-highcharts`, which ultimately extend `AIUXElement`.
- **Mixin pattern:** Passes `[HighchartsMore, HighchartsSolidGauge]` to `super()` -- same composable mixin pattern as the Axis component.
- **Data utilities:** Uses `resolveColumns`, `getCellValue`, `getNumericValue`, `getElementLabel` from `@servicenow/aiux-components-visualizations-base`.
- **Formatting:** Uses `formatNumber` from `@servicenow/aiux-components-visualizations-base`.
- **Rules:** Uses `evaluateRules` from `@servicenow/aiux-components-visualizations-base`.
- **SSR safety:** Theme resolution returns hardcoded defaults when `isServer` is true. `getComputedStyle` is only called on the client.
- **Custom element registration:** Uses `@customElement('aiux-visualizations-arc')`.
- **Reactive properties:** `data` and `renderingOverrides` are inherited from the `DataDriven` mixin. `type`, `min`, `max`, `animated`, `gradient`, `showNumbers`, `centerContent`, and `startAngle` are declared as Lit reactive properties on Arc.

### Exports

The component, processors, validators, config builders, center content helper, accessibility helpers, and relevant types are exported from `src/index.ts`. The full export list:

- `Arc` — the Lit web component
- `processArc` — Layer 3 data extraction
- `validateArc` — Layer 2 validation
- `buildGaugeConfig`, `buildDialConfig` — Highcharts config builders
- `mapRulesToStops` — rules-to-stops conversion for gauge arc coloring (re-exported from base via `build-arc.js`)
- `resolveCenterContent(arcData, rules, centerContent, min, max)` — resolves center label/value strings per mode; returns `null` for `'hidden'`
- `resolveGaugeTheme`, `resolveDialTheme` — CSS custom property → theme resolvers
- `getArcPointDescription`, `buildArcA11yOptions` — accessibility helpers
- Types: `ArcData`, `ArcProps`, `GaugeTheme`, `GaugeOptions`, `DialTheme`, `Gradient`, `DialOptions`, `CenterContentConfig`

Note: `resolveApplyingRuleApplies`, `buildCenterContentHtml`, and `resolveValueColor` are internal helpers used within the package but are **not** part of the barrel (`src/index.ts`) public surface.

## File Structure

```
components/visualizations/arc/
  README.md               # This document
  package.json
  index.js                # Version selector
  src/
    index.ts              # Barrel exports
    types.ts              # TypeScript types (ArcProps, GaugeTheme, DialTheme, Gradient, etc.)
    arc.ts                    # The Lit web component (extends Highcharts(DataDriven(Visualization))) -- config builder + theme resolver
    validate-arc.ts           # Layer 2: Self-contained arc validation (data + min/max range check)
    process-arc.ts            # Layer 3: Data extraction into ArcData (value, formattedValue, label)
    constants.ts              # Shared numeric constants (PANE_SIZE_FRACTION, CHORD_INSET, etc.) — imported by build-arc.ts and build-center-content.ts
    build-arc.ts              # Layer 3: Highcharts config builder (gauge + dial + shared helpers)
    build-center-content.ts   # Center content resolution + HTML building (resolveCenterContent, resolveApplyingRuleApplies, buildCenterContentHtml)
    resolve-theme.ts          # Pure functions: CSS custom property -> GaugeTheme / DialTheme
    rotate-tick-labels.ts     # Helper for rotating gauge axis tick labels
    build-a11y-options.ts     # Accessibility options builder for Highcharts config
    get-point-description.ts  # Point description for screen reader support
    arc-empty.stories.js              # Storybook: empty/no-data state story
    stories/arc-gauge.stories.js      # Storybook: basic gauge stories
    stories/arc-dial.stories.js       # Storybook: basic dial stories
    stories/arc-center-content.stories.js # Storybook: centerContent feature stories
    stories/arc-interactions.stories.js   # Storybook: click event stories
    stories/arc-themes.stories.js         # Storybook: CSS custom property theming stories
    stories/arc.stories.data.js           # Storybook: shared data fixtures and utilities
  test/
    validate-arc.test.ts        # Arc validation (data + min/max range)
    process-arc.test.ts         # ArcData extraction
    build-arc.test.ts           # Gauge config builder + resolveCenterContent + resolveApplyingRuleApplies
    build-dial.test.ts          # Dial config builder + centerContent modes
    resolve-theme.test.ts       # Theme resolution (SSR defaults, CSS overrides, edge cases)
    build-a11y-options.test.ts  # Accessibility options builder
    get-point-description.test.ts # Point description generation
    arc.test.ts                 # Arc component (routing, lifecycle, error handling)
```

## Testing Architecture

All tests run via Vitest in a Node (SSR) environment -- no browser or JSDOM. This shapes how different layers of the component are tested.

### Testing strategy by layer

| Layer          | What                                                                                                                           | How tested                                                                                                                                                                                               | Test file(s)                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Pure functions | `validateArc`, `processArc`, `buildGaugeConfig`, `buildDialConfig`, `mapRulesToStops`, `resolveGaugeTheme`, `resolveDialTheme` | Direct function calls with crafted inputs. Full branch coverage including edge cases (empty data, NaN, whitespace, non-numeric, boundary values).                                                        | `validate-arc.test.ts`, `process-arc.test.ts`, `build-arc.test.ts`, `build-dial.test.ts`, `resolve-theme.test.ts` |
| Arc component  | `buildChartConfig` routing, `shouldChartUpdate` rebuild triggers, error propagation                                            | Tests verify correct delegation to gauge vs. dial paths, that validation errors propagate to `setError` via the Highcharts mixin, and that `shouldChartUpdate` triggers rebuilds when properties change. | `arc.test.ts`                                                                                                     |
| Accessibility  | `buildArcA11yOptions`, `getArcPointDescription`                                                                                | Direct function calls verifying screen reader text and Highcharts a11y config.                                                                                                                           | `build-a11y-options.test.ts`, `get-point-description.test.ts`                                                     |

### What is NOT unit-tested

- **Highcharts rendering output** -- the actual visual rendering of charts is verified via Storybook stories and visual inspection, not unit tests. Unit tests verify the Highcharts _config object_ is correct.
- **`Visualization` base class error rendering** -- error state UI is owned by the `Visualization` base class and tested in the base package.
- **Highcharts mixin lifecycle** -- managed by the `Highcharts` mixin, tested in the highcharts package.

## Design Decisions

### 1. Composable Mixin Architecture

**Decision:** Arc extends `Highcharts(DataDriven(Visualization))`, using composable mixins instead of a monolithic base class. The `Highcharts` mixin manages the chart lifecycle (create, update, destroy) and the reactive update cycle (`willUpdate`/`updated`), the `DataDriven` mixin handles Layer 1 merge rendering, and the `Visualization` base class provides error boundary rendering.

### 2. Single component (no sub-components)

**Decision:** Arc is a single component that directly builds the Highcharts config in `buildChartConfig`. Since Arc only handles gauge/dial (no score type), there is no need for a router or rendering delegates. Theme resolution and config building happen inline.

### 3. Theme via CSS custom properties

**Decision:** Gauge and dial visual properties (arc width, track color, label color, value color) are read from CSS custom properties at render time, not passed as component properties. Theme resolution happens in `buildChartConfig` via `getComputedStyle(this)`, guarded by `isServer` from Lit. On the server, hardcoded defaults are used.

### 4. shouldChartUpdate for all display-affecting properties

**Decision:** The Highcharts mixin's `willUpdate` calls `shouldChartUpdate()` to determine when to rebuild `_chartConfig`. Arc's implementation returns true when `data`, `renderingOverrides`, `min`, `max`, `type`, `animated`, `gradient`, `interactions`, `showNumbers`, or `centerContent` change -- because all of these affect the Highcharts config output.

### 5. Gauge outer ring zones vs. dial badge

**Decision:** Gauge and dial use rules differently:

- **Gauge:** Rules map to colored arc segments on an outer ring (`stopsToZoneSeries`), and the value arc color is determined by which zone the value falls in.
- **Dial:** Rules produce a badge pill (color + label) below the value. No outer ring zones. The arc color comes from the `gradient` property (if provided), not from rules.

### 6. Center content as a composable property

**Decision:** Center label/value display is controlled by a single `centerContent` property rather than separate `showLabel`, `labelMode`, `labelSize` properties. The discriminated union on `mode` lets TypeScript enforce that `label`/`value` fields only exist for `'custom'` mode and that `inverted` is unavailable for `'hidden'` mode.

The center content HTML is built in `build-center-content.ts` (shared between gauge and dial), using per-element chord-width calculations so each line's `max-width` respects the available space at its vertical position in the inner circle. In inverted mode the label is lower in the circle, giving it a wider chord and thus more room.

### 7. Color sanitization in dial badge

**Decision:** The badge background color from `resolveApplyingRuleApplies` is validated against `/^#[0-9A-Fa-f]{3,8}$/` before embedding in the HTML data label. Invalid values are treated as absent (plain text badge). This prevents HTML injection via malicious rule colors.

`resolveApplyingRuleApplies` uses **position-based zone lookup** (first threshold the value falls below) rather than `evaluateRules` (last-matching-wins). This correctly identifies the zone even for colorless rules and avoids the bug where the default rule always wins for sequential `< threshold` zones.

### 8. Zone gap via shrinking endpoints

**Decision:** The visual spacing between gauge outer ring segments is achieved by making each zone slightly shorter (`ZONE_GAP_FRACTION = 0.025`), not by a literal Highcharts gap property. Adjacent zone endpoints are shrunk inward so rounded endpoints don't overlap.
