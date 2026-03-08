/**
 * Exporta la colección "directory" de Firestore a JSON (fuente de verdad = Firebase).
 * Genera: public/directory.json, public/api/resources.json, src/data/directory-export.json,
 * scripts/directory-by-category.json.
 *
 * Credenciales (una opción):
 * - GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/key.json
 * - FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'  (CI)
 * - node scripts/export-from-firestore.mjs [ruta-al-key.json]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_KEY_PATH = join(ROOT, 'scripts', 'firebase-service-account.json');

const DEST_PUBLIC = join(ROOT, 'public', 'directory.json');
const DEST_API = join(ROOT, 'public', 'api', 'resources.json');
const DEST_EXPORT = join(ROOT, 'src', 'data', 'directory-export.json');
const DEST_BY_CATEGORY = join(ROOT, 'scripts', 'directory-by-category.json');

function initFirebase() {
  const keyPathArg = process.argv[2];
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (jsonEnv) {
    const key = JSON.parse(jsonEnv);
    admin.initializeApp({ credential: admin.credential.cert(key) });
    return;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !keyPathArg) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return;
  }
  const keyPath = keyPathArg ? resolve(process.cwd(), keyPathArg) : DEFAULT_KEY_PATH;
  if (!existsSync(keyPath)) {
    console.error('No se encontró el archivo de credenciales:', keyPath);
    console.error('Usa GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON o pasa la ruta al key.json');
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(key) });
}

function toPlainEntry(doc) {
  const data = doc.data();
  const { updatedAt, ...rest } = data;
  return { id: doc.id, ...rest };
}

function buildByCategory(list) {
  const byCategory = { psychologists: [], lawyers: [], organizations: [], health: [] };
  for (const e of list) {
    if (e.type?.includes('psychological support')) byCategory.psychologists.push(e);
    if (e.type?.includes('legal support')) byCategory.lawyers.push(e);
    if (e.type?.includes('community support') || e.type?.includes('associations and foundations'))
      byCategory.organizations.push(e);
    if (
      e.type?.some((t) =>
        ['sexual health', 'reproductive rights', 'abortion accompaniment', 'medical and health', 'nutrition support'].includes(t)
      )
    )
      byCategory.health.push(e);
  }
  return byCategory;
}

async function main() {
  initFirebase();
  const db = admin.firestore();
  const snap = await db.collection('directory').get();
  const list = snap.docs.map((d) => toPlainEntry(d));

  if (list.length === 0) {
    console.warn('Aviso: la colección "directory" está vacía.');
  }

  const json = JSON.stringify(list, null, 2) + '\n';
  mkdirSync(dirname(DEST_PUBLIC), { recursive: true });
  mkdirSync(dirname(DEST_API), { recursive: true });
  mkdirSync(dirname(DEST_EXPORT), { recursive: true });

  writeFileSync(DEST_PUBLIC, json, 'utf8');
  writeFileSync(DEST_API, json, 'utf8');
  writeFileSync(DEST_EXPORT, json, 'utf8');

  const byCategory = buildByCategory(list);
  writeFileSync(DEST_BY_CATEGORY, JSON.stringify(byCategory, null, 2) + '\n', 'utf8');

  console.log('Exportado desde Firestore:');
  console.log('  public/directory.json');
  console.log('  public/api/resources.json');
  console.log('  src/data/directory-export.json');
  console.log('  scripts/directory-by-category.json');
  console.log(`  Total: ${list.length} entradas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
