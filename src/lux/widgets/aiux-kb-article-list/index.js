import {html, css, isServer} from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  AIUXWidgetElement,
  decorators,
  registerActions,
  unregisterActions,
  getAction,
  executeAction
} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {GET_SELECTION, SELECT_ARTICLE} from '../../utils/knowledge-workspace-actions.js';

const {name, description, bestFor, server, discoverable} = decorators;

@customElement('aiux-kb-article-list')
@name('My knowledge articles')
@description('Lists readable knowledge articles authored by the current user.')
@bestFor('Selecting an authored knowledge article in the workspace.')
@server('./server-script.js')
@discoverable(true)
export default class KnowledgeArticleList extends AIUXWidgetElement {
  static fetchDataOnConnect = false;

  static properties = {
    _articles: {type: Array, state: true},
    _selected: {type: String, state: true},
    _loading: {type: Boolean, state: true},
    _busy: {type: Boolean, state: true},
    _error: {type: String, state: true},
    _hasMore: {type: Boolean, state: true},
    _status: {type: String, state: true}
  };

  static styles = css`
    :host { display: block; min-width: 0; }
    @media (forced-colors: active) {
      button {
        forced-color-adjust: none;
        color: ButtonText;
        background: ButtonFace;
        border: 1px solid ButtonBorder;
      }
      button[aria-pressed='true'] {
        color: SelectedItemText;
        background: SelectedItem;
      }
      button:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
      button:disabled { color: GrayText; }
    }
  `;

  constructor() {
    super();
    this._articles = [];
    this._selected = '';
    this._loading = true;
    this._busy = false;
    this._error = '';
    this._hasMore = false;
    this._status = '';
  }

  connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    registerActions(this, [{
      actionRef: GET_SELECTION,
      name: i18n.getMessage('Get selected knowledge article'),
      description: i18n.getMessage('Returns the selected article in the knowledge workspace.'),
      execute: () => this._selected
    }], {}, {advertiseToChat: false});
    if (!this._articles.length) this._loadMore();
  }

  disconnectedCallback() {
    unregisterActions(this);
    super.disconnectedCallback();
  }

  async _loadMore() {
    if (this._fetching) return;
    this._fetching = true;
    this._loading = true;
    this._error = '';
    try {
      const cursor = this._articles.at(-1)?.id || '';
      const response = await this.server.get({action: 'list', cursor});
      if (response?.isError) {
        this._error = response.errorMessage || i18n.getMessage('Unable to load knowledge articles.');
        return;
      }
      if (!response || !Array.isArray(response.articles)) throw new Error('Invalid list response');
      this._articles = [...this._articles, ...response.articles];
      this._hasMore = response.hasMore === true;
      this._status = i18n.getMessage('Knowledge articles loaded.');
      if (!this._selected && this._articles.length) {
        this._selected = this._articles[0].id;
        if (getAction(SELECT_ARTICLE)) {
          const result = await executeAction(SELECT_ARTICLE, {id: this._selected});
          if (!result.success) throw new Error(result.error);
        }
      }
    } catch (error) {
      this._error = i18n.getMessage('Unable to load knowledge articles.');
      console.error('Knowledge workspace list failed', error);
    } finally {
      this._loading = false;
      this._fetching = false;
    }
  }

  async _select(event) {
    const id = event.currentTarget.dataset.id;
    if (!id || id === this._selected || this._busy) return;
    this._busy = true;
    this._error = '';
    try {
      const result = await executeAction(SELECT_ARTICLE, {id});
      if (!result.success) throw new Error(result.error);
      if (result.data === true) {
        this._selected = id;
        this._status = i18n.getMessage('Article selected.');
      }
    } catch (error) {
      this._error = i18n.getMessage('Unable to select the article. Please try again.');
      console.error('Knowledge workspace selection failed', error);
    } finally {
      this._busy = false;
    }
  }

  _navigate(event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll('button[data-id]')];
    const current = buttons.indexOf(event.target);
    if (current < 0) return;
    let next = current;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (event.key === 'ArrowDown') next = Math.min(current + 1, buttons.length - 1);
    if (event.key === 'ArrowUp') next = Math.max(current - 1, 0);
    event.preventDefault();
    buttons[next].focus();
  }

  render() {
    return html`
      <section
        class="aiux-card bg-base-100 shadow-sm lg:h-full lg:overflow-auto"
        aria-labelledby="article-list-heading"
      >
        <div class="aiux-card-body min-w-0 shrink-0 justify-start" data-i18n-skip>
          <h2 id="article-list-heading" class="aiux-card-title">
            ${i18n.getMessage('My knowledge articles')}
          </h2>
          <div role="status" aria-live="polite">${this._status}</div>
          ${this._error ? html`<p role="alert">${this._error}</p>` : ''}
          ${this._loading ? html`<p role="status">${i18n.getMessage('Loading articles...')}</p>` : ''}
          ${!this._loading && !this._error && !this._articles.length
            ? html`<p>${i18n.getMessage('No readable articles found.')}</p>` : ''}
          <ul class="flex flex-col gap-2" role="group" aria-busy=${this._busy || this._loading ? 'true' : 'false'}
            @keydown=${this._navigate}>
            ${this._articles.map(article => html`
              <li>
                <button
                  type="button"
                  class="aiux-btn aiux-btn-outline h-auto w-full justify-start whitespace-normal break-words text-start"
                  data-id=${article.id}
                  aria-pressed=${article.id === this._selected ? 'true' : 'false'}
                  @click=${this._select}
                >
                  <span>${article.number} ${article.title || i18n.getMessage('Untitled article')}</span>
                </button>
              </li>
            `)}
          </ul>
          ${this._hasMore || (this._error && !this._articles.length)
            ? html`<button type="button" class="aiux-btn aiux-btn-outline" ?disabled=${this._loading}
                @click=${this._loadMore}>${this._error ? i18n.getMessage('Retry') : i18n.getMessage('Load more')}</button>`
            : ''}
        </div>
      </section>
    `;
  }
}
