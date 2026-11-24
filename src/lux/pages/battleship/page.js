import {AIUXElement, decorators} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {setDocumentTitle} from '../../utils/document-title.js';
import './components/battleship-game.js';

const {global, title} = decorators;

@customElement('x-saghs-my-app-battleship-page')
@title('Battleship')
@global(false)
export default class BattleshipPage extends AIUXElement {
  firstUpdated() {
    setDocumentTitle(i18n.getMessage('Battleship'));
  }

  render() {
    return html`<battleship-game></battleship-game>`;
  }

  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }
  `;
}
