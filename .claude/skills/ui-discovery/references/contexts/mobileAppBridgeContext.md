# @servicenow/aiux-context-mobile-app-bridge

## Import

```js
import {mobileAppBridgeContext} from '@servicenow/aiux-context';
```


Re-export of the mobile app bridge context from `@servicenow/mobile-app-bridge-lit` for consistent context management across the application.

## Installation

```bash
pnpm add @servicenow/aiux-context-mobile-app-bridge
```

`@servicenow/mobile-app-bridge-lit` is dependency.

## Exports

| Export            | Description                                   |
| ----------------- | --------------------------------------------- |
| `mobileAppBridge` | Context key for mobile app bridge integration |

## Usage

This package re-exports the `mobileAppBridgeContext` from `@servicenow/mobile-app-bridge-lit` as `mobileAppBridge`, providing a centralized location for context imports.

### Consuming the context

```javascript
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {mobileAppBridge} from '@servicenow/aiux-context-mobile-app-bridge';

class MyWidget extends LitElement {
  @consume({context: mobileAppBridge})
  bridge;

  async handleAction() {
    if (this.bridge) {
      // Use mobile app bridge
      await this.bridge.someMethod();
    }
  }

  render() {
    return html`
      <button @click=${this.handleAction}>
        ${this.bridge ? 'Mobile Action' : 'Web Action'}
      </button>
    `;
  }
}
```

### With ContextConsumer

```javascript
import {LitElement, html} from 'lit';
import {ContextConsumer} from '@lit/context';
import {mobileAppBridge} from '@servicenow/aiux-context-mobile-app-bridge';

class MyWidget extends LitElement {
  constructor() {
    super();
    new ContextConsumer(this, {
      context: mobileAppBridge,
      callback: value => {
        this.bridge = value;
        this.requestUpdate();
      }
    });
  }

  render() {
    return html`
      <div>
        ${this.bridge
          ? html`<mobile-specific-ui></mobile-specific-ui>`
          : html`<web-ui></web-ui>`}
      </div>
    `;
  }
}
```

## Use Cases

- **Platform detection**: Check if running in mobile app vs web browser
- **Mobile-specific features**: Enable features only available in mobile app
- **Bridge communication**: Access native mobile app capabilities
- **Conditional rendering**: Show different UI based on platform

## Examples

### Conditional feature rendering

```javascript
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {mobileAppBridge} from '@servicenow/aiux-context-mobile-app-bridge';

class FeatureWidget extends LitElement {
  @consume({context: mobileAppBridge})
  bridge;

  render() {
    const isMobile = !!this.bridge;

    return html`
      <div class="features">
        <h2>Available Features</h2>
        ${isMobile
          ? html`
              <button @click=${this.useCameraFeature}>Take Photo</button>
              <button @click=${this.useLocationFeature}>Get Location</button>
            `
          : html` <p>Mobile-only features not available in web browser</p> `}
      </div>
    `;
  }

  async useCameraFeature() {
    if (this.bridge?.camera) {
      const photo = await this.bridge.camera.takePhoto();
      // Handle photo
    }
  }

  async useLocationFeature() {
    if (this.bridge?.location) {
      const coords = await this.bridge.location.getCurrentPosition();
      // Handle location
    }
  }
}
```

### Platform-specific styling

```javascript
import {LitElement, html, css} from 'lit';
import {consume} from '@lit/context';
import {mobileAppBridge} from '@servicenow/aiux-context-mobile-app-bridge';

class AdaptiveLayout extends LitElement {
  @consume({context: mobileAppBridge})
  bridge;

  static styles = css`
    .mobile {
      padding: 8px;
      font-size: 16px;
    }

    .web {
      padding: 16px;
      font-size: 14px;
    }
  `;

  render() {
    const platformClass = this.bridge ? 'mobile' : 'web';

    return html`
      <div class=${platformClass}>
        <h1>Adaptive Layout</h1>
        <p>Optimized for ${this.bridge ? 'mobile app' : 'web browser'}</p>
      </div>
    `;
  }
}
```

## SSR Compatibility

✅ **This context re-export is SSR-safe**. The underlying `mobileAppBridgeContext` from `@servicenow/mobile-app-bridge-lit` (exported as `mobileAppBridge`) is designed to work in both server-side and client-side rendering environments.

## Related Packages

- `@servicenow/mobile-app-bridge-lit` - The source package providing the mobile app bridge context
- `@lit/context` - Lit's context API

## Testing

```bash
cd context/mobile-app-bridge && pnpm test
```

## License

See the main repository LICENSE file.
