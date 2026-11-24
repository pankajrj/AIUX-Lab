import {html} from 'lit';
import {NavLayout} from '@servicenow/aiux-components-nav';

/**
 * Custom Layout Override
 *
 * Location: src/extensions/your-extension/pages/your-route/layout.js
 *
 * This layout overrides the host application's layout at this navigation level.
 * Extension layouts participate in nested layout inheritance:
 *
 * Precedence (highest to lowest):
 * 1. Extension layout at this level ← YOU ARE HERE
 * 2. Extension layout at parent level (inherited)
 * 3. Host layout at this level
 * 4. Host layout at parent level (inherited)
 * 5. Default layout from core-ui
 *
 * If you don't define a layout.js file, the extension inherits the host's layout
 * at that level automatically (most-specific-wins precedence).
 *
 * STRY64337616 (Lorenzo Mendes): Nested layouts for application extensions.
 * Extensions now participate in intermediate layout nesting with per-level
 * most-specific-wins precedence.
 *
 * Example scenarios:
 *
 * SCENARIO 1: Override just the toolbar but keep host sidebar
 * - Extend NavLayout
 * - Override _renderToolbar() to customize toolbar only
 * - Call super.render() to get host sidebar + default structure
 *
 * SCENARIO 2: Add custom styling or structure
 * - Extend NavLayout
 * - Add custom styles via static styles = css`...`
 * - Override render() to add CSS classes or wrappers
 *
 * SCENARIO 3: Hide/show parts of the layout
 * - Extend NavLayout
 * - Override the relevant _render*() method
 * - Return html`` (empty) or custom HTML
 */

export default class MyLayoutOverride extends NavLayout {
  /**
   * Optional: Custom styles for this layout.
   * These are adopted into the Shadow DOM.
   */
  static styles = [
    super.styles
    // Add custom styles here
    // css`
    //   :host {
    //     --custom-var: value;
    //   }
    // `
  ];

  /**
   * Main render method.
   *
   * Start with super.render() to get the host layout structure,
   * then customize as needed.
   *
   * IMPORTANT: Always render the <slot> for child pages!
   *
   * Layout structure:
   * <aiux-nav-layout>
   *   <nav-sidebar>...L1 items...</nav-sidebar>
   *   <content-toolbar>...breadcrumb, L3 tabs, actions...</content-toolbar>
   *   <content-header>...title, metadata, L3 tabs...</content-header>
   *   <div class="content">
   *     <slot></slot>  ← Child page renders here
   *   </div>
   * </aiux-nav-layout>
   */
  render() {
    // Option 1: Use host layout as-is
    // return super.render();

    // Option 2: Customize while keeping structure
    // Add a wrapper class or custom structure
    return html` <div class="extension-layout">${super.render()}</div> `;

    // Option 3: Custom complete layout
    // Note: You must still include <slot> for the child page!
    // return html`
    //   <div class="extension-sidebar">
    //     ${this._renderExtensionNav()}
    //   </div>
    //   <div class="extension-content">
    //     <slot></slot>
    //   </div>
    // `;
  }

  /**
   * Optional: Override specific parts of the layout.
   *
   * Available methods to override:
   * - _renderSidebar() — Navigation sidebar (L1 items)
   * - _renderToolbar() — Sticky toolbar (breadcrumb, L3 tabs, actions)
   * - _renderHeader() — Page header (title, metadata, tabs)
   * - _renderContent() — Main content area
   *
   * Example: Customize toolbar
   */
  // _renderToolbar() {
  //   return html`
  //     <content-toolbar class="extension-toolbar">
  //       <!-- Custom toolbar content -->
  //     </content-toolbar>
  //   `;
  // }

  /**
   * Optional: Custom properties or state for the layout.
   *
   * Example: Toggle extension-specific UI
   */
  // static properties = {
  //   ...super.properties,
  //   _showExtensionPanel: {type: Boolean, state: true}
  // };

  /**
   * Optional: Initialize extension-specific behavior.
   */
  // constructor() {
  //   super();
  //   this._showExtensionPanel = false;
  // }

  /**
   * Optional: Post-render initialization (runs in browser only).
   */
  // connectedCallback() {
  //   super.connectedCallback();
  //   // Set up event listeners, subscriptions, etc.
  // }

  /**
   * Optional: Cleanup when layout is removed.
   */
  // disconnectedCallback() {
  //   super.disconnectedCallback();
  //   // Clean up event listeners, subscriptions, etc.
  // }
}

/**
 * Layout Hierarchy Example
 *
 * Given this structure:
 *
 * Host Application:
 *   applications/my-app/pages/
 *   ├── measure/
 *   │   ├── layout.js          ← Host L2 layout
 *   │   └── value/
 *   │       ├── index.js
 *   │       └── layout.js      ← Host L3 layout
 *
 * Extension:
 *   src/extensions/reporting/pages/
 *   ├── measure/
 *   │   ├── layout.js          ← Extension L2 layout (overrides host)
 *   │   └── value/
 *   │       └── index.js       ← Extension L3 page (inherits host L3 layout)
 *
 * At /measure/value:
 * - L2 layout: Extension layout.js (most-specific)
 * - L3 layout: Host layout.js (inherited, no extension override)
 *
 * Result: Pages rendered with extension L2 layout + host L3 layout
 *
 * If extension defines layout.js at L3, it would also be used.
 */
