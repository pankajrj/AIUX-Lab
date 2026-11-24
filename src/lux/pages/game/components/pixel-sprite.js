import {html, css} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {customElement, property} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';

/**
 * Renders one of the engine's sprite grids as DOM pixels so the enemy dossier
 * shows the exact art the canvas draws, with no second source of truth and no
 * canvas work during server rendering.
 */
@customElement('pixel-sprite')
export default class PixelSprite extends AIUXElement {
  /** @type {string[]} rows of the sprite grid, '.' meaning transparent */
  @property({type: Array}) rows = [];
  /** @type {Record<string, string>} maps a grid digit to a CSS color */
  @property({type: Object}) colors = {};
  /** Size of one sprite pixel, in CSS pixels. */
  @property({type: Number}) scale = 6;

  static styles = css`
    :host {
      display: inline-block;
      line-height: 0;
    }
    .grid {
      display: grid;
      gap: 0;
    }
    .px {
      display: block;
    }
  `;

  render() {
    const cols = this.rows[0]?.length || 0;
    const cell = `${this.scale}px`;

    return html`
      <div
        class="grid"
        style=${styleMap({gridTemplateColumns: `repeat(${cols}, ${cell})`})}
        aria-hidden="true"
      >
        ${this.rows.flatMap(row =>
          [...row].map(
            key => html`<span
              class="px"
              style=${styleMap({
                width: cell,
                height: cell,
                background: key === '.' ? 'transparent' : this.colors[key]
              })}
            ></span>`
          )
        )}
      </div>
    `;
  }
}
