#!/usr/bin/env node
/**
 * Regenera scripts/directory-by-category.json desde src/data/directory.json
 * para que la data sea la misma en todos los JSON.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIR_DATA = join(ROOT, 'src/data/directory.json');
const GROUPED_PATH = join(ROOT, 'scripts/directory-by-category.json');

const list = JSON.parse(readFileSync(DIR_DATA, 'utf8'));

const byCategory = { psychologists: [], lawyers: [], organizations: [], health: [] };
for (const e of list) {
  if (e.type && e.type.includes('psychological support')) byCategory.psychologists.push(e);
  if (e.type && e.type.includes('legal support')) byCategory.lawyers.push(e);
  if (e.type && (e.type.includes('community support') || e.type.includes('associations and foundations'))) byCategory.organizations.push(e);
  if (
    e.type &&
    (e.type.includes('sexual health') ||
      e.type.includes('reproductive rights') ||
      e.type.includes('abortion accompaniment') ||
      e.type.includes('medical and health') ||
      e.type.includes('nutrition support'))
  ) {
    byCategory.health.push(e);
  }
}

writeFileSync(GROUPED_PATH, JSON.stringify(byCategory, null, 2) + '\n', 'utf8');
console.log(
  'directory-by-category.json actualizado desde src/data/directory.json:',
  'psychologists', byCategory.psychologists.length,
  '| lawyers', byCategory.lawyers.length,
  '| organizations', byCategory.organizations.length,
  '| health', byCategory.health.length
);
