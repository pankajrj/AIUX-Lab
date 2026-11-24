import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_SIZE,
  FLEET,
  chooseComputerTarget,
  createBoard,
  fireAt,
  isFleetComplete,
  placeFleetRandomly,
  placeShip,
  takeTurn
} from './engine.js';

function place(board, shipIndex, row, column, orientation = 'horizontal') {
  return placeShip(board, FLEET[shipIndex], row, column, orientation).board;
}

test('placement rejects ships outside the board and overlapping cells', () => {
  const board = place(createBoard(), 4, 9, 0);
  const outOfBounds = placeShip(board, FLEET[0], 0, 7, 'horizontal');
  const overlap = placeShip(board, FLEET[0], 9, 1, 'horizontal');

  assert.equal(outOfBounds.reason, 'out-of-bounds');
  assert.equal(overlap.reason, 'overlap');
  assert.equal(board.ships.length, 1);
});

test('placement rejects duplicate ships without mutating the board', () => {
  const board = place(createBoard(), 0, 0, 0);
  const result = placeShip(board, FLEET[0], 2, 0, 'horizontal');

  assert.equal(result.valid, false);
  assert.equal(result.reason, 'already-placed');
  assert.strictEqual(result.board, board);
});

test('random fleet placement creates a complete valid fleet', () => {
  let seed = 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const board = placeFleetRandomly(random);
  const occupied = board.ships.flatMap(ship =>
    ship.cells.map(cell => `${cell.row},${cell.column}`)
  );

  assert.equal(isFleetComplete(board), true);
  assert.equal(board.ships.length, FLEET.length);
  assert.equal(new Set(occupied).size, occupied.length);
  assert.ok(
    board.ships.every(ship =>
      ship.cells.every(
        cell =>
          cell.row >= 0 &&
          cell.row < BOARD_SIZE &&
          cell.column >= 0 &&
          cell.column < BOARD_SIZE
      )
    )
  );
});

test('shots report hit, miss, sunk, and reject duplicate coordinates', () => {
  const board = place(place(createBoard(), 4, 0, 0), 2, 4, 0);
  const hit = fireAt(board, 0, 0);
  const repeat = fireAt(hit.board, 0, 0);
  const miss = fireAt(hit.board, 2, 2);
  const sunk = fireAt(hit.board, 0, 1);

  assert.equal(hit.outcome, 'hit');
  assert.equal(repeat.valid, false);
  assert.equal(repeat.reason, 'repeat-shot');
  assert.equal(miss.outcome, 'miss');
  assert.equal(sunk.outcome, 'sunk');
});

test('firing at the last ship cell reports victory', () => {
  const board = place(createBoard(), 4, 0, 0);
  const first = fireAt(board, 0, 0);
  const victory = fireAt(first.board, 0, 1);

  assert.equal(victory.valid, true);
  assert.equal(victory.outcome, 'win');
});

test('turns alternate only after a valid shot and preserve the winner on victory', () => {
  const playerOne = place(createBoard(), 4, 0, 0);
  const playerTwo = place(createBoard(), 4, 0, 0);
  const first = takeTurn([playerOne, playerTwo], 0, 3, 3);
  const repeat = takeTurn(first.boards, 0, 3, 3);
  const hitPlayerOne = takeTurn(first.boards, 1, 0, 0);
  const hitPlayerTwo = takeTurn(hitPlayerOne.boards, 0, 0, 0);
  const victory = takeTurn(hitPlayerTwo.boards, 1, 0, 1);

  assert.equal(first.turn, 1);
  assert.equal(repeat.valid, false);
  assert.equal(repeat.turn, 0);
  assert.equal(hitPlayerOne.outcome, 'hit');
  assert.equal(hitPlayerTwo.outcome, 'hit');
  assert.equal(victory.outcome, 'win');
  assert.equal(victory.turn, 1);
  assert.equal(victory.winner, 1);
});

test('computer targets a valid neighboring cell after an unresolved hit', () => {
  let board = place(createBoard(), 0, 5, 2);
  board = fireAt(board, 5, 2).board;
  const target = chooseComputerTarget(board, () => 0);
  const key = `${target.row},${target.column}`;

  assert.ok(['4,2', '6,2', '5,1', '5,3'].includes(key));
  assert.equal(board.shots[key], undefined);
});
