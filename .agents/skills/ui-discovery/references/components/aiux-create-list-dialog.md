## aiux-list-nav-menu

## Import

```js
import '@servicenow/aiux-list-nav-menu';
```


 List Navigation Menu Component for Karuna

### Owners

> reshma.syeda

---

## Installation

### From npm registry (once published)

```bash
npm install @servicenow/aiux-list-nav-menu
```

### From a local checkout (before registry publishing)

Point your `package.json` at the local repo using a `file:` path:

```json
"dependencies": {
  "@servicenow/aiux-list-nav-menu": "file:/absolute/path/to/aiux-list-nav-menu"
}
```

Then install:

```bash
pnpm install
```

The package ships a pre-built `dist/` so no build step is required in the consuming project.

### Peer dependencies

```json
{
  "@servicenow/aiux-components-core": "*",
  "@servicenow/aiux-components-tabs": "1.2.0",
  "@servicenow/aiux-components-dialog": "2.1.3",
  "@servicenow/aiux-components-condition-builder": "*",
  "lit": "^3.3.2"
}
```

---

## Usage

### 1. Import the component

```js
import '@servicenow/aiux-list-nav-menu';
import '@servicenow/aiux-components-list';
```

### 2. Wire it in your page

```js
import {html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {AIUXElement, decorators, elementId} from '@servicenow/aiux-components-core';

const {global} = decorators;

@global(false)
@customElement('page-list')
export default class PageList extends AIUXElement {
  static styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
    }
  `;

  @state() _table = '';
  @state() _query = '';
  @state() _columns = [];
  @state() _layout = 'vertical';

  _onListMenuSelect(e) {
    this._table = e.detail.table;
    this._query = e.detail.query;
    this._columns = e.detail.columns || [];
  }

  _onLayoutChange(e) {
    this._layout = e.detail.layout;
  }

  render() {
    return html`
      <div style="display:flex;flex-direction:${this._layout === 'horizontal' ? 'column' : 'row'};width:100%;height:100%;">
        <aiux-list-nav-menu
          aiux-config-data=${elementId(this, 'listmenu')}
          .myListsPrefKey=${'my-app.my-lists'}
          .layout=${this._layout}
          .activeTable=${this._table}
          .activeQuery=${this._query}
          @aiux-list-nav-menu:select=${this._onListMenuSelect}
          @aiux-list-nav-menu:layout-change=${this._onLayoutChange}
        ></aiux-list-nav-menu>
        <aiux-list-connected
          style="flex:1;min-height:0;min-width:0;"
          .table=${this._table}
          .query=${this._query}
          .columns=${this._columns.join(',')}
        ></aiux-list-connected>
      </div>
    `;
  }
}
```

### 3. Configure categories via `sys_aix_configuration`

The menu categories are loaded from the AIUX config system. Create a `sys_aix_configuration` record with:

| Field | Value |
|---|---|
| **Tag** | your page's tag name (e.g. `page-list`) |
| **Experience Path** | your app's basename (e.g. `my-app`) |
| **Page Path** | your page route (e.g. `list`) |
| **Name** | `listmenu.categories` |
| **Value** | JSON array of category objects (see format below) |

#### Categories JSON format

```json
[
  {
    "id": "incidents",
    "label": "Incidents",
    "children": [
      { "id": "inc-all",  "label": "All",      "table": "incident", "query": "" },
      { "id": "inc-open", "label": "Open",     "table": "incident", "query": "active=true" },
      { "id": "inc-mine", "label": "Assigned to me", "table": "incident", "query": "assigned_toDYNAMIC0f63961e5f510100a9ad2572f2b47745" }
    ]
  },
  {
    "id": "requests",
    "label": "Requests",
    "children": [
      { "id": "req-open", "label": "Open Requests", "table": "sc_request",  "query": "active=true" },
      { "id": "req-items","label": "Open Items",    "table": "sc_req_item", "query": "active=true" }
    ]
  }
]
```

The `elementId(this, 'listmenu')` directive in your page's template filters the page's `aiuxConfigData` for keys prefixed `listmenu.` and passes `{ categories: [...] }` to the component automatically.

---

## Deep linking via `list-id` query param

On load, the component reads the `list-id` URL query parameter and auto-selects the matching list item, firing `aiux-list-nav-menu:select` for it. If no `list-id` is present or no match is found, the first item in the first category is selected by default.

```
/aiux/my-app/list?list-id=inc-open
```

---

## API

### Properties

| Property | Type | Default | Attribute | Description |
|---|---|---|---|---|
| `layout` | `String` | `'vertical'` | `layout` | `'vertical'` (sidebar) or `'horizontal'` (top bar) |
| `showListMenuPinToggle` | `Boolean` | `true` | — | Show/hide the pin/unpin toggle button |
| `myListsPrefKey` | `String` | `'aiux.workspace.my-lists'` | — | `sys_user_preference` name used to persist the user's My Lists. Set a unique key per app to avoid collisions between consumers |
| `activeTable` | `String` | `''` | `active-table` | Currently active table (for highlight state) |
| `activeQuery` | `String` | `''` | `active-query` | Currently active query (for highlight state) |
| `showSharedWithMe` | `Boolean` | `false` | `show-shared-with-me` | Show the "Shared with me" section in both vertical and horizontal layouts. Hidden by default until the feature is supported. |
| `showOpenedByLink` | `Boolean` | `false` | `show-opened-by-link` | Show the "Opened by link" section in vertical layout when `activeTable` is set. Hidden by default. |

### Events

| Event | Detail | Description |
|---|---|---|
| `aiux-list-nav-menu:select` | `{ table, query, id, columns? }` | Fired when the user selects a list item. Wire `table` and `query` to `aiux-list-connected` |
| `aiux-list-nav-menu:layout-change` | `{ layout }` | Fired when user pins/unpins the sidebar. `layout` is `'vertical'` or `'horizontal'` |

---

## Notes

- The package ships pre-compiled to `vN/` — no SWC or decorator transform needed in your build pipeline.
- `lit` and all `@servicenow/*` peer deps are externalized and must be provided by your app's import map.
- The component is CSR-only (`@global(false)` recommended on consuming pages) — it reads URL params and user preferences at runtime.

---

### How to build on Jenkins
* Create a `pom.xml` file at the root level
* Go to the [BT1 Service Catalog](https://buildtools1.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D9dbd0c54db1acb403a3d5dd5ce961948%26sysparm_link_parent%3Dad2fecb72bfc310052f7c71317da157e%26sysparm_catalog%3De0d08b13c3330100c8b837659bba8fb4%26sysparm_catalog_view%3Dess%26sysparm_view%3Dess) to request a Jenkins job

Once the request is processed, a multi-branch job is created on https://buildmaster-hotel.devsnc.com and will build any branches that match [ServiceNow branch naming convention](https://buildtools1.service-now.com/kb_view_customer.do?sysparm_article=KB0528607).
