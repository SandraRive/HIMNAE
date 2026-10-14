/**
 * Utilidades puras: fechas, números, texto y duraciones.
 * No dependen del estado de la app.
 */

/* ---------- Fechas (las claves de día son 'AAAA-MM-DD') ---------- */
export const pad = (n) => String(n).padStart(2, '0');
export const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => keyOf(new Date());
export function parseK(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(k, n) { const d = parseK(k); d.setDate(d.getDate() + n); return keyOf(d); }
/** Lunes de la semana de esa fecha */
export function weekStart(k) { const w = (parseK(k).getDay() + 6) % 7; return addDays(k, -w); }
export const fmtLong = (k) => parseK(k).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtShort = (k) => parseK(k).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
export const isDayKey = (k) => /^\d{4}-\d\d-\d\d$/.test(k);

/* ---------- Números ---------- */
export const fmtN = (n, dec = 0) => Number(n || 0).toLocaleString('es-ES', { maximumFractionDigits: dec });
/** Convierte texto a número aceptando coma decimal; devuelve 0 si no es válido */
export function num(v) { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; }
/** Valor para un input: '63,8' en vez de 63.8 y vacío si es 0 */
export const inputVal = (v) => (num(v) ? String(v).replace('.', ',') : '');

/* ---------- Texto y objetos ---------- */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export const uid = () => Math.random().toString(36).slice(2, 10);
export const clone = (o) => JSON.parse(JSON.stringify(o));
export const hasAny = (o) => Object.values(o || {}).some((v) => v !== null && v !== '' && v !== false && v !== 0);

/* ---------- Duraciones: '45s', '1:30', '20min' ---------- */
export function parseDur(s) {
  s = String(s || '').trim().toLowerCase().replace(',', '.');
  if (!s) return 0;
  if (s.includes(':')) { const p = s.split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0); }
  const n = parseFloat(s);
  if (!isFinite(n)) return 0;
  if (/h/.test(s)) return n * 3600;
  if (/m/.test(s)) return n * 60;
  return n;
}
export function fmtDur(t) {
  t = Math.round(t); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/* ---------- Aviso flotante ---------- */
let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2800);
}
