import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src', 'data', 'directory.json');
const destPublic = join(root, 'public', 'directory.json');
const destApi = join(root, 'public', 'api', 'resources.json');
const destByCategory = join(root, 'scripts', 'directory-by-category.json');

mkdirSync(dirname(destPublic), { recursive: true });
mkdirSync(dirname(destApi), { recursive: true });
copyFileSync(src, destPublic);
copyFileSync(src, destApi);
console.log('Copied src/data/directory.json → public/directory.json and public/api/resources.json');

const list = JSON.parse(readFileSync(src, 'utf8'));
const byCategory = { psychologists: [], lawyers: [], organizations: [], health: [] };
for (const e of list) {
  if (e.type?.includes('psychological support')) byCategory.psychologists.push(e);
  if (e.type?.includes('legal support')) byCategory.lawyers.push(e);
  if (e.type?.includes('community support') || e.type?.includes('associations and foundations')) byCategory.organizations.push(e);
  if (e.type?.some(t => ['sexual health', 'reproductive rights', 'abortion accompaniment', 'medical and health', 'nutrition support'].includes(t))) byCategory.health.push(e);
}
writeFileSync(destByCategory, JSON.stringify(byCategory, null, 2) + '\n', 'utf8');
console.log('Regenerated scripts/directory-by-category.json (psychologists:', byCategory.psychologists.length, '| lawyers:', byCategory.lawyers.length, '| organizations:', byCategory.organizations.length, '| health:', byCategory.health.length, ')');
