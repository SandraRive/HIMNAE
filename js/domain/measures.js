/**
 * Medidas corporales. Cada medición se guarda en su día: `día.measures = { clave: cm }`.
 */
import { MEASURES } from '../config/constants.js';
import { S } from '../core/state.js';
import { sortedKeys } from '../core/days.js';
import { hasAny, num } from '../core/utils.js';

export const measureByKey = (k) => MEASURES.find((m) => m.k === k);

/** Días con alguna medida, de más antiguo a más reciente */
export const measureDays = () => sortedKeys().filter((k) => hasAny(S.days[k].measures));

/** Serie temporal de una medida: [{ k: fecha, y: cm }] */
export const measureSeries = (key) =>
  measureDays().filter((k) => num(S.days[k].measures[key])).map((k) => ({ k, y: num(S.days[k].measures[key]) }));

export const weightSeries = (limit = 90) =>
  sortedKeys().filter((k) => S.days[k].weight).slice(-limit).map((k) => ({ k, y: num(S.days[k].weight) }));
