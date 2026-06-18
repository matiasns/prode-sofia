# 👶🎀 El Prode de Sofía

Un juego web para que amigos y familiares **adivinen cómo va a llegar Sofía**
(peso, talla, fecha, hora, color de ojos, a quién se va a parecer, etc.).
Cuando nazca, cargás los datos reales y se arma sola la **tabla de posiciones**
con los ganadores. 🏆

- ✍️ Cada persona pone su nombre y sus predicciones
- 👨‍👩‍👧 Pueden ver quién jugó y qué pronosticó cada uno
- 🏆 Tabla de posiciones automática con puntajes y medallas
- 📱 Diseño lindo y pensado para usar desde el celular
- 🆓 Se aloja gratis en GitHub Pages + Firebase

> **¿Cómo se ve?** En cuanto lo publiques quedará en:
> `https://matiasns.github.io/prode-sofia/`

---

## 🚀 Puesta en marcha (≈ 10 minutos, una sola vez)

La web ya está subida y funciona en **modo demo** (guarda solo en tu navegador).
Para que jueguen todos desde sus celulares y compartan los datos, hay que
conectar una base de datos gratuita (Firebase). Son 2 pasos:

### Paso 1 — Crear el proyecto de Firebase

1. Entrá a **https://console.firebase.google.com** con tu cuenta de Gmail.
2. Clic en **"Crear un proyecto"** → ponele un nombre (ej. `prode-sofia`) →
   podés **desactivar** Google Analytics → **Crear proyecto**.
3. Dentro del proyecto, menú izquierdo → **Compilación → Firestore Database**
   → **Crear base de datos** → elegí **modo de producción** → ubicación
   `southamerica-east1` (o la que te sugiera) → **Habilitar**.
4. En la pestaña **Reglas** de Firestore, pegá esto y dale **Publicar**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /predicciones/{id} {
         allow read: if true;
         allow create: if true;
         allow update, delete: if false;
       }
       match /config/{id} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

5. Ahora la configuración: ícono de **engranaje ⚙️ → Configuración del proyecto**.
   Bajá hasta **"Tus apps"** y clic en el ícono **`</>` (Web)**. Ponele un
   apodo (ej. `web`) y **Registrar app**. Te va a mostrar un bloque
   `const firebaseConfig = { apiKey: "...", ... }`. **Copiá esos valores.**

### Paso 2 — Pegar la configuración

Editá el archivo **`js/config.js`** de este repo (podés hacerlo desde la web de
GitHub: clic en el archivo → ✏️ lápiz) y reemplazá el bloque `FIREBASE_CONFIG`
con tus valores. También cambiá la `ADMIN_PASSWORD` por una clave tuya.

Guardá los cambios (Commit). ¡Listo! En 1-2 minutos la web ya guarda y comparte
datos de verdad. 🎉

---

## 📤 Activar la página (GitHub Pages)

En este repositorio en GitHub: **Settings → Pages** →
en *"Build and deployment"*, en **Source** elegí **Deploy from a branch**,
rama `main` y carpeta `/ (root)` → **Save**.
En 1-2 minutos tu juego estará en `https://matiasns.github.io/prode-sofia/`.

Compartí ese link por WhatsApp y… ¡a jugar! 🥳

---

## 👑 Cómo cargar los datos cuando nazca Sofía

1. Entrá a `https://matiasns.github.io/prode-sofia/admin.html`
2. Ingresá tu **clave de admin** (la que pusiste en `config.js`).
3. Completá los datos reales (peso, talla, fecha, etc.) y
   **Guardar y publicar**.
4. Automáticamente todos verán la **tabla de posiciones** con los ganadores. 🏆

---

## 🎛️ Personalizar

Todo se ajusta en **`js/config.js`**:

- **`BEBE`**: nombre, títulos y fecha probable de parto.
- **`CAMPOS`**: qué cosas se adivinan (podés agregar o quitar).
- **`PUNTAJE`**: cuántos puntos vale cada acierto y la "tolerancia".

---

## 🔐 Nota de seguridad (importante y honesta)

Esto es un juego familiar, así que la protección es **básica**:

- Las predicciones **no se pueden editar ni borrar** una vez enviadas (regla de
  Firestore), así que nadie puede cambiar lo de otro.
- El panel de admin está protegido por una clave, pero como el sitio es público,
  alguien con conocimientos técnicos *podría* eludirla. Para una familia/amigos
  es más que suficiente.
- La config de Firebase (`apiKey`, etc.) **es pública a propósito**: no es un
  secreto, la seguridad real está en las *reglas* de Firestore.

¿Querés seguridad fuerte de verdad (login con tu usuario para el admin)? Se puede
agregar con Firebase Authentication; pedímelo y lo dejo listo.

---

Hecho con 💗 para la llegada de Sofía.
