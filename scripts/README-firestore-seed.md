# Firestore como fuente de verdad

La colección **directory** en Firestore es la fuente de verdad del directorio. La página `/directorio` lee desde Firestore en tiempo real. El **build** exporta esa data a JSON para archivos públicos y SEO.

## Flujo

1. **Editas datos** en Firestore (consola, formulario futuro o script).
2. **Build** ejecuta `export-from-firestore.mjs`, que:
   - Lee la colección `directory`
   - Escribe `public/directory.json`, `public/api/resources.json`, `src/data/directory-export.json` y `scripts/directory-by-category.json`
3. **Astro build** usa `directory-export.json` para el LD+JSON (SEO) de la página del directorio.
4. En **runtime**, la página del directorio consume Firestore directamente.

## Credenciales para el build

El build (`npm run build`) necesita credenciales de Firebase Admin para ejecutar el export. Usa **una** de estas opciones:

- **Variable con ruta al key:**  
  `GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/al-key.json`

- **Variable con JSON (útil en CI):**  
  `FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'`  
  (contenido completo del archivo de cuenta de servicio)

- **Argumento al script:**  
  `node scripts/export-from-firestore.mjs ./scripts/firebase-service-account.json`

Para generar el key: Firebase Console → proyecto **directorio-morado** → Configuración → Cuentas de servicio → **Generar nueva clave privada**. No subas ese JSON a git (está en `.gitignore`).

## Scripts

| Script | Uso |
|--------|-----|
| `npm run export-directory` | Exportar Firestore → JSON (sin hacer astro build). |
| `npm run build` | Export + `astro build` (necesita credenciales). |
| `npm run seed-firestore -- <ruta.json>` | Poblar Firestore desde un JSON: `node scripts/seed-firestore.mjs ./backup.json` (carga inicial o restauración). |

Para la **primera carga** de Firestore, usa `seed-firestore` con un JSON de respaldo:  
`node scripts/seed-firestore.mjs ./backup-directory.json [ruta-al-key.json]`. Luego la fuente de verdad es Firestore.

## Reglas de Firestore

En Firebase Console → **Firestore** → **Reglas**, permite lectura pública solo de `directory`:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /directory/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

(La escritura la haces tú con el script/Admin SDK o desde la consola.)
