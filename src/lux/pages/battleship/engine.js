export const BOARD_SIZE = 10;

export const FLEET = Object.freeze([
  Object.freeze({id: 'carrier', length: 5}),
  Object.freeze({id: 'battleship', length: 4}),
  Object.freeze({id: 'cruiser', length: 3}),
  Object.freeze({id: 'submarine', length: 3}),
  Object.freeze({id: 'destroyer', length: 2})
]);

export function cellKey(row, column) {
  return `${row},${column}`;
}

export function createBoard() {
  return {ships: [], shots: {}};
}

export function cellsForShip(row, column, length, orientation) {
  return Array.from({length}, (_, index) => ({
    row: row + (orientation === 'vertical' ? index : 0),
    column: column + (orientation === 'horizontal' ? index : 0)
  }));
}

export function validatePlacement(board, ship, row, column, orientation) {
  if (board.ships.some(candidate => candidate.id === ship.id)) {
    return {valid: false, reason: 'already-placed'};
  }

  const cells = cellsForShip(row, column, ship.length, orientation);
  if (
    !['horizontal', 'vertical'].includes(orientation) ||
    cells.some(
      cell =>
        cell.row < 0 ||
        cell.row >= BOARD_SIZE ||
        cell.column < 0 ||
        cell.column >= BOARD_SIZE
    )
  ) {
    return {valid: false, reason: 'out-of-bounds', cells};
  }

  const occupied = new Set(
    board.ships.flatMap(candidate => candidate.cells.map(cell => cellKey(cell.row, cell.column)))
  );
  if (cells.some(cell => occupied.has(cellKey(cell.row, cell.column)))) {
    return {valid: false, reason: 'overlap', cells};
  }

  return {valid: true, cells};
}

export function placeShip(board, ship, row, column, orientation) {
  const validation = validatePlacement(board, ship, row, column, orientation);
  if (!validation.valid) return {...validation, board};

  return {
    valid: true,
    cells: validation.cells,
    board: {
      ...board,
      ships: [
        ...board.ships,
        {...ship, orientation, cells: validation.cells, hits: []}
      ]
    }
  };
}

export function placeFleetRandomly(random = Math.random) {
  let board = createBoard();

  for (const ship of FLEET) {
    let placement = null;
    let attempts = 0;
    do {
      const orientation = random() < 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(random() * BOARD_SIZE);
      const column = Math.floor(random() * BOARD_SIZE);
      placement = placeShip(board, ship, row, column, orientation);
      attempts += 1;
    } while (!placement.valid && attempts < 1000);

    if (!placement.valid) throw new Error('Unable to place fleet');
    board = placement.board;
  }

  return board;
}

export function isFleetComplete(board) {
  return board.ships.length === FLEET.length;
}

export function isShipSunk(ship) {
  return ship.hits.length === ship.length;
}

export function isFleetSunk(board) {
  return board.ships.length > 0 && board.ships.every(isShipSunk);
}

export function fireAt(board, row, column) {
  const key = cellKey(row, column);
  if (
    row < 0 ||
    row >= BOARD_SIZE ||
    column < 0 ||
    column >= BOARD_SIZE
  ) {
    return {valid: false, reason: 'out-of-bounds', board};
  }
  if (board.shots[key]) {
    return {valid: false, reason: 'repeat-shot', board};
  }

  const target = board.ships.find(ship =>
    ship.cells.some(cell => cell.row === row && cell.column === column)
  );
  let ships = board.ships;
  let outcome = 'miss';
  let shipId = null;

  if (target) {
    shipId = target.id;
    ships = board.ships.map(ship =>
      ship.id === target.id
        ? {...ship, hits: [...ship.hits, key]}
        : ship
    );
    outcome = isShipSunk(ships.find(ship => ship.id === target.id)) ? 'sunk' : 'hit';
  }

  const updated = {
    ...board,
    ships,
    shots: {...board.shots, [key]: {outcome, shipId}}
  };

  return {
    valid: true,
    outcome: isFleetSunk(updated) ? 'win' : outcome,
    shipId,
    board: updated
  };
}

export function takeTurn(boards, turn, row, column) {
  if (turn !== 0 && turn !== 1) {
    return {valid: false, reason: 'invalid-turn', boards, turn};
  }

  const defender = 1 - turn;
  const attack = fireAt(boards[defender], row, column);
  if (!attack.valid) {
    return {...attack, boards, turn};
  }

  const updatedBoards = [...boards];
  updatedBoards[defender] = attack.board;
  return {
    ...attack,
    boards: updatedBoards,
    turn: attack.outcome === 'win' ? turn : defender,
    winner: attack.outcome === 'win' ? turn : null
  };
}

export function chooseComputerTarget(board, random = Math.random) {
  const candidates = new Map();
  const unresolvedHits = board.ships
    .filter(ship => !isShipSunk(ship))
    .flatMap(ship => ship.hits.map(value => value.split(',').map(Number)));

  for (const [row, column] of unresolvedHits) {
    for (const [nextRow, nextColumn] of [
      [row - 1, column],
      [row + 1, column],
      [row, column - 1],
      [row, column + 1]
    ]) {
      const key = cellKey(nextRow, nextColumn);
      if (
        nextRow >= 0 &&
        nextRow < BOARD_SIZE &&
        nextColumn >= 0 &&
        nextColumn < BOARD_SIZE &&
        !board.shots[key]
      ) {
        candidates.set(key, {row: nextRow, column: nextColumn});
      }
    }
  }

  const targeted = [...candidates.values()];
  if (targeted.length) return targeted[Math.floor(random() * targeted.length)];

  const hunt = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (!board.shots[cellKey(row, column)] && (row + column) % 2 === 0) {
        hunt.push({row, column});
      }
    }
  }
  const remaining = hunt.length
    ? hunt
    : Array.from({length: BOARD_SIZE * BOARD_SIZE}, (_, index) => ({
        row: Math.floor(index / BOARD_SIZE),
        column: index % BOARD_SIZE
      })).filter(cell => !board.shots[cellKey(cell.row, cell.column)]);

  return remaining[Math.floor(random() * remaining.length)] ?? null;
}
