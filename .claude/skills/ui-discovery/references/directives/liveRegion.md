# @servicenow/aiux-directive-live-region

## Import

```js
import {liveRegion} from '@servicenow/aiux-directives';
```


Lit directive for applying aria-live attributes to elements for screen reader announcements. Use this when you need localized live regions within widget templates.

## Installation

```bash
pnpm add @servicenow/aiux-directive-live-region
```

`lit` is a peer dependency and must be installed separately.

## Exports

| Export                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `liveRegion`          | Directive function for applying aria-live attributes |
| `LiveRegionDirective` | Directive class (for typing and subclassing)         |
| `liveRegionPolite`    | Convenience directive for polite live regions        |
| `liveRegionAssertive` | Convenience directive for assertive live regions     |

## Usage

### Basic usage - polite announcement

```javascript
import {html} from 'lit';
import {liveRegion} from '@servicenow/aiux-directive-live-region';

render() {
  return html`
    <div ${liveRegion('polite')}>
      ${this.statusMessage}
    </div>
  `;
}
```

### Assertive announcement with options

```javascript
html`
  <div ${liveRegion('assertive', {atomic: true, relevant: 'additions text'})}>
    ${this.errorMessage}
  </div>
`;
```

### Form field error

```javascript
html`
  <span ${liveRegion('polite', {atomic: true})} class="error">
    ${this.fieldError}
  </span>
`;
```

### Convenience directives

```javascript
import {
  liveRegionPolite,
  liveRegionAssertive
} from '@servicenow/aiux-directive-live-region';

// Polite (default)
html`<div ${liveRegionPolite()}>${this.status}</div>`;

// Polite with options
html`<div ${liveRegionPolite({atomic: true})}>${this.status}</div>`;

// Assertive
html`<div ${liveRegionAssertive()}>${this.error}</div>`;

// Assertive with role
html`<div ${liveRegionAssertive({role: 'alert'})}>${this.error}</div>`;
```

## Options

| Property     | Type                                                                                                                                       | Default            | Description                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------- |
| `politeness` | `'polite' \| 'assertive' \| 'off'`                                                                                                         | `'polite'`         | The politeness level for announcements                                             |
| `atomic`     | `boolean`                                                                                                                                  | `false`            | If true, assistive technologies will present the entire region as a whole          |
| `relevant`   | `'additions' \| 'removals' \| 'text' \| 'all' \| 'additions text' \| 'additions removals' \| 'removals text' \| 'additions removals text'` | `'additions text'` | What types of changes should be announced                                          |
| `busy`       | `boolean`                                                                                                                                  | `false`            | Indicates the element is being updated and assistive technologies may want to wait |
| `role`       | `'status' \| 'alert' \| 'log' \| 'marquee' \| 'timer' \| 'none'`                                                                           | —                  | Optional ARIA role to apply                                                        |

## API

### `liveRegion(politeness, options)`

Main directive function that applies aria-live attributes to an element.

**Parameters:**

- `politeness` (`'polite' | 'assertive' | 'off'`) - The politeness level (default: `'polite'`)
- `options` (`LiveRegionOptions`) - Additional ARIA options

**Returns:** `DirectiveResult`

### `liveRegionPolite(options)`

Convenience directive for polite live regions.

**Parameters:**

- `options` (`LiveRegionOptions`) - Additional ARIA options

**Returns:** `DirectiveResult`

### `liveRegionAssertive(options)`

Convenience directive for assertive live regions.

**Parameters:**

- `options` (`LiveRegionOptions`) - Additional ARIA options

**Returns:** `DirectiveResult`

## ARIA Live Politeness Levels

- **`polite`**: Announcements are made at the next graceful opportunity (when the user pauses). Use for status updates, notifications, and non-critical information.

- **`assertive`**: Announcements interrupt the current speech. Use sparingly for critical errors or time-sensitive alerts.

- **`off`**: Disables announcements. The element is no longer a live region.

## Examples

### Status message

```javascript
html` <div ${liveRegion('polite', {role: 'status'})}>${this.saveStatus}</div> `;
```

### Error alert

```javascript
html`
  <div ${liveRegion('assertive', {role: 'alert', atomic: true})}>
    ${this.errorMessage}
  </div>
`;
```

### Loading indicator

```javascript
html`
  <div ${liveRegion('polite', {busy: this.isLoading})}>
    ${this.isLoading ? 'Loading...' : 'Content loaded'}
  </div>
`;
```

### Dynamic updates

```javascript
html`
  <div ${liveRegion('polite', {relevant: 'additions removals'})}>
    ${this.items.map(item => html`<div>${item.name}</div>`)}
  </div>
`;
```

## When to Use

Use this directive when you need:

- **Localized live regions** within component templates
- **Fine-grained control** over ARIA attributes (`atomic`, `relevant`, `busy`, `role`)
- **Declarative** attribute application via templates
- **Form field errors** that update in the template
- **Status messages** tied to specific UI elements

For programmatic announcements (button clicks, async operations, global notifications), consider using `AriaLiveController` instead, which provides message queuing and shared global regions.

## Testing

```bash
cd directives/live-region && pnpm test
```
