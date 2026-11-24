# @servicenow/aiux-components-chat

## Import

```js
import '@servicenow/aiux-components-chat';
```


Chat components for AIUX applications that wrap `sn-engagement-experience` to provide AI chat functionality with event-based session handling.

## Components

### `sn-aiux-chat-wrapper`

A flexible chat wrapper component that uses event-driven OAuth session detection instead of timeouts.

**Modes:**

1. **Input-only mode** (e.g., home page): Displays a minimal chat input
2. **Full chat mode** (e.g., dedicated chat page): Displays the complete chat experience

## Properties

Lit lowercases camelCase property names for their HTML attributes (e.g. `inputOnly` → `inputonly`), and there are no `attribute:` overrides on this component. Complex props (`Object` / `Array` types) cannot be expressed as attributes — set them with Lit property binding (`.applications=${[...]}`).

| Property                    | Attribute                   | Type      | Default       | Description                                                                                                                              |
| --------------------------- | --------------------------- | --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `aiexMode`                  | `aiexmode`                  | `String`  | `'chat_only'` | AIEX mode forwarded to `sn-engagement-experience`.                                                                                       |
| `inputOnly`                 | `inputonly`                 | `Boolean` | `false`       | `true` shows the minimal input-only experience; `false` shows the full chat experience.                                                  |
| `inputLayout`               | `inputlayout`               | `String`  | `null`        | Layout hint forwarded to LBF in input-only mode.                                                                                         |
| `conversationId`            | `conversationid`            | `String`  | `null`        | ID of an existing conversation to load (ignored when `forceNewConversation` is `true`).                                                  |
| `channel`                   | `channel`                   | `String`  | `null`        | Chat channel; defaults to `'aiux'` when unset.                                                                                           |
| `forceNewConversation`      | `forcenewconversation`      | `Boolean` | `false`       | Force creation of a new conversation, ignoring `conversationId`.                                                                         |
| `newConversationContext`    | (property only)             | `Object`  | `null`        | Initial chat payload (e.g. `{searchText: '...'}`) passed to LBF when starting a brand-new conversation, seeding the first user turn.     |
| `hideNewChat`               | `hidenewchat`               | `Boolean` | `false`       | Hides the "new chat" affordance in full chat mode.                                                                                       |
| `disabled`                  | `disabled`                  | `Boolean` | `false`       | Disables the chat experience in full chat mode.                                                                                          |
| `applications`              | (property only)             | `Array`   | `null`        | Application identifiers (e.g. `['sn_aia']`) forwarded to LBF and stamped onto each turn as `meta.applications` to gate skill visibility. |
| `clientContext`             | (property only)             | `Object`  | `null`        | Host-owned per-view context (route, selected record/agent, etc.) forwarded to LBF and stamped onto each turn as `meta.clientContext`.    |
| `pageContext`               | (property only)             | `Object`  | `null`        | Now Assist deployment binding forwarded into the AIEX `setSession` handshake as `session.pageContext`.                                   |
| `showHistoryButton`         | `showhistorybutton`         | `Boolean` | `false`       | Show the conversation-history button.                                                                                                    |
| `disableContactMenu`        | `disablecontactmenu`        | `Boolean` | `undefined`   | Tristate: only forwarded when explicitly set. Left unset preserves lbf-client's session-derived contact-menu sniff.                      |
| `showPromotedTopics`        | `showpromotedtopics`        | `Boolean` | `null`        | Show promoted topics. Defaults to `true` in input-only mode, `false` in full chat mode when unset.                                       |
| `promotedTopicsPosition`    | `promotedtopicsposition`    | `String`  | `null`        | Promoted-topics position; defaults to `'below'` in input-only mode when unset.                                                           |
| `showConversationTitle`     | `showconversationtitle`     | `Boolean` | `null`        | Show the conversation title. Defaults to `false` in input-only mode, `true` in full chat mode when unset.                                |
| `showCloseButton`           | `showclosebutton`           | `Boolean` | `false`       | Show the close button.                                                                                                                   |
| `showInteractiveViewButton` | `showinteractiveviewbutton` | `Boolean` | `false`       | Show the interactive-view button.                                                                                                        |
| `showViewToggleButton`      | `showviewtogglebutton`      | `Boolean` | `false`       | Show the view-toggle button.                                                                                                             |
| `enablePinnable`            | `enablepinnable`            | `Boolean` | `null`        | Enable pinnable chat; defaults to `true` in full chat mode when unset.                                                                   |
| `showChatPanelToggle`       | `showchatpaneltoggle`       | `Boolean` | `false`       | Show the chat-panel toggle.                                                                                                              |
| `branding`                  | (property only)             | `Object`  | `null`        | Branding object forwarded to LBF.                                                                                                        |

#### LBF Props Configuration

The component automatically configures different LBF properties based on the mode:

**Input-only mode (Homepage):**

- `showPromotedTopics`: `true` - Displays promoted topics
- `promotedTopicsPosition`: `'below'` - Shows topics below the input field
- `inputOnly`: `true` - Minimal input-only experience
- `showConversationTitle`: `false`
- `showCloseButton`: `false`
- `showHistoryButton`: `false`

**Full chat mode (Chat page):**

- `showPromotedTopics`: `false` - No promoted topics in full chat
- `showConversationTitle`: `true`
- `enablePinnable`: `true`
- `forceNewConversation`: Based on conversation ID presence

#### Usage

```javascript
import '@servicenow/aiux-components-chat';

// Input-only mode (home page)
// Note: Parent component controls layout/sizing
html`
  <sn-aiux-chat-wrapper
    .inputOnly=${true}
    style="max-width: 600px; margin: 0 auto;"
  ></sn-aiux-chat-wrapper>
`;

// Full chat mode (chat page)
html`
  <sn-aiux-chat-wrapper
    .inputOnly=${false}
    .conversationId=${conversationId}
    .forceNewConversation=${!conversationId}
  ></sn-aiux-chat-wrapper>
`;
```

**Layout Philosophy**: The chat wrapper only sets `display: block`. The parent component is responsible for:

- Width constraints (e.g., `max-width: 600px`)
- Positioning (e.g., `margin: 0 auto`)
- Spacing and layout

This gives consumers full control over how the chat fits into their design.

#### Events

`sn-aiux-chat-wrapper` does **not** dispatch any custom events. It **listens** for a single event bubbling up from `sn-engagement-experience`:

| Event            | `event.detail`                    | Handled types                                                                                                                                      | Behavior                                                                                     |
| ---------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `now:chat:event` | `{type: string, payload: object}` | `conversation:created` (`payload.conversationId`), `message:sent` (`payload.conversationId`), `conversation:switched` (`payload.toConversationId`) | Calls `__AIEX_GLOBALS__.setActiveConversation(...)` to keep the active conversation in sync. |

This component does not use `withWidgetContext`, `client_tools`, or `setAiContext` — it extends `AIUXElement` directly and coordinates with chat through the global `__AIEX_GLOBALS__` and DOM events above.

## Event-Based Session Handling

The component uses **event-driven OAuth detection** for session readiness:

1. Subscribes to `aiel:sessionUpdated` event from `__AIEX_GLOBALS__`
2. Checks for existing session in `initialContext`
3. Renders immediately when OAuth authentication completes
4. Falls back to ready state if AIEX_GLOBALS is unavailable

After script load, the wrapper also waits briefly for `globalThis.APP_CONFIG` with a bounded polling timeout (5 seconds by default) before proceeding without it. Session readiness itself is event-driven; the timeout only guards optional app-config availability.

## Self-Contained Dependency Loading

The chat wrapper **automatically handles its own dependency loading**. You don't need to load AIEX libraries in your layout or page components!

### How it works:

The wrapper delegates loading to `ensureAielLoaded()` from `@servicenow/aiux-components-core`, which:

1. **Checks if libraries are already loaded** via `globalThis.__AIEX_LOAD_PROMISE__`
2. **Loads libraries if needed** from the karuna-hosted asset path `/aiux/assets/core/` — injecting `<script type="module">` tags for `/aiux/assets/core/aiel.js` and `/aiux/assets/core/aiex.js`
3. **Caches the promise globally** so multiple instances share the same load
4. **Waits for session events** to know when OAuth is ready

### Benefits:

- ✅ **Self-contained**: Just drop `<sn-aiux-chat-wrapper>` anywhere
- ✅ **No setup required**: No need to load libraries in layout
- ✅ **Efficient**: Libraries loaded once and cached
- ✅ **Reusable**: Works in any application or page

## Requirements

- OAuth must be configured for the ServiceNow instance
- The AIEL/AIEX libraries must be accessible at the karuna-hosted asset path `/aiux/assets/core/` (`aiel.js` and `aiex.js`)

## Environment Configuration

### DC Instance with ADC Configuration

For DC (Data Center) instances using ADC (Application Delivery Controller) configuration to route to Nextwave services, you need to set the `GLIDE_ORIGIN` environment variable:

```bash
# .env
GLIDE_ORIGIN=https://your-dc-instance.service-now.com

```

This configuration is required because:

- AIEL (AI Engagement Library) and AIEX (AI Experience) are loaded by `ensureAielLoaded()` from the karuna-hosted assets `/aiux/assets/core/aiel.js` and `/aiux/assets/core/aiex.js` (the build pipeline bundles `library-ai-engagement` and `ai-engagement-shell-experience`, and the stable-alias machinery resolves these hash-free URLs to the current content-hashed filenames)
- The Nextwave chat client backend is reached via `/sncapps/nextwave/` endpoints

The ADC routes these `/sncapps/nextwave/` requests from the DC instance to the Nextwave service, enabling AI chat functionality across different deployment environments.

## Integration with NavLayout

The chat component is integrated into `NavLayout` to provide a consistent chat experience across all pages in the application.

### How NavLayout Uses Chat

NavLayout wraps `sn-engagement-experience` directly (not using `sn-aiux-chat-wrapper`) and manages three chat modes:

1. **OMNI Mode**: Floating chat bar at bottom of page (default)
2. **DEFAULT Mode**: Split view with chat on left (30%) and main content on right (70%)
3. **AIEX_HIDDEN Mode**: Chat hidden for home/loading/error states

### Chat Visibility in NavLayout

- **Homepage** (`/home` or paths ending with `/home`): Chat is hidden
- **Chat Page** (`/chat`): the NavLayout chat controller treats this as a chat route and `shouldHideChat()` returns `false`, so the shell chat remains available
- **All Other Pages**: Chat is visible in OMNI mode by default

### Split View Behavior

When a user interacts with the OMNI bar:

- Chat expands to DEFAULT mode (30% left panel)
- Main content shifts to 70% right panel
- Close button appears on main content to navigate to full-page chat

### Navigation Prevention

NavLayout prevents the embedded chat surface from navigating directly to the dedicated `/chat` route while it is in split view:

- Blocks navigation attempts from chat component
- Expands OMNI mode to DEFAULT mode instead
- Only allows navigation to full chat via close button

### Chat Visibility Control

Chat visibility inside `aiux-nav-layout` is determined internally by its chat controller via `chatController.shouldHideChat()`, which drives the `data-chat-mode` / `data-mode` attributes on the rendered layout. Visibility is derived from the current route (see "Chat Visibility in NavLayout" above) rather than toggled imperatively.

There is currently **no supported public API or HTML attribute** for a consuming page to toggle NavLayout's chat visibility. To show a full-page chat surface, use `sn-aiux-chat-wrapper` directly (see below); current source does not automatically hide the NavLayout shell chat on `/chat`.

### For Dedicated Chat Pages

If you're building the dedicated `/chat` page, use `sn-aiux-chat-wrapper` in full chat mode:

```javascript
html`
  <sn-aiux-chat-wrapper
    .inputOnly=${false}
    .conversationId=${conversationId}
    .forceNewConversation=${!conversationId}
  ></sn-aiux-chat-wrapper>
`;
```

If this page is rendered inside NavLayout, account for the shell chat separately; current `shouldHideChat()` returns `false` for `/chat`.
