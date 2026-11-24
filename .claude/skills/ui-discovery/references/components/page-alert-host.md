# @servicenow/aiux-components-page-alert

## Import

```js
import '@servicenow/aiux-components-page-alert';
```


Page-level alert system with a single host element that renders and orchestrates a stack of dismissible alerts. `<page-alert-host>` is placed once per page and listens for `add-page-alert` / `clear-page-alert` events (or the `PageAlertService`) to add, deduplicate, auto-dismiss, and clear alerts on navigation; `<page-alert>` is the individual alert shell it renders for each entry, delegating layout to `<aiux-alert-message>` and adding an optional inline action link or button.

## Installation

```js
import '@servicenow/aiux-components-page-alert';
```

## Usage

```html
<page-alert-host></page-alert-host>

<script type="module">
  document.dispatchEvent(
    new CustomEvent('add-page-alert', {
      bubbles: true,
      detail: {
        type: 'warning',
        title: 'Session Warning',
        message: 'Your session is expiring.'
      }
    })
  );
</script>
```

## API

`page-alert-host` has no public reactive properties or attributes — it is configured entirely through document events or the `PageAlertService` helper.

### Via `PageAlertService` (recommended)

```js
import {PageAlertService} from '@servicenow/aiux-components-page-alert';

PageAlertService.warning('Your session is expiring.', {
  title: 'Session Warning',
  timeout: 8000,
  dismissible: true
});

// Clear a specific alert or all alerts from this source:
PageAlertService.clear({id: 'session-warn'});
```

`PageAlertService` exposes one method per severity — `info`, `success`, `warning`, `error`, `critical`, `high`, `moderate`, `positive`, `low`, `ai` — plus `add(type, message, options)` and `clear(options)`.

### Alert options

The `options` object (for `PageAlertService`) and the `add-page-alert` event `detail` accept the same fields:

| Option           | Type       | Default | Description                                                                                    |
| ---------------- | ---------- | ------- | ---------------------------------------------------------------------------------------------- |
| `id`             | `string`   | auto    | Unique ID. Supplying a stable `id` deduplicates — a repeat with the same `id` is dropped.      |
| `sourceId`       | `string`   | —       | Source identifier; lets `clear({sourceId})` dismiss all alerts from that source.               |
| `title`          | `string`   | —       | Bold title line above the message.                                                             |
| `dismissible`    | `boolean`  | `true`  | Whether the user can dismiss the alert.                                                        |
| `autoDismiss`    | `boolean`  | —       | Opt in/out of auto-dismiss for this alert (also gated by system property and user preference). |
| `timeout`        | `number`   | `5000`  | Auto-dismiss duration in ms; clamped to a minimum of `3000`.                                   |
| `actionLabel`    | `string`   | —       | Text for an inline action link/button.                                                         |
| `actionHref`     | `string`   | —       | URL for the action; renders it as an `<a>` link.                                               |
| `actionCallback` | `Function` | —       | Called when the action button is clicked (used when no `actionHref` is set).                   |

`clear(options)` accepts `{id?, sourceId?}` — `clear()` dismisses all visible alerts, `clear({id})` dismisses one, `clear({sourceId})` dismisses all alerts from that source.

### Via document events directly

```js
document.dispatchEvent(
  new CustomEvent('add-page-alert', {
    bubbles: true,
    detail: {
      type: 'warning',
      message: 'Your session is expiring.',
      title: 'Session Warning',
      autoDismiss: true,
      timeout: 8000,
      dismissible: true,
      id: 'session-warn'
    }
  })
);

document.dispatchEvent(
  new CustomEvent('clear-page-alert', {
    bubbles: true,
    detail: {id: 'session-warn'}
  })
);
```

Alerts also clear automatically on navigation away from the page.
