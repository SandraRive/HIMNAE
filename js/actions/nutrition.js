/** Acciones de comida */
import { S, ui } from '../core/state.js';
import { mutateDay, setSettings } from '../core/storage.js';
import { getDay } from '../core/days.js';
import { num, toast, uid } from '../core/utils.js';
import { guessSlot, knownFoods } from '../domain/nutrition.js';
import { closeSheet, openSheet, renderSheet } from '../sheets/sheet.js';
import { newMealDraft, saveMeal } from '../sheets/meal.js';

export const nutritionActions = {
  'toggle-kcal': () => { setSettings({ trackKcal: !S.settings.trackKcal }); toast(S.settings.trackKcal ? 'Calorías activadas' : 'Modo sin calorías'); },
  'new-meal': (b) => openSheet('meal', newMealDraft(b.dataset.slot)),
  'edit-meal': (b) => { const m = getDay(ui.cur).meals.find((x) => x.id === b.dataset.id); if (m) openSheet('meal', { ...m, editing: true }); },
  'del-meal': (b) => mutateDay(ui.cur, (d) => { d.meals = d.meals.filter((m) => m.id !== b.dataset.id); }),
  'm-slot': (b) => { ui.draft.slot = b.dataset.v; renderSheet(); },
  'save-meal': () => { if (saveMeal()) closeSheet(); },
  'quick-food': (b) => {
    const f = knownFoods()[num(b.dataset.i)]; if (!f) return;
    const slot = document.getElementById('qslot')?.value || guessSlot();
    mutateDay(ui.cur, (d) => d.meals.push({ id: uid(), slot, name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f }));
    toast(f.name + ' añadido');
  },
};

/** Al escribir una comida ya conocida se rellenan sus números */
export function onMealInput(t) {
  if (ui.sheetKind !== 'meal') return;
  const fields = { 'm-name': 'name', 'm-kcal': 'kcal', 'm-p': 'p', 'm-c': 'c', 'm-f': 'f' };
  if (!fields[t.id]) return;
  ui.draft[fields[t.id]] = t.value;
  if (t.id !== 'm-name' || !S.settings.trackKcal) return;
  const f = knownFoods().find((x) => x.name.toLowerCase() === t.value.trim().toLowerCase());
  if (!f) return;
  ['kcal', 'p', 'c', 'f'].forEach((k) => {
    if (!num(f[k])) return;
    ui.draft[k] = f[k];
    const el = document.getElementById('m-' + k); if (el) el.value = f[k];
  });
}

export function onNutritionChange(t) {
  if (t.id === 'qslot') { ui.quickSlot = t.value; return true; }
  return false;
}
