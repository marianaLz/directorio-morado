/**
 * Sube un JSON de directorio a Firestore (colección "directory").
 * Uso: node scripts/seed-firestore.mjs <ruta-al-json-del-directorio> [ruta-opcional-al-key.json]
 *
 * Ejemplo: node scripts/seed-firestore.mjs ./backup-directory.json ./scripts/firebase-service-account.json
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_KEY_PATH = join(ROOT, 'scripts', 'firebase-service-account.json');

const BATCH_SIZE = 500;

async function main() {
  const dirJsonArg = process.argv[2];
  const keyPathArg = process.argv[3];

  if (!dirJsonArg) {
    console.error('Uso: node scripts/seed-firestore.mjs <ruta-al-json-del-directorio> [ruta-al-key.json]');
    console.error('Ejemplo: node scripts/seed-firestore.mjs ./backup-directory.json');
    process.exit(1);
  }

  const dirJsonPath = resolve(process.cwd(), dirJsonArg);
  if (!existsSync(dirJsonPath)) {
    console.error('No se encontró el archivo del directorio:', dirJsonPath);
    process.exit(1);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !keyPathArg) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    const keyPath = keyPathArg ? resolve(process.cwd(), keyPathArg) : DEFAULT_KEY_PATH;
    if (!existsSync(keyPath)) {
      console.error('No se encontró el archivo de credenciales:', keyPath);
      console.error('Indica la ruta al key de Firebase o usa GOOGLE_APPLICATION_CREDENTIALS.');
      process.exit(1);
    }
    const key = JSON.parse(readFileSync(keyPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(key) });
  }

  const raw = readFileSync(dirJsonPath, 'utf8');
  const list = JSON.parse(raw);

  if (!Array.isArray(list) || list.length === 0) {
    console.error('El JSON debe ser un array con al menos una entrada.');
    process.exit(1);
  }

  const db = admin.firestore();
  const col = db.collection('directory');
  let written = 0;

  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = list.slice(i, i + BATCH_SIZE);
    for (const entry of chunk) {
      const id = entry.id;
      if (!id) continue;
      const ref = col.doc(id);
      batch.set(ref, { ...entry, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      written++;
    }
    await batch.commit();
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${written} documentos enviados.`);
  }

  console.log(`Listo. ${written} entradas en Firestore (colección "directory").`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
