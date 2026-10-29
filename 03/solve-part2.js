import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getDataLines, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

const votes = getDataLines()
  .map((l) => l.split(' '))
  .map(([a, b]) => [a.slice(4), b]);

let answer = 0;

for (let [one, two] of votes) {
  let value = 0;
  const ln = two.length;
  while (one.length < ln) one = one + one;
  one = one.slice(-ln);
  for (let i = 0; i < ln; i++) {
    value += Math.pow(one[ln - i - 1], i) * two[ln - i - 1];
  }

  answer += value;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
