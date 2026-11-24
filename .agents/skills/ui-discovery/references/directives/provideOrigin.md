# @servicenow/aiux-directive-provider-origin

## Import

```js
import {provideOrigin} from '@servicenow/aiux-directives';
```


Lit directive for providing widget origin context to descendant elements without adding a wrapper element. This directive uses Lit's context API to make the origin value available to all child components.

## Installation

```bash
pnpm add @servicenow/aiux-directive-provider-origin
```

`lit` and `@lit/context` are peer dependencies and must be installed separately.

## Exports

| Export                   | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `provideOrigin`          | Directive function for providing origin context |
| `ProvideOriginDirective` | Directive class (for typing and subclassing)    |

## Usage

### Basic usage

```javascript
import {html, LitElement} from 'lit';
import {provideOrigin} from '@servicenow/aiux-directive-provider-origin';

class MyApp extends LitElement {
  render() {
    return html`
      <div ${provideOrigin('chat')}>
        <my-widget></my-widget>
      </div>
    `;
  }
}
```

### With origin constants

```javascript
import {html, LitElement} from 'lit';
import {provideOrigin} from '@servicenow/aiux-directive-provider-origin';

const WIDGET_ORIGIN = {
  PAGE: 'page',
  CHAT: 'chat'
};

class MyApp extends LitElement {
  render() {
    return html`
      <sn-engagement-experience ${provideOrigin(WIDGET_ORIGIN.CHAT)}>
        <my-chat-widget></my-chat-widget>
      </sn-engagement-experience>
    `;
  }
}
```

### Consuming the context

Child components can consume the origin context using `@consume` decorator:

```javascript
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {widgetOrigin} from '@servicenow/aiux-context-widget-origin';

class MyWidget extends LitElement {
  @consume({context: widgetOrigin})
  origin;

  render() {
    return html`
      <div class="widget ${this.origin}">
        ${this.origin === 'chat'
          ? html`<compact-view></compact-view>`
          : html`<full-view></full-view>`}
      </div>
    `;
  }
}
```

## API

### `provideOrigin(origin)`

Directive that provides origin context to descendant elements.

**Parameters:**

- `origin` (`string`) - The origin value to provide (e.g., 'page' or 'chat')

**Returns:** `DirectiveResult`

**Example:**

```javascript
html`<div ${provideOrigin('chat')}>...</div>`;
```

## How It Works

The directive uses Lit's `ContextProvider` internally to make the origin value available to all descendant components without requiring prop drilling. The context is provided on the element where the directive is applied.

### Benefits

- **No wrapper elements**: Context is provided directly on the host element
- **No prop drilling**: Child components access context directly
- **Type-safe**: Works with TypeScript decorators
- **Efficient**: Context updates trigger re-renders only in consuming components

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
    const isChatMode = this.origin === 'chat';

    return html`
      <div class="widget ${isChatMode ? 'compact' : 'full'}">
        <h2>${isChatMode ? 'Chat' : 'Page'} Widget</h2>
        ${isChatMode ? this.renderCompactView() : this.renderFullView()}
      </div>
    `;
  }

  renderCompactView() {
    return html`<div class="compact">Compact content</div>`;
  }

  renderFullView() {
    return html`<div class="full">Full content with details</div>`;
  }
}
```

### Multiple widgets with different origins

```javascript
class MyApp extends LitElement {
  render() {
    return html`
      <div class="layout">
        <!-- Page widgets -->
        <section ${provideOrigin('page')}>
          <my-widget></my-widget>
          <another-widget></another-widget>
        </section>

        <!-- Chat widgets -->
        <aside ${provideOrigin('chat')}>
          <my-widget></my-widget>
          <another-widget></another-widget>
        </aside>
      </div>
    `;
  }
}
```

### Dynamic origin

```javascript
class MyApp extends LitElement {
  @property() currentOrigin = 'page';

  render() {
    return html`
      <div ${provideOrigin(this.currentOrigin)}>
        <my-widget></my-widget>
      </div>

      <button @click=${() => (this.currentOrigin = 'chat')}>
        Switch to Chat
      </button>
    `;
  }
}
```

## SSR Compatibility

✅ **This directive is SSR-safe**. The `ContextProvider` from `@lit/context` has built-in SSR support and handles server-side rendering correctly.

## Related Packages

- `@servicenow/aiux-context-widget-origin` - The context definition used by this directive
- `@lit/context` - Lit's context API

## Testing

```bash
cd directives/provider-origin && pnpm test
```

## License

See the main repository LICENSE file.
