/** Acciones de la pantalla Hoy: agua y peso */
import { ui } from '../core/state.js';
import { mutateDay } from '../core/storage.js';
import { num, toast } from '../core/utils.js';

export const dayActions = {
  water: (b) => mutateDay(ui.cur, (d) => { d.water = Math.max(0, num(d.water) + num(b.dataset.v)); }),
  // Tocar el último vaso lleno lo vacía
  'water-set': (b) => mutateDay(ui.cur, (d) => { const v = num(b.dataset.v); d.water = num(d.water) === v ? v - 1 : v; }),
  'save-wt': () => {
    const v = num(document.getElementById('wt').value);
    mutateDay(ui.cur, (d) => { d.weight = v || null; });
    toast(v ? 'Peso guardado' : 'Peso borrado');
  },
};
