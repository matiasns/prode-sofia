// =============================================================
//  CONFIGURACIÓN — Este es el ÚNICO archivo que necesitás editar
// =============================================================
//
// 1) Pegá acá la configuración de tu proyecto de Firebase.
//    (En el README está el paso a paso para conseguirla.)
//    Mientras esté el texto "TU_API_KEY", la web funciona en
//    "modo demo" (guarda en tu navegador, no se comparte).
//
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDwuo9oHuVprr96h1Hu0OmWmz1O5a49PHw",
  authDomain: "prode-sofia.firebaseapp.com",
  projectId: "prode-sofia",
  storageBucket: "prode-sofia.firebasestorage.app",
  messagingSenderId: "863029783230",
  appId: "1:863029783230:web:7da5db33493c38cfcf8cef",
};

// 2) Clave para entrar al panel de admin (admin.html) y cargar
//    los datos reales cuando nazca Sofía. ¡Cambiala!
//    (Ojo: es una protección básica. Ver nota de seguridad en el README.)
export const ADMIN_PASSWORD = "1Sofia2";

// 3) Datos de la bebé (podés personalizar los textos).
export const BEBE = {
  nombre: "Sofía",
  titulo: "El Prode de Sofía",
  subtitulo: "Adiviná cómo va a llegar nuestra bebé 👶🎀",
  fechaEstimada: "2026-06-30", // fecha probable de parto (AAAA-MM-DD)
};

// =============================================================
//  Las predicciones a adivinar (podés agregar/sacar campos)
// =============================================================
export const CAMPOS = [
  { key: "fecha",    label: "Fecha de nacimiento",        emoji: "📅", tipo: "date" },
  { key: "hora",     label: "Hora de nacimiento",         emoji: "⏰", tipo: "time" },
  { key: "peso",     label: "Peso (en gramos)",           emoji: "⚖️", tipo: "number", min: 1000, max: 6000, step: 10,  placeholder: "Ej: 3250" },
  { key: "talla",    label: "Talla (en cm)",              emoji: "📏", tipo: "number", min: 30,   max: 60,   step: 0.5, placeholder: "Ej: 49" },
  { key: "ojos",     label: "Color de ojos",              emoji: "👀", tipo: "select", opciones: ["Marrones", "Claros (celestes/verdes)", "Negros"] },
  { key: "pelo",     label: "Cantidad de pelo",           emoji: "🧒", tipo: "select", opciones: ["Mucho", "Normal", "Poquito"] },
  { key: "parecido", label: "¿A quién se va a parecer?",   emoji: "🧬", tipo: "select", opciones: ["A mamá", "A papá", "Una mezcla"] },
  { key: "mensaje",  label: "Un mensaje o deseo para Sofía", emoji: "💌", tipo: "textarea", opcional: true, sinPuntaje: true, placeholder: "¡Bienvenida al mundo!" },
];

// =============================================================
//  Cómo se reparten los puntos (podés ajustar la dificultad)
// =============================================================
//  - "fecha": max puntos, se restan X por cada día de diferencia
//  - "hora":  max puntos, se restan X por cada minuto de diferencia
//  - "numero": max puntos, se restan X por cada unidad de diferencia
//  - "exacto": puntos solo si acierta exacto
export const PUNTAJE = {
  fecha:    { tipo: "fecha",  max: 500, penalidad: 100 }, // -100 por día
  hora:     { tipo: "hora",   max: 200, penalidad: 0.5 }, // -0.5 por minuto
  peso:     { tipo: "numero", max: 500, penalidad: 0.2 }, // -1 cada 5 g
  talla:    { tipo: "numero", max: 300, penalidad: 40  }, // -40 por cm
  ojos:     { tipo: "exacto", max: 150 },
  pelo:     { tipo: "exacto", max: 150 },
  parecido: { tipo: "exacto", max: 150 },
};
