// Capa de datos. Usa Firebase si está configurado; si no, "modo demo"
// que guarda en el navegador (localStorage) para poder probar la web.
import { FIREBASE_CONFIG } from "./config.js?v=4";

const SIN_CONFIGURAR =
  !FIREBASE_CONFIG?.apiKey || String(FIREBASE_CONFIG.apiKey).includes("TU_API_KEY");

export const MODO = SIN_CONFIGURAR ? "demo" : "firebase";

// ---------------------------------------------------------------
//  Firebase (carga perezosa: solo si hace falta)
// ---------------------------------------------------------------
let _fs = null;
let _db = null;
async function fb() {
  if (_fs) return _fs;
  const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  const app = appMod.initializeApp(FIREBASE_CONFIG);
  _db = fsMod.getFirestore(app);
  _fs = fsMod;
  return fsMod;
}

// ---------------------------------------------------------------
//  Modo demo (localStorage)
// ---------------------------------------------------------------
const K_PRED = "prode_predicciones";
const K_RES = "prode_resultado";
const leerLocal = (k) => JSON.parse(localStorage.getItem(k) || "null");
const escribirLocal = (k, v) => {
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("prode-cambio"));
};

// ---------------------------------------------------------------
//  API pública
// ---------------------------------------------------------------
export async function agregarPrediccion(datos) {
  if (MODO === "firebase") {
    const m = await fb();
    await m.addDoc(m.collection(_db, "predicciones"), {
      ...datos,
      createdAt: m.serverTimestamp(),
    });
    return;
  }
  // demo
  const lista = leerLocal(K_PRED) || [];
  lista.push({ ...datos, id: "demo-" + Date.now(), createdAt: Date.now() });
  escribirLocal(K_PRED, lista);
}

export async function escucharPredicciones(cb) {
  if (MODO === "firebase") {
    const m = await fb();
    const q = m.query(m.collection(_db, "predicciones"), m.orderBy("createdAt", "asc"));
    m.onSnapshot(q, (snap) => {
      cb(snap.docs.map((d, i) => ({ id: d.id, _orden: i, ...d.data() })));
    });
    return;
  }
  // demo
  const emitir = () => {
    const lista = (leerLocal(K_PRED) || []).map((p, i) => ({ _orden: i, ...p }));
    cb(lista);
  };
  emitir();
  window.addEventListener("prode-cambio", emitir);
  window.addEventListener("storage", emitir);
}

export async function escucharResultado(cb) {
  if (MODO === "firebase") {
    const m = await fb();
    m.onSnapshot(m.doc(_db, "config", "resultado"), (d) => {
      cb(d.exists() ? d.data() : null);
    });
    return;
  }
  // demo
  const emitir = () => cb(leerLocal(K_RES));
  emitir();
  window.addEventListener("prode-cambio", emitir);
  window.addEventListener("storage", emitir);
}

export async function guardarResultado(datos) {
  if (MODO === "firebase") {
    const m = await fb();
    await m.setDoc(m.doc(_db, "config", "resultado"), {
      ...datos,
      actualizado: m.serverTimestamp(),
    });
    return;
  }
  // demo
  escribirLocal(K_RES, { ...datos, actualizado: Date.now() });
}
