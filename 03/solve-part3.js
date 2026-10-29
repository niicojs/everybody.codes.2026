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
  .map(([a, b]) => [a.slice(5), b]);

let answer = 0;

function notation(one, two) {
  two = two.toString();
  let value = 0;
  const ln = two.length;
  while (one.length < ln) one = one + one;
  one = one.slice(-ln);
  for (let i = 0; i < ln; i++) {
    value += Math.pow(one[ln - i - 1], i) * two[ln - i - 1];
  }

  return value;
}

for (let [one, two] of votes) {
  const n = notation(one, two);
  let val = +two - 1;

  let good = true;
  while (val > 1) {
    if (notation(one, val) === n) {
      good = false;
      break;
    }
    val--;
  }

  if (good) answer += n;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
