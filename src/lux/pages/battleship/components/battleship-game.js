import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {icon} from '@servicenow/aiux-directive-icon';
import {i18n} from '@servicenow/aiux/aiux-services';
import {html, css, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, state} from 'lit/decorators.js';
import {
  BOARD_SIZE,
  FLEET,
  chooseComputerTarget,
  cellKey,
  createBoard,
  isFleetComplete,
  isShipSunk,
  placeFleetRandomly,
  placeShip,
  takeTurn,
  validatePlacement
} from '../engine.js';

const COLUMN_LABELS = 'ABCDEFGHIJ'.split('');
const BOARD_CELLS = Array.from(
  {length: BOARD_SIZE * BOARD_SIZE},
  (_, index) => ({
    row: Math.floor(index / BOARD_SIZE),
    column: index % BOARD_SIZE
  })
);

const SHIP_ART = Object.freeze({
  battleship: {
    body: '#ef6b7d',
    detail: '#a85a67',
    path: '<path d="M8 58H470L438 79H34Z"/><path d="M56 50H420V58H56Z"/><path d="M102 38H190V50H102ZM228 28H312V50H228ZM342 36H398V50H342Z"/><path d="M262 18H286V28H262ZM352 26H364V36H352Z"/><path d="M116 42H178V50H116Z"/><circle cx="220" cy="46" r="8"/><path d="M220 42H300V46H220Z"/>'
  },
  carrier: {
    body: '#f4a167',
    detail: '#bd7650',
    path: '<path d="M10 62H470L440 80H35Z"/><path d="M20 48H448V62H20Z"/><path d="M72 38H410L438 48H72Z"/><path d="M184 20H254V48H184ZM272 28H306V48H272ZM332 34H368V48H332Z"/><path d="M198 12H208V20H198ZM242 16H250V20H242Z"/><path d="M94 42H142V48H94Z"/>'
  },
  submarine: {
    body: '#8fbf65',
    detail: '#5d8a49',
    path: '<path d="M28 42H420C455 42 480 52 480 61C480 70 455 79 420 79H28C8 79 0 72 0 61C0 50 8 42 28 42Z"/><path d="M142 42V28H260V42Z"/><path d="M184 18H218V28H184ZM198 8H208V18H198Z"/><path d="M340 42V30H360V42Z"/><path d="M34 54H440"/>'
  },
  destroyer: {
    body: '#9b88ce',
    detail: '#665b9d',
    path: '<path d="M6 60H474L446 79H32Z"/><path d="M84 48H420V60H84Z"/><path d="M120 32H188V48H120ZM228 18H286V48H228ZM326 30H380V48H326Z"/><path d="M244 8H268V18H244ZM344 20H356V30H344Z"/><path d="M388 40H452V48H388Z"/><circle cx="210" cy="44" r="7"/><path d="M210 41H280V45H210Z"/>'
  },
  cruiser: {
    body: '#71808a',
    detail: '#46535c',
    path: '<path d="M4 60H474L444 80H32Z"/><path d="M52 48H434V60H52Z"/><path d="M108 30H164V48H108ZM194 18H270V48H194ZM302 26H366V48H302Z"/><path d="M222 6H248V18H222ZM326 14H338V26H326Z"/><path d="M80 38H124V48H80Z"/>'
  }
});

function shipImage(shipId, vertical = false) {
  const art = SHIP_ART[shipId];
  const viewBox = vertical ? '0 0 100 500' : '0 0 500 100';
  const transform = vertical ? 'translate(100 0) rotate(90)' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g transform="${transform}" fill="${art.body}" stroke="${art.detail}" stroke-width="2" stroke-linejoin="round">${art.path}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

@customElement('battleship-game')
export default class BattleshipGame extends AIUXElement {
  @state() _mode = 'computer';
  @state() _phase = 'configure';
  @state() _setupPlayer = 0;
  @state() _boards = [createBoard(), createBoard()];
  @state() _selectedShipId = FLEET[0].id;
  @state() _orientation = 'horizontal';
  @state() _hoveredCell = null;
  @state() _focusedCell = {own: 0, target: 0};
  @state() _turn = 0;
  @state() _winner = null;
  @state() _notice = '';
  @state() _handoffNextPhase = 'battle';

  _computerTimer = null;

  constructor() {
    super();
    this._onModeChange = this._onModeChange.bind(this);
    this._onStartSetup = this._onStartSetup.bind(this);
    this._onCellClick = this._onCellClick.bind(this);
    this._onCellPointerOver = this._onCellPointerOver.bind(this);
    this._onBoardPointerLeave = this._onBoardPointerLeave.bind(this);
    this._onBoardFocusIn = this._onBoardFocusIn.bind(this);
    this._onBoardKeyDown = this._onBoardKeyDown.bind(this);
    this._onSelectShip = this._onSelectShip.bind(this);
    this._onRotate = this._onRotate.bind(this);
    this._onRandomize = this._onRandomize.bind(this);
    this._onFinishSetup = this._onFinishSetup.bind(this);
    this._onHandoffReady = this._onHandoffReady.bind(this);
    this._onReturnToSetup = this._onReturnToSetup.bind(this);
    this._onNewGame = this._onNewGame.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._computerTimer !== null) {
      window.clearTimeout(this._computerTimer);
      this._computerTimer = null;
    }
  }

  _focusPhase(selector) {
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector(selector)?.focus();
    });
  }

  _playerLabel(player = this._setupPlayer) {
    return player === 0
      ? i18n.getMessage('Player 1')
      : this._mode === 'computer'
        ? i18n.getMessage('Computer')
        : i18n.getMessage('Player 2');
  }

  _shipLabel(shipId) {
    const labels = {
      carrier: i18n.getMessage('Carrier'),
      battleship: i18n.getMessage('Battleship'),
      cruiser: i18n.getMessage('Cruiser'),
      submarine: i18n.getMessage('Submarine'),
      destroyer: i18n.getMessage('Destroyer')
    };
    return labels[shipId] ?? shipId;
  }

  _selectedShip() {
    return FLEET.find(ship => ship.id === this._selectedShipId) ?? FLEET[0];
  }

  _onModeChange(event) {
    const mode = event.currentTarget.dataset.mode;
    if (!mode) return;
    this._mode = mode;
  }

  _onStartSetup() {
    this._boards = [createBoard(), createBoard()];
    this._setupPlayer = 0;
    this._selectedShipId = FLEET[0].id;
    this._orientation = 'horizontal';
    this._hoveredCell = null;
    this._turn = 0;
    this._winner = null;
    this._phase = 'setup';
    this._notice = i18n.getMessage(
      'Place your fleet. Select a ship, choose an orientation, then choose its starting cell.'
    );
    this._focusPhase('[data-ship-id="carrier"]');
  }

  _onCellPointerOver(event) {
    if (this._phase !== 'setup') return;
    const button = event.target.closest('[data-cell-index]');
    if (!button) return;
    this._hoveredCell = BOARD_CELLS[Number(button.dataset.cellIndex)];
  }

  _onBoardPointerLeave() {
    this._hoveredCell = null;
  }

  _onBoardFocusIn(event) {
    const button = event.target.closest('[data-cell-index]');
    if (!button) return;
    const boardType = button.dataset.boardType;
    const index = Number(button.dataset.cellIndex);
    if (!boardType || Number.isNaN(index)) return;
    this._focusedCell = {...this._focusedCell, [boardType]: index};
  }

  _onBoardKeyDown(event) {
    const button = event.target.closest('[data-cell-index]');
    if (!button) return;

    const boardType = button.dataset.boardType;
    const index = Number(button.dataset.cellIndex);
    const row = Math.floor(index / BOARD_SIZE);
    const column = index % BOARD_SIZE;
    let nextRow = row;
    let nextColumn = column;

    switch (event.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        nextRow = Math.min(BOARD_SIZE - 1, row + 1);
        break;
      case 'ArrowLeft':
        nextColumn = Math.max(0, column - 1);
        break;
      case 'ArrowRight':
        nextColumn = Math.min(BOARD_SIZE - 1, column + 1);
        break;
      case 'Home':
        if (event.ctrlKey) nextRow = 0;
        nextColumn = 0;
        break;
      case 'End':
        if (event.ctrlKey) nextRow = BOARD_SIZE - 1;
        nextColumn = BOARD_SIZE - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextIndex = nextRow * BOARD_SIZE + nextColumn;
    this._focusedCell = {...this._focusedCell, [boardType]: nextIndex};
    this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector(
          `[data-board-type="${boardType}"][data-cell-index="${nextIndex}"]`
        )
        ?.focus();
    });
  }

  _onCellClick(event) {
    const button = event.target.closest('[data-cell-index]');
    if (!button) return;
    const index = Number(button.dataset.cellIndex);
    const boardType = button.dataset.boardType;
    const cell = BOARD_CELLS[index];
    if (!cell || button.disabled) return;

    if (this._phase === 'setup' && boardType === 'own') {
      this._placeSelectedShip(cell);
      return;
    }
    if (this._phase === 'battle' && boardType === 'target') {
      this._fireHumanShot(cell);
    }
  }

  _placeSelectedShip(cell) {
    const board = this._boards[this._setupPlayer];
    const ship = this._selectedShip();
    const placement = placeShip(
      board,
      ship,
      cell.row,
      cell.column,
      this._orientation
    );

    if (!placement.valid) {
      this._notice =
        placement.reason === 'overlap'
          ? i18n.getMessage('That placement overlaps another ship.')
          : placement.reason === 'already-placed'
            ? i18n.getMessage('That ship is already placed.')
            : i18n.getMessage('That placement goes beyond the edge of the board.');
      return;
    }

    const boards = [...this._boards];
    boards[this._setupPlayer] = placement.board;
    this._boards = boards;
    this._hoveredCell = null;
    const remaining = FLEET.find(
      candidate => !placement.board.ships.some(placed => placed.id === candidate.id)
    );
    this._selectedShipId = remaining?.id ?? ship.id;
    this._notice = i18n.getMessage('{0} placed. Choose another cell.', [
      this._shipLabel(ship.id)
    ]);
  }

  _onSelectShip(event) {
    const shipId = event.currentTarget.dataset.shipId;
    if (!shipId) return;
    const alreadyPlaced = this._boards[this._setupPlayer].ships.some(
      ship => ship.id === shipId
    );
    if (alreadyPlaced) {
      this._notice = i18n.getMessage(
        'Use reset fleet to move a ship that is already placed.'
      );
      return;
    }
    this._selectedShipId = shipId;
    this._notice = i18n.getMessage('Placing {0}.', [this._shipLabel(shipId)]);
  }

  _onRotate() {
    this._orientation =
      this._orientation === 'horizontal' ? 'vertical' : 'horizontal';
    this._notice = i18n.getMessage('Orientation changed to {0}.', [
      this._orientation === 'horizontal'
        ? i18n.getMessage('horizontal')
        : i18n.getMessage('vertical')
    ]);
  }

  _onRandomize() {
    const boards = [...this._boards];
    boards[this._setupPlayer] = placeFleetRandomly();
    this._boards = boards;
    this._selectedShipId = FLEET[FLEET.length - 1].id;
    this._notice = i18n.getMessage('Fleet placed at random.');
  }

  _onFinishSetup() {
    if (!isFleetComplete(this._boards[this._setupPlayer])) {
      this._notice = i18n.getMessage('Place all five ships before continuing.');
      return;
    }

    if (this._mode === 'computer') {
      const boards = [...this._boards];
      boards[1] = placeFleetRandomly();
      this._boards = boards;
      this._turn = 0;
      this._phase = 'battle';
      this._notice = i18n.getMessage('Battle started. Choose a target cell.');
      this._focusPhase('[data-board-type="target"]:not(:disabled)');
      return;
    }

    if (this._setupPlayer === 0) {
      this._setupPlayer = 1;
      this._selectedShipId = FLEET[0].id;
      this._orientation = 'horizontal';
      this._phase = 'handoff';
      this._handoffNextPhase = 'setup';
      this._notice = i18n.getMessage('Pass the device to Player 2.');
      this._focusPhase('.handoff .aiux-btn');
      return;
    }

    this._turn = 0;
    this._phase = 'handoff';
    this._handoffNextPhase = 'battle';
    this._notice = i18n.getMessage('Pass the device to Player 1.');
    this._focusPhase('.handoff .aiux-btn');
  }

  _onHandoffReady() {
    this._phase = this._handoffNextPhase;
    this._hoveredCell = null;
    this._notice =
      this._phase === 'setup'
        ? i18n.getMessage('Player 2, place your fleet.')
        : i18n.getMessage('Player 1, choose a target cell.');
    this._focusPhase(
      this._phase === 'setup'
        ? '[data-ship-id="carrier"]'
        : '[data-board-type="target"]:not(:disabled)'
    );
  }

  _fireHumanShot(cell) {
    if (this._mode === 'computer' && this._turn !== 0) return;
    const result = takeTurn(
      this._boards,
      this._turn,
      cell.row,
      cell.column
    );
    if (!result.valid) {
      this._notice = i18n.getMessage('Choose a cell that has not been targeted.');
      return;
    }

    this._boards = result.boards;
    if (result.outcome === 'win') {
      this._finishGame(result.winner, result.shipId);
      return;
    }

    this._notice = this._shotMessage(result.outcome, result.shipId);
    this._turn = result.turn;
    if (this._mode === 'computer') {
      this._scheduleComputerShot();
    } else {
      this._phase = 'handoff';
      this._handoffNextPhase = 'battle';
      this._focusPhase('.handoff .aiux-btn');
    }
  }

  _shotMessage(outcome, shipId) {
    if (outcome === 'miss') return i18n.getMessage('Miss. The shot landed in open water.');
    if (outcome === 'sunk') {
      return i18n.getMessage('{0} sunk.', [this._shipLabel(shipId)]);
    }
    return i18n.getMessage('Hit. Part of a ship was damaged.');
  }

  _scheduleComputerShot() {
    this._notice = i18n.getMessage('Computer is choosing a target.');
    this._computerTimer = window.setTimeout(() => {
      this._computerTimer = null;
      const target = chooseComputerTarget(this._boards[0]);
      if (!target) return;
      const result = takeTurn(
        this._boards,
        this._turn,
        target.row,
        target.column
      );
      if (!result.valid) return;

      this._boards = result.boards;
      if (result.outcome === 'win') {
        this._finishGame(result.winner, result.shipId);
        return;
      }
      this._turn = result.turn;
      this._notice = i18n.getMessage('Computer fired at {0}. {1}', [
        `${COLUMN_LABELS[target.column]}${target.row + 1}`,
        this._shotMessage(result.outcome, result.shipId)
      ]);
    }, 650);
  }

  _finishGame(winner, shipId) {
    this._winner = winner;
    this._phase = 'victory';
    this._notice =
      winner === 0
        ? i18n.getMessage('Player 1 wins! The final {0} was sunk.', [
            this._shipLabel(shipId)
          ])
        : i18n.getMessage('{0} wins! The final {1} was sunk.', [
            this._playerLabel(winner),
            this._shipLabel(shipId)
          ]);
    this._focusPhase('.victory .aiux-btn');
  }

  _onReturnToSetup() {
    this._phase = 'setup';
    this._setupPlayer = 0;
    this._boards = [createBoard(), createBoard()];
    this._selectedShipId = FLEET[0].id;
    this._orientation = 'horizontal';
    this._notice = i18n.getMessage('Place your fleet to begin a new battle.');
    this._winner = null;
    this._focusPhase('[data-ship-id="carrier"]');
  }

  _onNewGame() {
    if (this._computerTimer !== null) {
      window.clearTimeout(this._computerTimer);
      this._computerTimer = null;
    }
    this._phase = 'configure';
    this._boards = [createBoard(), createBoard()];
    this._turn = 0;
    this._winner = null;
    this._notice = '';
    this._focusPhase('.mode-option');
  }

  _resetCurrentFleet() {
    const boards = [...this._boards];
    boards[this._setupPlayer] = createBoard();
    this._boards = boards;
    this._selectedShipId = FLEET[0].id;
    this._notice = i18n.getMessage('Fleet reset.');
  }

  _cellState(board, cell, revealShips, previewCells, invalidPreview) {
    const shot = board.shots[cellKey(cell.row, cell.column)];
    const ship = board.ships.find(candidate =>
      candidate.cells.some(
        shipCell => shipCell.row === cell.row && shipCell.column === cell.column
      )
    );
    const preview = previewCells.has(cellKey(cell.row, cell.column));
    const hit = shot && shot.outcome !== 'miss';
    return {
      shot,
      ship,
      preview,
      hit,
      invalidPreview: preview && invalidPreview,
      revealedShip: Boolean(revealShips && ship)
    };
  }

  _cellLabel(cell, state, revealShips, isSetup) {
    const coordinate = `${COLUMN_LABELS[cell.column]}${cell.row + 1}`;
    if (state.hit) {
      return state.shot.outcome === 'sunk'
        ? i18n.getMessage('{0}, hit and ship sunk', [coordinate])
        : i18n.getMessage('{0}, hit', [coordinate]);
    }
    if (state.shot) return i18n.getMessage('{0}, miss', [coordinate]);
    if (revealShips && state.ship) {
      return i18n.getMessage('{0}, {1}', [
        coordinate,
        this._shipLabel(state.ship.id)
      ]);
    }
    if (isSetup) return i18n.getMessage('{0}, place {1}', [coordinate, this._shipLabel(this._selectedShipId)]);
    return i18n.getMessage('{0}, not targeted', [coordinate]);
  }

  _renderShipArt(ship, cell) {
    const segment = ship.cells.findIndex(
      shipCell => shipCell.row === cell.row && shipCell.column === cell.column
    );
    return html`
      <img
        class=${classMap({
          'ship-image': true,
          'ship-vertical': ship.orientation === 'vertical'
        })}
        src=${shipImage(ship.id, ship.orientation === 'vertical')}
        alt=""
        aria-hidden="true"
        style=${`--ship-length:${ship.length};--ship-segment:${segment}`}
      />
    `;
  }

  _renderCell(board, cell, options) {
    const {boardType, revealShips, disabled, previewCells, invalidPreview} = options;
    const index = cell.row * BOARD_SIZE + cell.column;
    const state = this._cellState(
      board,
      cell,
      revealShips,
      previewCells,
      invalidPreview
    );
    return html`
      <button
        type="button"
        role="gridcell"
        class=${classMap({
          'board-cell': true,
          'cell-water': !state.revealedShip && !state.preview && !state.shot,
          'cell-ship': state.revealedShip && !state.hit,
          'cell-preview': state.preview && !state.invalidPreview,
          'cell-invalid': state.invalidPreview,
          'cell-hit': Boolean(state.hit),
          'cell-miss': Boolean(state.shot && !state.hit)
        })}
        data-board-type=${boardType}
        data-cell-index=${index}
        tabindex=${this._focusedCell[boardType] === index ? '0' : '-1'}
        aria-label=${this._cellLabel(
          cell,
          state,
          revealShips,
          this._phase === 'setup'
        )}
        ?disabled=${disabled}
      >
        ${state.hit
          ? html`<span aria-hidden="true">X</span>`
          : state.shot
            ? html`<span aria-hidden="true">o</span>`
            : state.revealedShip
              ? this._renderShipArt(state.ship, cell)
              : nothing}
      </button>
    `;
  }

  _renderBoard(board, {title, boardType, revealShips, interactive}) {
    let previewCells = new Set();
    let invalidPreview = false;
    if (this._phase === 'setup' && this._hoveredCell) {
      const validation = validatePlacement(
        board,
        this._selectedShip(),
        this._hoveredCell.row,
        this._hoveredCell.column,
        this._orientation
      );
      previewCells = new Set(
        (validation.cells ?? []).map(cell => cellKey(cell.row, cell.column))
      );
      invalidPreview = !validation.valid;
    }
    return html`
      <section class="board-section" aria-label=${title}>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 class="m-0 break-words text-base font-semibold text-text-primary">
            ${title}
          </h3>
          <span class="aiux-badge aiux-badge-sm aiux-badge-soft">
            ${i18n.getMessage('{0} ships afloat', [
              String(board.ships.filter(ship => !isShipSunk(ship)).length)
            ])}
          </span>
        </div>
        <div
          class="board-shell"
          role="grid"
          aria-label=${title}
          aria-rowcount=${String(BOARD_SIZE)}
          aria-colcount=${String(BOARD_SIZE)}
          @click=${interactive ? this._onCellClick : null}
          @keydown=${interactive ? this._onBoardKeyDown : null}
          @focusin=${interactive ? this._onBoardFocusIn : null}
          @pointerover=${interactive ? this._onCellPointerOver : null}
          @pointerleave=${interactive ? this._onBoardPointerLeave : null}
        >
          <div class="board-row" role="row">
            <span role="presentation"></span>
            ${COLUMN_LABELS.map(
              label => html`<span class="axis-label" role="columnheader">${label}</span>`
            )}
          </div>
          ${Array.from({length: BOARD_SIZE}, (_, row) => html`
            <div class="board-row" role="row">
              <span class="axis-label" role="rowheader">${row + 1}</span>
              ${BOARD_CELLS.slice(row * BOARD_SIZE, row * BOARD_SIZE + BOARD_SIZE).map(
                cell =>
                  this._renderCell(board, cell, {
                    boardType,
                    revealShips,
                    disabled: !interactive,
                    previewCells,
                    invalidPreview
                  })
              )}
            </div>
          `)}
        </div>
      </section>
    `;
  }

  _renderConfiguration() {
    return html`
      <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body gap-6 p-5 sm:p-7">
          <div>
            <p class="mb-2 text-sm font-medium text-primary-900">
              ${i18n.getMessage('Choose a battle mode')}
            </p>
            <h2 class="aiux-card-title break-words text-2xl text-text-primary">
              ${i18n.getMessage('Command the fleet')}
            </h2>
            <p class="mt-2 max-w-2xl break-words text-sm leading-6 text-text-secondary">
              ${i18n.getMessage(
                'Deploy a classic five-ship fleet on a 10 by 10 ocean grid, then locate and sink every opposing vessel.'
              )}
            </p>
          </div>
          <div
            class="mode-options"
            role="group"
            aria-label=${i18n.getMessage('Game mode')}
          >
            <button
              type="button"
              class=${classMap({
                'mode-option': true,
                selected: this._mode === 'computer'
              })}
              data-mode="computer"
              aria-pressed=${this._mode === 'computer' ? 'true' : 'false'}
              @click=${this._onModeChange}
            >
              ${icon({name: 'sparkle-outline', size: 'lg'})}
              <span>
                <strong>${i18n.getMessage('Player vs Computer')}</strong>
                <small>${i18n.getMessage('Play against a target-hunting computer')}</small>
              </span>
            </button>
            <button
              type="button"
              class=${classMap({
                'mode-option': true,
                selected: this._mode === 'players'
              })}
              data-mode="players"
              aria-pressed=${this._mode === 'players' ? 'true' : 'false'}
              @click=${this._onModeChange}
            >
              ${icon({name: 'users-outline', size: 'lg'})}
              <span>
                <strong>${i18n.getMessage('Player vs Player')}</strong>
                <small>${i18n.getMessage('Same-device pass-and-play')}</small>
              </span>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button class="aiux-btn aiux-btn-primary" type="button" @click=${this._onStartSetup}>
              ${icon({name: 'play-outline', size: 'sm'})}
              ${i18n.getMessage('Begin setup')}
            </button>
            <span class="text-sm text-text-secondary">
              ${i18n.getMessage('No sign-in or saved data required')}
            </span>
          </div>
        </div>
      </section>
    `;
  }

  _renderFleetControls() {
    const board = this._boards[this._setupPlayer];
    return html`
      <aside class="aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body gap-4 p-5">
          <div>
            <p class="text-xs font-medium uppercase text-text-secondary">
              ${i18n.getMessage('Fleet manifest')}
            </p>
            <h2 class="aiux-card-title mt-1 text-lg">
              ${i18n.getMessage('{0} deployment', [this._playerLabel(this._setupPlayer)])}
            </h2>
          </div>
          <div
            class="flex flex-col gap-2"
            role="group"
            aria-label=${i18n.getMessage('Ships')}
          >
            ${FLEET.map(ship => {
              const placed = board.ships.some(candidate => candidate.id === ship.id);
              return html`
                <button
                  type="button"
                  class=${classMap({
                    'fleet-row': true,
                    selected: this._selectedShipId === ship.id && !placed,
                    placed
                  })}
                  data-ship-id=${ship.id}
                  aria-pressed=${this._selectedShipId === ship.id && !placed
                    ? 'true'
                    : 'false'}
                  @click=${this._onSelectShip}
                >
                  <span class="flex min-w-0 items-center gap-3">
                    <img
                      class="fleet-ship-image"
                      src=${shipImage(ship.id)}
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="min-w-0 text-left">
                      <strong class="block break-words">${this._shipLabel(ship.id)}</strong>
                      <small>${i18n.getMessage('{0} cells', [String(ship.length)])}</small>
                    </span>
                  </span>
                  <span class="aiux-badge aiux-badge-sm aiux-badge-soft">
                    ${placed
                      ? i18n.getMessage('Placed')
                      : this._selectedShipId === ship.id
                        ? i18n.getMessage('Selected')
                        : i18n.getMessage('Available')}
                  </span>
                </button>
              `;
            })}
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button class="aiux-btn aiux-btn-outline" type="button" @click=${this._onRotate}>
              ${icon({name: 'arrow-rotate-right-outline', size: 'sm'})}
              ${this._orientation === 'horizontal'
                ? i18n.getMessage('Rotate vertical')
                : i18n.getMessage('Rotate horizontal')}
            </button>
            <button class="aiux-btn aiux-btn-outline" type="button" @click=${this._onRandomize}>
              ${icon({name: 'shuffle-outline', size: 'sm'})}
              ${i18n.getMessage('Random fleet')}
            </button>
            <button
              class="aiux-btn aiux-btn-ghost sm:col-span-2"
              type="button"
              @click=${this._resetCurrentFleet}
            >
              ${icon({name: 'trash-outline', size: 'sm'})}
              ${i18n.getMessage('Reset fleet')}
            </button>
          </div>
          <button class="aiux-btn aiux-btn-primary" type="button" @click=${this._onFinishSetup}>
            ${this._mode === 'players' && this._setupPlayer === 0
              ? i18n.getMessage('Finish Player 1 setup')
              : i18n.getMessage('Begin battle')}
            ${icon({name: 'arrow-right-outline', size: 'sm'})}
          </button>
        </div>
      </aside>
    `;
  }

  _renderSetup() {
    const board = this._boards[this._setupPlayer];
    return html`
      <div class="setup-layout">
        ${this._renderBoard(board, {
          title: i18n.getMessage('{0} fleet', [this._playerLabel(this._setupPlayer)]),
          boardType: 'own',
          revealShips: true,
          interactive: true
        })}
        ${this._renderFleetControls()}
      </div>
    `;
  }

  _renderHandoff() {
    const nextPlayer =
      this._handoffNextPhase === 'setup'
        ? i18n.getMessage('Player 2')
        : this._playerLabel(this._turn);
    return html`
      <section class="handoff aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body items-center gap-5 p-7 text-center sm:p-10">
          <span class="handoff-icon" aria-hidden="true">
            ${icon({name: 'user-outline', size: 'xl'})}
          </span>
          <div>
            <p class="text-sm font-medium text-text-secondary">
              ${i18n.getMessage('Private handoff')}
            </p>
            <h2 class="mt-1 break-words text-2xl font-bold">
              ${i18n.getMessage('Pass the device to {0}', [nextPlayer])}
            </h2>
            <p class="mt-3 max-w-lg break-words text-sm leading-6 text-text-secondary">
              ${i18n.getMessage(
                'The ocean grids are hidden until the next player is ready to continue.'
              )}
            </p>
          </div>
          <button class="aiux-btn aiux-btn-primary" type="button" @click=${this._onHandoffReady}>
            ${i18n.getMessage('I am ready')}
          </button>
        </div>
      </section>
    `;
  }

  _renderBattle() {
    const viewer = this._mode === 'computer' ? 0 : this._turn;
    const defender = 1 - viewer;
    const ownBoard = this._boards[viewer];
    const targetBoard = this._boards[defender];
    return html`
      <section class="battle-layout">
        ${this._renderBoard(ownBoard, {
          title: i18n.getMessage('{0} fleet', [this._playerLabel(viewer)]),
          boardType: 'own',
          revealShips: true,
          interactive: false
        })}
        ${this._renderBoard(targetBoard, {
          title: i18n.getMessage('{0} waters', [this._playerLabel(defender)]),
          boardType: 'target',
          revealShips: false,
          interactive: !(this._mode === 'computer' && this._turn === 1)
        })}
      </section>
    `;
  }

  _renderVictory() {
    return html`
      <section class="victory aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body items-center gap-5 p-7 text-center sm:p-10">
          <span class="victory-icon" aria-hidden="true">
            ${icon({name: 'trophy-outline', size: 'xl'})}
          </span>
          <div>
            <p class="text-sm font-medium text-text-secondary">
              ${i18n.getMessage('Battle complete')}
            </p>
            <h2 class="mt-1 break-words text-3xl font-bold">
              ${i18n.getMessage('{0} wins', [this._playerLabel(this._winner)])}
            </h2>
            <p class="mt-3 max-w-lg break-words text-sm leading-6 text-text-secondary">
              ${this._notice}
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <button class="aiux-btn aiux-btn-primary" type="button" @click=${this._onNewGame}>
              ${i18n.getMessage('New game')}
            </button>
            <button class="aiux-btn aiux-btn-outline" type="button" @click=${this._onReturnToSetup}>
              ${i18n.getMessage('Return to setup')}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  _renderPhase() {
    switch (this._phase) {
      case 'setup':
        return this._renderSetup();
      case 'handoff':
        return this._renderHandoff();
      case 'battle':
        return this._renderBattle();
      case 'victory':
        return this._renderVictory();
      default:
        return this._renderConfiguration();
    }
  }

  render() {
    const turnLabel =
      this._phase === 'battle'
        ? i18n.getMessage('{0} turn', [this._playerLabel(this._turn)])
        : this._phase === 'setup'
          ? i18n.getMessage('Fleet setup')
          : i18n.getMessage('Battleship command');
    return html`
      <main class="game-page">
        <header class="game-header">
          <div>
            <p class="eyebrow">${i18n.getMessage('Naval strategy game')}</p>
            <h1>${i18n.getMessage('Battleship')}</h1>
          </div>
          <span class="aiux-badge aiux-badge-lg aiux-badge-primary aiux-badge-soft">
            ${icon({name: 'crosshairs-outline', size: 'sm'})}
            ${turnLabel}
          </span>
        </header>

        ${this._notice && this._phase !== 'victory'
          ? html`
              <div class="aiux-alert aiux-alert-info aiux-alert-soft" role="status">
                ${icon({name: 'circle-info-outline', size: 'sm'})}
                <span class="break-words">${this._notice}</span>
              </div>
            `
          : nothing}

        ${this._renderPhase()}
      </main>
    `;
  }

  static styles = css`
    :host {
      display: block;
      min-width: 0;
      container-type: inline-size;
    }

    button {
      font: inherit;
    }

    .game-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0.75rem 2rem;
      color: var(--color-text-primary, #000);
    }

    .game-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.75rem;
      border-bottom: 1px solid var(--color-base-300, #e5e7eb);
      padding-bottom: 1rem;
    }

    .game-header h1 {
      margin: 0;
      overflow-wrap: anywhere;
      font-family: var(--font-servicenow, var(--font-sans));
      font-size: clamp(2rem, 3.5vw, 3.25rem);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: 0;
    }

    .eyebrow {
      margin: 0 0 0.25rem;
      color: var(--color-primary, #007b9e);
      font-size: var(--text-xs, 0.75rem);
      font-weight: 700;
      text-transform: uppercase;
    }

    .mode-options,
    .setup-layout,
    .battle-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
    }

    .mode-option,
    .fleet-row {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 2px solid var(--color-border-subtle, #e3e2df);
      border-radius: var(--radius-lg, 0.5rem);
      background: var(--color-base-100, #fff);
      color: var(--color-text-primary, #000);
      cursor: pointer;
      text-align: left;
      transition:
        background-color var(--duration-sm, 200ms) linear,
        border-color var(--duration-sm, 200ms) linear;
    }

    .mode-option {
      min-height: 6rem;
      padding: 1rem;
    }

    .mode-option span,
    .fleet-row span {
      min-width: 0;
    }

    .mode-option strong,
    .mode-option small,
    .fleet-row strong,
    .fleet-row small {
      display: block;
      max-width: 100%;
      overflow-wrap: anywhere;
    }

    .mode-option small,
    .fleet-row small {
      margin-top: 0.25rem;
      color: var(--color-text-secondary, #4d4c4a);
    }

    .mode-option:hover,
    .mode-option.selected,
    .fleet-row:hover,
    .fleet-row.selected {
      border-color: var(--color-primary, #007b9e);
      background: var(--color-base-200, #f2f2f2);
    }

    .mode-option:focus-visible,
    .fleet-row:focus-visible,
    .board-cell:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--color-primary, #007b9e);
      outline-offset: 2px;
    }

    .fleet-row {
      min-height: 4rem;
      padding: 0.75rem;
    }

    .fleet-row.placed {
      border-color: var(--color-success, #22c55e);
    }

    .fleet-ship-image {
      display: block;
      width: 5.5rem;
      height: 1.75rem;
      flex-shrink: 0;
      object-fit: contain;
    }

    .board-section {
      min-width: 0;
      border: 1px solid var(--color-base-300, #e5e7eb);
      border-radius: var(--radius-lg, 0.5rem);
      background: var(--color-base-100, #fff);
      padding: 0.75rem;
      box-shadow: 0 1px 2px var(--color-base-300, #e5e7eb);
    }

    .board-shell {
      display: grid;
      grid-template-columns: 1.25rem repeat(10, minmax(0, 1fr));
      gap: 2px;
      width: 100%;
      max-width: 34rem;
      margin: 0 auto;
    }

    .board-row {
      display: contents;
    }

    .axis-label {
      display: grid;
      min-width: 0;
      place-items: center;
      color: var(--color-text-secondary, #4d4c4a);
      font-size: clamp(0.625rem, 2.5vw, 0.75rem);
      font-weight: 700;
    }

    .board-cell {
      display: grid;
      aspect-ratio: 1;
      min-width: 0;
      min-height: 24px;
      place-items: center;
      border: 1px solid var(--color-info, #60a5fa);
      border-radius: 2px;
      background: var(--color-base-200, #f2f2f2);
      color: var(--color-text-primary, #000);
      cursor: crosshair;
      font-size: clamp(0.75rem, 3vw, 1rem);
      font-weight: 700;
      line-height: 1;
      padding: 0;
      transition:
        background-color var(--duration-sm, 200ms) linear,
        border-color var(--duration-sm, 200ms) linear,
        transform var(--duration-xs, 150ms) var(--ease-medium-accel);
    }

    .board-cell:hover:not(:disabled) {
      transform: scale(1.04);
      border-color: var(--color-primary, #007b9e);
    }

    .board-cell:disabled {
      cursor: default;
    }

    .cell-ship {
      position: relative;
      overflow: hidden;
      border-color: var(--color-primary, #007b9e);
      background: var(--color-base-100, #fff);
    }

    .ship-image {
      position: absolute;
      top: 0;
      left: calc(var(--ship-segment) * -100%);
      display: block;
      width: calc(var(--ship-length) * 100%);
      max-width: none;
      height: 100%;
      object-fit: fill;
      pointer-events: none;
    }

    .ship-image.ship-vertical {
      top: calc(var(--ship-segment) * -100%);
      left: 0;
      width: 100%;
      height: calc(var(--ship-length) * 100%);
    }

    .cell-preview {
      border-color: var(--color-success, #22c55e);
      background: var(--color-success, #22c55e);
      color: var(--color-primary-content, #fff);
    }

    .cell-invalid {
      border-color: var(--color-error, #be0003);
      border-style: dashed;
      background: var(--color-error, #be0003);
    }

    .cell-hit {
      border: 2px solid var(--color-error, #be0003);
      background: var(--color-error, #be0003);
      color: var(--color-primary-content, #fff);
    }

    .cell-miss {
      border-color: var(--color-border-default, #8a8986);
      background: var(--color-base-100, #fff);
      color: var(--color-info, #60a5fa);
      font-size: 1.5rem;
    }

    .ship-mark {
      font-size: 0.7rem;
    }

    .handoff,
    .victory {
      min-height: 20rem;
    }

    .handoff-icon,
    .victory-icon {
      display: grid;
      width: 5rem;
      height: 5rem;
      place-items: center;
      border: 2px solid var(--color-primary, #007b9e);
      border-radius: var(--radius-lg, 0.5rem);
      background: var(--color-base-200, #f2f2f2);
      color: var(--color-primary, #007b9e);
    }

    .victory-icon {
      border-color: var(--color-success, #22c55e);
      color: var(--color-success, #22c55e);
    }

    .sr-only-grid {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    @container (min-width: 44rem) {
      .mode-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .setup-layout {
        grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.75fr);
        align-items: start;
      }

      .battle-layout {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .game-page {
        padding: 1.5rem 2rem 3rem;
      }

      .board-section {
        padding: 1rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .mode-option,
      .fleet-row,
      .board-cell {
        transition: none;
      }

      .board-cell:hover:not(:disabled) {
        transform: none;
      }
    }

    @media (forced-colors: active) {
      .mode-option,
      .fleet-row,
      .board-cell {
        forced-color-adjust: none;
        border: 2px solid ButtonBorder;
        background: ButtonFace;
        color: ButtonText;
      }

      .mode-option:hover,
      .mode-option:focus-visible,
      .fleet-row:hover,
      .fleet-row:focus-visible,
      .board-cell:hover:not(:disabled),
      .board-cell:focus-visible {
        border-color: Highlight;
        background: Highlight;
        color: HighlightText;
        outline: 2px solid Highlight;
      }

      .mode-option.selected,
      .fleet-row.selected {
        background: SelectedItem;
        color: SelectedItemText;
      }

      .cell-ship,
      .cell-preview {
        border-style: double;
        background: SelectedItem;
        color: SelectedItemText;
      }

      .cell-hit,
      .cell-invalid {
        border: 3px double SelectedItem;
        background: CanvasText;
        color: Canvas;
      }

      .cell-miss {
        border-style: dotted;
        background: ButtonFace;
        color: ButtonText;
      }
    }
  `;
}
