import {html, css, isServer, nothing} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import '@servicenow/aiux/aiux-components-control';
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
const DEFAULT_EDITOR_HEIGHT = 320;

@customElement('aiux-kb-article-detail')
@name('Knowledge article detail')
@description('Previews and edits an authored knowledge article.')
@bestFor('Viewing and editing the selected knowledge article.')
@server('./server-script.js')
@discoverable(true)
export default class KnowledgeArticleDetail extends AIUXWidgetElement {
  static fetchDataOnConnect = false;

  static properties = {
    _article: {type: Object, state: true},
    _draft: {type: String, state: true},
    _editing: {type: Boolean, state: true},
    _editorHeight: {type: Number, state: true},
    _loading: {type: Boolean, state: true},
    _saving: {type: Boolean, state: true},
    _error: {type: String, state: true},
    _status: {type: String, state: true},
    _confirmVisible: {type: Boolean, state: true},
    _confirmOpen: {type: Boolean, state: true}
  };

  #bodyObserver;

  static styles = css`
    :host { display: block; min-width: 0; }
    @media (forced-colors: active) {
      button {
        forced-color-adjust: none;
        color: ButtonText;
        background: ButtonFace;
        border: 1px solid ButtonBorder;
      }
      button:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
      button:disabled { color: GrayText; }
    }
  `;

  constructor() {
    super();
    this._article = null;
    this._draft = '';
    this._editing = false;
    this._editorHeight = DEFAULT_EDITOR_HEIGHT;
    this._loading = false;
    this._saving = false;
    this._error = '';
    this._status = '';
    this._confirmVisible = false;
    this._confirmOpen = false;
    this._selectedId = '';
  }

  connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    registerActions(this, [{
      actionRef: SELECT_ARTICLE,
      name: i18n.getMessage('Select knowledge article'),
      description: i18n.getMessage('Opens an article in the knowledge workspace.'),
      execute: ({id}) => this._select(id)
    }], {}, {advertiseToChat: false});
    this._restoreSelection();
  }

  disconnectedCallback() {
    this.#bodyObserver?.disconnect();
    unregisterActions(this);
    if (this._resolveConfirmation) this._resolveConfirmation('stay');
    this._resolveConfirmation = null;
    this._confirmOpen = false;
    this._confirmVisible = false;
    super.disconnectedCallback();
  }

  #observeArticleBody = (slot) => {
    this.#bodyObserver?.disconnect();
    if (isServer || !slot) return;

    const editor = slot.querySelector('aiux-control-html-editor');
    const desktop = window.matchMedia('(min-width: 64rem)');
    this.#bodyObserver = new ResizeObserver(() => {
      if (!desktop.matches) {
        this._editorHeight = DEFAULT_EDITOR_HEIGHT;
        return;
      }
      if (!slot.clientHeight) return;

      // TinyMCE's pixel height excludes the control's field label.
      const editingSurface = editor.hostElement;
      const fieldChrome = editingSurface
        ? editor.offsetHeight - editingSurface.offsetHeight
        : 0;
      this._editorHeight = Math.max(100, slot.clientHeight - fieldChrome);
    });
    this.#bodyObserver.observe(slot);
    this.#bodyObserver.observe(editor);
  };

  async _restoreSelection() {
    if (!getAction(GET_SELECTION)) return;
    try {
      const result = await executeAction(GET_SELECTION);
      if (!result.success) throw new Error(result.error);
      if (result.data) await this._select(result.data);
    } catch (error) {
      this._error = i18n.getMessage('Unable to restore the selected article.');
      console.error('Knowledge workspace selection restoration failed', error);
    }
  }

  async _select(id) {
    if (!id || this._transitioning || this._saving) return false;
    if (id === this._selectedId) return true;
    this._transitioning = true;
    try {
      if (this._article && this._draft !== this._article.text) {
        const choice = await this._confirmSwitch();
        if (choice === 'stay') return false;
        if (choice === 'save' && !(await this._save())) return false;
      }
      this._selectedId = id;
      await this._load();
      return true;
    } finally {
      this._transitioning = false;
    }
  }

  async _load() {
    this._loading = true;
    this._error = '';
    this._article = null;
    this._editing = false;
    try {
      const response = await this.server.get({action: 'read', id: this._selectedId});
      if (response?.isError) {
        this._error = response.errorMessage || i18n.getMessage('Unable to load the article.');
        return;
      }
      if (!response?.article) throw new Error('Invalid article response');
      this._article = response.article;
      this._draft = response.article.text;
      this._status = i18n.getMessage('Article loaded.');
    } catch (error) {
      this._error = i18n.getMessage('Unable to load the article.');
      console.error('Knowledge workspace article load failed', error);
    } finally {
      this._loading = false;
    }
  }

  _confirmSwitch() {
    this._confirmVisible = true;
    this._confirmOpen = true;
    this._confirmationChoice = 'stay';
    return new Promise(resolve => { this._resolveConfirmation = resolve; });
  }

  _choose(event) {
    this._confirmationChoice = event.currentTarget.dataset.choice;
    this._confirmOpen = false;
  }

  _confirmationClosed(event) {
    if (event.target !== event.currentTarget) return;
    this._confirmOpen = false;
    this._confirmVisible = false;
    const resolve = this._resolveConfirmation;
    this._resolveConfirmation = null;
    if (resolve) resolve(this._confirmationChoice);
  }

  _updateDraft(event) {
    this._draft = event.detail.value;
  }

  async _save(event) {
    if (!this._article || this._saving) return false;
    const restoreFocus = Boolean(event?.currentTarget);
    let saved = false;
    this._saving = true;
    this._error = '';
    try {
      const response = await this.server.get({
        action: 'save',
        id: this._article.id,
        text: this._draft,
        version: this._article.version
      });
      if (response?.isError) {
        this._error = response.errorMessage || i18n.getMessage('Unable to save the article.');
        return false;
      }
      if (!response?.article) throw new Error('Invalid save response');
      this._article = response.article;
      this._draft = response.article.text;
      this._editing = false;
      this._status = i18n.getMessage('Article saved.');
      saved = true;
      return true;
    } catch (error) {
      this._error = i18n.getMessage('Unable to save the article.');
      console.error('Knowledge workspace article save failed', error);
      return false;
    } finally {
      this._saving = false;
      if (restoreFocus) {
        await this.updateComplete;
        this.renderRoot.querySelector(saved ? '[data-action="edit"]' : '[data-action="save"]')?.focus();
      }
    }
  }

  async _cancel() {
    this._draft = this._article.text;
    this._editing = false;
    this._error = '';
    this._status = i18n.getMessage('Changes discarded.');
    await this.updateComplete;
    this.renderRoot.querySelector('[data-action="edit"]')?.focus();
  }

  render() {
    const dirty = this._article && this._draft !== this._article.text;
    const isEditing = this._editing && !this._saving;
    return html`
      <section
        class="aiux-card bg-base-100 shadow-sm lg:h-full lg:overflow-auto"
        aria-labelledby="article-detail-heading"
      >
        <div data-i18n-skip class="aiux-card-body min-w-0 shrink-0 justify-start lg:h-full [&>p]:grow-0">
          <h2 id="article-detail-heading" class="aiux-card-title break-words">
            ${this._article?.title || i18n.getMessage('Article detail')}
          </h2>
          <div role="status" aria-live="polite">${this._status}</div>
          ${this._error ? html`<p role="alert">${this._error}</p>` : nothing}
          ${this._loading ? html`<p role="status">${i18n.getMessage('Loading article...')}</p>` : nothing}
          ${this._saving ? html`<p role="status">${i18n.getMessage('Saving article...')}</p>` : nothing}
          ${!this._article && !this._loading && !this._error
            ? html`<p>${i18n.getMessage('Select an article to view its content.')}</p>` : nothing}
          ${!this._article && this._error && this._selectedId
            ? html`<button type="button" class="aiux-btn aiux-btn-outline" @click=${this._load}>
                ${i18n.getMessage('Retry')}
              </button>` : nothing}
          ${this._article ? html`
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span class="min-w-0 break-words">${this._article.number}</span>
              ${this._article.canWrite ? html`
                <button type="button" class="aiux-btn aiux-btn-outline" data-action="edit" ?disabled=${this._saving}
                  @click=${() => { this._editing = !this._editing; }}>
                  ${this._editing ? i18n.getMessage('Preview') : i18n.getMessage('Edit')}
                </button>` : html`<p>${i18n.getMessage('This article is read-only.')}</p>`}
              ${dirty ? html`
                <button type="button" class="aiux-btn aiux-btn-primary" data-action="save" ?disabled=${this._saving} @click=${this._save}>
                  ${i18n.getMessage('Save')}
                </button>
              ` : nothing}
              ${this._editing || dirty ? html`
                <button type="button" class="aiux-btn aiux-btn-outline" ?disabled=${this._saving} @click=${this._cancel}>
                  ${i18n.getMessage('Cancel')}
                </button>
              ` : nothing}
            </div>
            ${dirty ? html`<p>${i18n.getMessage('Unsaved changes')}</p>` : nothing}
            <div class="min-w-0 lg:min-h-40 lg:flex-1 lg:[contain:size]" ${ref(this.#observeArticleBody)}>
              <aiux-control-html-editor
                class="block min-w-0 lg:data-[preview]:min-h-full lg:data-[preview]:rounded-box lg:data-[preview]:border lg:data-[preview]:border-base-300 lg:data-[preview]:p-3 forced-colors:border-[CanvasText]"
                ?data-preview=${!isEditing}
                name="text"
                label=${i18n.getMessage('Article body')}
                .height=${this._editorHeight}
                .controlStyles=${isEditing ? '' : 'max-height: none; overflow-wrap: anywhere'}
                .value=${this._draft}
                edit-mode=${isEditing ? 'default' : 'display-only'}
                @AIUX_CONTROL_HTML_EDITOR#STAGED_VALUE_CHANGED=${this._updateDraft}
                @AIUX_CONTROL_HTML_EDITOR#VALUE_CHANGED=${this._updateDraft}
              ></aiux-control-html-editor>
            </div>
          ` : nothing}
        </div>
      </section>
      ${this._confirmVisible ? html`
        <aiux-modal .open=${this._confirmOpen} label=${i18n.getMessage('Unsaved changes')}
          @aiux-modal:close=${this._confirmationClosed}>
          <h2 slot="header">${i18n.getMessage('Unsaved changes')}</h2>
          <p>${i18n.getMessage('Save or discard your changes before opening another article?')}</p>
          <div slot="footer" class="flex flex-wrap justify-end gap-2">
            <button type="button" class="aiux-btn aiux-btn-outline" data-choice="stay" @click=${this._choose}>
              ${i18n.getMessage('Stay')}
            </button>
            <button type="button" class="aiux-btn aiux-btn-outline" data-choice="discard" @click=${this._choose}>
              ${i18n.getMessage('Discard')}
            </button>
            <button type="button" class="aiux-btn aiux-btn-primary" data-choice="save" @click=${this._choose}>
              ${i18n.getMessage('Save')}
            </button>
          </div>
        </aiux-modal>` : nothing}
    `;
  }
}
