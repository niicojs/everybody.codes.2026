import clipboard from 'clipboardy';
import { consola } from 'consola';
import { colors } from 'consola/utils';

import { count, enumGrid, getCurrentDay, getDataLines, getGrid, getNeighbors, inGridRange, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

let grid = getGrid(getDataLines());
const center = [grid[0].length / 2 - 0.5, grid.length / 2 - 0.5];
grid[center[1]][center[0]] = '#';

const printGrid = () => {
  const pad = (grid.length - 1).toString().length;
  console.log(''.padStart(pad, ' ') + ' ┌' + '─'.repeat(grid[0].length) + '┐');
  for (let y = 0; y < grid.length; y++) {
    let line = y.toString().padStart(pad, ' ') + ' │';
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '#') line += colors.green(grid[y][x]);
      else if (grid[y][x] === '=') line += colors.yellow(grid[y][x]);
      else if (grid[y][x] === '@') line += colors.magenta(grid[y][x]);
      else line += colors.blue(grid[y][x]);
    }
    line += '│';
    console.log(line);
  }
  console.log(''.padStart(pad, ' ') + ' └' + '─'.repeat(grid[0].length) + '┘');
};

function step_one() {
  const newgrid = grid.map((arr) => arr.slice());
  for (const { x, y, cell } of enumGrid(grid)) {
    if (cell === '#') continue;
    const neighbors = getNeighbors(x, y).filter(([nx, ny]) => inGridRange(grid, nx, ny));
    const touch = neighbors.filter(([nx, ny]) => grid[ny][nx] === '#').length;
    if (touch === 0) continue;

    const nb = neighbors.filter(([nx, ny]) => ['#', '1'].includes(grid[ny][nx])).length;
    if (nb >= 5) newgrid[y][x] = '#';
  }
  grid = newgrid;
}

function step_two() {
  const newgrid = grid.map((arr) => arr.slice());
  for (const { x, y, cell } of enumGrid(grid)) {
    if (cell !== '#') continue;
    const neighbors = getNeighbors(x, y).filter(([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] === '=');
    if (neighbors.length >= 5) newgrid[y][x] = '=';
  }
  grid = newgrid;
}

function can_i_put_tree(x, y) {
  if (x < 2 || y < 2) return false;
  if (x > grid[0].length - 3 || y > grid.length - 3) return false;
  if (grid[y][x] !== '#') return false;

  const first_circle = getNeighbors(x, y).filter(([nx, ny]) => ['#', '@'].includes(grid[ny][nx])).length;
  if (first_circle < 8) return false;

  for (let i = x - 2; i <= x + 2; i++) {
    for (let j = y - 2; j <= y + 2; j++) {
      if (Math.abs(x - i) === 2 && Math.abs(y - j) === 2) continue;
      if (!['#', '@'].includes(grid[j][i])) {
        return false;
      }
    }
  }

  return true;
}

function plant_trees() {
  for (const { x, y } of enumGrid(grid)) {
    if (can_i_put_tree(x, y)) grid[y][x] = '@';
  }
}

function grow_trees() {
  const newgrid = grid.map((arr) => arr.slice());
  for (const { x, y, cell } of enumGrid(grid)) {
    if (cell !== '#') continue;
    const neighbors = getNeighbors(x, y).filter(([nx, ny]) => inGridRange(grid, nx, ny));
    const sand = neighbors.filter(([nx, ny]) => grid[ny][nx] === '=');
    if (sand.length > 0) continue;
    const trees = neighbors.filter(([nx, ny]) => grid[ny][nx] === '@');
    if (trees.length >= 4) {
      newgrid[y][x] = '@';
    }
  }
  grid = newgrid;
}

function letsgo() {
  // define land
  while (true) {
    const before = grid.reduce((p, c) => p + count(c, '#'), 0);
    step_one();
    const after = grid.reduce((p, c) => p + count(c, '#'), 0);
    if (before === after) break;
  }
  // sand appears
  const newgrid = grid.map((arr) => arr.slice());
  for (const { x, y, cell } of enumGrid(grid)) {
    if (cell === '#') {
      const water = getNeighbors(x, y).filter(([nx, ny]) => !inGridRange(grid, nx, ny) || grid[ny][nx] !== '#');
      if (water.length > 0) newgrid[y][x] = '=';
    } else {
      newgrid[y][x] = '.';
    }
  }
  grid = newgrid;
  // make sand
  while (true) {
    const before = grid.reduce((p, c) => p + count(c, '='), 0);
    step_two();
    const after = grid.reduce((p, c) => p + count(c, '='), 0);
    if (before === after) break;
  }
  // trees
  printGrid();
  plant_trees();
  grow_trees();
  grow_trees();
  return grid.reduce((p, c) => p + count(c, '@'), 0);
}

let answer = letsgo();
printGrid();

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
