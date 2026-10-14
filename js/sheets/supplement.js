/** Formulario para gestionar la lista de suplementos */
import { SUPPLEMENT_SUGGESTIONS, WHEN } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { esc } from '../core/utils.js';
import { whenLabel } from '../domain/supplements.js';

export const newSupplementDraft = (when = 'manana') => ({ name: '', dose: '', when });

export function supplementSheet() {
  const own = S.settings.supps || [], dr = ui.draft;
  const list = own.length
    ? '<div class="list">' + own.map((x) => `<div class="item"><div class="grow"><p><b>${esc(x.name)}</b></p>
        <p class="muted" style="font-size:.82rem">${[x.dose, whenLabel(x.when)].filter(Boolean).map(esc).join(' · ')}</p></div>
        <button class="btn small ghost danger" data-act="supp-del" data-id="${x.id}">Quitar</button></div>`).join('') + '</div>'
    : '<p class="empty">Todavía no tienes ninguno. Añade el primero aquí abajo.</p>';
  return `<div class="row between"><h2>Tu suplementación</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">✕</button></div>${list}
    <div class="ex-card"><span class="label">Añadir suplemento</span>
      <div class="grid2"><label class="field"><span>Nombre</span><input id="sp-name" list="supplist" placeholder="Ej. Creatina" value="${esc(dr.name)}" autofocus></label>
        <label class="field"><span>Dosis (opcional)</span><input id="sp-dose" placeholder="Ej. 3 g, 1 cápsula" value="${esc(dr.dose)}"></label></div>
      <div class="chips" role="group" aria-label="Cuándo">${WHEN.map(([id, l]) => `<button class="chip" data-act="sp-when" data-v="${id}" aria-pressed="${dr.when === id}">${l}</button>`).join('')}</div>
      <button class="btn primary" data-act="supp-add" style="justify-content:center">Añadir a mi lista</button></div>
    <datalist id="supplist">${SUPPLEMENT_SUGGESTIONS.map((n) => `<option value="${n}">`).join('')}</datalist>
    <p class="hint">Quitar uno de la lista no borra los días que ya marcaste.</p>`;
}
