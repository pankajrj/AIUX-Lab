# @servicenow/aiux-context-widget-origin

## Import

```js
import {widgetRenderingContext} from '@servicenow/aiux-context';
```


Lit context for tracking where a widget is rendered ('page' or 'chat'). This context allows widgets to adapt their behavior based on their rendering environment.

## Installation

```bash
pnpm add @servicenow/aiux-context-widget-origin
```

`@lit/context` is a peer dependency and must be installed separately.

## Exports

| Export         | Description                             |
| -------------- | --------------------------------------- |
| `widgetOrigin` | Context key for widget rendering origin |

## Usage

### Providing context

Use with `ContextProvider` or the `provideOrigin` directive:

```javascript
import {html, LitElement} from 'lit';
import {ContextProvider} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class MyApp extends LitElement {
  constructor() {
    super();
    // Provide 'chat' origin to all descendants
    new ContextProvider(this, {
      context: widgetOrigin,
      initialValue: 'chat'
    });
  }

  render() {
    return html` <my-widget></my-widget> `;
  }
}
```

### Consuming context

Use `@consume` decorator or `ContextConsumer`:

```javascript
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class MyWidget extends LitElement {
  @consume({context: widgetOrigin})
  origin;

  render() {
    return html` <div>Rendering in: ${this.origin}</div> `;
  }
}
```

### With ContextConsumer

```javascript
import {LitElement, html} from 'lit';
import {ContextConsumer} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class MyWidget extends LitElement {
  constructor() {
    super();
    new ContextConsumer(this, {
      context: widgetOrigin,
      callback: value => {
        this.origin = value;
        this.requestUpdate();
      }
    });
  }

  render() {
    return html` <div>Rendering in: ${this.origin}</div> `;
  }
}
```

## Context Values

The context typically contains one of these string values:

- `'page'` - Widget is rendered in a page context
- `'chat'` - Widget is rendered in a chat/conversation context

## Use Cases

- **Conditional rendering**: Show/hide features based on rendering context
- **Behavior adaptation**: Adjust widget behavior for page vs. chat
- **Styling**: Apply different styles based on context
- **Analytics**: Track widget usage by rendering origin

## Examples

### Conditional rendering based on origin

```javascript
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class AdaptiveWidget extends LitElement {
  @consume({context: widgetOrigin})
  origin;

  render() {
    return html`
      <div class="widget">
        ${this.origin === 'chat'
          ? html`<compact-view></compact-view>`
          : html`<full-view></full-view>`}
      </div>
    `;
  }
}
```

### Analytics tracking

```javascript
import {LitElement} from 'lit';
import {consume} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class TrackedWidget extends LitElement {
  @consume({context: widgetOrigin})
  origin;

  connectedCallback() {
    super.connectedCallback();
    this.trackEvent('widget_rendered', {origin: this.origin});
  }

  trackEvent(event, data) {
    // Send analytics with origin context
    console.log(`Event: ${event}`, data);
  }
}
```

## SSR Compatibility

✅ **This context is SSR-safe**. The `createContext` function from `@lit/context` works identically in both server-side and client-side rendering environments.

## Testing

```bash
cd context/widget-origin && pnpm test
```

## License

See the main repository LICENSE file.
