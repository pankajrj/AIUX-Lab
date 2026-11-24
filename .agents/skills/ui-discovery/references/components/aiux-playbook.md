# @servicenow/aiux-components-playbook

## Import

```js
import '@servicenow/aiux-components-playbook';
```


A self-contained web component for rendering ServiceNow Playbooks. Provides a full playbook UI — stage/activity pickers, activity cards with dynamic content widgets, and server-authored action buttons — driven by real-time GraphQL data and AMB subscriptions.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Properties](#properties)
- [Events](#events)
- [Deep Linking](#deep-linking)
- [Auto Advance](#auto-advance)
- [SSR Compatibility](#ssr-compatibility)
- [Styling](#styling)
- [Components](#components)
- [Exports](#exports)
- [Further Reading](#further-reading)

---

## Installation

```js
import '@servicenow/aiux-components-playbook';
```

The side-effect import registers `<aiux-playbook>` and all sub-components.

---

## Usage

### Data loading

For normal use, render `<aiux-playbook>` with the parent record identifiers and let the component fetch its own data client-side:

```js
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux-components-core';
import '@servicenow/aiux-components-playbook';

@customElement('my-playbook-page')
export default class MyPlaybookPage extends AIUXElement {
  render() {
    const {table, recordId} = this.loaderData;
    return html`
      <aiux-playbook
        parent-table=${table}
        parent-sys-id=${recordId}
      ></aiux-playbook>
    `;
  }
}
```

The package root does **not** currently export `fetchPlaybookContexts`, so do not import that helper from `@servicenow/aiux-components-playbook`. The `prefetch` / `preFetchedData` path is intended for callers that already have a source-compatible playbook data object from an app-local loader or a future public helper export.

### Idle-time data prefetching

Pages can opt into idle-time data prefetching by adding `static prefetchData = true` to the page class. When enabled, the framework prefetches the page's loader data during idle time via `requestIdleCallback`, so data is already available when the user navigates to the page. See [docs/arch-prefetch.md](../../docs/arch-prefetch.md) for the full architecture.

```js
@customElement('my-playbook-page')
export default class MyPlaybookPage extends AIUXElement {
  static prefetchData = true;

  static async loader(ctx) {
    // ... same as above
  }
}
```

Parameterized routes (e.g. `/playbook/[table]/[recordId]`) are skipped automatically by the prefetch system since the route parameters are unknown ahead of time.

---

## Properties

| Property                      | Attribute                         | Type      | Default                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | --------------------------------- | --------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentTable`                 | `parent-table`                    | `String`  | `''`                                 | ServiceNow table name of the parent record                                                                                                                                                                                                                                                                                                                                                                                                      |
| `parentSysId`                 | `parent-sys-id`                   | `String`  | `''`                                 | sys_id of the parent record                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `experienceId`                | `experience-id`                   | `String`  | `PLAYBOOK_EXPERIENCE_ID`             | Playbook experience sys_id. Defaults to the global playbook experience (`98e09a...`). Only needed when targeting a custom experience.                                                                                                                                                                                                                                                                                                           |
| `processDefinitionId`         | `process-definition-id`           | `String`  | `''`                                 | Process definition sys_id. Optional; also read from the `processDefinitionId` URL query param when the attribute is unset.                                                                                                                                                                                                                                                                                                                      |
| `prefetch`                    | `prefetch`                        | `Boolean` | `false`                              | When true, waits for `preFetchedData` instead of fetching client-side                                                                                                                                                                                                                                                                                                                                                                           |
| `preFetchedData`              | ---                               | `Object`  | `null`                               | Source-compatible pre-fetched playbook data. Only needed when `prefetch` is true; otherwise the component fetches client-side.                                                                                                                                                                                                                                                                                                                  |
| `onlyShowSelectedPlaybook`    | `only-show-selected-playbook`     | `Boolean` | `false`                              | Data-provider-level filter: when true, only the currently selected playbook's data is fetched/exposed to every descendant (all layouts, including vertical/guided) — other playbook contexts for the parent record are hidden entirely, not just visually filtered in one picker. Defaults the selection to the first loaded playbook if nothing is selected yet. Also hides the playbook context-selector, since there's nothing to switch to. |
| `deepLinkParams`              | ---                               | `Object`  | `null`                               | Programmatic deep-link override — same shape as the [Deep Linking](#deep-linking) URL params. Takes precedence over the URL when set. Leave unset to let the URL/auto-advance resolve the initial selection.                                                                                                                                                                                                                                    |
| `config`                      | ---                               | `Object`  | `{ layout: 'vertical-all-stacked' }` | Configuration object (see below)                                                                                                                                                                                                                                                                                                                                                                                                                |
| `showStageAndPlaybookActions` | `show-stage-and-playbook-actions` | `Boolean` | `false`                              | **In development / temporary.** Opt-in gate for the stage-level and playbook-level declarative action bar and per-stage kebab menus.                                                                                                                                                                                                                                                                                                            |

### `config` object

Pass `config` as a property (not an attribute) since it is an object.

| Key                         | Type               | Default                  | Description                                                        |
| --------------------------- | ------------------ | ------------------------ | ------------------------------------------------------------------ |
| `layout`                    | `String \| Object` | `'vertical-all-stacked'` | Layout mode — string shorthand or object with options (see below)  |
| `compactMode`               | `Boolean`          | `false`                  | Collapse the picker column into a drawer trigger (see below)       |
| `activityWidth`             | `String`           | `'full'`                 | Activity card width (`'default'` or `'full'`)                      |
| `showActivityStatus`        | `Boolean`          | `true`                   | Whether to show activity status badges                             |
| `activityPicker.showStages` | `Boolean`          | `true`                   | Whether to show stage groupings in the activity picker (when used) |

#### `layout` property

`layout` accepts a string or an object. Use the string shorthand when no layout-specific options are needed:

```js
config = {layout: 'vertical-focused'};
```

Use the object form to pass layout-specific options:

```js
config = {
  layout: {
    type: 'vertical-focused',
    collapsiblePicker: true
  }
};
```

**Layout object properties:**

| Key                 | Type      | Default | Description                                                                                                                                       |
| ------------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`              | `String`  | ---     | Layout type (required — same values as the string form)                                                                                           |
| `collapsiblePicker` | `Boolean` | `false` | Show a "Show/Hide steps" toggle button in the card header. Only takes effect in `vertical-focused` layout. When active, the picker starts hidden. |

> `showOnlySelectedPlaybook` used to live here as a display-only flag scoped to one picker. It's been replaced by the top-level `onlyShowSelectedPlaybook` property (see the Properties table above), which filters at the data-provider level and applies across all layouts.

**Layout values** (pass these strings in `config.layout`; the package root does not currently export `PLAYBOOK_LAYOUT`):

| Value                    | Constant                               | Picker                        | Viewer            |
| ------------------------ | -------------------------------------- | ----------------------------- | ----------------- |
| `'vertical-all-stacked'` | `PLAYBOOK_LAYOUT.VERTICAL_ALL_STACKED` | Activity picker (show-stages) | Stacked           |
| `'vertical-stacked'`     | `PLAYBOOK_LAYOUT.VERTICAL_STACKED`     | Stage picker                  | Stacked           |
| `'vertical-focused'`     | `PLAYBOOK_LAYOUT.VERTICAL_FOCUSED`     | Activity picker (show-stages) | Focused           |
| `'guided'`               | `PLAYBOOK_LAYOUT.GUIDED`               | None (full-width)             | Guided            |
| `'wizard'`               | `PLAYBOOK_LAYOUT.WIZARD`               | None — own activity stepper   | Focused + stepper |

#### `compactMode`

`compactMode` is a top-level `config` property, since it applies independently of any layout-specific options:

```js
config = {layout: 'vertical-all-stacked', compactMode: true};
```

When active, the picker column collapses into `aiux-playbook-drawer` — a trigger bar (progress ring + selected stage title) that opens a popover with the full stage/activity picker; picking a stage or activity closes it automatically.

- **Always on below a 640px viewport**, regardless of `compactMode` — there isn't room for a side picker column at that width. `compactMode: true` forces it on at wider viewports too; the default (`false`) only collapses on narrow viewports.
- Only applies to vertical layouts (`vertical-all-stacked`, `vertical-stacked`, `vertical-focused`). `guided` has no picker column to collapse, and horizontal layouts aren't affected.
- Independent of `collapsiblePicker` — when compact mode is active, the "Show/Hide steps" toggle button does not render, since there's no picker column left for it to show or hide.

---

## Events

Playbook events use two namespaces:

- **`playbook-experience:*`** --- Host-facing events that bubble out of `<aiux-playbook>`. These are the public API for embedding pages.
- **`playbook-internal:*`** --- Internal coordination events consumed by the data provider. These never reach the host page. Do not rely on them.

### Host-facing events (public API)

All host-facing events use `bubbles: true, composed: true`.

| Event                                  | Detail                                                  | Description                                                       |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| `playbook-experience:open-record`      | `{ table, sysId, params?, targetRoute?, source?, ... }` | Host should navigate to the given record                          |
| `playbook-experience:open-list`        | `{ table, title, query, payload, action }`              | Host should open the given list view                              |
| `playbook-experience:state-change`     | `{ playbookContextId, state: {value, displayValue} }`   | Playbook reached a terminal state (COMPLETE, ERROR, or CANCELLED) |
| `playbook-experience:error`            | `{ error: string \| null }`                             | Service error state changed (non-null = error, null = recovered)  |
| `playbook-experience:record-generated` | `{ table: string, sysId: string }`                      | A record generator activity created a record                      |
| `aiux:open-chat`                       | `{ conversationId }`                                    | Open the AI chat panel with the given conversation ID             |
| `playbook-experience:activity-changed` | `{ contextId, title, state, isForm }`                   | In-view activity became in-progress (see below)                   |
| `playbook-experience:form-filled`      | `{ contextId, fieldNames }`                             | Form fields filled(see below)                                     |

### Handling record and list navigation

Playbook does not own the record or list page. When a user clicks a record link inside a list activity, or when an `OPEN_RECORD` / `OPEN_LIST` declarative action fires, Playbook emits an event. The embedding page is responsible for navigating:

```js
@customElement('my-playbook-page')
export default class MyPlaybookPage extends AIUXElement {
  render() {
    const {table, recordId} = this.loaderData;
    return html`
      <aiux-playbook
        parent-table=${table}
        parent-sys-id=${recordId}
        prefetch
        .preFetchedData=${this.loaderData.playbookData}
        @playbook-experience:open-record=${this._handleOpenRecord}
        @playbook-experience:open-list=${this._handleOpenList}
      ></aiux-playbook>
    `;
  }

  _handleOpenRecord(e) {
    const {table, sysId} = e.detail;
    navigate(`/my-app/record/${table}/${sysId}`);
  }

  _handleOpenList(e) {
    const {table, query} = e.detail;
    navigate(`/my-app/list/${table}?query=${encodeURIComponent(query ?? '')}`);
  }
}
```

### Reacting to playbook completion

The `playbook-experience:state-change` event fires when a playbook reaches a terminal state via an AMB update. Use this to navigate away, show a summary, or trigger follow-up actions.

```js
@customElement('my-playbook-page')
export default class MyPlaybookPage extends AIUXElement {
  render() {
    return html`
      <aiux-playbook
        parent-table=${this.parentTable}
        parent-sys-id=${this.parentSysId}
        @playbook-experience:state-change=${this._onStateChange}
      ></aiux-playbook>
    `;
  }

  _onStateChange(e) {
    const {playbookContextId, state} = e.detail;
    // state.value is 'COMPLETE', 'ERROR', or 'CANCELLED'
    // state.displayValue is the human-readable label
  }
}
```

### Handling data errors

`<aiux-playbook>` renders an error screen automatically when the data service enters an error state --- no action needed from consumers.

### Handling record generator completion

Some playbooks include a record generator activity --- a form that creates a new record and triggers a follow-up playbook. After the record is created, `<aiux-playbook>` dispatches `playbook-experience:record-generated` so the consumer page can update the URL or perform any other side effects. The playbook component handles the data transition internally (service re-creation, re-fetch, auto-advance to the next activity), so listening to this event is optional --- but recommended if the page URL contains the record ID.

```js
@customElement('my-playbook-page')
export default class MyPlaybookPage extends AIUXElement {
  render() {
    return html`
      <aiux-playbook
        parent-table=${this.parentTable}
        parent-sys-id=${this.parentSysId}
        @playbook-experience:record-generated=${this._onRecordGenerated}
      ></aiux-playbook>
    `;
  }

  _onRecordGenerated(e) {
    const {table, sysId} = e.detail;
    navigate(`/playbook/${table}/${sysId}`);
  }
}
```

### Reacting to activity/form state (e.g. narrating into chat)

When the in-view activity becomes in-progress, or a form is filled via a client tool, Playbook emits a structured, presentation-neutral event. Playbook does not own the chat surface or compose user-facing copy --- it emits state, and the host decides how (or whether) to present it (for example, narrating it into a chat conversation).

```js
class MyPlaybookPage extends AIUXElement {
  render() {
    return html`
      <aiux-playbook
        parent-table=${this.parentTable}
        parent-sys-id=${this.parentSysId}
        @playbook-experience:activity-changed=${this._onActivityChanged}
        @playbook-experience:form-filled=${this._onFormFilled}
      ></aiux-playbook>
    `;
  }

  _onActivityChanged(e) {
    const {contextId, title, state, isForm} = e.detail;
    // host composes its own copy, e.g. `We're now on ${title}.`
  }

  _onFormFilled(e) {
    const {contextId, fieldNames} = e.detail;
    // host composes its own copy, e.g. `Fields ${fieldNames.join(', ')} were filled.`
  }
}
```

---

## Deep Linking

The playbook supports deep linking via URL query parameters. Users can share or bookmark a link to a specific playbook, stage, or activity.

| Parameter                   | Description                              |
| --------------------------- | ---------------------------------------- |
| `selectedPlaybookContextId` | sys_id of the playbook context to select |
| `selectedStageContextId`    | sys_id of the stage to select            |
| `selectedActivityContextId` | sys_id of the activity to select         |

Parameters can be combined with increasing specificity:

- **Playbook only** --- selects the playbook, finds the first `IN_PROGRESS` activity within it
- **Playbook + stage** --- selects the stage, finds the first `IN_PROGRESS` activity in that stage
- **Playbook + stage + activity** --- selects the exact activity

If the parameters don't resolve to valid data, they are discarded and standard auto-advance takes over.

As the user navigates, the URL is automatically updated via `history.pushState`. Back/forward buttons restore previous selections client-side without a page reload.

### Programmatic selection

To select a playbook/stage/activity without a URL round-trip, pass the same parameter shape via the `deepLinkParams` property instead of a query string — on `<aiux-playbook>` it overrides the URL-parsed value, and on `<playbook-data-provider>` it's the only source (no URL parsing happens at that layer):

```js
html`<aiux-playbook
  parent-table=${table}
  parent-sys-id=${recordId}
  .deepLinkParams=${{selectedPlaybookContextId: myPlaybookContextId}}
></aiux-playbook>`;
```

---

## Auto Advance

When an activity reaches a terminal state (`COMPLETE`, `SKIPPED`, or `CANCELLED`), the playbook automatically advances the selection to the next actionable activity.

**Selection algorithm:**

1. Check the current stage for any `IN_PROGRESS` activity (forward first, then backward)
2. If all subsequent activities are terminal, search from the beginning of the playbook
3. Search for `IN_PROGRESS`, then `PENDING`
4. If a `PENDING` activity is found, wait up to 10 seconds for it to transition to `IN_PROGRESS`
5. If nothing is found, stay on the current selection

The stage picker also auto-advances when all visible activities in a stage reach a terminal state.

For the full algorithm details, see [docs/architecture.md](docs/architecture.md).

---

## SSR Compatibility

This component is compatible with `@lit-labs/ssr`.

| Constraint                        | How it is handled                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| No browser globals in `render()`  | `render()` uses only Lit templates and context state                                                               |
| Optional prefetch data            | Source-compatible data can be passed via `preFetchedData`; package-root SSR fetch helper is not currently exported |
| `isServer` guard for `aiux-list`  | The list renderer returns `nothing` on the server                                                                  |
| `initSanitizer()` client-only     | Guarded with `if (!isServer)` in `connectedCallback()`                                                             |
| All properties have safe defaults | Every property has an explicit default value                                                                       |

---

## Styling

All components use DaisyUI semantic tokens (`bg-base-100`, `border-base-300`, `text-text-primary`) and `aiux-`-prefixed DaisyUI component classes (`aiux-badge`, `aiux-badge-success`, `aiux-btn-primary`, etc.) which automatically adapt to the active DaisyUI theme. No custom CSS variables are required.

---

## Components

| Element                         | Class                    | Description                                                                                     |
| ------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| `aiux-playbook`                 | `PlaybookExperience`     | Root component --- renders the full experience                                                  |
| `playbook-data-provider`        | `PlaybookDataProvider`   | Data layer --- fetches, provides context, handles events                                        |
| `aiux-playbook-stage-picker`    | `PlaybookStagePicker`    | Stage selector sidebar with auto-advance and "Completed" badges                                 |
| `aiux-playbook-activity-picker` | `PlaybookActivityPicker` | Activity selector with hierarchical or flat layout                                              |
| `aiux-playbook-activity-viewer` | `PlaybookActivityViewer` | Renders cards for selected activity (focused, stacked, or guided)                               |
| `aiux-playbook-drawer`          | `PlaybookDrawer`         | Compact-mode picker --- drawer trigger that opens a popover with the full stage/activity picker |
| `playbook-guided-panel`         | `PlaybookGuidedPanel`    | Guided step-by-step view --- terminal accordion + in-progress cards                             |
| `playbook-card`                 | `PlaybookCard`           | Collapsible card with content widget + action buttons                                           |
| `aiux-playbook-modal`           | `PlaybookModal`          | Config-driven generic modal (confirmation, custom content)                                      |

---

## Modal

`<aiux-playbook-modal>` is a config-driven wrapper around `<aiux-modal>`, placed once inside `<playbook-experience>`. Any playbook sub-component can open a modal by dispatching a `playbook-internal:show-modal` event via the `dispatchShowModal` helper.

### Opening a modal

```js
import {dispatchShowModal} from '../events.js';

dispatchShowModal(this, {
  title: 'Restart stage?',
  message: 'All activities in this stage will be reset.',
  actions: [
    {label: 'Cancel', variant: 'ghost'},
    {label: 'Restart', variant: 'error'}
  ],
  onAction({label, index}) {
    if (label === 'Restart') {
      // perform restart
    }
  },
  onDismiss() {
    // user closed via backdrop or Escape
  }
});
```

### Config properties

| Property          | Type                   | Default | Description                                                                   |
| ----------------- | ---------------------- | ------- | ----------------------------------------------------------------------------- |
| `title`           | `string`               | ---     | Modal title (required --- also gates whether the modal is open)               |
| `message`         | `string`               | ---     | Plain-text body; newlines become separate `<p>` elements                      |
| `header`          | `TemplateResult`       | ---     | Custom header HTML (replaces the default title)                               |
| `content`         | `TemplateResult`       | ---     | Custom body HTML (replaces the message)                                       |
| `footer`          | `TemplateResult`       | ---     | Custom footer HTML (replaces the action buttons)                              |
| `actions`         | `Array<ActionConfig>`  | `[]`    | Action buttons rendered in the footer                                         |
| `size`            | `'sm' \| 'md' \| 'lg'` | `'sm'`  | Modal size                                                                    |
| `closeOnBackdrop` | `boolean`              | `true`  | Close on backdrop click                                                       |
| `closeOnEscape`   | `boolean`              | `true`  | Close on Escape key                                                           |
| `noDividers`      | `boolean`              | `true`  | Hide horizontal dividers between header/body/footer                           |
| `onAction`        | `Function`             | ---     | Callback when an action button is clicked; receives `{label, variant, index}` |
| `onDismiss`       | `Function`             | ---     | Callback when the modal is dismissed (backdrop or Escape)                     |

### ActionConfig

| Property    | Type      | Description                                                    |
| ----------- | --------- | -------------------------------------------------------------- |
| `label`     | `string`  | Button text                                                    |
| `variant`   | `string`  | Button style: `'primary'`, `'secondary'`, `'ghost'`, `'error'` |
| `disabled`  | `boolean` | Whether the button is disabled                                 |
| `ariaLabel` | `string`  | Accessible label for the button                                |

### Custom HTML content

Pass Lit `TemplateResult` values via `content`, `header`, or `footer` for full control over what the modal renders. To pass data from custom body content to action handlers, use a shared closure object:

```js
import {html} from 'lit';
import {dispatchShowModal} from '../events.js';

const selection = {value: null};

dispatchShowModal(this, {
  title: 'Choose an option',
  content: html`
    <label
      ><input
        type="radio"
        name="opt"
        value="a"
        @change=${() => {
          selection.value = 'a';
        }}
      />
      Option A</label
    >
    <label
      ><input
        type="radio"
        name="opt"
        value="b"
        @change=${() => {
          selection.value = 'b';
        }}
      />
      Option B</label
    >
  `,
  actions: [{label: 'Confirm', variant: 'primary'}],
  onAction() {
    console.log('Selected:', selection.value);
  }
});
```

### Modal events

| Event                             | Detail            | Description                                              |
| --------------------------------- | ----------------- | -------------------------------------------------------- |
| `playbook-internal:show-modal`    | `ModalConfig`     | Opens the modal (handled by `playbook-experience`)       |
| `playbook-internal:modal-action`  | `{action, index}` | Action button clicked (handled by `playbook-experience`) |
| `playbook-internal:modal-dismiss` | ---               | Modal dismissed via backdrop or Escape                   |

All modal events are internal (`playbook-internal:*`) and are stopped by `playbook-experience`. They never reach the host page.

---

## Exports

The primary way to use this package is the side-effect import (see [Installation](#installation)), which registers `<aiux-playbook>` and all sub-components. No named import is required for the common case.

The package entry point (`@servicenow/aiux-components-playbook`) currently re-exports exactly four named symbols:

```js
import {
  PlaybookExperience, // the <aiux-playbook> root component class
  PlaybookDataProvider, // the <playbook-data-provider> data-layer class
  withPlaybookContext, // mixin: custom widget action lifecycle
  withPlaybookFormContext // mixin: form widget lifecycle
} from '@servicenow/aiux-components-playbook';
```

### Not currently exported from the package root

The source barrel (`src/index.js`) defines additional symbols, but the package's published entry point (`index.js`, referenced by `package.json`'s `main`/`exports`) does **not** re-export them. Importing any of the following from `@servicenow/aiux-components-playbook` will fail today — they are internal implementation details, not part of the public API surface:

- **Components / renderers:** `PlaybookActions`, `PlaybookBasicForm`, `dynamicWidgetRenderer`
- **Controllers:** `PlaybookCardController`, `PlaybookController`
- **Contexts:** `playbookContext`, `playbookActivityContext`
- **Utilities:** `fetchPlaybookContexts`, `getVisibleLanes`, `getVisibleCards`, `getCardTagline`, `getStateBadgeClass`, `getInitialContextIndex`, `getInitialLaneIndex`, `hasCardWithState`, `getTargetState`
- **Constants:** `PLAYBOOK_LAYOUT`, `ACTIVITY_VIEW_MODES`, `ORIENTATIONS`, `TERMINAL_ACTIVITY_STATES`, `PLAYBOOK_EXPERIENCE_ID`, `ACTION_TO_STATE`

---

## Further Reading

| Document                                                         | Audience                    | Description                                                                                                                       |
| ---------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [docs/activity-authoring.md](docs/activity-authoring.md)         | Activity definition authors | How to configure content widgets and playbook actions (DAs) for activity definitions, and how to migrate from the legacy registry |
| [docs/architecture.md](docs/architecture.md)                     | Internal developers         | Component hierarchy, data flow, event system, DA bridge internals, AMB handling, auto-advance algorithm                           |
| [docs/custom-experience-ui.md](docs/custom-experience-ui.md)     | BUs building custom UIs     | Contract for building custom playbook experience UIs (planned --- not yet ready for external use)                                 |
| [docs/da-bridge-capabilities.md](docs/da-bridge-capabilities.md) | Internal developers         | DA bridge capability summary                                                                                                      |
| [docs/da-bridge-status.md](docs/da-bridge-status.md)             | Internal developers         | DA bridge status and gap analysis                                                                                                 |

### Custom playbook experience UIs

Building a fully custom playbook experience UI (custom layout, pickers, cards) on top of the playbook data provider is a planned capability. The architectural direction uses a reusable provider + dynamic widget renderer pattern where the provider and canonical events are the fixed spine, and everything above (layout, pickers, card chrome) is replaceable. See [docs/custom-experience-ui.md](docs/custom-experience-ui.md) for the current direction. This is not yet ready for external consumption --- reach out to the playbook team before building on it.
