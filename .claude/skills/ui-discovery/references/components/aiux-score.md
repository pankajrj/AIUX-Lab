# @servicenow/aiux-components-score

## Import

```js
import '@servicenow/aiux-components-score';
```


A score card that displays a single metric with an optional change indicator and target. Driven by a `data` object, it renders a labelled primary value (number, percentage, or ratio with denominator), applies sentiment-based styling, and can show a period-over-period change and, at `md` size, a target/gap summary, exposing an accessible `role="figure"` label describing the value and change.

## Installation

```js
import '@servicenow/aiux-components-score';
```

## Usage

```html
<aiux-score size="md"></aiux-score>

<script type="module">
  const score = document.querySelector('aiux-score');
  // `data` must be set as a JS property (attribute: false) — not an HTML attribute.
  score.data = {
    label: 'SLA Compliance',
    value: 94.5,
    formattedValue: '94.5%',
    format: 'percentage',
    denominator: null,
    formattedDenominator: null,
    sentiment: 'positive',
    color: '#22c55e',
    change: {
      value: 3,
      formattedValue: '+3%',
      isPercentage: true,
      reference: 'vs last month'
    },
    target: null
  };
</script>
```

## Properties

| Property | Attribute         | Type                | Default | Description                                                                                                                                                                                        |
| -------- | ----------------- | ------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`   | — (property only) | `ScoreData \| null` | `null`  | The metric value, label, and optional change indicator to display. Set as a JS property, not an HTML attribute (`attribute: false`). See `components/score/src/types.ts` for the `ScoreData` shape |
| `size`   | `size`            | `'sm' \| 'md'`      | `'md'`  | Card size variant. At `sm`, the target/gap summary and ratio denominator are hidden                                                                                                                |
