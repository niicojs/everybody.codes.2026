import clipboard from 'clipboardy';
import { consola } from 'consola';

import { getCurrentDay, getDataLines, timer } from '../utils.ts';

consola.wrapAll();

const day = getCurrentDay();
const isReal = process.argv[2] === 'real';

consola.start('Starting day ' + day, isReal ? '(real)' : '(test)');
const t = timer();

let answer = 0;

function extend(comparaisons) {
  const map = new Map();

  // put all reverse comparisons as well
  for (const [a, op, b] of comparaisons) {
    if (!map.has(a)) map.set(a, new Map());
    if (!map.has(b)) map.set(b, new Map());
    map.get(a).set(b, op);
    map.get(b).set(a, op === '<' ? '>' : '<');
  }

  // put all transitive comparisons as well
  for (const [a, neighbors] of map) {
    for (const [b, op1] of neighbors) {
      for (const [c, op2] of map.get(b)) {
        if (c === a) continue;
        const transitiveOp = op1 === '<' && op2 === '<' ? '<' : op1 === '>' && op2 === '>' ? '>' : null;
        if (transitiveOp) {
          map.get(a).set(c, transitiveOp);
          map.get(c).set(a, transitiveOp === '<' ? '>' : '<');
        }
      }
    }
  }

  return map;
}

function compare(from, to, comparaisons) {
  const c = comparaisons.get(from).get(to);
  return c === '>' ? -1 : 1;
}

const lines = getDataLines().map((l) => l.split(' '));
for (const line of lines) {
  const raw_comps = line.map((elt) => elt.match(/(\d+)(.)(\d+)/)).map(([, a, op, b]) => [Number(a), op, Number(b)]);
  const comparaisons = extend(raw_comps);

  const numbers = Array.from(comparaisons.keys()).sort((a, b) => compare(a, b, comparaisons));
  answer += +numbers.map((n) => n.toString()).join('');
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
