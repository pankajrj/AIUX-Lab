import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  AIUXElement,
  decorators,
  getLogger
} from '@servicenow/aiux-components-core';
import {i18n} from '@servicenow/aiux-services';

const {roles} = decorators;
const log = getLogger('{{TAG_NAME}}');

/**
 * {{PAGE_TITLE}} Page
 *
 * For extension pages, save this file to:
 *   src/extensions/<host-scope>/<host-basename>/pages/<route>/page.js
 *   Example: src/extensions/sn_app_aict_ui/aict/pages/home/page.js
 *
 * For application pages, save to:
 *   applications/<app>/pages/<route>/page.js (or index.js)
 *
 * Path: {{PAGE_PATH}}
 * Navigation Level: {{NAV_LEVEL}} (L1/L2/L3 or deep)
 * SSR: Yes (renders on server with loader data, hydrates in browser)
 *
 * This page demonstrates:
 * - Server-side data fetching via static loader()
 * - SSR-safe rendering (no browser APIs in render())
 * - i18n for user-facing text
 * - Error handling
 * - Page-scoped components
 * - @customElement with scope-local tag name prefix
 *
 * To use this template:
 * 1. Change class name from 'MyPage' to your class name
 * 2. Change '@customElement' tag to your scope prefix (e.g., x-acme-home-page)
 * 3. Update loader to fetch your actual data
 * 4. Implement the _renderContent() method with your page UI
 * 5. (Optional) Uncomment @roles decorator if page requires specific roles
 */

@customElement('x-scope-page-name') // Replace 'x-scope' with your scope prefix
// @roles(['admin', 'user'])  // Uncomment to restrict access to roles
export default class MyPage extends AIUXElement {
  static get properties() {
    return {
      // Define reactive properties here
      // Example: _loading: {type: Boolean, state: true}
    };
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .page-container {
      padding: var(--spacing-4);
      height: 100%;
      overflow-y: auto;
    }

    .page-header {
      margin-bottom: var(--spacing-6);
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-base-content, #1f2937);
      margin: 0 0 var(--spacing-2) 0;
    }

    .page-description {
      font-size: 0.9375rem;
      color: var(--color-text-secondary, #6b7280);
    }

    .content-section {
      margin-bottom: var(--spacing-6);
    }

    .error-message {
      background-color: var(--color-error-container, #fee2e2);
      color: var(--color-error, #dc2626);
      padding: var(--spacing-4);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--color-text-secondary, #6b7280);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-8) var(--spacing-4);
      color: var(--color-text-secondary, #6b7280);
    }

    .empty-state p {
      margin: var(--spacing-2) 0;
    }
  `;

  constructor() {
    super();
    this._loading = false;
    this._error = null;
  }

  /**
   * Server-side loader for SSR data fetching.
   *
   * This method runs:
   * - On the server during initial page render
   * - On the client during navigation (via client-side router)
   *
   * @param {Object} ctx - Loader context (protocol, hostname, params, query, headers, csrfToken)
   * @returns {Promise<Object>} Object with pageTitle and loader data
   *
   * The returned object is:
   * - Serialized to JSON during SSR
   * - Embedded in the HTML as __LOADER_DATA__
   * - Available in this.loaderData in the render() method
   *
   * Example return:
   * {
   *   pageTitle: 'My Page Title',
   *   items: [...],
   *   metrics: {...},
   *   // Any other data the page needs
   * }
   */
  static async loader(ctx) {
    try {
      // TODO: Implement your data fetching here
      // Example:
      // const data = await fetch(`${ctx.protocol}://${ctx.hostname}/api/v2/my-data`, {
      //   headers: getHeaders(ctx)
      // }).then(r => r.json());

      return {
        pageTitle: i18n.getMessage('{{PAGE_TITLE}}')
        // Add your loader data here
        // items: data.items,
        // metrics: data.metrics,
      };
    } catch (err) {
      log.error({error: err.message}, '{{CLASS_NAME}} loader error');
      // Return error state - page component can check this.loaderData.error
      throw err; // Or return {pageTitle: '...', error: err.message}
    }
  }

  /**
   * SSR-safe page rendering.
   *
   * Important: Never use browser APIs here (window, document, localStorage, etc.)
   * This method runs on both the server (during SSR) and browser (during hydration).
   *
   * Access your loader data via this.loaderData:
   * - this.loaderData.pageTitle
   * - this.loaderData.items
   * - etc.
   */
  render() {
    // Loading state - loaderData is not available yet
    if (!this.loaderData) {
      return html`
        <div class="page-container">
          <div class="loading-state">
            <p>${i18n.getMessage('Loading')}</p>
          </div>
        </div>
      `;
    }

    // Error state
    if (this.loaderData.error) {
      return html`
        <div class="page-container">
          <div class="error-message">
            <strong>${i18n.getMessage('Error')}</strong>
            <p>${this.loaderData.error}</p>
          </div>
        </div>
      `;
    }

    // Normal render
    return html`
      <div class="page-container">
        <header class="page-header">
          <h1 class="page-title">${this.loaderData.pageTitle}</h1>
          <p class="page-description">${i18n.getMessage('Page description')}</p>
        </header>

        ${this._renderContent()}
      </div>
    `;
  }

  /**
   * Helper method to render page content.
   * Split complex render logic into focused helper methods.
   */
  _renderContent() {
    // Destructure your loader data (example: const { items, total } = this.loaderData;)
    const {items} = this.loaderData;

    // Check for empty state (update condition based on your data)
    const isEmpty = !items || items.length === 0; // UPDATE THIS CHECK
    if (isEmpty) {
      return html`
        <div class="empty-state">
          <p>${i18n.getMessage('No data available')}</p>
        </div>
      `;
    }

    return html`
      <div class="content-section">
        <!-- Your page content goes here -->
        <p>${i18n.getMessage('Replace this with your page content')}</p>
      </div>
    `;
  }

  /**
   * Optional: Post-hydration updates.
   * Called after the component is mounted in the browser.
   * Safe to use browser APIs here.
   */
  connectedCallback() {
    super.connectedCallback();
    // Set up event listeners, subscriptions, etc.
  }

  /**
   * Optional: Cleanup when component is removed.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up event listeners, subscriptions, etc.
  }
}
