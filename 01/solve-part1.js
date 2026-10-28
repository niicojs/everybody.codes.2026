import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getRawData, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

const values = getRawData().trim().split(',').map(Number);

let answer = 0;

for (const value of values) {
  let i = 1;
  while (i * i < value) i++;
  answer += i * i - value;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
