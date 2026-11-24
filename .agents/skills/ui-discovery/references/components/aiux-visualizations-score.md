# Score Component

## Import

```js
import '@servicenow/aiux-components-visualizations-score';
```


## Overview

Score visualization for displaying a single metric as a formatted score card with optional target comparison, change indicator, conditional coloring, click events, and responsive sizing via `<aiux-score>`.

The component does **not** use Highcharts. It does not include the `Highcharts` mixin.

The component inherits `data` and `renderingOverrides` from the `DataDriven` mixin, which handles the merge rendering layer (Layer 1), chart lifecycle, and error state rendering. See the base package documentation for details on those shared concerns.

## Properties

> **Inherited from DataDriven mixin:** `data`, `renderingOverrides` -- see the base package `README.MD` for full documentation of these properties, including tooltip behavior, label resolution, and color rules.

### `size` (optional)

Controls the visual size of the score component.

Accepted values:

- `'sm'` -- small layout
- `'md'` -- medium layout
- `'auto'` -- uses a `ResizeObserver` to switch between `sm` and `md` at a **280px** breakpoint (default)

The `size` property is a single word, so its HTML attribute is also `size`. `data` and `renderingOverrides` are complex objects and must be set via Lit property bindings (`.data`, `.renderingOverrides`), not HTML attributes.

## Usage

```html
<aiux-visualizations-score
  .data="${scoreData}"
  size="auto"
></aiux-visualizations-score>
```

```js
import '@servicenow/aiux-components-visualizations-score';

const scoreData = {
  metadata: {
    columns: {
      incidents: {
        type: 'numerical',
        meaning: 'metric',
        order: 0,
        dataShape: 'single',
        groupedBy: [],
        label: 'Open Incidents'
      }
    }
  },
  data: [['247']],
  rendering: {
    columns: {
      incidents: {
        role: 'value',
        formatting: {type: 'number', options: {}},
        rules: []
      }
    }
  },
  interactions: {}
};

// Listen for click interactions (bubbles + composed):
el.addEventListener('visualization:click', e => {
  console.log(e.detail.values, e.detail.interactionData);
});
```

## Architecture

The component is built as a data pipeline on top of DataDriven(Visualization)'s layered architecture, delegating rendering to `<aiux-score>`.

```
Score (extends DataDriven(Visualization)) -- data pipeline owner + renderer
  |-- Properties: data, renderingOverrides, size
  |-- willUpdate: merge -> buildChartConfig
  |-- buildChartConfig:
  |     processScore(data) -> { scoreData }
  |-- renderChart:
  |     <aiux-score .data .size>
  |-- Owns: ResizeObserver for auto-sizing (client-only)
  |-- Owns: click listener -> dispatches visualization:click (client-only)
  +-- No Highcharts mixin
```

### Data Flow

```
                    +-------------------------------------------+
                    |      <aiux-visualizations-score>           |
                    |          DataDriven(Visualization)           |
                    |                                            |
                    |  data -> merge -> validate -> process      |
                    |                                            |
                    |  buildChartConfig()                       |
                    |    processScore(data) -> { scoreData }     |
                    |                                            |
                    |  renderChart()                             |
                    +---------------------+---------------------+
                                          |
                                          v
                              +-----------------------+
                              |   <aiux-score>        |
                              |                       |
                              |   Props:              |
                              |    - data (ScoreData) |
                              |    - size (sm | md)   |
                              +-----------------------+
```

### Layer 1: Merge Rendering (DataDriven mixin)

Handled by the base class. See the base package `README.MD` for full details.

The Score component receives a **complete rendering map** where every column in `metadata.columns` has a deterministic rendering entry. All downstream layers can rely on this completeness.

### Layer 2: Validate

**Input:** Merged data (from Layer 1)
**Output:** Throws on failure, returns void on success.

#### `validateScore(data)`

1. **No data:** If `data.data` is an empty array, throw `'No data available'`.
2. **Score column exists:** A metric column with empty `groupedBy` (grand total) must exist. Otherwise throw `'No score metric found'`.
3. **Grand total row exists:** At least one data row must have a truthy value in the grand total metric column. Otherwise throw `'No grand total row found in data'`.
4. **Numeric value:** The score value must parse as a number via `getNumericValue`. Otherwise throw `'Score value is not a valid number'`.

The validation is lenient on optional data: missing change, target, or sparkline columns are NOT errors.

### Layer 3: Process

**Input:** Validated merged data
**Output:** `ScoreData`

#### `processScore(data)` -- data transformation

Transforms the `DataResponse` into a `ScoreData` object consumed by the `<aiux-score>` renderer:

1. **Score value:** Finds the grand total metric column, extracts the numeric value, formats it via `formatNumber`.
2. **Rules/color:** Evaluates `evaluateRules(rules, scoreValue)` on the score column's rules; extracts `color` (or `null`).
3. **Label:** Uses `column.label ?? column.key`.
4. **Target:** Finds the `meaning: 'target'` column (if present), extracts its value, computes `gap = scoreValue - targetValue`, formats both with sign.
5. **Change:** Finds `meaning: 'changePercentage'` or `meaning: 'change'` columns derived from the score column (`derivedFrom === scoreCol.key`). Prefers `changePercentage` over `change`. Also finds `meaning: 'changeReference'` for the reference label (e.g., "since last month"). Formats with leading `+`/`-` sign, appends `%` for percentage changes.
6. **Sentiment:** Derived from change value -- `'positive'` if `> 0`, `'negative'` if `< 0`, `'neutral'` otherwise.
7. **Format:** Returns `'ratio'` if target exists, `'percentage'` if score column formatting has a `%` unit, `'plain'` otherwise.

### Layer 4: Render

**Input:** Processed data (`ScoreData`), resolved size
**Output:** Lit template rendered in the component's shadow DOM

The `renderChart()` method renders `<aiux-score .data .size>` with the processed `ScoreData` and the resolved size. If `_chartConfig` is null (e.g., due to an error), it renders an empty container.

An accessibility live region (`role="status"`, `aria-live="polite"`) is always rendered alongside the score for screen reader announcements.

#### Error state rendering

If any layer throws, the component calls `setError(e)` which sets `_error` and clears `_chartConfig`. The `Visualization` base class handles all error state rendering.

## Data Requirements

### Required columns

| Column `meaning` | `groupedBy`  | Description                           |
| ---------------- | ------------ | ------------------------------------- |
| `metric`         | `[]` (empty) | The primary score value (grand total) |

### Optional columns

| Column `meaning`   | `derivedFrom` | Description                                            |
| ------------------ | ------------- | ------------------------------------------------------ |
| `target`           | --            | Target value; enables ratio format + gap calculation   |
| `changePercentage` | score col key | Percentage change (preferred over `change`)            |
| `change`           | score col key | Absolute change (fallback if no percentage)            |
| `changeReference`  | score col key | Reference label for the change (e.g., "vs. last week") |

## Events

The component attaches a `click` listener on itself (client-only, in `connectedCallback`). Clicking anywhere on the score card dispatches a single event:

| Event                 | When                       | `bubbles` | `composed` |
| --------------------- | -------------------------- | --------- | ---------- |
| `visualization:click` | User clicks the score card | `true`    | `true`     |

The event is only dispatched when merged data and a valid chart config exist, and when a grand-total metric column is present. The `detail` payload (`VisualizationClickDetail` from the base package) has this shape:

```js
{
  columns: {
    // keyed by the metric column key
    [metricKey]: {label: string, meaning: string}
  },
  values: {
    [metricKey]: number | null   // the score value
  },
  interactionData: /* drill-down metadata resolved from data.interactions, or null */,
  nativeEvent: Event             // the originating DOM click event
}
```

## Adapter Management

Score does not include the `Highcharts` mixin. The `<aiux-score>` renderer is a pure Lit web component with no Highcharts dependency, so no adapter lifecycle management is needed. This keeps the score bundle lightweight.

## Existing Codebase Integration

### Patterns to Follow

- **Component base class:** Uses `DataDriven(Visualization)` mixin composition from `@servicenow/aiux-components-visualizations-base`, which itself extends `AIUXElement`.
- **Data utilities:** Uses `resolveColumns`, `getCellValue`, `getNumericValue`, `getElementLabel` from `@servicenow/aiux-components-visualizations-base`.
- **Formatting:** Uses `formatNumber` from `@servicenow/aiux-components-visualizations-base`.
- **Rules:** Uses `evaluateRules` from `@servicenow/aiux-components-visualizations-base`.
- **SSR safety:** `ResizeObserver` is only created on the client (guarded by `isServer`). Default resolved size is `'md'`.
- **Custom element registration:** Uses `@customElement('aiux-visualizations-score')`.
- **Reactive properties:** `data` and `renderingOverrides` are inherited from the `DataDriven` mixin. `size` is declared as a Lit reactive property on Score. `_resolvedSize` is internal state.

### Exports

The component, processor, validator, and relevant types are exported from `src/index.ts`:

- `Score` -- the Lit web component
- `processScore` -- data transformation function
- `validateScore` -- data validation function
- `ScoreProps` -- TypeScript interface for component properties

## File Structure

```
components/visualizations/score/
  README.md               # This document
  package.json
  index.js                # Version selector
  src/
    index.ts              # Barrel exports
    types.ts              # TypeScript types (ScoreProps)
    score.ts              # The Lit web component (extends DataDriven(Visualization)) -- data pipeline + renderer
    score.stories.js      # Storybook stories
    validate-score.ts     # Layer 2: Score validation
    process-score.ts      # Layer 3: Data transformation into ScoreData
    find-score-row.ts     # Helper: finds the grand total row in data
  test/
    validate-score.test.js    # Score validation
    process-score.test.js     # Score data transformation
    score.test.ts             # Score component (routing, lifecycle, error handling)
    score-render.test.ts      # Score rendering tests
    score.a11y.test.ts        # Score accessibility tests
    score-client.test.ts      # Browser-only paths (ResizeObserver, connectedCallback)
```

## Testing Architecture

All tests run via Vitest in a Node (SSR) environment -- no browser or JSDOM. This shapes how different layers of the component are tested.

### Testing strategy by layer

| Layer              | What                                                                         | How tested                                                                                                                                                                                                                 | Test file(s)                                      |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Pure functions     | `validateScore`, `processScore`                                              | Direct function calls with crafted inputs. Full branch coverage including edge cases (empty data, NaN, whitespace, non-numeric, boundaries).                                                                               | `validate-score.test.js`, `process-score.test.js` |
| Score component    | `buildChartConfig` routing, `willUpdate` rebuild triggers, error propagation | Test subclass exposes internal methods. Tests verify correct delegation to processScore, that validation errors propagate to `setError`, and that `willUpdate` rebuilds config when properties change.                     | `score.test.ts`, `score-render.test.ts`           |
| Accessibility      | Screen reader support, live region behavior                                  | Tests for accessibility patterns (aria attributes, live regions).                                                                                                                                                          | `score.a11y.test.ts`                              |
| Browser-only paths | `connectedCallback`, `_setupScoreResizeObserver`, ResizeObserver callback    | Separate `score-client.test.ts` file that mocks `lit` with `isServer: false` and stubs browser globals (`ResizeObserver`). Covers code paths gated by `isServer` that are unreachable in the default SSR test environment. | `score-client.test.ts`                            |

### SSR vs. client test split

The Node test environment sets Lit's `isServer` to `true`, which means:

- `Score.connectedCallback()` skips `_setupScoreResizeObserver` -- the ResizeObserver is never created.
- `Score.willUpdate()` skips the observer setup/teardown branch inside the `isServer` guard.

To cover these browser-only paths, the `score-client.test.ts` file uses `vi.mock('lit', ...)` to set `isServer: false` and provides lightweight stubs for `AIUXElement` and `ResizeObserver`. This allows testing:

- The `connectedCallback` -> `_setupScoreResizeObserver` -> `ResizeObserver` callback (simulated entries with different widths to exercise the 280px breakpoint logic).
- The `willUpdate` observer setup/teardown when `size` changes between `'auto'` and explicit values.

### Test subclass pattern

Components are tested via `@customElement`-decorated subclasses that expose `protected`/`private` methods as public wrappers:

```ts
@customElement('test-score')
class TestScore extends Score {
  public testBuildChartConfig(data: DataResponse): ChartConfig | null {
    this._mergedData = data;
    return (this as any).buildChartConfig();
  }
  // ... etc
}
```

This avoids calling Lit lifecycle methods indirectly (which would require a full DOM environment) while still exercising the actual component logic.

### What is NOT unit-tested

- **`<aiux-score>` rendering output** -- the actual visual rendering of the score card is verified via Storybook stories and visual inspection, not unit tests. Unit tests verify the `ScoreData` config object is correct.
- **`Visualization` base class error rendering** -- error state UI is owned by the base class and tested in the base package.

## Theming

The `<aiux-score>` renderer uses CSS custom properties for all visual styling, with sensible defaults:

| CSS Custom Property                     | Default   | Description                     |
| --------------------------------------- | --------- | ------------------------------- |
| `--datavis-score-color`                 | `#172b31` | Primary score value text color  |
| `--datavis-score-font-size`             | `48px`    | Primary score value font size   |
| `--datavis-score-title-color`           | `#172b31` | Score label text color          |
| `--datavis-score-title-font-size`       | `16px`    | Score label font size           |
| `--datavis-score-slash-color`           | `#172b31` | Ratio slash text color          |
| `--datavis-score-slash-font-size`       | `30px`    | Ratio slash font size           |
| `--datavis-score-denominator-color`     | `#4a5e65` | Ratio denominator text color    |
| `--datavis-score-denominator-font-size` | `30px`    | Ratio denominator font size     |
| `--datavis-score-change-positive-color` | `#008a01` | Positive change indicator color |
| `--datavis-score-change-negative-color` | `#d32f2f` | Negative change indicator color |
| `--datavis-score-change-text-color`     | `#384e55` | Change row text color           |
| `--datavis-score-target-bg`             | `#fafafa` | Target footer background        |
| `--datavis-score-target-text-color`     | `#172b31` | Target footer text color        |

When a score has a `color` value (from rules), it is applied as `--datavis-score-color` on the host element, overriding the default primary value color.

## Design Decisions

### 1. Direct DataDriven(Visualization) Extension (No Sub-components)

**Decision:** Score directly extends DataDriven(Visualization) and owns all rendering. Since there is only one rendering path (the `<aiux-score>` web component), there is no need for routing or sub-component delegation.

### 2. No Highcharts Mixin

**Decision:** Score does not include the `Highcharts` mixin. It renders via `<aiux-score>` (a Lit component, not Highcharts) and needs no adapter. This keeps the bundle lightweight with no Highcharts dependency.

### 3. ResizeObserver for auto-sizing

**Decision:** When `size='auto'`, the Score component uses a `ResizeObserver` (client-only) with a 280px breakpoint to switch between `sm` and `md` layouts. The observer is set up in `connectedCallback` and torn down in `disconnectedCallback`. Default resolved size is `'md'`.

### 4. Shared validation and processing

**Decision:** The `validateScore` and `processScore` functions are standalone exports, making them reusable by other components that need score data processing. The validation is strict on required data (score column and value) but lenient on optional data (change, target).

### 5. willUpdate rebuild for size changes

**Decision:** The DataDriven mixin's `willUpdate` rebuilds `_chartConfig` when `data` or `renderingOverrides` change. Score's `willUpdate` override additionally manages the ResizeObserver lifecycle when `size` changes -- setting up the observer when switching to `'auto'` and tearing it down when switching to an explicit size.
