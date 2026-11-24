# `@servicenow/aiux-timeline`

## Import

```js
import '@servicenow/aiux-timeline';
```


Horizontal timeline Lit web component for the ServiceNow AIUX platform. Renders point-in-time event markers above a date-range track, with pan, zoom, proximity-based event clustering, and an optional legend popover.

## Usage

> **Note on property binding**: `startDate`, `endDate`, `eventData`, `rangeData`,
> `visibleStart`, and `visibleEnd` all have `attribute: false` — they cannot be set
> via HTML attributes. Use `.prop=${value}` in a Lit template or assign them in JS.
> Simple string/boolean properties (`label`, `show-legend`, etc.) can be set as
> HTML attributes.

```html
<!-- String/boolean properties can be set as HTML attributes -->
<aiux-timeline label="Release Calendar" show-legend id="my-timeline"></aiux-timeline>
```

```js
import '@servicenow/aiux-timeline';

const el = document.getElementById('my-timeline');

// Date bounds — set as JS properties (attribute: false)
el.startDate = '2025-01-01';
el.endDate = '2025-09-30';

// eventData — nested array mirroring Seismic's structure.
// Each group carries type-level metadata (color, icon) shared by all its events.
// Individual EventRecord items may override color or icon per-record.
el.eventData = [
  {
    name: 'deploy',
    label: 'Deployments',
    color: '#6366f1',
    icon: 'rocketship-fill',
    events: [
      {
        id: 'e1',
        timestamp: '2025-02-15',
        label: 'v2.1 → staging',
        description: 'Feature branch merged and promoted.',
      },
      {
        id: 'e2',
        timestamp: '2025-04-03',
        label: 'v2.1 → production',
        description: 'Full rollout completed.',
      },
      {
        id: 'e3',
        timestamp: '2025-07-10',
        label: 'v2.2 → production',
        description: 'Hotfix release.',
      },
    ],
  },
  {
    name: 'incident',
    label: 'Incidents',
    color: '#ef4444',
    icon: 'circle-exclamation-fill',
    events: [
      {
        id: 'e4',
        timestamp: '2025-03-22',
        label: 'P1 — DB latency',
        description: 'Root cause: missing index. Resolved in 4 h.',
      },
      {
        id: 'e5',
        timestamp: '2025-06-01',
        label: 'P2 — API timeout',
        description: 'Upstream rate-limit. Mitigated with retry logic.',
      },
    ],
  },
];

// rangeData — nested array. Each group supplies a shared color and label;
// all ranges in a group are toggled together as one entry in the legend.
el.rangeData = [
  {
    name: 'q1',
    label: 'Q1',
    color: '#a5b4fc',
    ranges: [
      {
        id: 'r1',
        start: '2025-01-01',
        end: '2025-03-31',
        description: 'Q1 planning and build phase.',
      },
    ],
  },
  {
    name: 'q2',
    label: 'Q2',
    color: '#86efac',
    ranges: [
      {
        id: 'r2',
        start: '2025-04-01',
        end: '2025-06-30',
        description: 'Q2 stabilisation and release.',
      },
    ],
  },
  {
    name: 'q3',
    label: 'Q3',
    color: '#fde68a',
    ranges: [
      {
        id: 'r3',
        start: '2025-07-01',
        end: '2025-09-30',
        description: 'Q3 roadmap execution.',
      },
    ],
  },
];
```

### In a Lit template

```js
html`
  <aiux-timeline
    label="Release Calendar"
    show-legend
    .startDate=${'2025-01-01'}
    .endDate=${'2025-09-30'}
    .eventData=${eventData}
    .rangeData=${rangeData}
    @aiux-timeline:event-click=${this._handleEventClick}
  ></aiux-timeline>
`;
```

## Properties / Attributes

| Property           | Attribute            | Type                                                           | Default         | Description                                                                                                                                                |
| ------------------ | -------------------- | -------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `emptyMessage`     | `empty-message`      | `string`                                                       | `''`            | Message shown when there are no events or ranges. Defaults to a translated "No events or ranges found for this period" when not set.                       |
| `endDate`          | —                    | `Date \| string`                                               | `''`            | Right edge of the full domain                                                                                                                              |
| `error`            | `error`              | `boolean`                                                      | `false`         | Show error state instead of chart                                                                                                                          |
| `errorMessage`     | `error-message`      | `string`                                                       | `''`            | Message shown in error state. Defaults to a translated "An error occurred." when not set.                                                                  |
| `eventData`        | —                    | `EventTypeData[]`                                              | `[]`            | Nested event type groups (mirrors Seismic structure)                                                                                                       |
| `label`            | `label`              | `string`                                                       | `''`            | Title shown in the header bar                                                                                                                              |
| `legendPosition`   | `legend-position`    | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Where the "Show legend" button appears                                                                                                                     |
| `locale`           | `locale`             | `string`                                                       | `''`            | BCP 47 locale tag (e.g. `"en-US"`, `"fr-FR"`) for tick labels, tooltips, and viewport announcement. Falls back to the browser's default locale when empty. |
| `loading`          | `loading`            | `boolean`                                                      | `false`         | Shows a skeleton loading overlay; hides the SVG chart                                                                                                      |
| `rangeData`        | —                    | `RangeTypeData[]`                                              | `[]`            | Nested range type groups                                                                                                                                   |
| `showHeader`       | `show-header`        | `boolean`                                                      | `true`          | Render the top header bar                                                                                                                                  |
| `showLegend`       | `show-legend`        | `boolean`                                                      | `false`         | Show the "Show legend" button and popover                                                                                                                  |
| `showTodayMarker`  | `show-today-marker`  | `boolean`                                                      | `true`          | Render today's dashed vertical marker                                                                                                                      |
| `showZoomControls` | `show-zoom-controls` | `boolean`                                                      | `true`          | Render zoom-in / zoom-out buttons                                                                                                                          |
| `startDate`        | —                    | `Date \| string`                                               | `''`            | Left edge of the full domain                                                                                                                               |
| `visibleEnd`       | —                    | `Date \| string \| undefined`                                  | `undefined`     | Initial visible-window end (defaults to `endDate`)                                                                                                         |
| `visibleStart`     | —                    | `Date \| string \| undefined`                                  | `undefined`     | Initial visible-window start (defaults to `startDate`)                                                                                                     |

## Config Properties

Set via the platform Config Editor (`configSchema`), not as HTML attributes.

| Property                 | Type      | Label              | Default     | Description                                                                                     |
| ------------------------ | --------- | ------------------ | ----------- | ----------------------------------------------------------------------------------------------- |
| `configLabel`            | `String`  | Label              | `undefined` | Heading text displayed in the header bar.                                                       |
| `configEmptyMessage`     | `String`  | Empty Message      | `undefined` | Message shown in the empty state when there are no events or ranges to display.                 |
| `configErrorMessage`     | `String`  | Error Message      | `undefined` | Message shown inside the error state.                                                           |
| `configLegendPosition`   | `String`  | Legend Position    | `undefined` | Position of the Show legend trigger relative to the component.                                  |
| `configShowHeader`       | `Boolean` | Show Header        | `undefined` | When false, hides the header bar (label + controls).                                            |
| `configShowLegend`       | `Boolean` | Show Legend        | `undefined` | When true, renders the Show legend trigger and legend panel.                                    |
| `configShowTodayMarker`  | `Boolean` | Show Today Marker  | `undefined` | When true, renders the Now button and the today marker line on the chart.                       |
| `configShowZoomControls` | `Boolean` | Show Zoom Controls | `undefined` | When true, renders the zoom-in and zoom-out buttons in the header.                              |
| `configLocale`           | `String`  | Locale             | `undefined` | BCP 47 locale tag used to format dates in tick labels, tooltips, and the viewport announcement. |

## Data types

The component uses the same **nested** structure as Seismic's `eventData` API —
type metadata and individual records are bundled together in one array. There is no
separate type-metadata array or cross-array ID matching.

### `EventTypeData`

Top-level element of the `eventData` property. Mirrors Seismic's outer group object.

```ts
interface EventTypeData {
  /** Unique type identifier. Referenced by legend and visibility toggles. */
  name: string;
  /** Display label in the legend (falls back to `name` when absent). */
  label?: string;
  /** Default CSS color for all events in this group. */
  color?: string;
  /** Default icon name for all events in this group (e.g. 'star-fill'). */
  icon?: string;
  /** Individual event records. */
  events: EventRecord[];
}
```

### `EventRecord`

An individual event nested inside an `EventTypeData` group.

```ts
interface EventRecord {
  /** Required. Must be unique across all event records passed to the component. */
  id: string;
  /** ISO string, Date object, or UTC millisecond number. */
  timestamp: Date | string | number;
  end?: Date | string | number;
  label: string;
  description?: string;
  /** Per-record icon override — takes precedence over EventTypeData.icon. */
  icon?: string;
  /** Per-record color override — takes precedence over EventTypeData.color. */
  color?: string;
  metadata?: Record<string, unknown>;
}
```

### `RangeTypeData`

Top-level element of the `rangeData` property.

```ts
interface RangeTypeData {
  /** Unique type identifier. Referenced by legend and visibility toggles. */
  name: string;
  /** Display label in the legend (falls back to `name` when absent). */
  label?: string;
  /** Default CSS color for all ranges in this group. */
  color?: string;
  /** Individual range records. */
  ranges: RangeRecord[];
}
```

### `RangeRecord`

An individual range nested inside a `RangeTypeData` group.

```ts
interface RangeRecord {
  /** Required. Must be unique across all range records passed to the component. */
  id: string;
  start: Date | string | number;
  end: Date | string | number;
  description?: string;
  /** Per-record color override — takes precedence over RangeTypeData.color. */
  color?: string;
}
```

## Events

All events bubble and are composed.

| Event                                | Detail type                      | Description                                           |
| ------------------------------------ | -------------------------------- | ----------------------------------------------------- |
| `aiux-timeline:event-click`       | `TimelineEventClickDetail`       | A timeline event marker was clicked                   |
| `aiux-timeline:range-click`       | `TimelineRangeClickDetail`       | A range bar was clicked                               |
| `aiux-timeline:zoom`              | `TimelineZoomDetail`             | Viewport zoomed in or out (buttons or scroll wheel)   |
| `aiux-timeline:pan`               | `TimelinePanDetail`              | Viewport panned left or right (buttons or drag)       |
| `aiux-timeline:now`               | `TimelineNowDetail`              | Now button clicked — viewport reset to default window |
| `aiux-timeline:visibility-change` | `TimelineVisibilityChangeDetail` | An event type or range group was shown or hidden      |

```ts
interface TimelineEventClickDetail {
  /**
   * One or more clicked events. Length === 1 for a single marker click;
   * length > 1 when a proximity-grouped cluster indicator was clicked.
   */
  events: EventData[];
}

interface TimelineRangeClickDetail {
  range: RangeData; // clicked range; includes RangeRecord fields + resolved label + typeName
}

interface TimelineZoomDetail {
  direction: 'in' | 'out';
  visibleStart: Date;
  visibleEnd: Date;
}

interface TimelinePanDetail {
  direction: 'left' | 'right';
  visibleStart: Date;
  visibleEnd: Date;
}

interface TimelineNowDetail {
  visibleStart: Date;
  visibleEnd: Date;
}

interface TimelineVisibilityChangeDetail {
  eventVisibility?: { name: string; visible: boolean };
  /** rangeTypeName is the stable RangeTypeData.name — use this as the identity key, not the display label. */
  rangeVisibility?: { rangeTypeName: string; visible: boolean };
}
```

## Exported utilities

### Utility functions

```ts
import {
  parseDate,
  durationLabel,
  computeTicks,
  formatEventDate,
  groupEventsByProximity,
  timeScale,
  clampToRange,
} from '@servicenow/aiux-timeline/utils';
```

## File structure

```
timeline/
├── src/
│   ├── aiux-timeline.ts          # Main component
│   ├── index.ts                  # Public barrel export
│   ├── controllers/
│   │   ├── viewport.controller.ts  # Lit ReactiveController — viewport/zoom/pan/drag state
│   │   └── popover.controller.ts   # Lit ReactiveController — hover/pinned tooltip state
│   ├── renders/
│   │   ├── chart.render.ts       # SVG chart: track pill, range segments, stems, axis
│   │   ├── chart-row.render.ts   # Outer chart row: scroll buttons, chart inner container
│   │   ├── header.render.ts      # Header bar: label, now button, zoom controls
│   │   ├── icon.render.ts        # Event marker icon helper (wraps aiux-icon)
│   │   ├── legend.render.ts      # Legend trigger, popover content, range/event toggles
│   │   ├── markers.render.ts     # HTML overlay: event icon buttons + cluster badges
│   │   ├── range-ring.render.ts  # Pinned/focused range bar ring overlay
│   │   ├── scrubber.render.ts    # Pan scrubber arrows
│   │   └── tooltip.render.ts     # Hover tooltip + pinned info panel
│   ├── stories/                  # Storybook stories (default, dense, states, viewport, release-cycle)
│   ├── styles/
│   │   └── timeline.styles.ts    # SVG layout constants + FALLBACK_COLOR
│   ├── types/
│   │   └── timeline.types.ts     # Public type definitions + TIMELINE_EVENTS
│   └── utils/
│       └── timeline-utils.ts     # Pure utility functions
├── test/
│   ├── aiux-timeline.test.ts           # Component unit tests
│   ├── chart.render.test.ts            # Chart render helper tests
│   ├── chart-row.render.test.ts        # Chart row render helper tests
│   ├── header.render.test.ts           # Header render helper tests
│   ├── icon.render.test.ts             # Icon render helper tests
│   ├── legend.render.test.ts           # Legend render helper tests
│   ├── markers.render.test.ts          # Markers render helper tests
│   ├── popover.controller.test.ts      # Popover controller unit tests
│   ├── range-ring.render.test.ts       # Range ring render helper tests
│   ├── scrubber.render.test.ts         # Scrubber render helper tests
│   ├── tooltip.render.test.ts          # Tooltip render helper tests
│   ├── viewport.controller.test.ts     # Viewport controller unit tests
│   └── timeline-utils.test.ts          # Utility function unit tests
├── index.js                      # Re-export entry point
├── package.json
└── tsconfig.json
```

## Dependencies

| Package                            | Type           | Purpose                              |
| ---------------------------------- | -------------- | ------------------------------------ |
| `date-fns`                         | dependency     | Calendar-aware tick arithmetic       |
| `@lit/localize`                    | peerDependency | Localized UI strings                 |
| `@servicenow/aiux-components-core` | peerDependency | `AIUXElement` base class             |
| `@servicenow/aiux-directive-icon`  | peerDependency | `icon()` directive for event markers |
| `@servicenow/aiux-sn-popover`      | peerDependency | Legend popover                       |
| `lit`                              | peerDependency | Lit framework provided by platform   |

## Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Typecheck only
pnpm typecheck
```

Tests use Vitest in Node environment. All `it()` blocks carry SDLC annotations linking to the originating story.
