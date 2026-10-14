/** Acciones de la pantalla Progreso */
import { ui, notify } from '../core/state.js';

export const progressActions = {
  'p-group': (b) => { ui.progGroup = b.dataset.v; ui.exSel = null; notify(); },
  'p-metric': (b) => { ui.progMetric = b.dataset.v; notify(); },
};

export function onProgressChange(t) {
  if (t.id !== 'exsel') return false;
  ui.exSel = t.value; notify();
  return true;
}
