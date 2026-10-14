/**
 * Guardado de datos.
 *
 * Dos destinos posibles:
 *  - Navegador (localStorage): siempre disponible. Es lo que se usa en GitHub Pages.
 *  - Cuenta de claude.ai (capacidad `db`): solo cuando la app se abre como artifact.
 *    En ese caso cada día se guarda como un documento y los ajustes en 'settings'.
 *
 * El resto de la app no sabe cuál se está usando: solo llama a
 * `mutateDay()` y `setSettings()`.
 */
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../config/constants.js';
import { S, notify } from './state.js';
import { clone, isDayKey, toast } from './utils.js';
import { getDay, isEmptyDay } from './days.js';

let db = null;
let basePath = null;
let firstSnapshot = true;
const queues = {};

/* ---------- Navegador ---------- */
function saveLocal() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ days: S.demo ? {} : S.days, settings: S.settings })); } catch (e) { /* sin almacenamiento */ }
}
export function loadLocal() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}

/* ---------- Cola de escrituras (una a la vez por documento) ---------- */
function enqueue(key, fn) {
  queues[key] = (queues[key] || Promise.resolve()).then(fn).catch((e) => {
    toast(e && e.code === 'quota_exceeded' ? 'No queda espacio para guardar más datos' : 'No se ha podido guardar. Revisa la conexión.');
  });
}

export function persistDay(k) {
  if (S.mode === 'db') {
    const d = S.days[k], ref = db.collection(basePath).doc(k);
    enqueue(k, () => (!d || isEmptyDay(d) ? ref.delete() : ref.set(clone(d))));
  } else saveLocal();
}

export function persistSettings() {
  if (S.mode === 'db') {
    const s = clone(S.settings);
    enqueue('settings', () => db.collection(basePath).doc('settings').set(s));
  } else saveLocal();
}

/* ---------- API para el resto de la app ---------- */

/** Cambia ajustes, guarda y repinta */
export function setSettings(patch) {
  S.settings = { ...S.settings, ...patch };
  persistSettings();
  notify();
}

/** Al registrar el primer dato propio se borran los datos de ejemplo */
export function leaveDemo() { if (S.demo) { S.demo = false; S.days = {}; } }

/** Modifica un día con `fn(día)`, lo guarda y repinta */
export function mutateDay(k, fn) {
  leaveDemo();
  const d = clone(getDay(k));
  fn(d);
  if (isEmptyDay(d)) delete S.days[k]; else S.days[k] = d;
  persistDay(k);
  notify();
}

export function clearDemo() { S.demo = false; S.days = {}; if (S.mode !== 'db') saveLocal(); }

export function resetAll() {
  const keys = Object.keys(S.days);
  S.demo = false; S.days = {}; S.settings = { ...DEFAULT_SETTINGS };
  keys.forEach(persistDay); persistSettings();
}

/* ---------- Cuenta de claude.ai (solo cuando existe) ---------- */
function onSnapshot(snap) {
  const days = {}; let settings = null;
  snap.docs.forEach((doc) => {
    const v = doc.data(); if (!v) return;
    if (doc.id === 'settings') settings = clone(v);
    else if (isDayKey(doc.id)) days[doc.id] = clone(v);
  });
  const has = Object.keys(days).length > 0;
  if (firstSnapshot) {
    firstSnapshot = false;
    const local = loadLocal();
    // Primera vez con cuenta: sube lo que hubiera solo en este navegador
    if (!has && !settings && local && local.days && Object.keys(local.days).length) {
      S.demo = false; S.days = local.days; S.settings = { ...DEFAULT_SETTINGS, ...(local.settings || {}) };
      Object.keys(S.days).forEach(persistDay); persistSettings(); notify(); return;
    }
  }
  if (has) S.demo = false;
  if (!S.demo) S.days = days;
  if (settings) S.settings = { ...DEFAULT_SETTINGS, ...settings };
  notify();
}

export async function connectCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [dbx, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!dbx || !user) return;
    const id = await user.id(); if (!id) return;
    db = dbx; basePath = 'data/users/' + id; S.mode = 'db';
    db.collection(basePath).onSnapshot(onSnapshot, () => { S.mode = 'local'; notify(); });
    notify();
  } catch (e) { /* sin cuenta: seguimos en local */ }
}
