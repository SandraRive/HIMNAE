/** Formulario de comida */
import { SLOTS } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { mutateDay } from '../core/storage.js';
import { esc, num, toast, uid } from '../core/utils.js';
import { guessSlot } from '../domain/nutrition.js';

export const newMealDraft = (slot) => ({ id: uid(), slot: slot || guessSlot(), name: '', kcal: '', p: '', c: '', f: '' });

export function mealSheet() {
  const m = ui.draft;
  const numbers = S.settings.trackKcal
    ? `<p class="hint">Los números son opcionales: déjalos en blanco si no los sabes. Si ya lo registraste antes, se rellenan solos.</p>
       <div class="grid4">
         <label class="field"><span>kcal</span><input id="m-kcal" inputmode="numeric" value="${esc(m.kcal)}"></label>
         <label class="field"><span>Proteína g</span><input id="m-p" inputmode="decimal" value="${esc(m.p)}"></label>
         <label class="field"><span>Carbos g</span><input id="m-c" inputmode="decimal" value="${esc(m.c)}"></label>
         <label class="field"><span>Grasas g</span><input id="m-f" inputmode="decimal" value="${esc(m.f)}"></label></div>`
    : '<p class="hint">Estás en modo sin calorías. Actívalas en la pestaña Comida si quieres apuntar números.</p>';
  return `<div class="row between"><h2>${m.editing ? 'Editar comida' : 'Añadir comida'}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">✕</button></div>
    <div class="chips" role="group" aria-label="Franja">${SLOTS.map(([id, l]) => `<button class="chip" data-act="m-slot" data-v="${id}" aria-pressed="${m.slot === id}">${l}</button>`).join('')}</div>
    <label class="field"><span>Qué has comido</span><input id="m-name" list="foodlist" placeholder="Ej. Pollo con arroz" value="${esc(m.name)}" autofocus></label>
    ${numbers}
    <button class="btn primary" data-act="save-meal" style="justify-content:center;padding:13px">Guardar</button>`;
}

/** Guarda la comida en el día visible. Devuelve true si se guardó. */
export function saveMeal() {
  const m = ui.draft;
  if (!String(m.name).trim()) { toast('Escribe qué has comido'); return false; }
  const item = { id: m.id, slot: m.slot, name: String(m.name).trim(), kcal: num(m.kcal), p: num(m.p), c: num(m.c), f: num(m.f) };
  mutateDay(ui.cur, (d) => { const i = d.meals.findIndex((x) => x.id === m.id); if (i >= 0) d.meals[i] = item; else d.meals.push(item); });
  toast('Comida guardada');
  return true;
}
