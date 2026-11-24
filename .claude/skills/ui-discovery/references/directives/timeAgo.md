# @servicenow/aiux-directive-time-ago

## Import

```js
import {timeAgo} from '@servicenow/aiux-directives';
```


Lit directive for auto-updating relative time display. All instances share a single 30-second timer for efficiency.

## Installation

```bash
pnpm add @servicenow/aiux-directive-time-ago
```

`lit` is a peer dependency and must be installed separately.

## Exports

| Export             | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `timeAgo`          | Directive function for auto-updating relative time display |
| `TimeAgoDirective` | Directive class (for typing and subclassing)               |
| `getTimeAgo`       | Get time difference data without formatting                |
| `formatTimeAgo`    | Format time data with translations                         |
| `timeAgoTimer`     | Shared timer manager (for manual subscription)             |

## Usage

### Basic usage (auto-updates)

```javascript
import {html} from 'lit';
import {timeAgo} from '@servicenow/aiux-directive-time-ago';

render() {
  return html`
    <span>${timeAgo(this.updatedAt)}</span>
  `;
}
// Output: "Updated 5 minutes ago" (auto-updates every 30s)
```

### Static display (no updates)

```javascript
html`<span>${timeAgo(timestamp, {live: false})}</span>`;
```

### Custom formatter

```javascript
html`
  <span>
    ${timeAgo(timestamp, {
      formatter: data => `${data.value} ${data.unit} ago`
    })}
  </span>
`;
```

## Options

| Property    | Type                                                                                     | Default | Description                                   |
| ----------- | ---------------------------------------------------------------------------------------- | ------- | --------------------------------------------- |
| `timestamp` | `Date \| number \| string`                                                               | —       | The timestamp to display (required)           |
| `live`      | `boolean`                                                                                | `true`  | Auto-update every 30 seconds                  |
| `formatter` | `(data: {value: number, unit: string, isFuture: boolean, isJustNow: boolean}) => string` | —       | Custom formatter function (overrides default) |

## API

### `getTimeAgo(timestamp)`

Get time difference data without formatting.

**Returns:** `{value: number, unit: string, isFuture: boolean, isJustNow: boolean}`

```javascript
import {getTimeAgo} from '@servicenow/aiux-directive-time-ago';

const data = getTimeAgo(new Date(Date.now() - 300000));
// {value: 5, unit: 'minute', isFuture: false, isJustNow: false}
```

### `formatTimeAgo(timeData)`

Format time data with translations.

**Parameters:** `{value: number, unit: string, isFuture: boolean, isJustNow: boolean}`

**Returns:** `string` - Formatted time string (e.g., "Updated 5 minutes ago")

```javascript
import {formatTimeAgo, getTimeAgo} from '@servicenow/aiux-directive-time-ago';

const data = getTimeAgo(timestamp);
const formatted = formatTimeAgo(data);
```

### `timeAgoTimer`

Shared timer manager for manual subscription (advanced usage).

```javascript
import {timeAgoTimer} from '@servicenow/aiux-directive-time-ago';

// Subscribe to 30-second updates
const unsubscribe = timeAgoTimer.subscribe(() => {
  this.requestUpdate();
});

// Later: clean up
unsubscribe();
```

## Performance

All `timeAgo` directive instances share a **single 30-second timer**. This means:

- 100 instances = 1 timer (not 100 timers)
- Timer automatically starts when first instance subscribes
- Timer automatically stops when last instance disconnects
- Minimal performance overhead regardless of instance count

## Translations

The directive uses `@lit/localize` for internationalization. Default messages are in English:

- "Updated just now"
- "Updated 1 minute ago"
- "Updated 5 minutes ago"
- "Updated 1 hour ago"
- etc.

Future dates are also supported:

- "Updated in 1 minute"
- "Updated in 5 hours"
- etc.

## Testing

```bash
cd directives/time-ago && pnpm test
```
