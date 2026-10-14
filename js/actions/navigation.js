/** Acciones de navegación: pestañas, días y cierre de formularios */
import { ui, notify } from '../core/state.js';
import { clearDemo } from '../core/storage.js';
import { addDays, todayKey, toast } from '../core/utils.js';
import { closeSheet } from '../sheets/sheet.js';

export const navigationActions = {
  tab: (b) => { ui.view = b.dataset.v; notify(); window.scrollTo(0, 0); },
  prev: () => { ui.cur = addDays(ui.cur, -1); notify(); },
  next: () => { if (ui.cur < todayKey()) { ui.cur = addDays(ui.cur, 1); notify(); } },
  close: () => closeSheet(),
  'clear-demo': () => { clearDemo(); notify(); toast('Listo. Todo en blanco para empezar.'); },
};
