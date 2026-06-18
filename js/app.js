// Lógica de la página principal (jugar, participantes, tabla).
import { BEBE, CAMPOS, TEXTOS } from "./config.js?v=5";
import { MODO, agregarPrediccion, escucharPredicciones, escucharResultado } from "./db.js?v=5";
import { tablaDePosiciones, puntajeMaximo } from "./scoring.js?v=5";
import confetti from "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/+esm";

// --- estado ---
let predicciones = [];
let resultado = null;
let LANG = localStorage.getItem("prode_lang") ||
  (navigator.language?.toLowerCase().startsWith("en") ? "en" : "es");
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

// --- idioma ---
function t(key) {
  const tabla = TEXTOS[LANG] || TEXTOS.es;
  return tabla[key] ?? TEXTOS.es[key] ?? key;
}
const labelCampo = (c) => (LANG === "en" && c.label_en) ? c.label_en : c.label;
const phCampo = (c) => (LANG === "en" && c.placeholder_en) ? c.placeholder_en : (c.placeholder || "");
function etiquetaOpcion(c, value) {
  const o = c?.opciones?.find((op) => op.v === value);
  if (!o) return value;
  return (LANG === "en" && o.en) ? o.en : o.v;
}

function fmtValor(key, v) {
  if (v == null || v === "") return "—";
  if (key === "peso") return `${v} g`;
  if (key === "talla") return `${v} cm`;
  if (key === "fecha") {
    const [a, m, d] = String(v).split("-");
    return `${d}/${m}/${a}`;
  }
  const c = campo(key);
  if (c?.tipo === "select") return etiquetaOpcion(c, v);
  return v;
}

// ===============================================================
//  Encabezado + textos
// ===============================================================
function pintarTextos() {
  document.title = BEBE.titulo;
  $("#titulo").textContent = BEBE.titulo;
  $("#subtitulo").textContent =
    (LANG === "en" && BEBE.subtitulo_en) ? BEBE.subtitulo_en : BEBE.subtitulo;
  pintarCuentaRegresiva();
}

function pintarCuentaRegresiva() {
  const el = $("#countdown");
  const n = esc(BEBE.nombre);
  if (resultado?.publicado) {
    el.innerHTML = t("countdown_nacio").replace("{n}", n);
  } else {
    el.innerHTML = t("countdown_falta").replace("{n}", n);
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
        <option value="" disabled selected>${esc(t("select_default"))}</option>
        ${c.opciones.map((o) => `<option value="${esc(o.v)}">${esc((LANG === "en" && o.en) ? o.en : o.v)}</option>`).join("")}
      </select>`;
    } else if (c.tipo === "textarea") {
      input = `<textarea name="${c.key}" rows="2" placeholder="${esc(phCampo(c))}" ${req}></textarea>`;
    } else {
      const extra = [
        c.min != null ? `min="${c.min}"` : "",
        c.max != null ? `max="${c.max}"` : "",
        c.step != null ? `step="${c.step}"` : "",
        phCampo(c) ? `placeholder="${esc(phCampo(c))}"` : "",
      ].join(" ");
      input = `<input type="${c.tipo}" name="${c.key}" ${extra} ${req}>`;
    }
    return `<label class="campo">
      <span class="campo-label">${c.emoji} ${esc(labelCampo(c))}${c.opcional ? ` <em>${esc(t("opcional"))}</em>` : ""}</span>
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
  $("#captcha-pregunta").textContent = t("captcha_pregunta").replace("{a}", a).replace("{b}", b);
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
    alert(t("captcha_error"));
    nuevoCaptcha();
    return;
  }

  for (const c of CAMPOS) {
    datos[c.key] = form.elements[c.key]?.value ?? "";
  }

  btn.disabled = true;
  btn.textContent = t("btn_guardando");
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
    alert(t("error_guardar") + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = t("btn_enviar");
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
    cont.innerHTML = `<p class="vacio">${esc(t("participantes_vacio"))}</p>`;
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
        <h3>${esc(p.nombre)} ${mio ? `<span class="vos">${esc(t("vos"))}</span>` : ""}</h3>
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
  const n = esc(BEBE.nombre);

  if (!resultado?.publicado) {
    banner.style.display = "none";
    cont.innerHTML = `<div class="vacio grande">
      <div class="emoji-grande">🤍</div>
      <h3>${t("tabla_vacia_titulo").replace("{n}", n)}</h3>
      <p>${t("tabla_vacia_texto")}</p>
    </div>`;
    return;
  }

  // Banner con los datos reales
  banner.style.display = "block";
  banner.innerHTML = `<h3>${t("banner_titulo").replace("{n}", n)}</h3>
    <div class="chips">${CAMPOS.filter((c) => !c.sinPuntaje)
      .map((c) => `<span class="chip real"><b>${c.emoji}</b> ${esc(fmtValor(c.key, resultado[c.key]))}</span>`)
      .join("")}</div>`;

  const tabla = tablaDePosiciones(predicciones, resultado);
  const max = puntajeMaximo();
  if (!tabla.length) {
    cont.innerHTML = `<p class="vacio">${esc(t("tabla_sin_pred"))}</p>`;
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
            <span>${c.emoji} ${esc(labelCampo(c))}</span>
            <span class="det-val">${esc(fmtValor(c.key, p[c.key]))} ${icon}</span>
            <span class="det-pts">+${d.pts}</span>
          </div>`;
        })
        .join("");
      const ex = esc(p.exactos === 1 ? t("badge_exacto_one") : t("badge_exacto_many"));
      return `<details class="fila ${mio ? "mio" : ""} ${i < 3 ? "podio" : ""}">
        <summary>
          <span class="pos">${pos}</span>
          <span class="nombre">${esc(p.nombre)} ${mio ? `<span class="vos">${esc(t("vos"))}</span>` : ""}
            ${p.exactos ? `<span class="badge">${p.exactos} ${ex} 🎯</span>` : ""}
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
  document.querySelectorAll(".tab").forEach((tb) => tb.classList.remove("activa"));
  $(`#vista-${nombre}`)?.classList.add("activa");
  document.querySelector(`.tab[data-vista="${nombre}"]`)?.classList.add("activa");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function compartir() {
  const url = location.href.split("#")[0].replace("admin.html", "");
  if (navigator.share) {
    navigator.share({ title: BEBE.titulo, text: $("#subtitulo").textContent, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    const b = $("#btn-compartir");
    const prev = b.textContent;
    b.textContent = t("compartir_copiado");
    setTimeout(() => (b.textContent = prev), 2000);
  }
}

// ===============================================================
//  Idioma (botón ES / EN)
// ===============================================================
function aplicarIdioma() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  const btn = $("#btn-idioma");
  if (btn) btn.textContent = LANG === "es" ? "🌐 EN" : "🌐 ES";
  pintarTextos();
  pintarFormulario();
  nuevoCaptcha();
  pintarParticipantes();
  pintarTabla();
}

function cambiarIdioma() {
  LANG = LANG === "es" ? "en" : "es";
  localStorage.setItem("prode_lang", LANG);
  aplicarIdioma();
}

// ===============================================================
//  Inicio
// ===============================================================
function init() {
  if (MODO === "demo") $("#aviso-demo").style.display = "block";

  $("#form-prediccion").addEventListener("submit", enviarPrediccion);
  $("#btn-compartir").addEventListener("click", compartir);
  $("#btn-idioma").addEventListener("click", cambiarIdioma);
  document.querySelectorAll(".tab").forEach((tabEl) =>
    tabEl.addEventListener("click", () => mostrarVista(tabEl.dataset.vista))
  );

  aplicarIdioma();

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
