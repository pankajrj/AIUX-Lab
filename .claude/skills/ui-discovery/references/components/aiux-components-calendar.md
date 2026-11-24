---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-components-calendar'
  - rule: aiux_prefix_for_custom_elements
    identifiers:
      - aiux-calendar-component
  - rule: event_name_namespaced_with_component
    identifiers:
      - calendar-date-month-change
      - calendar-date-select-date
---

# @servicenow/aiux-components-calendar

## Import

```js
import '@servicenow/aiux-components-calendar';
```


Calendar date picker component for the Karuna AIUX platform.

## Installation

```bash
pnpm add @servicenow/aiux-components-calendar
```

## Usage

```javascript
import '@servicenow/aiux-components-calendar';
```

```html
<aiux-calendar-component></aiux-calendar-component>
```

## Properties

| Property       | Type   | Default | Description                           |
| -------------- | ------ | ------- | ------------------------------------- |
| `currentDate`  | `Date` | `null`  | The month/year currently being viewed |
| `selectedDate` | `Date` | `null`  | The currently selected date           |

Both are internal reactive state (`@state()`), so they have **no HTML attribute** — set them as JavaScript properties, since `Date` objects cannot be serialized to attributes. They initialize to `null`; on first client-side render the component defaults both to today's date (server render shows an empty card placeholder until then).

## Events

| Event                         | Detail                          | Description                   |
| ----------------------------- | -------------------------------- | ------------------------------ |
| `calendar-date-select-date`   | `string` (ISO `YYYY-MM-DD`)      | Fired when a day is selected   |
| `calendar-date-month-change`  | `{month: number, year: number}` | Fired on month navigation      |

Both events set `bubbles: true` and `composed: true`, so they cross shadow DOM boundaries and can be listened for from an ancestor of the component.

```javascript
const calendar = document.querySelector('aiux-calendar-component');
calendar.addEventListener('calendar-date-select-date', e => {
  console.log('Selected:', e.detail); // "2024-06-15"
});
calendar.addEventListener('calendar-date-month-change', e => {
  console.log('Month:', e.detail.month, 'Year:', e.detail.year);
});
```

## Programmatic API

```javascript
calendar.selectDay(15); // Select day 15 of the current month
calendar.prevMonth(); // Navigate to previous month
calendar.nextMonth(); // Navigate to next month
```

## Accessibility

Implements the [ARIA APG Date Picker Grid](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) pattern:

- `role="grid"` with `role="row"` and `role="gridcell"` structure
- Roving `tabindex` for efficient keyboard navigation
- `aria-live="polite"` region announces month/year changes
- `aria-selected` on day buttons, `aria-current="date"` on today
- Full date strings in `aria-label` for screen readers

### Keyboard Navigation

| Key                | Action                             |
| ------------------ | ---------------------------------- |
| Arrow Right/Left    | Move to next/previous day          |
| Arrow Down/Up       | Move to next/previous week         |
| Home / End          | Jump to Monday/Sunday of the week  |
| Page Down/Up        | Next/previous month                |
| Shift+Page Down/Up  | Next/previous year                 |
| Enter / Space       | Select the focused date            |

## Reduced Motion

When the host element carries the `reduced-motion` attribute, month transitions use a fade instead of the slide animation, and the day-button hover/focus scale is disabled. Otherwise, month navigation animates with a directional slide (`--duration-lg` / `--ease-high-accel`).

## Tag Name

The canonical custom element tag is `aiux-calendar-component`.

## Dependencies

- `@servicenow/aiux-components-core` (peer)
- `@servicenow/aiux-directive-icon` (peer) — renders the previous/next month chevrons via the `icon()` directive
- `lit` (peer)
- `@lit/localize` (peer)

## Development

```bash
pnpm install
pnpm test
pnpm test:functional
pnpm lint
```
