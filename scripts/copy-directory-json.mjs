import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src', 'data', 'directory.json');
const destPublic = join(root, 'public', 'directory.json');
const destApi = join(root, 'public', 'api', 'resources.json');

mkdirSync(dirname(destPublic), { recursive: true });
mkdirSync(dirname(destApi), { recursive: true });
copyFileSync(src, destPublic);
copyFileSync(src, destApi);
console.log('Copied src/data/directory.json → public/directory.json and public/api/resources.json');
