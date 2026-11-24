# @servicenow/aiux-components-announcement-banner

## Import

```js
import '@servicenow/aiux-components-announcement-banner';
```


A container that fetches, groups, and renders a set of active announcement banners, applying client-side dismissal state from localStorage and live updates over the AMB realtime channel. Each banner is a color-coded alert with a heading, optional summary, icon, and action link that can be dismissible or collapsed into an expandable stack.

## Installation

```js
import '@servicenow/aiux-components-announcement-banner';
```

## How this actually gets used

**`<aiux-announcement-banner-list>` is shared app-layout chrome, not something you render yourself.** It is placed exactly once, by `NavLayout` (`components/nav/src/nav-layout/src/views/render-layout.js:122-130`), which binds `.data` from `navLayoutContext.get()?.announcements` and gates rendering on `navLayoutContext.get()?.features?.announcements !== false`. No app under `applications/*/pages/**` imports or renders this tag directly — if you're building a page, you get the announcement banner for free from the layout, or you opt out via the `announcements` feature flag, not by placing the tag yourself.

**Where the data comes from:** `NavLayout`'s own SSR `loader` (`components/nav/src/nav-layout/src/api/loader.js:226-233`) resolves a `configId` from the system property `glide.ui.polaris.announcement_banner_config_id` and calls `AnnouncementBannerList.loader(ctx)` (the same package's own loader, `announcement-banner-list.js:169-220`), which POSTs a GraphQL query to `/api/now/graphql` and returns `{announcements, realTimeEnabled}`. That result is stored on `navLayoutContext` and read back by `render-layout.js` above. The banner is fully disabled server-side by the `glide.ui.polaris.disable_announcement_banner` system property.

**Realtime takeover:** once mounted, `<aiux-announcement-banner-list>` subscribes to the `/uxbannerannouncements` AMB channel (`announcement-amb.js:13`) via an `AMBController`, but only when the loader's `realTimeEnabled` flag is true (`announcement-banner-list.js:244`). Incoming AMB messages (`add`/`update`/`remove`/`m2mSwap`/`comingSoon`/`expiringSoon`/`configCleared`/`configRefresh`) replace the SSR-fetched data live, without a page reload.

**`<aiux-announcement-banner>` is never rendered standalone in production** — it's an implementation detail that `-list` renders once per item (`announcement-banner-list.js:432-447`). The properties table below exists to document that internal contract (and for Storybook/testing), not because you're expected to author `<aiux-announcement-banner>` directly on a page.

## Usage

```html
<!-- This is what NavLayout renders — shown for reference; app authors don't write this themselves -->
<aiux-announcement-banner-list
  .data="${announcementsFromLoader}"
></aiux-announcement-banner-list>
```

```html
<!-- Individual banner shape, for Storybook/testing reference — not authored directly in real pages -->
<aiux-announcement-banner
  heading="Scheduled maintenance"
  summary="Service will be unavailable Sunday 2–4am."
  color="warning"
></aiux-announcement-banner>
```

## Properties

### `aiux-announcement-banner-list`

| Property | Attribute         | Type   | Default | Description                                                                                                                                                                                                                                                 |
| -------- | ----------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`   | — (property only) | Object | `null`  | SSR-fetched `{announcements, configId, realTimeEnabled}` payload, normally set automatically by `NavLayout` from its own loader — see "How this actually gets used" above. When unset, the element falls back to `this.loaderData` from its own SSR loader. |

### `aiux-announcement-banner`

The individual banner element (`@customElement('aiux-announcement-banner')` in `announcement-banner.js`), rendered internally by `-list` — see above for why you normally don't author this tag directly.

Lit lowercases property names for their attribute form (it does not kebab-case them), so `iconTooltip` maps to the attribute `icontooltip`, `numAnnouncements` to `numannouncements`, etc. Object-typed properties (`link`) can only be set as a property (`.link=${...}`), never as an attribute.

| Property           | Attribute          | Type    | Default   | Description                                                                                                                                                    |
| ------------------ | ------------------ | ------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `heading`          | `heading`          | String  | `''`      | Announcement heading text                                                                                                                                      |
| `summary`          | `summary`          | String  | `''`      | Short summary/body text (only shown when `componentSize` is `lg`)                                                                                              |
| `icon`             | `icon`             | String  | `''`      | Icon name shown with the announcement                                                                                                                          |
| `iconTooltip`      | `icontooltip`      | String  | `''`      | Tooltip text for the icon                                                                                                                                      |
| `color`            | `color`            | String  | `'info'`  | Accent color/severity: `critical`, `high`, `warning`, `moderate`, `info`, `positive`, or `low` (exported as `COLORS`)                                          |
| `link`             | — (property only)  | Object  | `{}`      | Action link, shape `{url, label, clickBehavior}`. Rendered only when both `url` and `label` are set. `clickBehavior: 'new'` opens in a new tab/window          |
| `sysId`            | `sysid`            | String  | `''`      | sys_id of the underlying announcement record; echoed in the `dismiss` event detail                                                                             |
| `nonDismissible`   | `nondismissible`   | Boolean | `false`   | Hides the dismiss control when `true`                                                                                                                          |
| `numAnnouncements` | `numannouncements` | Number  | `0`       | Count of announcements in the current stack — set by `-list`, not authored. A negative value marks the last item in a stack (renders the collapse caret there) |
| `expanded`         | `expanded`         | Boolean | `false`   | Whether the banner is expanded to show full content — set by `-list`, not authored                                                                             |
| `isPeek`           | `ispeek`           | Boolean | `false`   | Renders a condensed "peek" preview strip instead of the full banner — set by `-list`, not authored                                                             |
| `stackType`        | `stacktype`        | String  | `''`      | Identifies which stack the banner belongs to; echoed in the `toggle-expanded` event detail — set by `-list`, not authored                                      |
| `contentPosition`  | `contentposition`  | String  | `'start'` | Text alignment of the content: `start`, `center`, or `end`                                                                                                     |
| `componentSize`    | `componentsize`    | String  | `'lg'`    | Size variant: `lg` (wide, shows summary) or `md` (narrow)                                                                                                      |

## Events

All events are dispatched by `aiux-announcement-banner` with `bubbles: true` and `composed: true`, so they cross the Shadow DOM boundary. `aiux-announcement-banner-list` listens for `dismiss` and `toggle-expanded` on its container to manage dismissal and stack state.

| Event                               | Fired when                                                                             | `detail`                                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aiux-announcement:dismiss`         | The dismiss (close) button is clicked                                                  | `{sysId}`                                                                                                                                                                    |
| `aiux-announcement:toggle-expanded` | A stack is expanded or collapsed (caret click, or content click on a multi-item stack) | `{stackType}`                                                                                                                                                                |
| `aiux-announcement:link-clicked`    | The action link is clicked                                                             | `{url, newWindow, userAction}` — `newWindow` reflects `clickBehavior: 'new'`; `userAction` is `'new tab/window'` or `'same tab/window'` (also accounts for meta/shift-click) |
