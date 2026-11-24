import { html, css } from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  AIUXWidgetElement,
  decorators
} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
const {
  name,
  description,
  bestFor,
  chatCompatible,
  category,
  server,
  discoverable
} = decorators;

@customElement('aiux-lux-lab')
@name('LUX Lab')
@description('A simple LUX Lab widget.')
@bestFor('Displaying LUX Lab information.')
@chatCompatible(false)
@category('custom')
@server('./server-script.js')
@discoverable(true)
export default class LuxLab extends AIUXWidgetElement {
  static properties = {
    _title: { type: String,state: true },
    _greeting: { type: String,state: true }
  };

    static styles = css`
      :host {
        display: block;
        padding: 10px;
        
        
      }
        .ainow{
        background: lightgreen;
        
        }
    `;

  constructor() {
    super();
    this._title = 'Welcome to AiNow - LUX Lab';
    this._greeting = 'Hello how are you guys doing?';
  }
  //createRenderRoot() { return this; }
  render() {
  const title = this.data?.title || this._title;
  const greeting = this.data?.greeting || this._greeting;
  const timestamp = this.data?.timestamp || this.data?.timestampError ;
  const incident = this.data?.incident;
  const incidentError = this.data?.incidentError;
  return html`
    <h2 class="ainow">${title}</h2>
    <p>${greeting}</p>
    <small>${i18n.getMessage('Server Timestamp:')} ${timestamp}</small>
    <div class="mt-4">
      <h3 class="text-sm font-semibold">${i18n.getMessage('Latest incident')}</h3>
      ${incident
        ? html`
            <p>${incident.number}</p>
            <p class="text-sm">${incident.shortDescription}</p>
          `
        : html`<p class="text-sm">
            ${incidentError || i18n.getMessage('No incidents found')}
          </p>`}
    </div>
  `;
}
}