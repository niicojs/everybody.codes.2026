import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getDataLines, nums, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

const values = getDataLines().map(nums);

const times = {};

for (const [id, , , time] of values) {
  if (!times[id]) times[id] = 0;
  times[id] = times[id] + time;
}

let answer = 0;
const sorted = Object.entries(times).sort((a, b) => a[1] - b[1]);
for (const [idx, [, time]] of sorted.entries()) {
  answer += (idx + 1) * time;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
