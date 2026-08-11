# Firestore como fuente de verdad

La colección **directory** en Firestore es la fuente de verdad del directorio. La página `/directorio` lee desde Firestore en tiempo real. El **build** exporta esa data a JSON para archivos públicos y SEO.

## Flujo

1. **Editas datos** en Firestore (consola, formulario futuro o script).
2. **Build** ejecuta `export-from-firestore.mjs`, que:
   - Lee la colección `directory`
   - Escribe `public/directory.json`, `public/api/resources.json` y `scripts/directory-by-category.json`
3. **Astro build** usa `public/directory.json` para el LD+JSON (SEO) de la página del directorio.
4. En **runtime**, la página del directorio consume Firestore directamente.

## Credenciales para el build

El build (`npm run build`) necesita credenciales de Firebase Admin para ejecutar el export. Usa **una** de estas opciones:

- **Archivo local (recomendado):**  
  `scripts/firebase-service-account.json`  
  (está en `.gitignore`)

- **Variable con ruta al key:**  
  `GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/al-key.json`

- **Variable con JSON (útil en CI):**  
  `FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'`  
  (contenido completo del archivo de cuenta de servicio)

- **Argumento al script:**  
  `node scripts/export-from-firestore.mjs ./scripts/firebase-service-account.json`

Para generar el key: Firebase Console → proyecto **directorio-morado** → Configuración → Cuentas de servicio → **Generar nueva clave privada**. No subas ese JSON a git.

## Hosting (Firebase)

El sitio se despliega con **Firebase Hosting** (`dist/` tras el build).

```bash
# 1) Instalar CLI si no la tienes
npm i -g firebase-tools
firebase login

# 2) Build (exporta Firestore → JSON + Astro) y deploy
npm run deploy
```

Solo hosting (si ya corriste `npm run build`):

```bash
npm run deploy:hosting
```

URLs típicas: `https://directorio-morado.web.app` / `https://directorio-morado.firebaseapp.com` (o tu dominio custom en Firebase Console → Hosting).

Para CI (GitHub Actions, etc.), define el secret `FIREBASE_SERVICE_ACCOUNT_JSON` y autentica el CLI con una cuenta de servicio o token (`firebase login:ci`).

## Scripts

| Script | Uso |
|--------|-----|
| `npm run export-directory` | Exportar Firestore → JSON (sin hacer astro build). |
| `npm run build` | Export + `astro build` (necesita credenciales). |
| `npm run deploy` | Build + deploy a Firebase Hosting. |
| `npm run deploy:hosting` | Solo hosting (si `dist/` ya está generado). |
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

**Colección `directory_pending`:** Las solicitudes del formulario "Sugerir un recurso" (home) se guardan aquí con `status: 'pending'`. Solo están permitidas las **creaciones** (el público no puede leer ni editar). Para publicar una solicitud, en Firebase Console (o con un script) copia el documento a la colección `directory` asignando un `id` (ej. slug del nombre) y bórralo de `directory_pending` si quieres.

---

## CI (GitHub Actions u otro)

Para que el **build** exporte desde Firestore en CI:

1. Crea un secret `FIREBASE_SERVICE_ACCOUNT_JSON` con el contenido completo del JSON de la cuenta de servicio.
2. En el job de build, expón esa variable de entorno antes de `npm run build`.
3. Para desplegar hosting, usa `firebase-tools` con un token CI (`firebase login:ci`) o Application Default Credentials.

Si no hay credenciales, el build **no fallará**: reutiliza `public/directory.json` (puede quedar vacío o desactualizado).
