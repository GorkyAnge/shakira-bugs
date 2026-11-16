#!/usr/bin/env node
// Ejecuta cada reto (tests/challenges/<id>.test.js) por separado y reporta cuáles pasan.
// Uso: node scripts/run-challenges.mjs [archivo-salida.json]
import { readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'tests', 'challenges');
const files = readdirSync(dir).filter((f) => f.endsWith('.test.js')).sort();

const passed = [];
const failed = [];
for (const file of files) {
  const id = file.replace(/\.test\.js$/, '');
  const run = spawnSync(process.execPath, ['--test', join(dir, file)], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30_000,
    env: { PATH: process.env.PATH, TZ: 'UTC' }
  });
  (run.status === 0 ? passed : failed).push(id);
  console.error(`${run.status === 0 ? '✅' : '❌'} ${id}`);
}

const result = { passed, failed, total: files.length };
console.error(`\n${passed.length}/${files.length} retos resueltos`);
const out = process.argv[2];
if (out) writeFileSync(out, JSON.stringify(result, null, 2));
else console.log(JSON.stringify(result, null, 2));
