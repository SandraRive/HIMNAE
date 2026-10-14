/** Acciones de suplementación */
import { S, ui } from '../core/state.js';
import { mutateDay, setSettings } from '../core/storage.js';
import { getDay } from '../core/days.js';
import { toast, uid } from '../core/utils.js';
import { allSuppsTaken, suppsAreDemo } from '../domain/supplements.js';
import { openSheet, renderSheet } from '../sheets/sheet.js';
import { newSupplementDraft } from '../sheets/supplement.js';
import { confirmTap } from '../ui/confirm.js';

export const supplementActions = {
  'supp-manage': () => openSheet('supp', newSupplementDraft()),
  'supp-tick': (b) => {
    if (suppsAreDemo()) { toast('Estos son de ejemplo. Añade los tuyos para empezar a marcarlos.'); openSheet('supp', newSupplementDraft()); return; }
    const id = b.dataset.id; let nowTaken = false;
    mutateDay(ui.cur, (d) => { d.supps = { ...(d.supps || {}) }; if (d.supps[id]) delete d.supps[id]; else { d.supps[id] = true; nowTaken = true; } });
    if (nowTaken && allSuppsTaken(getDay(ui.cur))) toast('Suplementación del día completa · +5 XP');
  },
  'sp-when': (b) => { ui.draft.when = b.dataset.v; renderSheet(); },
  'supp-add': () => {
    const dr = ui.draft, name = String(dr.name || '').trim();
    if (!name) { toast('Escribe el nombre del suplemento'); return; }
    setSettings({ supps: [...(S.settings.supps || []), { id: uid(), name, dose: String(dr.dose || '').trim(), when: dr.when }] });
    ui.draft = newSupplementDraft(dr.when); renderSheet();
    toast(name + ' añadido'); document.getElementById('sp-name')?.focus();
  },
  'supp-del': (b) => confirmTap(b, () => { setSettings({ supps: (S.settings.supps || []).filter((x) => x.id !== b.dataset.id) }); renderSheet(); }),
};

export function onSupplementInput(t) {
  if (ui.sheetKind !== 'supp') return;
  if (t.id === 'sp-name') ui.draft.name = t.value;
  else if (t.id === 'sp-dose') ui.draft.dose = t.value;
}
