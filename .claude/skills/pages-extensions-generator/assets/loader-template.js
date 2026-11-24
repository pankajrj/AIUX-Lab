/**
 * Data Fetching Module
 *
 * Location: pages/your-route/loaders/data.js
 *
 * This module fetches data from ServiceNow and returns it for page rendering.
 * Import this in your page's static loader() method.
 *
 * Example usage in page:
 *
 *   import {fetchPageData} from './loaders/data.js';
 *
 *   static async loader(ctx) {
 *     return {
 *       pageTitle: 'My Page',
 *       data: await fetchPageData(ctx)
 *     };
 *   }
 */

import {getHeaders, getLogger} from '@servicenow/aiux-components-core';

const log = getLogger('fetchPageData');

/**
 * Fetch data from ServiceNow API.
 *
 * @param {Object} ctx - Loader context
 *   - protocol: Request protocol (e.g., https)
 *   - hostname: ServiceNow instance hostname (e.g., dev.service-now.com)
 *   - params: Route parameters (e.g., {id: '...', sys_id: '...'})
 *   - query: Query string parameters
 *   - headers: {cookie, ...} for authentication
 *   - csrfToken: CSRF token for POST requests
 * @returns {Promise<Object>} Fetched data
 * @throws {Error} If the fetch fails
 *
 * Example return:
 * {
 *   items: [...],
 *   total: 42,
 *   filters: {...}
 * }
 */
export async function fetchPageData(ctx) {
  try {
    // Construct API URL
    const url = new URL(
      `${ctx.protocol}://${ctx.hostname}/api/v2/your-endpoint`
    );

    // Add query parameters from route params
    if (ctx.params.id) {
      url.searchParams.set('id', ctx.params.id);
    }

    // Add any additional filters or options
    // url.searchParams.set('limit', '50');
    // url.searchParams.set('offset', '0');

    // Fetch with authentication headers
    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(ctx),
      // Include credentials for cookie-based auth
      credentials: 'include'
    });

    // Handle HTTP errors
    if (!resp.ok) {
      throw new Error(
        `Failed to fetch data: ${resp.status} ${resp.statusText}`
      );
    }

    // Parse and return JSON
    const data = await resp.json();
    return data;
  } catch (err) {
    // Log error for debugging
    log.error({error: err.message}, 'fetchPageData error');

    // Re-throw so the page component can handle it
    throw err;
  }
}

/**
 * Optional: Handle errors gracefully for the page component.
 *
 * Usage in page loader:
 *
 *   try {
 *     const data = await fetchPageData(ctx);
 *     return {pageTitle: '...', data};
 *   } catch (err) {
 *     return {
 *       pageTitle: 'Error',
 *       error: err.message,
 *       data: null
 *     };
 *   }
 */
