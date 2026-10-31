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
  if (!times[id]) times[id] = { parts: 0, time: 0 };
  times[id] = {
    parts: times[id].parts + 1,
    time: times[id].time + time,
  };
}

let answer = 0;
const sorted = Object.entries(times).toSorted((a, b) => {
  if (a[1].parts === b[1].parts) {
    return a[1].time - b[1].time;
  } else {
    return b[1].parts - a[1].parts;
  }
});

for (const [idx, [, { time }]] of sorted.entries()) {
  answer += (idx + 1) * time;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
