// Panel de administración: cargar los datos reales cuando nazca el bebé.
import { BEBE, CAMPOS, ADMIN_PASSWORD } from "./config.js?v=5";
import { MODO, escucharResultado, escucharPredicciones, guardarResultado } from "./db.js?v=5";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Solo campos que puntúan (el mensaje no se carga acá)
const CAMPOS_REALES = CAMPOS.filter((c) => !c.sinPuntaje);

let resultado = null;

function entrar(e) {
  e?.preventDefault();
  if ($("#pass").value !== ADMIN_PASSWORD) {
    $("#error-pass").textContent = "Clave incorrecta 🙈";
    return;
  }
  $("#login").style.display = "none";
  $("#panel").style.display = "block";
  pintarFormulario();
}

function pintarFormulario() {
  $("#bebe-nombre").textContent = BEBE.nombre;
  if (MODO === "demo") $("#aviso-demo").style.display = "block";

  $("#campos-reales").innerHTML = CAMPOS_REALES.map((c) => {
    let input = "";
    if (c.tipo === "select") {
      input = `<select name="${c.key}">
        <option value="">— sin dato —</option>
        ${c.opciones.map((o) => `<option value="${esc(o.v)}">${esc(o.v)}</option>`).join("")}
      </select>`;
    } else {
      const extra = [
        c.min != null ? `min="${c.min}"` : "",
        c.max != null ? `max="${c.max}"` : "",
        c.step != null ? `step="${c.step}"` : "",
        c.placeholder ? `placeholder="${esc(c.placeholder)}"` : "",
      ].join(" ");
      input = `<input type="${c.tipo}" name="${c.key}" ${extra}>`;
    }
    return `<label class="campo"><span class="campo-label">${c.emoji} ${esc(c.label)}</span>${input}</label>`;
  }).join("");

  rellenar();
  actualizarEstado();
}

function rellenar() {
  if (!resultado) return;
  for (const c of CAMPOS_REALES) {
    const el = document.querySelector(`[name="${c.key}"]`);
    if (el && resultado[c.key] != null) el.value = resultado[c.key];
  }
}

function actualizarEstado() {
  const badge = $("#estado");
  if (resultado?.publicado) {
    badge.innerHTML = "🟢 Publicado — la tabla de posiciones está visible para todos";
    badge.className = "estado pub";
    $("#btn-despublicar").style.display = "inline-block";
  } else {
    badge.innerHTML = "🔴 Sin publicar — todavía nadie ve la tabla";
    badge.className = "estado nopub";
    $("#btn-despublicar").style.display = "none";
  }
}

async function guardar(e) {
  e.preventDefault();
  const datos = { publicado: true };
  for (const c of CAMPOS_REALES) {
    datos[c.key] = document.querySelector(`[name="${c.key}"]`)?.value ?? "";
  }
  const btn = $("#btn-guardar");
  btn.disabled = true;
  btn.textContent = "Guardando…";
  try {
    await guardarResultado(datos);
    avisar("✅ ¡Guardado y publicado! Ya pueden ver la tabla de posiciones.");
  } catch (err) {
    alert("No se pudo guardar 😞\n\n" + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 Guardar y publicar resultados";
  }
}

async function despublicar() {
  if (!confirm("¿Ocultar la tabla de posiciones? Los datos se conservan, solo dejan de verse.")) return;
  await guardarResultado({ ...(resultado || {}), publicado: false });
  avisar("La tabla quedó oculta. Podés volver a publicarla cuando quieras.");
}

function avisar(txt) {
  const el = $("#aviso");
  el.textContent = txt;
  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), 5000);
}

function init() {
  $("#login-form").addEventListener("submit", entrar);
  $("#form-resultado").addEventListener("submit", guardar);
  $("#btn-despublicar").addEventListener("click", despublicar);

  escucharResultado((res) => {
    resultado = res;
    if ($("#panel").style.display === "block") { rellenar(); actualizarEstado(); }
  });
  escucharPredicciones((lista) => {
    $("#contador").textContent = lista.length;
  });
}

init();
