---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-components-empty-state-content'
---
# @servicenow/aiux-components-empty-state-content

## Import

```js
import '@servicenow/aiux-components-empty-state-content';
```


A centered empty-state message for when content is unavailable, with a heading, optional body text, an action slot, and a choice of an icon or a slotted illustration as its asset. Matches the Horizon 2.0 design system and is built with Lit 3.

## Installation

```js
import '@servicenow/aiux-components-empty-state-content';
```

## Usage

```html
<aiux-empty-state-content
  icon="circle-question-outline"
  heading-text="No results found"
  body-text="Try adjusting your filters."
  show-action
>
  <button slot="action" class="aiux-btn aiux-btn-primary">Retry</button>
</aiux-empty-state-content>
```

## Properties

| Property (attribute if different)       | Type                       | Default                     | Description                                        |
| --------------------------------------- | -------------------------- | --------------------------- | -------------------------------------------------- |
| `asset`                                 | `'icon' \| 'illustration'` | `'icon'`                    | Whether to render an icon or a larger illustration |
| `icon`                                  | String                     | `'circle-question-outline'` | Icon name used when `asset="icon"`                 |
| `headingText` (attr: `heading-text`)    | String                     | `''`                        | Heading shown below the asset                      |
| `bodyText` (attr: `body-text`)          | String                     | `''`                        | Supporting body copy                               |
| `showBodyText` (attr: `show-body-text`) | Boolean                    | `true`                      | Whether the body text is rendered                  |
| `showAction` (attr: `show-action`)      | Boolean                    | `false`                     | Whether the action slot/button is rendered         |

## Slots

| Slot           | Description                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `action`       | Action area shown when `show-action` is set (e.g. a primary button). Falls back to a default "Action" button. |
| `illustration` | Illustration content shown when `asset="illustration"`. Falls back to a default placeholder SVG.              |

## Dependencies

| Package                               | Type | Range     |
| -------------------------------------- | ---- | --------- |
| `lit`                                  | peer | `^3.3.2`  |
| `@servicenow/aiux-components-core`     | peer | `^4.26.1` |
| `@servicenow/aiux-directive-icon`      | peer | `^1.2.0`  |
