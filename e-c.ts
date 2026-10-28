import { createDecipheriv } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { consola } from 'consola';
import { ofetch } from 'ofetch';

function getClient() {
  if (!process.env.COOKIE) throw new Error('No cookie in config!');

  return ofetch.create({
    baseURL: 'https://everybody.codes/api/',
    headers: {
      cookie: 'everybody-codes=' + process.env.COOKIE,
    },
  });
}

function decrypt(key: string, text: string) {
  const algorithm = 'aes-256-cbc';
  const keybytes = Buffer.from(key, 'utf8');
  const iv = Buffer.from(key.substring(0, 16), 'utf8');
  const decipher = createDecipheriv(algorithm, keybytes, iv);
  const encryptedText = Buffer.from(text, 'hex');
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function getData({ year, day, part }: { year?: string; day: string; part: number }) {
  try {
    const client = getClient();
    const info = await client('user/me');
    const seed = info.seed;

    const keys = await client(`event/${year}/quest/${+day}`);
    const key = keys['key' + part];

    const res = await ofetch(`https://everybody.codes/assets/${year}/${+day}/input/${seed}.json`);
    const data = decrypt(key, res[part]);

    return data;
  } catch (e) {
    consola.error(e);
    throw new Error('Failed to fetch data', { cause: e });
  }
}

export async function submitAnswer({
  year,
  day,
  level,
  answer,
}: {
  year?: string;
  day: string;
  level: string;
  answer: string;
}) {
  if (!process.env.COOKIE) throw new Error('No cookie in config!');
  if (!year) year = new Date().getFullYear().toString();

  let incorrect: Record<string, any> = {};
  if (existsSync('incorrect.json')) {
    incorrect = JSON.parse(readFileSync('incorrect.json', 'utf-8'));
  }
  const wrong = incorrect[`${day}-${level}`] || {};
  if (wrong[answer]) {
    consola.error('Réponse incorrect et déjà envoyée', wrong[answer]);
    return false;
  }

  try {
    const client = getClient();
    const res = await client(`event/${year}/quest/${+day}/part/${level}/answer`, {
      body: { answer },
      method: 'POST',
    });
    if (res.correct) {
      consola.success('Bonne réponse !');
      return true;
    } else {
      wrong[answer] = { length: res.lengthCorrect, first: res.firstCorrect };

      consola.error(res);

      consola.error('Mauvaise réponse !', wrong[answer]);

      incorrect[`${day}-${level}`] = wrong;
      writeFileSync('incorrect.json', JSON.stringify(incorrect, null, 2), 'utf-8');
      return false;
    }
  } catch (e: any) {
    if (e.statusCode === 423) {
      consola.error('Mauvaise réponse envoyée trop récemment.');
    } else if (e.statusCode === 409) {
      consola.error(`Quest déjà rélisée ${day}-${level}`);
    } else {
      consola.error(e);
    }
  }
}
