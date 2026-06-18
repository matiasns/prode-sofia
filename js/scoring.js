// Lógica de puntajes: compara cada predicción con el resultado real.
import { PUNTAJE } from "./config.js?v=5";

function aDias(str) {
  // "AAAA-MM-DD" -> número de días (en UTC)
  const [a, m, d] = String(str).split("-").map(Number);
  return Date.UTC(a, m - 1, d) / 86400000;
}

function aMinutos(str) {
  // "HH:MM" -> minutos del día
  const [h, m] = String(str).split(":").map(Number);
  return h * 60 + m;
}

// Puntaje de UNA predicción contra el resultado real.
export function puntajeIndividual(pred, real) {
  let total = 0;
  let exactos = 0;
  const detalle = {};

  for (const [key, cfg] of Object.entries(PUNTAJE)) {
    const p = pred?.[key];
    const r = real?.[key];

    // Si falta el dato real o la persona no lo completó -> 0
    if (p == null || p === "" || r == null || r === "") {
      detalle[key] = { pts: 0, exacto: false, valor: p ?? "" };
      continue;
    }

    let pts = 0;
    let exacto = false;

    switch (cfg.tipo) {
      case "exacto":
        exacto = String(p) === String(r);
        pts = exacto ? cfg.max : 0;
        break;
      case "numero": {
        const dif = Math.abs(parseFloat(p) - parseFloat(r));
        pts = Math.max(0, Math.round(cfg.max - dif * cfg.penalidad));
        exacto = dif === 0;
        break;
      }
      case "fecha": {
        const dif = Math.abs(aDias(p) - aDias(r));
        pts = Math.max(0, Math.round(cfg.max - dif * cfg.penalidad));
        exacto = dif === 0;
        break;
      }
      case "hora": {
        let dif = Math.abs(aMinutos(p) - aMinutos(r));
        dif = Math.min(dif, 1440 - dif); // distancia "circular" (cruza medianoche)
        pts = Math.max(0, Math.round(cfg.max - dif * cfg.penalidad));
        exacto = dif === 0;
        break;
      }
    }

    if (exacto) exactos++;
    total += pts;
    detalle[key] = { pts, exacto, valor: p };
  }

  return { total, exactos, detalle };
}

// Tabla de posiciones ordenada.
export function tablaDePosiciones(predicciones, real) {
  return predicciones
    .map((pred) => ({ ...pred, ...puntajeIndividual(pred, real) }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;       // más puntos
      if (b.exactos !== a.exactos) return b.exactos - a.exactos; // más aciertos exactos
      return (a._orden ?? 0) - (b._orden ?? 0);                 // quien jugó primero
    });
}

// Puntaje máximo posible (para mostrar "X de Y").
export function puntajeMaximo() {
  return Object.values(PUNTAJE).reduce((s, c) => s + c.max, 0);
}
