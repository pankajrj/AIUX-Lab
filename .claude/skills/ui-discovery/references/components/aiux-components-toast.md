---
argus-naming-exceptions:
  - rule: package_name_aiux_sn_prefix
    identifiers:
      - '@servicenow/aiux-components-toast'
  - rule: event_name_namespaced_with_component
    identifiers:
      - toast-dismiss
---

# Toast Component

## Import

```js
import '@servicenow/aiux-components-toast';
```


A flexible toast notification component for displaying temporary messages, with multiple types, 9 positions, auto-dismiss, and smooth position-aware animations.

## Transient Toast Pattern

Use the `triggerTransientToast` utility — one line, no state management, no cleanup needed:

```js
import {triggerTransientToast} from '@servicenow/aiux-components-toast';

triggerTransientToast('Changes saved');
triggerTransientToast('Copied', 'info');
```

**Convention (enforced by `triggerTransientToast`):**

- `position` — always `bottom-end` (bottom right)
- `duration` — always `5000` (5 seconds)
- `dismissible` — `true`
- `type` — defaults to `success`, accepts `'info'`, `'success'`, `'warning'`, `'error'`

**Do not use for:** critical information, messages the user may need to reference, or situations requiring user action.

## Features

- 🎨 Multiple types (info, success, warning, error)
- 📍 9 position options (top, middle, bottom × start, center, end)
- ⏱️ Auto-dismiss with configurable duration
- 🎯 Manual dismiss option
- 🖼️ Custom icons support
- 🎭 Smooth slide animations
- ♿ Fully accessible with ARIA labels
- 🎨 Theme-compatible (uses DaisyUI `aiux-` component classes)

## Properties

All property names are single words, so each HTML attribute name matches its JS property name.

| Property      | Attribute     | Type    | Default     | Description                                                                                                                                                    |
| ------------- | ------------- | ------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`        | `type`        | String  | `'info'`    | Type of toast: `'info'`, `'success'`, `'warning'`, `'error'`                                                                                                   |
| `message`     | `message`     | String  | `''`        | Toast message text                                                                                                                                             |
| `position`    | `position`    | String  | `'top-end'` | Position: `'top-start'`, `'top-center'`, `'top-end'`, `'middle-start'`, `'middle-center'`, `'middle-end'`, `'bottom-start'`, `'bottom-center'`, `'bottom-end'` |
| `dismissible` | `dismissible` | Boolean | `true`      | Whether the toast can be manually dismissed (shows a close button)                                                                                             |
| `visible`     | *(none)*      | Boolean | `true`      | Whether the toast is currently rendered. Internal reactive state (`@state()`), not attribute-observed; set the JS property directly to control it              |
| `duration`    | `duration`    | Number  | `3000`      | Auto-dismiss duration in milliseconds (0 = no auto dismiss)                                                                                                    |
| `icon`        | `icon`        | String  | `''`        | Custom icon text/emoji, e.g. `'🎉'` (default: built-in SVG icon for each type). Free-form text, not a sprite icon name.                                       |

## Events

### `@toast-dismiss`

Fired when the toast is dismissed (manually or automatically).

**Event Detail:**

```javascript
{
  type: string,    // Toast type
  message: string  // Toast message
}
```

## Slots

| Slot      | Description                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| (default) | Extra content rendered inside the alert, after the icon and message (e.g. an action button/link). |

## Methods

### `dismiss()`

Manually dismiss the toast.

```javascript
const toast = document.querySelector('aiux-toast-notification');
toast.dismiss();
```

### `show()`

Show the toast and restart the auto-dismiss timer.

```javascript
const toast = document.querySelector('aiux-toast-notification');
toast.show();
```

### Render helpers

These compute the classes/role used by `render()` from the current `type`/`position`. They're public
(and directly covered by tests) but are render-support helpers, not part of the toast's control API:

| Method                    | Returns              | Description                                                             |
| ------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `getAlertClass()`         | `string`              | DaisyUI alert type class plus layout utility classes for the alert body |
| `getAlertRole()`          | `'status' \| 'alert'` | ARIA live-region role for the current `type` (see Accessibility)        |
| `getIconTextClass()`      | `string`              | Semantic text color class for the default icon, matched to `type`       |
| `getToastPositionClass()` | `string`              | Space-separated vertical/horizontal position classes for `position`     |

## Usage Examples

### Basic Toast

```html
<aiux-toast-notification type="info" message="This is an info message">
</aiux-toast-notification>
```

### Success Toast

```html
<aiux-toast-notification
  type="success"
  message="Operation completed successfully!"
>
</aiux-toast-notification>
```

### Warning Toast

```html
<aiux-toast-notification type="warning" message="Please review your changes">
</aiux-toast-notification>
```

### Error Toast

```html
<aiux-toast-notification type="error" message="An error occurred">
</aiux-toast-notification>
```

### Different Positions

```html
<!-- Top positions -->
<aiux-toast-notification
  position="top-start"
  message="Top Start"
></aiux-toast-notification>
<aiux-toast-notification
  position="top-center"
  message="Top Center"
></aiux-toast-notification>
<aiux-toast-notification
  position="top-end"
  message="Top End"
></aiux-toast-notification>

<!-- Middle positions -->
<aiux-toast-notification
  position="middle-start"
  message="Middle Start"
></aiux-toast-notification>
<aiux-toast-notification
  position="middle-center"
  message="Middle Center"
></aiux-toast-notification>
<aiux-toast-notification
  position="middle-end"
  message="Middle End"
></aiux-toast-notification>

<!-- Bottom positions -->
<aiux-toast-notification
  position="bottom-start"
  message="Bottom Start"
></aiux-toast-notification>
<aiux-toast-notification
  position="bottom-center"
  message="Bottom Center"
></aiux-toast-notification>
<aiux-toast-notification
  position="bottom-end"
  message="Bottom End"
></aiux-toast-notification>
```

### Custom Duration

```html
<!-- No auto-dismiss -->
<aiux-toast-notification
  duration="0"
  message="This will stay until manually dismissed"
>
</aiux-toast-notification>

<!-- 5 seconds -->
<aiux-toast-notification
  duration="5000"
  message="This will auto-dismiss in 5 seconds"
>
</aiux-toast-notification>
```

### Non-dismissible Toast

`dismissible` is a Lit **Boolean** property. In plain HTML, any presence of the
attribute is truthy — `dismissible="false"` still renders the dismiss button.
Because the component defaults `dismissible` to `true`, static HTML cannot make
a toast non-dismissible; set the JavaScript property instead.

```js
import {html} from 'lit';

html`
  <aiux-toast-notification
    .dismissible=${false}
    message="Cannot be dismissed manually"
  ></aiux-toast-notification>
`;
```

### Custom Icon

```html
<aiux-toast-notification type="success" icon="🎉" message="Celebration!">
</aiux-toast-notification>
```

### Programmatic Control

```html
<aiux-toast-notification id="myToast" type="success" message="Controlled toast">
</aiux-toast-notification>

<script>
  const toast = document.getElementById('myToast');

  // Dismiss programmatically
  setTimeout(() => {
    toast.dismiss();
  }, 5000);

  // Show again
  setTimeout(() => {
    toast.show();
  }, 10000);

  // Listen to dismiss event
  toast.addEventListener('toast-dismiss', e => {
    console.log('Toast dismissed:', e.detail);
  });
</script>
```

### Stacked Toasts

```html
<!-- Multiple toasts will stack automatically -->
<aiux-toast-notification
  position="top-end"
  type="info"
  message="First notification"
>
</aiux-toast-notification>

<aiux-toast-notification
  position="top-end"
  type="success"
  message="Second notification"
>
</aiux-toast-notification>

<aiux-toast-notification
  position="top-end"
  type="warning"
  message="Third notification"
>
</aiux-toast-notification>
```

## DaisyUI Classes Used

The component uses the DaisyUI `aiux-`-prefixed component classes for full theme compatibility:

- `aiux-toast` - Base toast container
- `aiux-toast-top`, `aiux-toast-middle`, `aiux-toast-bottom` - Vertical positioning
- `aiux-toast-start`, `aiux-toast-center`, `aiux-toast-end` - Horizontal positioning
- `aiux-alert` - Alert base class
- `aiux-alert-info`, `aiux-alert-success`, `aiux-alert-warning`, `aiux-alert-error` - Alert types
- `aiux-btn`, `aiux-btn-sm`, `aiux-btn-circle`, `aiux-btn-ghost` - Dismiss button styling
- Tailwind utilities: `z-50`, `h-6`, `w-6`, `shrink-0`, `stroke-current`, `text-xl`, `flex`, `items-center`, `w-[26.5rem]`, `max-w-3xl`, `h-12`, `gap-2`, `p-3`, `rounded-field`, `shadow-lg`, `ml-auto`
- Semantic text tokens: `text-info-content`, `text-success-content`, `text-warning-content`, `text-error-content` - default icon color, matched to `type`

## Accessibility

The component is fully accessible:

- Uses `role="status"` (polite) for non-urgent types (`info`, `success`) and `role="alert"` (assertive) for urgent types (`warning`, `error`), so info/success toasts don't interrupt the user
- Dismiss button includes a localized `aria-label` ("Dismiss toast") plus a tooltip (via the `@servicenow/aiux-directive-tooltip` directive)
- Icons (both the default SVG icon and a custom `icon` value) are marked `aria-hidden="true"` since they are decorative
- Keyboard accessible dismiss button
- Auto-dismiss uses a fixed timer when `duration > 0`; it is not paused by hover or focus

## Notes

- Toasts are positioned using CSS fixed positioning
- Multiple toasts at the same position will stack automatically
- The component cleans up timers on disconnect to prevent memory leaks
- Uses smooth slide-in animations matching DaisyUI's design patterns
- Default z-index is 50 to ensure toasts appear above most content

## Browser Support

Works in all modern browsers that support:

- Web Components (Custom Elements)
- ES6 JavaScript
- CSS Grid and Flexbox
