import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getDataLines, nums, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

function compare([, quest1, part1, time1], [, quest2, part2, time2]) {
  if (quest1 !== quest2) return quest1 - quest2;
  if (part1 !== part2) return part1 - part2;
  return time1 - time2;
}

const values = getDataLines().map(nums).toSorted(compare);

// fix times to include previous parts
const times = {};
for (let i = 0; i < values.length; i++) {
  let [id, quest, part, time] = values[i];
  if (!times[id]) times[id] = {};
  if (!times[id][quest]) times[id][quest] = {};
  times[id][quest][part] = time;

  if (part > 1) time = time + (times[id][quest][part - 1] || 0);
  if (part > 2) time = time + (times[id][quest][part - 2] || 0);

  values[i][3] = time;
}

const ranks = {};

const sorted = values.toSorted(compare);

let [last_id, last_quest, last_part, last_time] = sorted[0];
let score = last_part === 3 ? 150 : last_part === 2 ? 100 : 50;
ranks[last_id] = score;

let decalage = 0;
for (let [id, quest, part, time] of sorted.slice(1)) {
  if (quest !== last_quest || part !== last_part) {
    score = part === 3 ? 150 : part === 2 ? 100 : 50;
    ranks[id] = (ranks[id] || 0) + score;
    decalage = 0;
  } else if (last_time !== time) {
    score = score - 1 - decalage;
    if (score < 0) score = 0;
    ranks[id] = (ranks[id] || 0) + score;
    decalage = 0;
  } else {
    // same time, same score
    ranks[id] = (ranks[id] || 0) + score;
    decalage++;
  }

  [last_id, last_quest, last_part, last_time] = [id, quest, part, time];
}

const classement = Object.entries(ranks).toSorted(([, time1], [, time2]) => time2 - time1);

let answer = classement[0][1];
let rank = 1;
decalage = 0;
for (let idx = 1; idx < classement.length; idx++) {
  if (classement[idx - 1][1] !== classement[idx][1]) {
    rank = rank + 1 + decalage;
    decalage = 0;
  } else {
    decalage++;
  }

  answer += rank * classement[idx][1];
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
