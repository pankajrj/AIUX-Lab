# @servicenow/aiux-components-stepper

## Import

```js
import '@servicenow/aiux-components-stepper';
```


Vertical stepper that shows AI agent workflow progress for a conversation by reading `sys_cs_message` records and subscribing to a live record watcher.

## Overview

`<aiux-stepper>` renders a collapsible vertical list of workflow steps for a given conversation. On connect (and whenever `conversationId` changes) it fetches messages from the `sys_cs_message` table via the REST Table API, extracts steps from the matching messages, and subscribes to a record watcher for live updates. New steps are revealed progressively one at a time with a fade-in animation.

The component understands three `sys_cs_message` shapes:

1. **Workflow tasks** — `widget_payload` containing `workflow.tasks` (shown reversed, newest first).
2. **DynamicLoaderRichControl** — `payload` with `uiType: 'DynamicLoaderRichControl'` and a `progressMessages` array (shown in sequence).
3. **ProcessingMessage** — `payload` with `type: 'ProcessingMessage'`; each record contributes one step, collected across multiple records.

## Usage

### Basic Usage

```html
<aiux-stepper
  conversation-id="conv123"
  plan-id="plan456"
  title="Agent Steps"
  open
></aiux-stepper>
```

```javascript
import '@servicenow/aiux-components-stepper';
```

### In a Lit Component

```javascript
import {html} from 'lit';
import {AIUXElement} from '@servicenow/aiux-components-core';
import '@servicenow/aiux-components-stepper';

class MyAgentView extends AIUXElement {
  render() {
    return html`
      <aiux-stepper
        .conversationId=${this.conversationId}
        title="Execution Steps"
        .open=${true}
      ></aiux-stepper>
    `;
  }
}
```

## Properties

| Property         | Attribute         | Type      | Default   | Description                                                             |
| ---------------- | ----------------- | --------- | --------- | ----------------------------------------------------------------------- |
| `conversationId` | `conversation-id` | `String`  | `''`      | Conversation to fetch/watch messages for. Drives all data loading.      |
| `planId`         | `plan-id`         | `String`  | `''`      | Accepted for compatibility but currently unused by the component logic. |
| `title`          | `title`           | `String`  | `'Steps'` | Header text for the collapsible panel.                                  |
| `open`           | `open`            | `Boolean` | `false`   | Whether the panel is expanded. Reflected to the attribute.              |

Internal reactive state (`_steps`, `_loading`, `_visibleStepsCount`) is not part of the public API but can be set directly in stories/tests to drive visual states.

## Internal payload helpers

> These are **internal** utility functions, not part of the public package export surface. The package root (`@servicenow/aiux-components-stepper`) exports only the `AiuxStepper` element — you cannot import these functions from it. They are documented here to explain how the component parses and normalizes `sys_cs_message` payloads.

`src/index.js` defines the following pure helper functions, used internally by `AiuxStepper` to parse and normalize payloads:

| Function                              | Signature                            | Description                                                                                                       |
| ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `extractTasksFromWidgetPayload(raw)`  | `(string) => Array \| null`          | Parses a `widget_payload` string and returns `workflow.tasks` if present, else `null`.                            |
| `extractProgressMessages(raw)`        | `(string) => Array \| null`          | Parses a `payload` string and returns `progressMessages` if `uiType === 'DynamicLoaderRichControl'`, else `null`. |
| `normalizeTasks(tasks)`               | `(Array) => Array<{label,status}>`   | Reverses tasks (newest first) and maps `status_indicator` (`'complete'` → `'completed'`, else `'in-progress'`).   |
| `normalizeProgressMessages(messages)` | `(Array) => Array<{label,status}>`   | Maps messages in sequence (`status` `'COMPLETED'` → `'completed'`, else `'in-progress'`).                         |
| `extractProcessingMessage(raw)`       | `(string) => {label,status} \| null` | Returns a single completed step from a `ProcessingMessage` payload, else `null`.                                  |

For example, `normalizeTasks` maps raw workflow tasks to normalized steps:

```javascript
// internal to src/index.js
normalizeTasks([{title: 'Analyze', status_indicator: 'complete'}]);
// → [{label: 'Analyze', status: 'completed'}]
```

## Data loading

On connect and on `conversationId` change, the component:

1. Subscribes to a record watcher on `sys_cs_message` (via `AMBController.subscribeToRecordWatcher`). The watcher query is **broad**: its first `^NQ` (OR) clause matches _every_ record for the conversation (`conversation=<id>`), OR'd with a `DynamicLoaderRichControl` payload match, OR'd with a `ProcessingMessage` payload match. Because the first clause already matches the whole conversation, the watcher effectively fires on any message in the conversation.
2. Issues a `GET /api/now/table/sys_cs_message` (via `aiuxFetch`) with a **stricter** `sysparm_query`. Unlike the watcher, its first OR clause additionally requires an empty payload (`conversation=<id>^payloadISEMPTY`), then OR's in the same `DynamicLoaderRichControl` and `ProcessingMessage` payload matches. It requests `sys_id,payload,widget_payload,sys_created_on`, sorted by `sys_created_on`.
3. Sorts fetched messages by `sys_created_on`, scans them in order, and uses the first record with workflow tasks (`widget_payload`) or progress messages (`DynamicLoaderRichControl` payload). `ProcessingMessage` records are accumulated only if no earlier task/progress payload is selected.
4. Handles record-watcher notifications by updating steps in place — appending `ProcessingMessage` steps to the existing list, or replacing the list for workflow-task and progress-message updates. (`_fetchMessages` supports a `{silent: true}` option to suppress the loading state, but it is not triggered automatically.)

> **Watcher scope ≠ fetch scope.** The two queries are intentionally _not_ identical. The watcher subscribes broadly (any conversation record) so no live update is missed, while the fetch narrows the first clause to empty-payload records. Do not assume the watcher filters to the same set as the fetch.

## Step states

Normalized steps carry one of two statuses:

| Status        | Visual                              | Source mapping                                                               |
| ------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `completed`   | Green circle with a checkmark       | `status_indicator: 'complete'` / `status: 'COMPLETED'` / `ProcessingMessage` |
| `in-progress` | Spinning circle with primary border | Any other status value                                                       |

The icon renderer also supports a `pending` state (spinning gray circle), but the current normalizers never emit it.

## Progressive reveal

Steps are not shown all at once. `_visibleStepsCount` starts at `0` and increments every 300ms until all steps are visible, and each newly shown `<li>` animates in via a `fadeInSlide` keyframe. The reveal timer is cleared on `disconnectedCallback`.

## Loading & empty states

- **Loading** — while a non-silent fetch is in flight, shows an inline spinner (`aiux-loading aiux-loading-spinner`) with "Loading steps…".
- **Empty / no steps** — shows three skeleton placeholder rows (`skeleton` blocks), not a text message.
- **Error** — fetch failures are logged with the structured browser logger (`getLogger('aiux-stepper').warn(...)`) and the step list is cleared (for non-silent fetches).

## Styling

The component uses the DaisyUI collapse component (`aiux-collapse`, `aiux-collapse-arrow`) plus Tailwind utilities, with a small `static styles` block for the spin and fade-in keyframes:

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.step-icon--in-progress {
  border-top-color: currentColor;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  animation: spin 0.8s linear infinite;
}
```

Step colors come from DaisyUI semantic classes: `bg-success` / `text-success-content` for completed, `border-primary` for in-progress, and `border-base-300` / `bg-base-300` for pending and connector lines.

## Events

This component does not dispatch custom events. All state updates are driven by record-watcher notifications and Table API responses.

## Accessibility

- The collapsible panel uses a native `<input type="checkbox">` bound to `open` for keyboard support.
- The step list uses semantic `<ul>` / `<li>` elements.
- Visual states (icons, colors) are supplemented with text labels.
- Loading and empty states provide clear visual feedback.

## File Structure

```
stepper/
├── src/
│   ├── index.js            # Main component + internal payload helpers
│   └── stepper.stories.js  # Storybook stories
├── test/
│   └── stepper.test.js     # Component tests
├── index.js                # Package entry point
├── package.json
└── README.md
```

## Dependencies

- **@servicenow/aiux-components-core** — `AIUXElement` base class, `AMBController`, `aiuxFetch`, `getLogger`
- **lit** (`^3.0.0`, peer dependency) — Web Components framework

## Testing

```bash
# Run tests
pnpm test

# Lint
pnpm lint
```

## Notes

- Only `conversationId` is required for the component to load data; `planId` is currently accepted but unused.
- Record-watcher notifications update steps in place; `ProcessingMessage` records append to the existing step list, while workflow-task and progress-message updates replace it.
- Steps derived from workflow tasks are reversed (newest first); progress messages and processing messages are shown in original order.
