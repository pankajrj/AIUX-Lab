# @servicenow/aiux-components-visual-board

## Import

```js
import '@servicenow/aiux-components-visual-board';
```


AIUX Visual Board (Kanban) component — a standalone, reusable board rendering engine for 1D and 2D kanban layouts with drag-and-drop support.

## Overview

This component renders lanes, swimlanes, and cards via consumer-provided custom element tags using `unsafeStatic` from `lit/static-html.js`. It is a **renderless engine** — all visual content (cards, lane headers, swimlane headers) is injected via custom element tags configured through the `cardConfig`, `laneConfig`, and `swimlaneConfig` objects.

The package ships default consumer elements (`aiux-vb-card`, `aiux-vb-lane-header`, `aiux-vb-swimlane-header`) that are used automatically when no tag override is supplied.

Built in TypeScript for the Karuna platform.

## Usage

```html
<aiux-visual-board
  .lanes="${lanes}"
  .cards="${cards}"
  .laneConfig="${{headerTag: 'aiux-vb-lane-header'}}"
  .cardConfig="${{tag: 'aiux-vb-card', draggable: true}}"
  @aiux-visual-board:card-moved="${handleCardMoved}"
></aiux-visual-board>
```

A 2D board additionally provides `swimlanes` (rows) and `swimlaneConfig`:

```html
<aiux-visual-board
  .lanes="${lanes}"
  .swimlanes="${swimlanes}"
  .cards="${cards}"
  .laneConfig="${{headerTag: 'aiux-vb-lane-header'}}"
  .swimlaneConfig="${{headerTag: 'aiux-vb-swimlane-header'}}"
  .cardConfig="${{tag: 'aiux-vb-card'}}"
></aiux-visual-board>
```

## Key Features

- **1D Board** — horizontal lanes with cards
- **2D Board** — lanes × swimlanes grid (provide a non-empty `swimlanes` array)
- **Drag & Drop** — lane, swimlane, and card reordering
- **Consumer Tags** — consumer-provided custom elements rendered via `unsafeStatic` for all visual content
- **Clone Mode** — optimized rendering for drag clones

## Properties

Complex data is passed as properties (use `.prop`); config objects also accept the kebab-case attribute shown below. Arrays and objects should always be set as properties — attribute serialization is unreliable for them.

| Property         | Attribute         | Type             | Default | Description                                                                                                       |
| ---------------- | ----------------- | ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `lanes`          | —                 | `Lane[]`         | `[]`    | Ordered list of lanes (columns) to render.                                                                        |
| `cards`          | —                 | `Card[]`         | `[]`    | All cards across all lanes and swimlanes. Placement is driven by `laneId`/`swimlaneId`.                           |
| `swimlanes`      | —                 | `Swimlane[]`     | `[]`    | Ordered list of swimlanes (rows). An empty array renders a 1D board.                                              |
| `cellHeaders`    | —                 | `CellHeader[]`   | `[]`    | Cell header data for 2D boards — one entry per lane+swimlane intersection.                                        |
| `cellHeaderTag`  | `cell-header-tag` | `string`         | `''`    | Custom element tag rendered as the cell header inside each lane+swimlane cell.                                    |
| `cardConfig`     | `card-config`     | `CardConfig`     | `{}`    | Card rendering and DnD config (tag, draggable, sort, placeholders).                                               |
| `laneConfig`     | `lane-config`     | `LaneConfig`     | `{}`    | Lane rendering and DnD config (header/footer tags, draggable, placeholders).                                      |
| `swimlaneConfig` | `swimlane-config` | `SwimlaneConfig` | `{}`    | Swimlane rendering and DnD config (header tag, draggable, row mode, placeholders).                                |
| `boardStyles`    | `styles`          | `BoardStyles`    | `{}`    | Per-region inline style overrides keyed by board region (e.g. `board`, `lanes-header-container`, `card-wrapper`). |
| `cloneMode`      | `clone-mode`      | `boolean`        | `false` | Disables all DnD and renders the board as a lightweight clone.                                                    |

### Config object shapes

```ts
interface CardConfig {
  tag?: string; // default 'aiux-vb-card'
  draggable?: boolean; // default true
  sortEnabled?: boolean;
  sortPlaceholderText?: string;
  dragPlaceholderTag?: string;
  dropPlaceholderTag?: string;
}

interface LaneConfig {
  headerTag?: string; // default 'aiux-vb-lane-header'
  footerTag?: string;
  draggable?: boolean; // default true
  dragPlaceholderTag?: string;
  dropPlaceholderTag?: string;
}

interface SwimlaneConfig {
  headerTag?: string; // default 'aiux-vb-swimlane-header'
  headerCloneTag?: string;
  draggable?: boolean; // default true
  dragPlaceholderTag?: string;
  dropPlaceholderTag?: string;
  showAsRow?: boolean;
  rowLaneHeaderTag?: string;
  rowLaneHeaderConfig?: RowLaneHeaderConfig;
}
```

`Card` requires `id`, `title`, `order`, and `laneId` (plus optional `swimlaneId` for 2D boards). `Lane` and `Swimlane` require `id` and `title`. All data interfaces allow arbitrary extra keys, which are passed through to the consumer element as part of its `data` object. See `src/types/board.types.ts` for full definitions.

## Events

All public events bubble and are `composed` (they cross the shadow DOM boundary). Listen on the `<aiux-visual-board>` element.

| Event                              | Fired when              | `detail` shape                                                                                             |
| ---------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `aiux-visual-board:card-moved`     | A card is dropped       | `{id, fromLane, toLane, fromPosition, toPosition, fromSwimlane, toSwimlane}` (swimlane fields empty in 1D) |
| `aiux-visual-board:lane-moved`     | A lane is reordered     | `{id, fromPosition, toPosition}`                                                                           |
| `aiux-visual-board:swimlane-moved` | A swimlane is reordered | `{id, fromPosition, toPosition}`                                                                           |

```ts
board.addEventListener('aiux-visual-board:card-moved', e => {
  const {id, fromLane, toLane, fromPosition, toPosition} = e.detail;
  // persist the new card position
});
```

## Related Components

The package exports three default consumer elements, registered automatically when `aiux-visual-board` is imported:

| Tag                       | Role                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `aiux-vb-card`            | Default card renderer (used when `cardConfig.tag` is unset).             |
| `aiux-vb-lane-header`     | Default lane header (used when `laneConfig.headerTag` is unset).         |
| `aiux-vb-swimlane-header` | Default swimlane header (used when `swimlaneConfig.headerTag` is unset). |

Provide your own tags via `cardConfig.tag`, `laneConfig.headerTag`, etc. to replace any of them. Consumer elements receive their data via a `.data` property binding.

## Architecture

See `.claude/rules/architecture.md` for the renderless-engine pattern, `unsafeStatic` tag rendering, DnD subsystems, and clone mode. Feature-specific design docs live under `docs/` (e.g. `docs/card-dnd-sortable.md`, `docs/cards-and-swimlanes.md`).

## Development

```bash
pnpm install
pnpm run storybook   # primary dev environment (no standalone dev server)
pnpm test
pnpm run lint
```
