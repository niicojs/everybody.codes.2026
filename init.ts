import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { consola } from 'consola';
import mri from 'mri';

import { getData } from './e-c.ts';

let args = mri(process.argv.slice(2));
let year = args.year || new Date().getFullYear().toString();
let day = new Date().getDate().toString().padStart(2, '0');
if (args.day) day = (+args.day).toString().padStart(2, '0');

if (args.part === undefined || +args.part === 1) {
  consola.start('init part 1 pour le jour', day);
  if (!existsSync(`./${day}`)) {
    mkdirSync(`./${day}`);
    copyFileSync(`./_template/solve-part1.js`, `./${day}/solve-part1.js`);
    copyFileSync(`./_template/input.txt`, `./${day}/input.txt`);
  }
  const input = await getData({ year, day, part: 1 });
  writeFileSync(`./${day}/real.txt`, input, 'utf8');
} else if (+args.part === 2) {
  consola.start('init part 2 pour le jour', day);
  if (!existsSync(`./${day}/solve-part2.js`)) {
    let content = readFileSync(`./${day}/solve-part1.js`, 'utf8');
    writeFileSync(`./${day}/solve-part2.js`, content, 'utf8');
  }
  const input = await getData({ year, day, part: 2 });
  writeFileSync(`./${day}/real.txt`, input, 'utf8');
} else if (+args.part === 3) {
  consola.start('init part 3 pour le jour', day);
  if (!existsSync(`./${day}/solve-part3.js`)) {
    let content = readFileSync(`./${day}/solve-part2.js`, 'utf8');
    writeFileSync(`./${day}/solve-part3.js`, content, 'utf8');
  }
  const input = await getData({ year, day, part: 3 });
  writeFileSync(`./${day}/real.txt`, input, 'utf8');
}

consola.success('done.');
