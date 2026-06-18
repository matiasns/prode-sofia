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
  subtitulo_en: "Guess how our baby will arrive 👶🎀",
  fechaEstimada: "2026-06-30", // fecha probable de parto (AAAA-MM-DD)
};

// =============================================================
//  Las predicciones a adivinar (podés agregar/sacar campos)
//  - label_en: traducción al inglés del rótulo
//  - opciones: { v: valor que se guarda (ES), en: cómo se muestra en inglés }
// =============================================================
export const CAMPOS = [
  { key: "fecha",    label: "Fecha de nacimiento", label_en: "Date of birth",  emoji: "📅", tipo: "date" },
  { key: "hora",     label: "Hora de nacimiento",  label_en: "Time of birth",  emoji: "⏰", tipo: "time" },
  { key: "peso",     label: "Peso (en gramos)",    label_en: "Weight (grams)", emoji: "⚖️", tipo: "number", step: "any", placeholder: "Ej: 3250", placeholder_en: "e.g. 3250" },
  { key: "talla",    label: "Talla (en cm)",       label_en: "Length (cm)",    emoji: "📏", tipo: "number", step: "any", placeholder: "Ej: 49", placeholder_en: "e.g. 49" },
  { key: "ojos",     label: "Color de ojos",       label_en: "Eye color",      emoji: "👀", tipo: "select", opciones: [
      { v: "Marrones", en: "Brown" },
      { v: "Negros", en: "Black" },
      { v: "Celestes", en: "Blue" },
      { v: "Verdes", en: "Green" },
      { v: "Miel / Avellana", en: "Hazel" },
      { v: "Grises", en: "Gray" },
  ] },
  { key: "pelo",     label: "Cantidad de pelo",    label_en: "Amount of hair", emoji: "🧒", tipo: "select", opciones: [
      { v: "Mucho", en: "A lot" },
      { v: "Normal", en: "Normal" },
      { v: "Poquito", en: "A little" },
  ] },
  { key: "parecido", label: "¿A quién se va a parecer?", label_en: "Who will the baby look like?", emoji: "🧬", tipo: "select", opciones: [
      { v: "A mamá", en: "Mom" },
      { v: "A papá", en: "Dad" },
      { v: "Una mezcla", en: "A mix" },
  ] },
  { key: "mensaje",  label: "Un mensaje o deseo para Sofía", label_en: "A message or wish for Sofía", emoji: "💌", tipo: "textarea", opcional: true, sinPuntaje: true, placeholder: "¡Bienvenida al mundo!", placeholder_en: "Welcome to the world!" },
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

// =============================================================
//  Textos de la interfaz en español e inglés (para el botón ES/EN)
//  Usá {n} para el nombre de la bebé y {a}/{b} para el captcha.
// =============================================================
export const TEXTOS = {
  es: {
    tab_jugar: "✍️ Jugar",
    tab_participantes: "👨‍👩‍👧 Participantes",
    tab_posiciones: "🏆 Posiciones",
    jugar_titulo: "Hacé tu predicción ✨",
    jugar_intro: "Completá tus pronósticos sobre la llegada de Sofía. ¡El que más se acerque gana!",
    nombre_label: "🙋 Tu nombre",
    nombre_ph: "Ej: Tía Caro",
    captcha_label: "🤖 Verificación:",
    captcha_ph: "Escribí el resultado",
    captcha_pregunta: "¿Cuánto es {a} + {b}?",
    captcha_error: "La verificación no coincide 🤔\n¡Resolvé la sumita y probá de nuevo!",
    btn_enviar: "¡Enviar mi predicción! 🎉",
    btn_guardando: "Guardando…",
    error_guardar: "Ups, no se pudo guardar 😞\n\n",
    btn_compartir: "🔗 Compartir el juego",
    compartir_copiado: "¡Link copiado! ✅",
    participantes_titulo: "Participantes",
    jugando: "jugando 🎈",
    participantes_vacio: "Todavía nadie jugó. ¡Sé el primero! 🥳",
    vos: "vos",
    tabla_titulo: "Tabla de posiciones 🏆",
    countdown_nacio: "🎉 <strong>¡{n} ya nació!</strong> Mirá la tabla de posiciones 👇",
    countdown_falta: "⏳ <strong>¡Falta poco para conocer a {n}!</strong> 💕",
    tabla_vacia_titulo: "{n} todavía no llegó",
    tabla_vacia_texto: "En cuanto nazca y se carguen los datos reales, acá va a aparecer la tabla de posiciones con los ganadores.<br>Mientras tanto… ¡sumá tu predicción! 👶",
    banner_titulo: "🎀 ¡Así llegó {n}!",
    tabla_sin_pred: "No hubo predicciones cargadas 🙈",
    badge_exacto_one: "exacto",
    badge_exacto_many: "exactos",
    toast_enviado: "¡Tu predicción quedó guardada! 🎉",
    footer_hecho: "Hecho con 💗 para Sofía · ",
    aviso_demo: "🧪 <b>Modo demo:</b> las predicciones se guardan solo en este dispositivo. Para que jueguen todos y se compartan los datos, falta conectar Firebase (ver README).",
    select_default: "Elegí una opción…",
    opcional: "(opcional)",
  },
  en: {
    tab_jugar: "✍️ Play",
    tab_participantes: "👨‍👩‍👧 Players",
    tab_posiciones: "🏆 Leaderboard",
    jugar_titulo: "Make your prediction ✨",
    jugar_intro: "Fill in your guesses about Sofía's arrival. The closest one wins!",
    nombre_label: "🙋 Your name",
    nombre_ph: "e.g. Aunt Caro",
    captcha_label: "🤖 Verification:",
    captcha_ph: "Type the answer",
    captcha_pregunta: "What is {a} + {b}?",
    captcha_error: "Verification doesn't match 🤔\nSolve the sum and try again!",
    btn_enviar: "Send my prediction! 🎉",
    btn_guardando: "Saving…",
    error_guardar: "Oops, couldn't save 😞\n\n",
    btn_compartir: "🔗 Share the game",
    compartir_copiado: "Link copied! ✅",
    participantes_titulo: "Players",
    jugando: "playing 🎈",
    participantes_vacio: "Nobody has played yet. Be the first! 🥳",
    vos: "you",
    tabla_titulo: "Leaderboard 🏆",
    countdown_nacio: "🎉 <strong>{n} is here!</strong> Check the leaderboard 👇",
    countdown_falta: "⏳ <strong>Not long until we meet {n}!</strong> 💕",
    tabla_vacia_titulo: "{n} hasn't arrived yet",
    tabla_vacia_texto: "As soon as she's born and the real data is loaded, the leaderboard with the winners will appear here.<br>Meanwhile… add your prediction! 👶",
    banner_titulo: "🎀 This is how {n} arrived!",
    tabla_sin_pred: "No predictions were submitted 🙈",
    badge_exacto_one: "exact",
    badge_exacto_many: "exact",
    toast_enviado: "Your prediction was saved! 🎉",
    footer_hecho: "Made with 💗 for Sofía · ",
    aviso_demo: "🧪 <b>Demo mode:</b> predictions are saved only on this device. To let everyone play and share data, Firebase must be connected (see README).",
    select_default: "Choose an option…",
    opcional: "(optional)",
  },
};
