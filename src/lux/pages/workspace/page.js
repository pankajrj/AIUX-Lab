import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement, decorators} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import body from '../../regions/workspace/body.js';
import {setDocumentTitle} from '../../utils/document-title.js';

const {global} = decorators;

@customElement('x-saghs-my-app-workspace-page')
@global(false)
export default class WorkspacePage extends AIUXElement {
  static styles = css`
    :host {
      display: contents;
    }

    @media (min-width: 64rem) {
      .workspace {
        block-size: 100%;
        min-block-size: 24rem;
      }

      /* Give the region and its rows the height left after the page header. */
      .workspace > [data-aiux-region],
      .workspace > [data-aiux-region] > * {
        flex: 1 1 0%;
        min-block-size: 0;
      }
    }
  `;

  static async loader(ctx) {
    return {basePath: ctx.basePath};
  }

  firstUpdated() {
    setDocumentTitle(i18n.getMessage('Knowledge workspace'));
  }

  render() {
    const {basePath = ''} = this.loaderData ?? {};
    return html`
      <div data-i18n-skip class="workspace mx-auto flex min-w-0 max-w-7xl flex-col gap-4 p-4">
        <header class="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <h1 class="min-w-0 text-2xl font-bold [overflow-wrap:anywhere]">
            ${i18n.getMessage('Knowledge workspace')}
          </h1>
          <a
            class="aiux-btn aiux-btn-secondary h-auto min-w-0 max-w-full whitespace-normal text-center [overflow-wrap:anywhere] forced-colors:forced-color-adjust-none forced-colors:border-[ButtonBorder] forced-colors:bg-[ButtonFace] forced-colors:text-[LinkText] forced-colors:focus-visible:outline-[Highlight]"
            href="${basePath}/home"
          >
            ${i18n.getMessage('Back to home')}
          </a>
        </header>
        ${body()}
      </div>
    `;
  }
}
