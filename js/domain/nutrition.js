/**
 * Comidas.
 * Comida = { id, slot, name, kcal, p, c, f }   (los números son opcionales)
 */
import { S } from '../core/state.js';
import { sortedKeys } from '../core/days.js';
import { fmtN, num } from '../core/utils.js';

export function mealTotals(d) {
  return (d.meals || []).reduce((a, m) => ({ kcal: a.kcal + num(m.kcal), p: a.p + num(m.p), c: a.c + num(m.c), f: a.f + num(m.f) }), { kcal: 0, p: 0, c: 0, f: 0 });
}

/** Comidas ya registradas, ordenadas de más a menos frecuentes */
export function knownFoods() {
  const m = {};
  sortedKeys().forEach((k) => (S.days[k].meals || []).forEach((f) => {
    const n = f.name.trim(); if (!n) return;
    const key = n.toLowerCase();
    m[key] = { ...f, count: (m[key]?.count || 0) + 1 };
  }));
  return Object.values(m).sort((a, b) => b.count - a.count);
}

/** Franja que toca según la hora */
export function guessSlot() {
  const h = new Date().getHours();
  return h < 11 ? 'desayuno' : h < 16 ? 'comida' : h < 19 ? 'merienda' : h < 23 ? 'cena' : 'picoteo';
}

/** 'kcal · P · C · G' de una comida, solo con los valores rellenos */
export function mealNumbers(m) {
  if (!S.settings.trackKcal) return '';
  const p = [];
  if (num(m.kcal)) p.push(fmtN(m.kcal) + ' kcal');
  if (num(m.p)) p.push('P ' + fmtN(m.p));
  if (num(m.c)) p.push('C ' + fmtN(m.c));
  if (num(m.f)) p.push('G ' + fmtN(m.f));
  return p.join(' · ');
}
