# @servicenow/aiux-components-time-selector

## Import

```js
import '@servicenow/aiux-components-time-selector';
```


Editable time input with a dropdown picker for the Karuna AIUX platform. Supports 12-hour and 24-hour formats with colon or dot separators.

## Installation

```bash
pnpm add @servicenow/aiux-components-time-selector
```

## Usage

```javascript
import '@servicenow/aiux-components-time-selector';
```

```html
<aiux-time-selector value="09:30 AM"></aiux-time-selector>
```

## Properties

| Property      | Type      | Default         | Description                                                                                                                             |
| ------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `String`  | `'HH:mm:ss aa'` | Time format pattern: `'HH:mm:ss aa'` (12h), `'HH:mm:ss'` / `'HH.mm.ss'` (24h), `'hh:mm:ss a'` / `'hh.mm.ss a'` (12h). Seconds stripped. |
| `value`       | `String`  | `''`            | Initial time value matching the specified format (e.g., `"09:30 AM"`, `"14:30"`).                                                       |
| `disabled`    | `Boolean` | `false`         | Disables the input field and clock button.                                                                                              |
| `readonly`    | `Boolean` | `false`         | Makes the input read-only.                                                                                                              |
| `size`        | `String`  | `'md'`          | Size variant: `'sm'` \| `'md'`.                                                                                                         |
| `placeholder` | `String`  | Auto-generated  | Placeholder text. Auto-generated from format (e.g., `"HH:MM AM"`).                                                                      |
| `label`       | `String`  | `'Time input'`  | Accessible label for the input (rendered as `aria-label`).                                                                              |

## Events

| Event                            | Detail                                          | Description                                                             |
| -------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `aiux-timeselector-value-set`    | `{ value: string \| null, isCleared: boolean }` | Fired when the time changes (user input, dropdown selection, or clear). |
| `aiux-timeselector-input-change` | `{ value: string, isValid: boolean }`           | Fired on every input change.                                            |
| `aiux-timeselector-invalid-set`  | `{ message: string, value: string }`            | Fired when input transitions from valid to invalid.                     |

```javascript
const selector = document.querySelector('aiux-time-selector');
selector.addEventListener('aiux-timeselector-value-set', e => {
  if (e.detail.isCleared) {
    console.log('Time cleared');
  } else {
    console.log('Selected time:', e.detail.value);
  }
});
```

## Getters

### `value`

Returns the current time in the specified format, or an empty string if incomplete.

```javascript
const currentTime = selector.value; // "09:30 AM" or "14:30"
```

## Supported Formats

| Format        | Description              | Example    |
| ------------- | ------------------------ | ---------- |
| `HH:mm:ss aa` | 12-hour, colon (default) | `09:30 AM` |
| `HH:mm:ss`    | 24-hour, colon           | `14:30`    |
| `HH.mm.ss`    | 24-hour, dot             | `14.30`    |
| `hh:mm:ss a`  | 12-hour, colon           | `09:30 AM` |
| `hh.mm.ss a`  | 12-hour, dot             | `09.30 AM` |

Seconds (`:ss` / `.ss`) are automatically stripped. Invalid formats fall back to the default `HH:mm:ss aa` with a console warning.

## Examples

### 24-Hour Format

```html
<aiux-time-selector format="HH:mm:ss" value="14:30"></aiux-time-selector>
```

### Dot Separator

```html
<aiux-time-selector format="hh.mm.ss a" value="09.30 AM"></aiux-time-selector>
```

### Disabled / Readonly

```html
<aiux-time-selector value="09:00 AM" disabled></aiux-time-selector>
<aiux-time-selector value="09:00 AM" readonly></aiux-time-selector>
```

### Size Variants

```html
<aiux-time-selector size="sm" value="09:00 AM"></aiux-time-selector>
<aiux-time-selector size="md" value="09:00 AM"></aiux-time-selector>
```

### Error Handling

```html
<aiux-time-selector id="validated"></aiux-time-selector>

<script>
  const selector = document.getElementById('validated');
  selector.addEventListener('aiux-timeselector-invalid-set', e => {
    console.error('Error:', e.detail.message, 'Value:', e.detail.value);
  });
  selector.addEventListener('aiux-timeselector-input-change', e => {
    if (e.detail.isValid) {
      // Clear error display
    }
  });
</script>
```

## Behavior

### Input Field

- Valid time matching the format is parsed and displayed.
- Invalid input triggers an error state and fires `aiux-timeselector-invalid-set`.
- Empty input clears the time and fires `aiux-timeselector-value-set` with `isCleared: true`.
- Format validation occurs on load — a mismatched value/format pair emits an error event.

### Dropdown Picker

Click the clock icon to open a scrollable picker with hours, minutes, and (for 12-hour formats) an AM/PM column. Columns repeat 3 times for infinite-scroll feel; selected values auto-scroll into view.

### Validation

- 12-hour: hours 1–12, minutes 0–59, AM/PM required.
- 24-hour: hours 0–23, minutes 0–59.
- Separator must match the format (colon or dot).

## Keyboard Navigation

| Key                 | Action                                                        |
| ------------------- | ------------------------------------------------------------- |
| `Tab`               | Focus input or clock button (closed); navigate columns (open) |
| `Shift+Tab`         | Navigate columns backward                                     |
| `Arrow Up` / `Down` | Change selected value in current column (wraps)               |
| `Enter` / `Space`   | Select the focused cell                                       |
| `Escape`            | Close dropdown and return focus to input                      |

Tab navigation is trapped within the picker while open.

## Accessibility

- `role="listbox"` on dropdown columns, `role="option"` on time cells.
- `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-disabled` reflect state.
- `aria-label` on input and clock button; `aria-invalid` set on error.
- Visible focus rings on all interactive elements.
- All strings wrapped with `msg()` for i18n.

## Reduced Motion

The component respects `prefers-reduced-motion` where animations are used.

## Tag Name

The canonical custom element tag is `aiux-time-selector`.

## Dependencies

- `@servicenow/aiux-components-core` (workspace)
- `@servicenow/aiux-directive-icon` (workspace)
- `lit` (peer)
- `@lit/localize` (peer)
