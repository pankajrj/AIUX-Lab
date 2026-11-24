# @servicenow/controller-aria-live

## Import

```js
import {AriaLiveController} from '@servicenow/aiux-controller-aria-live';
```


A standalone, Lit-compatible controller that announces messages to screen readers via partitioned `aria-live` region pairs on `document.body`.

## When to use

Use this controller for **programmatic announcements** — button clicks, async operation results, global notifications — that aren't tied to a specific template element: call `announce()` from anywhere and it queues the message into a shared, page-level `aria-live` region.

Use `@servicenow/aiux-directive-live-region` (the `liveRegion()` directive) instead when the announcement should be **declarative and localized** to one template — a form field error, a status message rendered next to specific UI, or when you need fine-grained control over `atomic`/`relevant`/`busy`/`role` on that specific region.

## Features

- **Partitioned regions** — each `aria-live` value (`polite`, `assertive`) gets its own pair of regions. Attributes are set once at creation and never overwritten, so multiple controller instances with different priorities never interfere with each other.
- **Eager region creation** — all region pairs are appended to `document.body` at module import time, before any `announce()` call. Screen readers (NVDA, JAWS, VoiceOver) register their mutation observers at page load; lazily-created regions are often never observed.
- **Alternating A/B regions** — each flush writes to the next region in the pair and clears the previous one, so even identical consecutive messages always land as a fresh DOM mutation.
- **Automatic per-message task scheduling** — rapid-fire `announce()` calls are queued and each flushed in its own macrotask with a 150 ms delay between each. This gives screen readers enough time to process each mutation individually, preventing them from coalescing rapid DOM writes and only reading the last one.
- **Polite by default** — works out of the box with no configuration.
- **Standalone + Lit host** — no Lit host required; implements `ReactiveController` for optional integration.

## Installation

```bash
pnpm add @servicenow/controller-aria-live
```

## Usage

### Basic (standalone)

```js
import {AriaLiveController} from '@servicenow/controller-aria-live';

const live = new AriaLiveController();
live.announce('3 items added to cart');
```

### With a Lit host

```js
import {LitElement} from 'lit';
import {AriaLiveController} from '@servicenow/controller-aria-live';

class MyElement extends LitElement {
  _live = new AriaLiveController(this);

  _onSave() {
    this._live.announce('Changes saved.');
  }
}
```

### Assertive (interrupts screen reader immediately)

```js
const live = new AriaLiveController({live: 'assertive'});
live.announce('Critical error — connection lost.');
```

### Rapid-fire

```js
const live = new AriaLiveController();
live.announce('Step 1 complete');
live.announce('Step 2 complete');
live.announce('Step 3 complete');
// All three are queued immediately. Each is flushed in its own macrotask
// with a 150 ms delay between each, giving the screen reader enough time
// to announce each one individually.
```

## API

### `new AriaLiveController(host?, options?)`

| Parameter      | Type                           | Description                                                        |
| -------------- | ------------------------------ | ------------------------------------------------------------------ |
| `host`         | `ReactiveControllerHost`       | Optional Lit host. Pass to auto-register. Omit for standalone use. |
| `options.live` | `'off'\|'polite'\|'assertive'` | Initial `aria-live` value. Default: `'polite'`.                    |

### Properties

| Property | Type                           | Default    | Description                                           |
| -------- | ------------------------------ | ---------- | ----------------------------------------------------- |
| `live`   | `'off'\|'polite'\|'assertive'` | `'polite'` | Gets/sets which region pair the controller writes to. |

### Methods

| Method               | Description                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `announce(message)`  | Enqueues `message`. Each message is flushed in its own macrotask (150 ms apart), writing to the next region slot (A/B alternating) and clearing the other. |
| `clear()`            | Empties this controller's region pair and cancels any pending queue.                                                                                       |
| `hostConnected()`    | No-op.                                                                                                                                                     |
| `hostDisconnected()` | Calls `clear()`.                                                                                                                                           |
| `destroy()`          | Calls `hostDisconnected()` and removes the controller from the host.                                                                                       |

## Demo

```bash
pnpm --filter @servicenow/controller-aria-live dev
```

## Tests

```bash
pnpm --filter @servicenow/controller-aria-live test
```
