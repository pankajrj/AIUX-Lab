# aiux-date-range-picker

## Import

```js
import '@servicenow/aiux-components-date-range-picker';
```


Date range picker for selecting start and end dates from quick presets or a calendar popup. Renders a trigger button with preset sidebar, calendar, and text inputs; selections are pending until Apply and emit date-filter events.

---

## Usage

```html
<aiux-date-range-picker
  date-format="DD Mon YYYY"
  presets-label="Active during"
  default-label="Date range"
></aiux-date-range-picker>
```

```js
const picker = document.querySelector('aiux-date-range-picker');

// dateRangePresets is optional — defaults to a standard set of relative ranges
// (Last 7 days, Last week, Last 30 days, Last month, Last 3 months, Last 6 months, Last year, Year-to-date).
// Override only if you need custom presets:
picker.dateRangePresets = [
  {
    id: 'last_7_days',
    label: 'Last 7 days',
    payload: {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
  },
  {
    id: 'last_30_days',
    label: 'Last 30 days',
    payload: {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
  }
];

picker.addEventListener('date-filter-apply', e => {
  console.log(e.detail); // { start, end, dynamicTimeRange }
});
```

---

## Properties

| Property            | Attribute             | Type      | Default               | Description                                                                                                                                                                   |
| ------------------- | --------------------- | --------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dateRangePresets`  | `date-range-presets`  | `Array`   | built-in defaults     | List of preset ranges. Each item: `{ id, label, payload: { start, end } }` where dates are `YYYY-MM-DD`. Defaults to 8 standard relative ranges (Last 7 days … Year-to-date). |
| `dynamicTimeRange`  | `dynamic-time-range`  | `String`  | `''`                  | ID of the initially selected preset.                                                                                                                                          |
| `start`             | `start`               | `String`  | `''`                  | Initial start date (`YYYY-MM-DD`).                                                                                                                                            |
| `end`               | `end`                 | `String`  | `''`                  | Initial end date (`YYYY-MM-DD`).                                                                                                                                              |
| `dateFormat`        | `date-format`         | `String`  | `'DD Mon YYYY'`       | Display format for the date text inputs. Supported: `DD Mon YYYY`, `YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY`.                                                                  |
| `presetsLabel`      | `presets-label`       | `String`  | `'Active during'`     | Header label above the preset list.                                                                                                                                           |
| `defaultLabel`      | `default-label`       | `String`  | `'Date range'`        | Trigger button label when no range is selected.                                                                                                                               |
| `enableFutureDates` | `enable-future-dates` | `Boolean` | `false`               | Allow selecting future dates in the calendar.                                                                                                                                 |
| `popupDirection`    | `popup-direction`     | `String`  | `'auto'`              | Popup anchor edge: `'auto'` detects available space and flips if needed, `'left'` or `'right'` forces a side.                                                                 |
| `open`              | `open`                | `Boolean` | `false`               | Open the popup on mount.                                                                                                                                                      |
| `dateFilterView`    | `date-filter-view`    | `String`  | `'calendar-reldates'` | Layout mode: `'calendar-reldates'` (presets + calendar), `'calendar-only'`, `'reldates-only'`.                                                                                |

---

## Events

### `date-filter-apply`

Fired when the user clicks **Apply**.

```js
picker.addEventListener('date-filter-apply', e => {
  console.log(e.detail);
  // {
  //   start: '2026-03-01',           // ISO date string (YYYY-MM-DD)
  //   end:   '2026-03-31',           // ISO date string (YYYY-MM-DD)
  //   dynamicTimeRange: 'last_month' // preset ID, or 'custom' for manual selection
  // }
});
```

### `date-filter-clear`

Fired when the user clicks **Clear**.

```js
picker.addEventListener('date-filter-clear', () => {
  console.log('Range cleared');
});
```

---

## Keyboard interaction

| Key               | Action                                                |
| ----------------- | ----------------------------------------------------- |
| `Enter` / `Space` | Open/close the picker (on trigger button)             |
| `Escape`          | Close the picker                                      |
| `←` `→` `↑` `↓`   | Navigate days in the calendar grid                    |
| `Page Up`         | Go to previous month                                  |
| `Page Down`       | Go to next month                                      |
| `Enter` / `Space` | Select focused day                                    |
| `Tab`             | Move between preset items, inputs, and action buttons |

---

## File structure

```
date-range-picker/
  package.json
  index.js                              ← version router (AIUX_VERSION)
  src/
    index.js                            ← trigger + popup wrapper (aiux-date-range-picker element)
    date-range-content.js               ← presets + calendar + inputs + footer
    calendar.js                         ← day grid, month/year navigation
    date-range-panel.js                 ← wraps calendar
    preset-options.js                   ← preset list
    date-range-picker.stories.js
  test/
    date-range-picker.test.js
    date-range-content.test.js
    calendar.test.js
    date-range-panel.test.js
    preset-options.test.js
```

---

## Running tests

```bash
pnpm --filter @servicenow/aiux-components-date-range-picker test
```
