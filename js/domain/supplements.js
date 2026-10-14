/**
 * Suplementación.
 * Suplemento = { id, name, dose, when }   (lista en ajustes)
 * Cada día guarda cuáles se tomaron en `día.supps[id] = true`.
 */
import { WHEN } from '../config/constants.js';
import { S } from '../core/state.js';
import { DEMO_SUPPS } from '../core/demo.js';

export const getSupps = () => {
  const own = S.settings.supps || [];
  return own.length ? own : S.demo ? DEMO_SUPPS : [];
};
export const suppsAreDemo = () => !(S.settings.supps || []).length && S.demo;
export const allSuppsTaken = (d) => {
  const sp = getSupps();
  return sp.length > 0 && sp.every((x) => d && d.supps && d.supps[x.id]);
};
export const whenLabel = (w) => (WHEN.find((x) => x[0] === w) || [, ''])[1];
export const whenOrder = (w) => WHEN.findIndex((x) => x[0] === w);
