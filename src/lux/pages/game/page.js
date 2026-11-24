import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {setDocumentTitle} from '../../utils/document-title.js';
import {
  COLORS,
  SPRITE_DRONE,
  SPRITE_HUNTER,
  SPRITE_SHIP
} from './components/engine.js';
import './components/space-fighter-arcade.js';
import './components/pixel-sprite.js';

@customElement('x-space-fighter-game-page')
export default class GamePage extends AIUXElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100%;
      container-type: inline-size;
    }
  `;

  firstUpdated() {
    setDocumentTitle(i18n.getMessage('Arcade'));
  }

  _renderDossierEntry({rows, colors, name, role, points, hp, behavior}) {
    return html`
      <li class="flex gap-4 border-b border-base-300 pb-4 last:border-b-0 last:pb-0">
        <pixel-sprite
          class="mt-1 shrink-0"
          .rows=${rows}
          .colors=${colors}
          .scale=${5}
        ></pixel-sprite>
        <div class="min-w-0">
          <p class="font-mono text-sm font-bold break-words text-text-primary">
            ${name}
          </p>
          <p class="text-xs break-words text-text-secondary">${role}</p>
          <p class="mt-2 text-xs leading-relaxed break-words text-text-secondary">
            ${behavior}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="aiux-badge aiux-badge-sm aiux-badge-soft font-mono"
              >${points}</span
            >
            <span class="aiux-badge aiux-badge-sm aiux-badge-soft font-mono"
              >${hp}</span
            >
          </div>
        </div>
      </li>
    `;
  }

  _renderControls() {
    const rows = [
      [i18n.getMessage('Arrow keys / W A S D'), i18n.getMessage('Fly')],
      [i18n.getMessage('Space'), i18n.getMessage('Fire')],
      [i18n.getMessage('Enter'), i18n.getMessage('Start or restart')],
      [i18n.getMessage('P or Escape'), i18n.getMessage('Pause')],
      [i18n.getMessage('M'), i18n.getMessage('Mute')],
      [i18n.getMessage('Drag on screen'), i18n.getMessage('Steer and fire')]
    ];

    return html`
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
        ${rows.map(
          ([key, action]) => html`
            <dt class="font-mono break-words text-text-primary">${key}</dt>
            <dd class="break-words text-text-secondary">${action}</dd>
          `
        )}
      </dl>
    `;
  }

  render() {
    return html`
      <div class="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
        <header class="flex flex-col gap-2">
          <div class="aiux-badge aiux-badge-primary aiux-badge-outline w-fit">
            ${i18n.getMessage('AIUX platform demo')}
          </div>
          <h2 class="text-3xl font-bold tracking-tight break-words">
            ${i18n.getMessage('Space Fighter arcade')}
          </h2>
          <p class="max-w-3xl text-sm leading-relaxed break-words text-text-secondary">
            ${i18n.getMessage(
              'A retro vertical shooter built entirely from AIUX primitives — an AIUXElement host, a server-render-safe engine module, Tailwind and DaisyUI styling, and a live region that narrates every wave, hit, and respawn.'
            )}
          </p>
        </header>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section
            class="aiux-card border border-base-300 bg-base-100 shadow-sm"
            aria-label=${i18n.getMessage('Arcade cabinet')}
          >
            <div class="aiux-card-body items-center p-4 lg:p-6">
              <space-fighter-arcade></space-fighter-arcade>
            </div>
          </section>

          <aside class="flex flex-col gap-6">
            <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
              <div class="aiux-card-body p-6">
                <h3 class="aiux-card-title text-base">
                  ${i18n.getMessage('Enemy dossier')}
                </h3>
                <ul class="mt-2 flex flex-col gap-4">
                  ${this._renderDossierEntry({
                    rows: SPRITE_DRONE,
                    colors: COLORS.drone,
                    name: i18n.getMessage('Drone'),
                    role: i18n.getMessage('Formation type'),
                    behavior: i18n.getMessage(
                      'Descends into a swaying grid and drops straight-down plasma. Harmless alone, lethal in volume.'
                    ),
                    points: i18n.getMessage('{0} pts', [100]),
                    hp: i18n.getMessage('{0} hit', [1])
                  })}
                  ${this._renderDossierEntry({
                    rows: SPRITE_HUNTER,
                    colors: COLORS.hunter,
                    name: i18n.getMessage('Hunter'),
                    role: i18n.getMessage('Pursuit type'),
                    behavior: i18n.getMessage(
                      'Breaks formation to swoop at your column, fires aimed shots, and loops back over the top for another pass.'
                    ),
                    points: i18n.getMessage('{0} pts', [250]),
                    hp: i18n.getMessage('{0} hits', [2])
                  })}
                  ${this._renderDossierEntry({
                    rows: SPRITE_SHIP,
                    colors: COLORS.ship,
                    name: i18n.getMessage('Your fighter'),
                    role: i18n.getMessage('Player'),
                    behavior: i18n.getMessage(
                      'Three lives. Every loss respawns you at centre screen behind a shield that blinks while it holds.'
                    ),
                    points: i18n.getMessage('Extra life every {0}', [5000]),
                    hp: i18n.getMessage('{0} lives', [3])
                  })}
                </ul>
              </div>
            </section>

            <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
              <div class="aiux-card-body p-6">
                <h3 class="aiux-card-title text-base">
                  ${i18n.getMessage('Controls')}
                </h3>
                ${this._renderControls()}
              </div>
            </section>
          </aside>
        </div>
      </div>
    `;
  }
}
