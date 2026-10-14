/** Acciones de medidas corporales */
import { MEASURES } from '../config/constants.js';
import { ui, notify } from '../core/state.js';
import { mutateDay } from '../core/storage.js';
import { num, todayKey, toast } from '../core/utils.js';
import { selectMeasure } from '../views/cuerpo.js';

export const bodyActions = {
  'meas-sel': (b) => {
    selectMeasure(b.dataset.k);
    if (b.classList.contains('mk')) document.getElementById('ms-' + b.dataset.k)?.focus();
  },
  'meas-edit': (b) => { ui.measDate = b.dataset.d; notify(); window.scrollTo(0, 0); },
  'save-meas': () => {
    const values = {};
    MEASURES.forEach((m) => { const v = num(document.getElementById('ms-' + m.k)?.value); if (v) values[m.k] = v; });
    const weight = num(document.getElementById('mw')?.value);
    if (!Object.keys(values).length && !weight) { toast('Escribe al menos una medida'); return; }
    mutateDay(ui.measDate, (d) => { d.measures = values; if (weight) d.weight = weight; });
    toast('Medición guardada · +15 XP');
  },
};

export function onBodyChange(t) {
  if (t.id !== 'm-date' || !t.value) return false;
  ui.measDate = t.value > todayKey() ? todayKey() : t.value;
  notify();
  return true;
}

/** Al entrar en una casilla de medida se resalta su punto en el muñeco */
export function onBodyFocus(t) {
  if ((t.id || '').startsWith('ms-')) selectMeasure(t.id.slice(3));
}

/** Teclado sobre los puntos del muñeco (Intro o espacio) */
export function onBodyKey(e) {
  const t = e.target;
  if (!(t.classList && t.classList.contains('mk')) || (e.key !== 'Enter' && e.key !== ' ')) return false;
  e.preventDefault();
  selectMeasure(t.dataset.k);
  document.getElementById('ms-' + t.dataset.k)?.focus();
  return true;
}
