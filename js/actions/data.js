/** Copia de seguridad, restauración y borrado de datos */
import { DEFAULT_SETTINGS } from '../config/constants.js';
import { S, notify } from '../core/state.js';
import { leaveDemo, persistDay, persistSettings, resetAll } from '../core/storage.js';
import { blankDay } from '../core/days.js';
import { isDayKey, toast } from '../core/utils.js';
import { confirmTap } from '../ui/confirm.js';

function exportBackup() {
  const text = JSON.stringify({ days: S.demo ? {} : S.days, settings: S.settings });
  const box = document.getElementById('imp');
  const fallback = () => { box.value = text; box.select(); toast('Selecciona y copia el texto del recuadro'); };
  try {
    navigator.clipboard.writeText(text).then(() => toast('Copia de seguridad copiada. Pégala en una nota para guardarla.'), fallback);
  } catch (e) { fallback(); }
}

function importBackup() {
  let obj;
  try { obj = JSON.parse(document.getElementById('imp').value); } catch (e) { toast('Ese texto no es una copia válida. Pega el texto completo.'); return; }
  if (!obj || typeof obj.days !== 'object') { toast('Falta la parte «days» de la copia.'); return; }
  leaveDemo();
  Object.entries(obj.days).forEach(([k, d]) => { if (isDayKey(k) && d) { S.days[k] = { ...blankDay(k), ...d }; persistDay(k); } });
  if (obj.settings) { S.settings = { ...DEFAULT_SETTINGS, ...obj.settings }; persistSettings(); }
  notify(); toast('Datos restaurados');
}

export const dataActions = {
  export: exportBackup,
  import: importBackup,
  reset: (b) => confirmTap(b, () => { resetAll(); notify(); toast('Datos borrados'); }),
};
