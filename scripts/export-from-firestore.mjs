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

/** @returns {boolean} true si se inicializó Firebase, false si no hay credenciales (fallback). */
function initFirebase() {
  const keyPathArg = process.argv[2];
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (jsonEnv) {
    try {
      const key = JSON.parse(jsonEnv);
      admin.initializeApp({ credential: admin.credential.cert(key) });
      return true;
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido.');
      return false;
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !keyPathArg) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return true;
  }
  const keyPath = keyPathArg ? resolve(process.cwd(), keyPathArg) : DEFAULT_KEY_PATH;
  if (!existsSync(keyPath)) {
    return false;
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(key) });
  return true;
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

function writeExportFiles(list) {
  const json = JSON.stringify(list, null, 2) + '\n';
  mkdirSync(dirname(DEST_PUBLIC), { recursive: true });
  mkdirSync(dirname(DEST_API), { recursive: true });
  mkdirSync(dirname(DEST_EXPORT), { recursive: true });
  writeFileSync(DEST_PUBLIC, json, 'utf8');
  writeFileSync(DEST_API, json, 'utf8');
  writeFileSync(DEST_EXPORT, json, 'utf8');
  const byCategory = buildByCategory(list);
  writeFileSync(DEST_BY_CATEGORY, JSON.stringify(byCategory, null, 2) + '\n', 'utf8');
}

async function main() {
  const hasCreds = initFirebase();

  if (!hasCreds) {
    console.warn('');
    console.warn('⚠️  Sin credenciales de Firebase. Usando directory-export.json existente.');
    console.warn('   Para exportar desde Firestore en Netlify/CI, configura la variable de entorno:');
    console.warn('   FIREBASE_SERVICE_ACCOUNT_JSON = contenido completo del JSON de la cuenta de servicio.');
    console.warn('');
    let list = [];
    if (existsSync(DEST_EXPORT)) {
      try {
        list = JSON.parse(readFileSync(DEST_EXPORT, 'utf8'));
        if (!Array.isArray(list)) list = [];
      } catch (_) {}
    }
    writeExportFiles(list);
    console.log(`Export (fallback): ${list.length} entradas desde directory-export.json.`);
    return;
  }

  const db = admin.firestore();
  const snap = await db.collection('directory').get();
  const list = snap.docs.map((d) => toPlainEntry(d));

  if (list.length === 0) {
    console.warn('Aviso: la colección "directory" está vacía.');
  }

  writeExportFiles(list);

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
