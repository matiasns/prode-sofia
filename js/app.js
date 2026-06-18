// Lógica de la página principal (jugar, participantes, tabla).
import { BEBE, CAMPOS } from "./config.js?v=4";
import { MODO, agregarPrediccion, escucharPredicciones, escucharResultado } from "./db.js?v=4";
import { tablaDePosiciones, puntajeMaximo } from "./scoring.js?v=4";
import confetti from "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/+esm";

// --- estado ---
let predicciones = [];
let resultado = null;
const yo = {
  nombre: localStorage.getItem("prode_mi_nombre") || "",
};

// --- helpers ---
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const campo = (k) => CAMPOS.find((c) => c.key === k);

function fmtValor(key, v) {
  if (v == null || v === "") return "—";
  if (key === "peso") return `${v} g`;
  if (key === "talla") return `${v} cm`;
  if (key === "fecha") {
    const [a, m, d] = String(v).split("-");
    return `${d}/${m}/${a}`;
  }
  return v;
}

// ===============================================================
//  Encabezado + textos
// ===============================================================
function pintarTextos() {
  document.title = BEBE.titulo;
  $("#titulo").textContent = BEBE.titulo;
  $("#subtitulo").textContent = BEBE.subtitulo;
  pintarCuentaRegresiva();
}

function pintarCuentaRegresiva() {
  const el = $("#countdown");
  if (resultado?.publicado) {
    el.innerHTML = `🎉 <strong>¡${esc(BEBE.nombre)} ya nació!</strong> Mirá la tabla de posiciones 👇`;
  } else {
    el.innerHTML = `⏳ <strong>¡Falta poco para conocer a ${esc(BEBE.nombre)}!</strong> 💕`;
  }
}

// ===============================================================
//  Formulario para jugar
// ===============================================================
function pintarFormulario() {
  const cont = $("#campos");
  cont.innerHTML = CAMPOS.map((c) => {
    let input = "";
    const req = c.opcional ? "" : "required";
    if (c.tipo === "select") {
      input = `<select name="${c.key}" ${req}>
        <option value="" disabled selected>Elegí una opción…</option>
        ${c.opciones.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
      </select>`;
    } else if (c.tipo === "textarea") {
      input = `<textarea name="${c.key}" rows="2" placeholder="${esc(c.placeholder || "")}" ${req}></textarea>`;
    } else {
      const extra = [
        c.min != null ? `min="${c.min}"` : "",
        c.max != null ? `max="${c.max}"` : "",
        c.step != null ? `step="${c.step}"` : "",
        c.placeholder ? `placeholder="${esc(c.placeholder)}"` : "",
      ].join(" ");
      input = `<input type="${c.tipo}" name="${c.key}" ${extra} ${req}>`;
    }
    return `<label class="campo">
      <span class="campo-label">${c.emoji} ${esc(c.label)}${c.opcional ? ' <em>(opcional)</em>' : ""}</span>
      ${input}
    </label>`;
  }).join("");

  $("#nombre").value = yo.nombre;
}

// Verificación anti-robot simple: una sumita al azar
let captchaResultado = 0;
function nuevoCaptcha() {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  captchaResultado = a + b;
  $("#captcha-pregunta").textContent = `¿Cuánto es ${a} + ${b}?`;
  const inp = $("#captcha-respuesta");
  if (inp) inp.value = "";
}

async function enviarPrediccion(e) {
  e.preventDefault();
  const form = e.target;
  const btn = $("#btn-enviar");
  const datos = { nombre: $("#nombre").value.trim() };
  if (!datos.nombre) return;

  // Chequeo anti-robot
  if (parseInt($("#captcha-respuesta").value, 10) !== captchaResultado) {
    alert("La verificación no coincide 🤔\n¡Resolvé la sumita y probá de nuevo!");
    nuevoCaptcha();
    return;
  }
  for (const c of CAMPOS) {
    datos[c.key] = form.elements[c.key]?.value ?? "";
  }

  btn.disabled = true;
  btn.textContent = "Guardando…";
  try {
    await agregarPrediccion(datos);
    yo.nombre = datos.nombre;
    localStorage.setItem("prode_mi_nombre", datos.nombre);
    festejar();
    form.reset();
    $("#nombre").value = yo.nombre;
    nuevoCaptcha();
    mostrarVista("participantes");
    $("#enviado").classList.add("visible");
    setTimeout(() => $("#enviado").classList.remove("visible"), 4000);
  } catch (err) {
    alert("Ups, no se pudo guardar 😞\n\n" + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "¡Enviar mi predicción! 🎉";
  }
}

function festejar() {
  const fin = Date.now() + 800;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors: ["#ff8fab", "#cdb4db", "#b8e0d2", "#ffd166"] });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors: ["#ff8fab", "#cdb4db", "#b8e0d2", "#ffd166"] });
    if (Date.now() < fin) requestAnimationFrame(frame);
  })();
}

// ===============================================================
//  Participantes
// ===============================================================
function pintarParticipantes() {
  const cont = $("#lista-participantes");
  $("#contador-part").textContent = predicciones.length;
  if (!predicciones.length) {
    cont.innerHTML = `<p class="vacio">Todavía nadie jugó. ¡Sé el primero! 🥳</p>`;
    return;
  }
  cont.innerHTML = predicciones
    .map((p) => {
      const mio = yo.nombre && p.nombre?.toLowerCase() === yo.nombre.toLowerCase();
      const chips = CAMPOS.filter((c) => !c.sinPuntaje)
        .map((c) => `<span class="chip"><b>${c.emoji}</b> ${esc(fmtValor(c.key, p[c.key]))}</span>`)
        .join("");
      const msg = p.mensaje
        ? `<p class="mensaje">💌 “${esc(p.mensaje)}”</p>`
        : "";
      return `<article class="card-part ${mio ? "mio" : ""}">
        <h3>${esc(p.nombre)} ${mio ? '<span class="vos">vos</span>' : ""}</h3>
        <div class="chips">${chips}</div>
        ${msg}
      </article>`;
    })
    .join("");
}

// ===============================================================
//  Tabla de posiciones
// ===============================================================
function pintarTabla() {
  const cont = $("#tabla");
  const banner = $("#resultado-real");

  if (!resultado?.publicado) {
    banner.style.display = "none";
    cont.innerHTML = `<div class="vacio grande">
      <div class="emoji-grande">🤍</div>
      <h3>${esc(BEBE.nombre)} todavía no llegó</h3>
      <p>En cuanto nazca y se carguen los datos reales, acá va a aparecer la tabla de posiciones con los ganadores.<br>Mientras tanto… ¡sumá tu predicción! 👶</p>
    </div>`;
    return;
  }

  // Banner con los datos reales
  banner.style.display = "block";
  banner.innerHTML = `<h3>🎀 ¡Así llegó ${esc(BEBE.nombre)}!</h3>
    <div class="chips">${CAMPOS.filter((c) => !c.sinPuntaje)
      .map((c) => `<span class="chip real"><b>${c.emoji}</b> ${esc(fmtValor(c.key, resultado[c.key]))}</span>`)
      .join("")}</div>`;

  const tabla = tablaDePosiciones(predicciones, resultado);
  const max = puntajeMaximo();
  if (!tabla.length) {
    cont.innerHTML = `<p class="vacio">No hubo predicciones cargadas 🙈</p>`;
    return;
  }

  const medallas = ["🥇", "🥈", "🥉"];
  cont.innerHTML = tabla
    .map((p, i) => {
      const mio = yo.nombre && p.nombre?.toLowerCase() === yo.nombre.toLowerCase();
      const pos = medallas[i] || `<span class="pos-num">${i + 1}</span>`;
      const detalle = CAMPOS.filter((c) => !c.sinPuntaje)
        .map((c) => {
          const d = p.detalle[c.key] || { pts: 0, exacto: false };
          const icon = d.exacto ? "✅" : d.pts > 0 ? "🟡" : "⚪";
          return `<div class="det-row">
            <span>${c.emoji} ${esc(c.label)}</span>
            <span class="det-val">${esc(fmtValor(c.key, p[c.key]))} ${icon}</span>
            <span class="det-pts">+${d.pts}</span>
          </div>`;
        })
        .join("");
      return `<details class="fila ${mio ? "mio" : ""} ${i < 3 ? "podio" : ""}">
        <summary>
          <span class="pos">${pos}</span>
          <span class="nombre">${esc(p.nombre)} ${mio ? '<span class="vos">vos</span>' : ""}
            ${p.exactos ? `<span class="badge">${p.exactos} exacto${p.exactos > 1 ? "s" : ""} 🎯</span>` : ""}
          </span>
          <span class="puntos">${p.total}<small>/${max}</small></span>
        </summary>
        <div class="detalle">${detalle}</div>
      </details>`;
    })
    .join("");
}

// ===============================================================
//  Navegación entre vistas
// ===============================================================
function mostrarVista(nombre) {
  document.querySelectorAll(".vista").forEach((v) => v.classList.remove("activa"));
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("activa"));
  $(`#vista-${nombre}`)?.classList.add("activa");
  document.querySelector(`.tab[data-vista="${nombre}"]`)?.classList.add("activa");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function compartir() {
  const url = location.href.split("#")[0].replace("admin.html", "");
  if (navigator.share) {
    navigator.share({ title: BEBE.titulo, text: BEBE.subtitulo, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    const b = $("#btn-compartir");
    const t = b.textContent;
    b.textContent = "¡Link copiado! ✅";
    setTimeout(() => (b.textContent = t), 2000);
  }
}

// ===============================================================
//  Inicio
// ===============================================================
function init() {
  pintarTextos();
  pintarFormulario();
  nuevoCaptcha();
  pintarParticipantes();
  pintarTabla();

  if (MODO === "demo") $("#aviso-demo").style.display = "block";

  $("#form-prediccion").addEventListener("submit", enviarPrediccion);
  $("#btn-compartir").addEventListener("click", compartir);
  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => mostrarVista(t.dataset.vista))
  );

  escucharPredicciones((lista) => {
    predicciones = lista;
    pintarParticipantes();
    pintarTabla();
  });
  escucharResultado((res) => {
    resultado = res;
    pintarCuentaRegresiva();
    pintarTabla();
  });
}

init();
