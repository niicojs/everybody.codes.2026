import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getDataLines, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

let answer = 0;

const lines = getDataLines().map((l) => l.split(' '));
for (const line of lines) {
  const comparaisons = line.map((elt) => elt.match(/(\d+)(.)(\d+)/)).map(([_, a, op, b]) => [Number(a), op, Number(b)]);
  const set = new Set();
  for (const [a, op, b] of comparaisons) {
    set.add(a);
    set.add(b);
  }
  const numbers = Array.from(set).sort((a, b) => {
    const [c, op, d] = comparaisons.find(([c, op, d]) => (a === c && b === d) || (a === d && b === c));
    if (a === c) return op === '<' ? 1 : -1;
    if (a === d) return op === '<' ? -1 : 1;
    return 0;
  });
  answer += +numbers.map((n) => n.toString()).join('');
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
