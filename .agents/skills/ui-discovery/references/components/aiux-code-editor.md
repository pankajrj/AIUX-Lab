# AIUX Code Editor Component

## Import

```js
import '@servicenow/aiux-components-code-editor';
```


A Monaco-based source code editor for the AIUX platform with syntax highlighting, an optional toolbar, fullscreen mode, and optional linting and autocomplete.

## Installation

```bash
pnpm add @servicenow/aiux-components-code-editor
```

## Usage

```javascript
import '@servicenow/aiux-components-code-editor';
```

```html
<aiux-code-editor
  value="console.log('Hello, World!');"
  language="javascript"
  height="400px"
></aiux-code-editor>
```

## Properties

Lit lowercases camelCase property names when mapping them to HTML attributes (it does not use kebab-case), so `readOnly` is set via the `readonly` attribute. Object-typed properties (`linting`, `autocomplete`) have no attribute and must be set via property binding (`.linting=${...}`).

| Property               | Attribute              | Type      | Default                              | Description                                                                                  |
| ---------------------- | ---------------------- | --------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `value`                | `value`                | `String`  | `''`                                 | Editor content. Kept in sync as the user types (uncontrolled).                               |
| `language`             | `language`             | `String`  | `'javascript'`                       | Language for syntax highlighting (`javascript`, `typescript`, `json`, `xml`, `html`, `css`). |
| `height`               | `height`               | `String`  | `'400px'`                            | Height of the editor.                                                                        |
| `width`                | `width`                | `String`  | `'100%'`                             | Width of the editor.                                                                         |
| `readOnly`             | `readonly`             | `Boolean` | `false`                              | Whether the editor is read-only.                                                             |
| `scrollBeyondLastLine` | `scrollbeyondlastline` | `Boolean` | `true`                               | Allow scrolling past the last line.                                                          |
| `autoresizeLineLimit`  | `autoresizelinelimit`  | `Number`  | `0`                                  | Max lines before a fixed max-height is applied. `0` disables autoresize.                     |
| `hideToolbar`          | `hide-toolbar`         | `Boolean` | `false`                              | Hide the toolbar. Reflected to the attribute.                                                |
| `scriptField`          | `scriptfield`          | `String`  | `''`                                 | Script field name for JavaScript linting/autocomplete context.                               |
| `sysId`                | `sysid`                | `String`  | `''`                                 | Record sys_id for JavaScript linting/autocomplete context.                                   |
| `recordType`           | `recordtype`           | `String`  | `''`                                 | Table name for JavaScript linting/autocomplete context.                                      |
| `isClientScript`       | `isclientscript`       | `Boolean` | `false`                              | Whether this is a client-side script (affects linting rules).                                |
| `scope`                | `scope`                | `String`  | `'global'`                           | Application scope for autocomplete.                                                          |
| `linting`              | —                      | `Object`  | `{disabled: false}`                  | Linting config: `{disabled?, lintConfig?}`. Set via property binding.                        |
| `autocomplete`         | —                      | `Object`  | `{disabled: false, lazyLoad: false}` | Autocomplete config: `{disabled?, lazyLoad?, customCompletions?}`. Set via property binding. |

`value` is an uncontrolled reactive property — read it back or set it programmatically:

```javascript
const editor = document.querySelector('aiux-code-editor');
const code = editor.value; // read current content
editor.value = 'const x = 42;'; // set content programmatically
```

## Events

All events bubble and are composed (cross Shadow DOM boundaries).

| Event                                        | `detail` shape                                                 | Fired when                                                       |
| -------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `AIUX_CODE_EDITOR#CONTENT_CHANGED`           | `{text: string, errors: LintError[], lintingEnabled: boolean}` | Content changes (and when lint errors change).                   |
| `AIUX_CODE_EDITOR#TEXT_EDITOR_FOCUS_CHANGED` | `{hasFocus: boolean}`                                          | The editor gains or loses focus.                                 |
| `AIUX_CODE_EDITOR#FULLSCREEN_TOGGLED`        | `{isFullScreen: boolean}`                                      | Fullscreen mode is toggled (toolbar button or `Escape` to exit). |

`LintError` shape: `{message: string, severity: 'error' | 'warning' | 'info' | 'hint', from: {line, column}, to: {line, column}}`.

## Toolbar

When `hideToolbar` is `false` (default), a toolbar (via `<aiux-toolbar>`) provides: Find, Toggle comment, Format code, Toggle syntax check (JavaScript only), and Fullscreen. Syntax check, comment, and format are disabled in read-only mode.

## Example

```javascript
import {html} from 'lit';
import '@servicenow/aiux-components-code-editor';

const template = html`
  <aiux-code-editor
    .value=${"function greet(name) {\n  return 'Hello, ' + name;\n}"}
    language="typescript"
    height="300px"
    ?readonly=${false}
    .linting=${{disabled: false}}
    @AIUX_CODE_EDITOR#CONTENT_CHANGED=${e => console.log(e.detail.text)}
  ></aiux-code-editor>
`;
```

## Technical Details

- Built with Lit 3.x, extends `AIUXElement` from `@servicenow/aiux-components-core`.
- Uses Monaco Editor 0.38.0.
- Uncontrolled component — manages its own state and syncs `value`.
- SSR-compatible: Monaco initialization is guarded with `isServer` and runs client-side only.
- Disposes the Monaco instance, linting/autocomplete managers, and listeners on disconnect.

## Related Components

- `aiux-toolbar` (`components/toolbar`) — renders the editor's action toolbar.

## Browser Support

Supports all modern browsers that Monaco Editor supports.
