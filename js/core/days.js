/**
 * Modelo de un día.
 *
 * Día = {
 *   date: 'AAAA-MM-DD',
 *   weight: number | null,           // kg
 *   water: number,                   // vasos
 *   workouts: Sesión[],
 *   meals: Comida[],
 *   supps: { [idSuplemento]: true },
 *   goals: { [idMeta]: true | number },
 *   measures: { [clave]: cm },
 * }
 */
import { S } from './state.js';
import { hasAny, isDayKey } from './utils.js';

export function blankDay(k) {
  return { date: k, weight: null, water: 0, workouts: [], meals: [], supps: {}, goals: {}, measures: {} };
}

/** Devuelve el día (o uno vacío) con todos los campos rellenos */
export function getDay(k) {
  const d = S.days[k];
  return d ? { ...blankDay(k), ...d } : blankDay(k);
}

export function isEmptyDay(d) {
  return !d.weight && !d.water && !(d.workouts || []).length && !(d.meals || []).length
    && !hasAny(d.supps) && !hasAny(d.goals) && !hasAny(d.measures);
}

/** Claves de días con datos, de más antiguo a más reciente */
export const sortedKeys = () => Object.keys(S.days).filter(isDayKey).sort();
