# @servicenow/aiux-components-document-viewer

## Import

```js
import '@servicenow/aiux-components-document-viewer';
```


Document viewer component for rendering ServiceNow attachments including PDFs, images, text, JSON, and Office documents converted server-side.

- **Tag:** `<aiux-document-viewer>`
- **Package:** `@servicenow/aiux-components-document-viewer`
- **Upstream:** `@servicenow/aiux-document-viewer@1.1.3`

---

## Table of Contents

- [Installation](#installation)
- [Usage (Lit)](#usage-lit)
- [Properties](#properties)
- [Outbound Events](#outbound-events)
- [Inbound Commands](#inbound-commands)
- [Error Handling](#error-handling)
- [Supported File Types](#supported-file-types)
- [Exports](#exports)
- [Development](#development)

---

## Installation

This package is a workspace dependency in the karuna monorepo:

```json
{
  "dependencies": {
    "@servicenow/aiux-components-document-viewer": "workspace:*"
  }
}
```

---

## Usage (Lit)

### Basic usage

```ts
import {html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux-components-core';
import '@servicenow/aiux-components-document-viewer';

@customElement('my-feature')
class MyFeature extends AIUXElement {
  @state() private sysId = 'abc123def456';

  override render() {
    return html`
      <aiux-document-viewer .sysId=${this.sysId}></aiux-document-viewer>
    `;
  }
}
```

### All properties

```ts
html`
  <aiux-document-viewer
    .sysId=${'abc123def456'}
    .maxFileSizeMb=${100}
    .officePreview=${true}
    .search=${{query: 'hello'}}
    .zoom=${true}
    .navigation=${true}
    .rotation=${true}
    .download=${true}
    .close=${true}
    .fileName=${true}
    .keyboardShortcuts=${true}
    style="flex: 1; min-height: 0;"
  ></aiux-document-viewer>
`;
```

### Listening to events

```ts
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux-components-core';
import '@servicenow/aiux-components-document-viewer';

@customElement('my-feature')
class MyFeature extends AIUXElement {
  private _onDocumentLoaded(e: CustomEvent) {
    const {sysId, fileName, kind, contentType, fileSize} = e.detail;
    console.log(`Loaded "${fileName}" (${kind}, ${fileSize} bytes)`);
  }

  private _onViewerLoaded(e: CustomEvent) {
    const {kind, capabilities, totalPages} = e.detail;
    console.log(`Viewer ready: ${kind}, ${totalPages} pages`, capabilities);
  }

  override render() {
    return html`
      <aiux-document-viewer
        .sysId=${'abc123def456'}
        @dv:document:loaded=${this._onDocumentLoaded}
        @dv:viewer:loaded=${this._onViewerLoaded}
        @dv:document:load-error=${(e: CustomEvent) => {
          console.error('Load error:', e.detail.message);
        }}
      ></aiux-document-viewer>
    `;
  }
}
```

### Sending commands

```ts
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {createRef, ref} from 'lit/directives/ref.js';
import {AIUXElement} from '@servicenow/aiux-components-core';
import {dispatchCommand} from '@servicenow/aiux-components-document-viewer';

@customElement('my-feature')
class MyFeature extends AIUXElement {
  private _viewerRef = createRef<HTMLElement>();

  private _zoomIn() {
    if (this._viewerRef.value) {
      dispatchCommand(this._viewerRef.value, 'zoom.in');
    }
  }

  override render() {
    return html`
      <aiux-document-viewer
        ${ref(this._viewerRef)}
        .sysId=${'abc123def456'}
      ></aiux-document-viewer>
      <button @click=${this._zoomIn}>Zoom In</button>
    `;
  }
}
```

---

## Properties

All properties are reactive and inherited from `@servicenow/aiux-document-viewer`. **All feature properties default to `true`**.

### Core Properties

| Property        | Attribute          | Type      | Default | Description                                              |
| --------------- | ------------------ | --------- | ------- | -------------------------------------------------------- |
| `sysId`         | `sys-id`           | `string`  | `''`    | ServiceNow attachment `sys_id` to display.               |
| `maxFileSizeMb` | `max-file-size-mb` | `number`  | `50`    | Maximum file size in MB before rejecting preview.        |
| `officePreview` | `office-preview`   | `boolean` | `true`  | Convert Office docs (docx/xlsx/pptx) to PDF server-side. |
| `hidden`        | `hidden`           | `boolean` | `false` | Hide the viewer. Reflected to attribute.                 |

### Feature Properties

| Property            | Attribute            | Type                      | Default | Description                                                            |
| ------------------- | -------------------- | ------------------------- | ------- | ---------------------------------------------------------------------- |
| `search`            | _(property-only)_    | `boolean \| SearchConfig` | `true`  | Search feature (PDF only). Pass `{ query: '...' }` for initial search. |
| `zoom`              | `zoom`               | `boolean`                 | `true`  | Zoom in/out controls (PDF only).                                       |
| `navigation`        | `navigation`         | `boolean`                 | `true`  | Page navigation — previous/next/go-to (PDF only).                      |
| `rotation`          | `rotation`           | `boolean`                 | `true`  | Rotate left/right controls (PDF only).                                 |
| `download`          | `download`           | `boolean`                 | `true`  | Download button.                                                       |
| `close`             | `close`              | `boolean`                 | `true`  | Close button. Emits `dv:viewer:closed` and sets `hidden=true`.         |
| `fileName`          | `file-name`          | `boolean`                 | `true`  | File name chip displayed in the toolbar.                               |
| `keyboardShortcuts` | `keyboard-shortcuts` | `boolean`                 | `true`  | Keyboard shortcuts for zoom, navigation, search, etc.                  |

#### `SearchConfig`

```ts
interface SearchConfig {
  query?: string; // Initial search query to execute when the viewer loads
}
```

---

## Outbound Events

All events are standard DOM `CustomEvent`s dispatched on the `<aiux-document-viewer>` element. Access the payload via `event.detail`. In Lit templates, use `@event-name=${handler}` syntax.

### Document Lifecycle Events

| Event                    | Payload                     | Description                                        |
| ------------------------ | --------------------------- | -------------------------------------------------- |
| `dv:document:loading`    | `DocumentLoadingPayload`    | Attachment metadata fetch started.                 |
| `dv:document:loaded`     | `DocumentLoadedPayload`     | Attachment metadata resolved; renderer selected.   |
| `dv:document:unloaded`   | `void`                      | Document unloaded (new `sysId` or teardown).       |
| `dv:document:converting` | `DocumentConvertingPayload` | Office→PDF server-side conversion in progress.     |
| `dv:document:no-preview` | `DocumentNoPreviewPayload`  | Preview unavailable (unsupported, infected, etc.). |
| `dv:document:load-error` | `DocumentLoadErrorPayload`  | An error occurred during document loading.         |

#### Payload Types

```ts
interface DocumentLoadingPayload {
  sysId: string;
}

interface DocumentLoadedPayload {
  sysId: string;
  fileName: string;
  kind: 'pdf' | 'image' | 'text' | 'office' | 'unsupported';
  contentType: string; // MIME type
  fileSize: number; // bytes
}

interface DocumentConvertingPayload {
  sysId: string;
  fileName: string;
}

interface DocumentNoPreviewPayload {
  sysId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  reason: string; // 'infected' | 'scan-pending' | 'size-exceeded' | 'unsupported'
  downloadBlocked: boolean;
  message: string;
}

interface DocumentLoadErrorPayload {
  sysId: string;
  error: Error & {code?: string};
  message: string;
}
```

### Viewer Events

| Event                         | Payload                         | Description                                 |
| ----------------------------- | ------------------------------- | ------------------------------------------- |
| `dv:viewer:loaded`            | `ViewerLoadedPayload`           | Renderer is ready and content is displayed. |
| `dv:viewer:page-changed`      | `ViewerPageChangedPayload`      | Current page changed (PDF only).            |
| `dv:viewer:zoom-changed`      | `ViewerZoomChangedPayload`      | Zoom scale changed (PDF only).              |
| `dv:viewer:rotation-changed`  | `ViewerRotationChangedPayload`  | Rotation angle changed (PDF only).          |
| `dv:viewer:password-required` | `ViewerPasswordRequiredPayload` | PDF is password-protected.                  |
| `dv:viewer:closed`            | `ViewerClosedPayload`           | Viewer was closed by the user.              |

#### Payload Types

```ts
interface ViewerLoadedPayload {
  kind: 'pdf' | 'image' | 'text' | 'office' | 'unsupported';
  capabilities: {
    search: boolean;
    zoom: boolean;
    rotation: boolean;
    navigation: boolean;
  };
  sysId: string;
  fileName: string;
  fileSize: number; // bytes
  contentType: string; // MIME type
  url?: string; // PDF viewer URL (pdf kind only)
  totalPages: number; // Page count (0 for non-PDF)
}

interface ViewerPageChangedPayload {
  currentPage: number;
  totalPages: number;
  sysId: string | null;
}

interface ViewerZoomChangedPayload {
  scale: number; // e.g. 1.5 = 150%
  preset?: string;
}

interface ViewerRotationChangedPayload {
  rotation: number; // degrees (0, 90, 180, 270)
}

interface ViewerPasswordRequiredPayload {
  url: string;
  invalidPassword: boolean;
}

interface ViewerClosedPayload {
  sysId: string;
}
```

### Search Events

| Event                       | Payload                       | Description                            |
| --------------------------- | ----------------------------- | -------------------------------------- |
| `dv:search:results-updated` | `SearchResultsUpdatedPayload` | Search results count/position changed. |

```ts
interface SearchResultsUpdatedPayload {
  query: string;
  totalMatches: number;
  currentMatch: number; // 1-based index of current highlight
  sysId: string | null;
}
```

### Download Events

| Event                 | Payload                  | Description                  |
| --------------------- | ------------------------ | ---------------------------- |
| `dv:download:started` | `DownloadStartedPayload` | File download was initiated. |

```ts
interface DownloadStartedPayload {
  sysId: string;
  fileName: string;
}
```

---

## Inbound Commands

Use `dispatchCommand()` to programmatically control the viewer. The wrapper package exports this runtime function but does not ship TypeScript declarations; compile-time command typing requires importing upstream types from `@servicenow/aiux-document-viewer` (see [TypeScript types](#typescript-types)).

```js
import {dispatchCommand} from '@servicenow/aiux-components-document-viewer';
```

### Document Commands

| Command          | Arguments                        | Return          | Description                       |
| ---------------- | -------------------------------- | --------------- | --------------------------------- |
| `document.load`  | `(options: DocumentLoadOptions)` | `Promise<void>` | Programmatically load a document. |
| `document.abort` | `()`                             | `void`          | Abort the current load operation. |

```ts
interface DocumentLoadOptions {
  sysId: string;
  maxFileSizeMb: number;
  officePreview: boolean;
}
```

### Zoom Commands

| Command      | Arguments | Return   | Description                           |
| ------------ | --------- | -------- | ------------------------------------- |
| `zoom.in`    | `()`      | `number` | Zoom in one step. Returns new scale.  |
| `zoom.out`   | `()`      | `number` | Zoom out one step. Returns new scale. |
| `zoom.reset` | `()`      | `number` | Reset to default zoom.                |

### Navigation Commands

| Command               | Arguments        | Return | Description                     |
| --------------------- | ---------------- | ------ | ------------------------------- |
| `navigation.next`     | `()`             | `void` | Go to the next page.            |
| `navigation.previous` | `()`             | `void` | Go to the previous page.        |
| `navigation.goToPage` | `(page: number)` | `void` | Jump to a specific page number. |

### Search Commands

| Command           | Arguments         | Return | Description                     |
| ----------------- | ----------------- | ------ | ------------------------------- |
| `search.query`    | `(query: string)` | `void` | Execute a search query.         |
| `search.next`     | `()`              | `void` | Navigate to the next match.     |
| `search.previous` | `()`              | `void` | Navigate to the previous match. |
| `search.clear`    | `()`              | `void` | Clear the current search.       |

### Rotation Commands

| Command          | Arguments | Return   | Description                                  |
| ---------------- | --------- | -------- | -------------------------------------------- |
| `rotation.left`  | `()`      | `number` | Rotate 90° counter-clockwise. Returns angle. |
| `rotation.right` | `()`      | `number` | Rotate 90° clockwise. Returns angle.         |
| `rotation.reset` | `()`      | `number` | Reset rotation to 0°. Returns angle.         |

### Download Commands

| Command          | Arguments          | Return | Description                                 |
| ---------------- | ------------------ | ------ | ------------------------------------------- |
| `download.start` | `(sysId?: string)` | `void` | Start download. Uses current doc if no arg. |

### Viewer Commands

| Command         | Arguments            | Return | Description                                 |
| --------------- | -------------------- | ------ | ------------------------------------------- |
| `viewer.unlock` | `(password: string)` | `void` | Unlock a password-protected PDF.            |
| `viewer.close`  | `()`                 | `void` | Close the viewer. Emits `dv:viewer:closed`. |

---

## Error Handling

```ts
import {
  DocumentViewerError,
  DocumentViewerErrorCode
} from '@servicenow/aiux-components-document-viewer';
```

### Error Codes

| Code                      | User Message                                             |
| ------------------------- | -------------------------------------------------------- |
| `NETWORK_ERROR`           | A network error occurred while loading the document.     |
| `NOT_FOUND`               | The requested document was not found.                    |
| `UNAUTHORIZED`            | You do not have permission to view this document.        |
| `FILE_NOT_FOUND`          | The requested document could not be found.               |
| `FILE_TYPE_NOT_SUPPORTED` | This file type is not supported for preview.             |
| `FILE_SIZE_EXCEEDED`      | This file is too large to preview.                       |
| `FILE_INFECTED`           | This file failed the security scan and cannot be viewed. |
| `FILE_SCAN_PENDING`       | This file is being scanned for security threats.         |
| `PASSWORD_REQUIRED`       | This document is password-protected.                     |
| `INVALID_PASSWORD`        | Incorrect password. Please try again.                    |
| `CONVERSION_FAILED`       | Could not convert this document for preview.             |
| `PARSE_ERROR`             | This document could not be parsed.                       |
| `UNKNOWN_ERROR`           | An unexpected error occurred.                            |

---

## Supported File Types

| Category   | Extensions / MIME Types                                                                | Renderer  | Features Available                 |
| ---------- | -------------------------------------------------------------------------------------- | --------- | ---------------------------------- |
| **PDF**    | `.pdf` (`application/pdf`)                                                             | PDF.js    | Search, Zoom, Navigation, Rotation |
| **Image**  | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`, `.ico`                       | `<img>`   | _(view only)_                      |
| **Text**   | `.txt`, `.json`, `.xml`, `.csv`, `.log`, `.md`, `.html`, `.css`, `.js`, `.ts`, `.yaml` | `<pre>`   | _(view only)_                      |
| **Office** | `.docx`, `.xlsx`, `.pptx` (requires `officePreview=true`)                              | PDF.js \* | Search, Zoom, Navigation, Rotation |

\* Office documents are converted to PDF server-side before rendering.

### Viewer Capabilities

| Viewer | `search` | `zoom` | `rotation` | `navigation` |
| ------ | -------- | ------ | ---------- | ------------ |
| PDF    | ✅       | ✅     | ✅         | ✅           |
| Image  | ❌       | ❌     | ❌         | ❌           |
| Text   | ❌       | ❌     | ❌         | ❌           |

---

## Exports

This package's entry point (`index.js`) proxies the four runtime values from `@servicenow/aiux-document-viewer`. Tag registration and SSR/pdfjs handling are delegated upstream.

```ts
// Proxied from @servicenow/aiux-document-viewer
export const DocumentViewer;
export const dispatchCommand;
export const DocumentViewerError;
export const DocumentViewerErrorCode;
```

### TypeScript types

This wrapper package does **not** ship type declarations (no `types` field in its `package.json`, and `index.js` re-exports only the runtime values above). TypeScript will not resolve types through this package. To get typed properties, events, and commands, import the type-only symbols directly from the upstream package, which ships its own `.d.ts`:

```ts
import type {
  DocumentViewerProps,
  DocumentViewerEventMap,
  SearchConfig
} from '@servicenow/aiux-document-viewer';
```

---

## Development

### Test

```bash
pnpm test
```

### Storybook

Run from the karuna repo root:

```bash
pnpm storybook
```

Navigate to **Components → Document Viewer** in the Storybook sidebar.

### Upstream

All core logic lives in [`@servicenow/aiux-document-viewer`](https://code.devsnc.com/dev/sn-document-viewer-lit). This package is a thin wrapper that proxies the upstream runtime exports (`DocumentViewer`, `dispatchCommand`, `DocumentViewerError`, `DocumentViewerErrorCode`). Tag registration and SSR/pdfjs handling are delegated to the upstream package.
