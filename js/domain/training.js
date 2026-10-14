/**
 * Entrenos: sesiones, ejercicios, récords y volumen.
 *
 * Sesión = { id, name, type, min, km?, notes, exercises: Ejercicio[] }
 * Ejercicio = { group, name, kind: 'peso'|'tiempo', equip, grip, hand, feel, sets }
 *   sets (peso)   = [{ kg, reps }]
 *   sets (tiempo) = [{ name, time, reps, rest }]
 */
import { GROUPS, TYPES } from '../config/constants.js';
import { S } from '../core/state.js';
import { sortedKeys } from '../core/days.js';
import { addDays, fmtN, num, weekStart } from '../core/utils.js';

export const normName = (n) => String(n || '').trim().toLowerCase();
export const exKind = (e) => (e.kind === 'tiempo' ? 'tiempo' : 'peso');
export const groupKind = (g) => (GROUPS.find((z) => z[0] === g) || [, , 'peso'])[2];
export const groupLabel = (g) => (GROUPS.find((z) => z[0] === g) || [, ''])[1];
export const typeLabel = (t) => (TYPES.find((z) => z[0] === t) || [, 'Entreno'])[1];

/** Máximo estimado a 1 repetición (fórmula de Epley) */
export function e1rm(kg, reps) {
  kg = num(kg); reps = num(reps);
  if (!kg || !reps) return 0;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

export const exVolume = (e) => (exKind(e) === 'peso' ? (e.sets || []).reduce((a, s) => a + num(s.kg) * num(s.reps), 0) : 0);
export const sessionVolume = (w) => (w.exercises || []).reduce((a, e) => a + exVolume(e), 0);
/** Km de la sesión (compatible con el formato antiguo `cardio.km`) */
export const sessionKm = (w) => num(w.km ?? (w.cardio && w.cardio.km));

/** Todas las sesiones con su fecha, de más antigua a más reciente */
export function allSessions() {
  const out = [];
  sortedKeys().forEach((k) => (S.days[k].workouts || []).forEach((w) => out.push({ ...w, date: k })));
  return out;
}

export function findSession(date, id) {
  const d = S.days[date];
  return d ? (d.workouts || []).find((w) => w.id === id) : undefined;
}

/** Entrenos de la semana a la que pertenece `k` */
export function weekCount(k) {
  const ws = weekStart(k); let c = 0;
  for (let i = 0; i < 7; i++) { const d = S.days[addDays(ws, i)]; if (d && (d.workouts || []).length) c++; }
  return c;
}

/**
 * Récords: mejor 1RM estimado por ejercicio.
 * `marks` indica qué ejercicio de qué sesión batió récord ('idSesión|nombre').
 */
export function computePRs() {
  const best = {}, prs = [], marks = {};
  allSessions().forEach((w) => (w.exercises || []).forEach((e) => {
    if (exKind(e) !== 'peso') return;
    const n = normName(e.name); if (!n) return;
    let top = 0, topSet = null;
    (e.sets || []).forEach((s) => { const v = e1rm(s.kg, s.reps); if (v > top) { top = v; topSet = s; } });
    if (!top) return;
    if (best[n] && top > best[n].v + 0.01) { prs.push({ date: w.date, name: e.name, v: top }); marks[w.id + '|' + n] = 1; }
    if (!best[n] || top > best[n].v) best[n] = { v: top, name: e.name, set: topSet, date: w.date, group: e.group };
  }));
  return { best, prs, marks };
}

/** Última vez que se hizo un ejercicio antes de una fecha */
export function lastTimeFor(name, beforeKey, excludeId) {
  const n = normName(name); if (!n) return null;
  const list = allSessions().filter((w) => w.date <= beforeKey && w.id !== excludeId).reverse();
  for (const w of list) {
    const e = (w.exercises || []).find((x) => normName(x.name) === n);
    if (e && (e.sets || []).length) return { date: w.date, e };
  }
  return null;
}

/** Texto corto con las series: '50×8 · 50×8' o 'Plancha 45s desc. 15s · ...' */
export function setsText(e) {
  if (exKind(e) === 'tiempo') {
    return (e.sets || []).map((s) => [s.name, s.time, s.reps ? '×' + s.reps : '', s.rest ? 'desc. ' + s.rest : ''].filter(Boolean).join(' ')).join(' · ');
  }
  return (e.sets || []).map((s) => fmtN(s.kg, 2) + '×' + fmtN(s.reps)).join(' · ');
}

/** Historial por ejercicio de fuerza para las gráficas de Progreso */
export function exerciseHistory() {
  const map = {};
  allSessions().forEach((w) => (w.exercises || []).forEach((e) => {
    if (exKind(e) !== 'peso') return;
    const n = normName(e.name); if (!n) return;
    const sets = (e.sets || []).filter((s) => num(s.kg) || num(s.reps)); if (!sets.length) return;
    map[n] = map[n] || { name: e.name, group: e.group || 'otro', entries: [] };
    if (e.group) map[n].group = e.group;
    let best = sets[0];
    sets.forEach((s) => { if (num(s.kg) > num(best.kg) || (num(s.kg) === num(best.kg) && num(s.reps) > num(best.reps))) best = s; });
    map[n].entries.push({
      k: w.date,
      max: Math.max(...sets.map((s) => num(s.kg))),
      rm: Math.max(...sets.map((s) => e1rm(s.kg, s.reps))),
      vol: exVolume(e),
      feel: e.feel,
      best,
    });
  }));
  return map;
}

/** Series por grupo muscular desde una fecha */
export function setsByGroup(sinceKey) {
  const out = {};
  sortedKeys().filter((k) => k >= sinceKey).forEach((k) => (S.days[k].workouts || []).forEach((w) => (w.exercises || []).forEach((e) => {
    const g = e.group || 'otro'; out[g] = (out[g] || 0) + (e.sets || []).length;
  })));
  return out;
}
