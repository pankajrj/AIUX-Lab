# aiux-help-assistant

## Import

```js
import '@servicenow/aiux-components-help-assistant';
```


Dynamic Guidance assistant that runs a live, voice-driven Now Assist help session with screen sharing. It orchestrates microphone capture, a live LLM WebSocket client, periodic screen-frame capture, user consent and OAuth authentication, cross-tab session sync, and feedback collection — rendering a consent modal, a floating modeless session dialog, alerts, and a feedback form.

Tag name: `<aiux-help-assistant>`.

## Installation

```js
import '@servicenow/aiux-components-help-assistant';
```

## Examples

### Basic usage

The component renders nothing until a Dynamic Guidance session is started. Add it to the page, then start a session by dispatching the `aiux-ha:start-guidance` event on the element.

```html
<aiux-help-assistant></aiux-help-assistant>
```

```js
const assistant = document.querySelector('aiux-help-assistant');

// Start a session (opens the consent flow, then the modeless dialog)
assistant.dispatchEvent(
  new CustomEvent('aiux-ha:start-guidance', {
    detail: {src: 'help-center', conversationId: 'abc-123'}
  })
);
```

In a Lit template:

```js
html`<aiux-help-assistant
  ?enable-transcript=${true}
  trace-id=${this.traceId}
></aiux-help-assistant>`;
```

### Listen for events

```js
const assistant = document.querySelector('aiux-help-assistant');

// dg-started / dg-ended are dispatched on `document`, not the host element
document.addEventListener('help-assistant:dg-started', () => {
  console.log('dynamic guidance started');
});
document.addEventListener('help-assistant:dg-ended', () => {
  console.log('dynamic guidance ended');
});

// Telemetry and feedback failures bubble from the host element
assistant.addEventListener('ha:telemetry', ({detail}) => {
  console.log('telemetry', detail.metric, detail.payload);
});
```

## Properties

All three are attribute-backed reactive properties. Multi-word names map to kebab-case attributes (Lit convention).

| Property              | Attribute               | Type      | Default | Description                                                                                                                                                                                                                |
| --------------------- | ----------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enableHelpAssistant` | `enable-help-assistant` | `Boolean` | `true`  | Master enable flag. When `false` at connect time, the component re-enables itself only if the Dynamic Guidance system property is on **and** the user has the DG or admin role. When disabled, `render()` returns nothing. |
| `enableTranscript`    | `enable-transcript`     | `Boolean` | `true`  | Show or hide the live transcript inside the modeless session dialog.                                                                                                                                                       |
| `traceId`             | `trace-id`              | `String`  | `''`    | Trace ID forwarded with feedback submissions and telemetry payloads.                                                                                                                                                       |

Session state (paused, transcript content, AI-speaking, mic volume, consent, which modals are open) is managed internally via `@state()` and is not part of the public API. There is no `opened` or `appContext` property.

## Events

### Received (dispatched onto the host to control it)

| Event                    | Detail                    | Description                                                                       |
| ------------------------ | ------------------------- | --------------------------------------------------------------------------------- |
| `aiux-ha:start-guidance` | `{src?, conversationId?}` | Starts a Dynamic Guidance session (establishes this tab as primary, begins auth). |

### Dispatched on the host element (`bubbles: true, composed: true`)

| Event                       | Detail              | Description                              |
| --------------------------- | ------------------- | ---------------------------------------- |
| `ha:telemetry`              | `{metric, payload}` | Telemetry event for the host app to log. |
| `ha:feedback-submit-failed` | `{error}`           | Feedback POST failed.                    |

### Dispatched on `document`

| Event                       | Detail   | Bubbles/composed | Description                      |
| --------------------------- | -------- | ---------------- | -------------------------------- |
| `help-assistant:dg-started` | —        | yes              | Dynamic Guidance session started |
| `help-assistant:dg-ended`   | —        | yes              | Dynamic Guidance session ended   |
| `help-assistant:error`      | `{text}` | no               | An error notification was raised |

## Architecture: Controllers

All cross-cutting concerns are extracted into controllers under `src/help-assistant/controllers/`. Each controller registers with the host on construction and tears itself down on disconnect.

| Controller                           | Responsibility                                             |
| ------------------------------------ | ---------------------------------------------------------- |
| `audio-controller.js`                | Voice recording lifecycle and waveform state               |
| `consent-auth-controller.js`         | User consent gate and auth token management                |
| `cross-tab-controller.js`            | `BroadcastChannel` cross-tab state synchronisation         |
| `help-assistant-alert-controller.js` | Alert and toast notification lifecycle                     |
| `live-client-controller.js`          | Now Assist WebSocket client connection and message routing |
| `modals-controller.js`               | Dialog and modal open/close lifecycle                      |
| `screen-controller.js`               | Screen-share capture — grabs periodic video frames to send |

## Sub-components

These are internal and registered automatically on import:

| Tag                       | Description                            |
| ------------------------- | -------------------------------------- |
| `<ha-alerts>`             | Alert banner area                      |
| `<ha-feedback>`           | Thumbs up/down + comment feedback form |
| `<ha-modeless-dialog>`    | Expanded floating dialog view          |
| `<ha-user-consent-modal>` | Consent and terms acceptance modal     |
| `<ha-voice-wave>`         | Animated voice waveform visualisation  |

## Source Structure

```
src/
  help-assistant/
    help-assistant.js              ← main component (<aiux-help-assistant>)
    constants.js                   ← shared constants
    utils.js                       ← shared utilities
    controllers/
      audio-controller.js
      consent-auth-controller.js
      cross-tab-controller.js
      help-assistant-alert-controller.js
      live-client-controller.js
      modals-controller.js
      screen-controller.js
  components/presentational/
    ha-alerts/ha-alerts.js
    ha-feedback/ha-feedback.js
    ha-modeless-dialog/ha-modeless-dialog.js
    ha-user-consent-modal/ha-user-consent-modal.js
    ha-voice-wave/ha-voice-wave.js
  index.js                         ← package entry point
```

## Running Tests

```bash
pnpm test           # run all unit tests
pnpm test:coverage  # run with coverage report
```

Tests live in `test/` and use Vitest with `happy-dom`. 14 test files, 257 tests covering all controllers and presentational components.
