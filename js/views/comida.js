/** Pantalla COMIDA: totales del día, frecuentes y comidas por franja */
import { SLOTS } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { getDay } from '../core/days.js';
import { esc, fmtN, num } from '../core/utils.js';
import { guessSlot, knownFoods, mealNumbers, mealTotals } from '../domain/nutrition.js';
import { dayNav, demoBanner } from '../ui/components.js';

function summaryCard(d) {
  const st = S.settings, t = mealTotals(d);
  const toggle = `<button class="switch" role="switch" aria-checked="${st.trackKcal}" data-act="toggle-kcal"><i></i>Contar calorías y macros</button>`;
  if (!st.trackKcal) {
    return `<section class="card"><div class="row between"><span class="label">Total del día</span>${toggle}</div>
      <p><b class="big">${(d.meals || []).length}</b> <span class="muted">/ ${st.mealsGoal} comidas registradas</span></p>
      <p class="muted small">Solo apuntas qué comes, sin números. Puedes volver a activar las calorías cuando quieras.</p></section>`;
  }
  const kcalFromMacros = t.p * 4 + t.c * 4 + t.f * 9 || 1;
  const cell = (l, v, goal, u) => `<div><p class="label">${l}</p><p class="num"><b class="big">${fmtN(v)}</b> <span class="muted">${goal ? '/ ' + fmtN(goal) + ' ' : ''}${u}</span></p></div>`;
  return `<section class="card"><div class="row between"><span class="label">Total del día</span>${toggle}</div>
    <div class="grid4">${cell('Energía', t.kcal, st.kcal, '')}${cell('Proteína', t.p, st.protein, 'g')}${cell('Carbos', t.c, 0, 'g')}${cell('Grasas', t.f, 0, 'g')}</div>
    <div class="macro-bar" aria-label="Reparto de macros">
      <i style="width:${(t.p * 4) / kcalFromMacros * 100}%;background:var(--blue)"></i>
      <i style="width:${(t.c * 4) / kcalFromMacros * 100}%;background:var(--yellow)"></i>
      <i style="width:${(t.f * 9) / kcalFromMacros * 100}%;background:var(--green)"></i></div>
    <div class="chart-legend"><span><i class="dot" style="--c:var(--blue)"></i>Proteína</span><span><i class="dot" style="--c:var(--yellow)"></i>Carbohidratos</span><span><i class="dot" style="--c:var(--green)"></i>Grasas</span></div></section>`;
}

function frequentCard() {
  const foods = knownFoods().slice(0, 8);
  if (!foods.length) return '';
  const slot = ui.quickSlot || guessSlot();
  return `<section class="card"><div class="row between"><span class="label">Tus frecuentes · un toque y listo</span>
    <select id="qslot" aria-label="Franja" style="width:auto;padding:5px 8px">${SLOTS.map(([id, l]) => `<option value="${id}"${id === slot ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="chips">${foods.map((f, i) => `<button class="chip" data-act="quick-food" data-i="${i}">${esc(f.name)}${S.settings.trackKcal && num(f.kcal) ? ` <span class="muted">${fmtN(f.kcal)}</span>` : ''}</button>`).join('')}</div></section>`;
}

function slotCard(d, id, label) {
  const items = (d.meals || []).filter((m) => m.slot === id), kcal = items.reduce((a, m) => a + num(m.kcal), 0);
  const list = items.length ? '<div class="list">' + items.map((m) => {
    const n = mealNumbers(m);
    return `<div class="item"><div class="grow"><p><b>${esc(m.name)}</b></p>${n ? `<p class="muted num" style="font-size:.82rem">${n}</p>` : ''}</div>
      <button class="btn small ghost" data-act="edit-meal" data-id="${m.id}">Editar</button>
      <button class="btn small ghost danger" data-act="del-meal" data-id="${m.id}" aria-label="Borrar">✕</button></div>`;
  }).join('') + '</div>' : '';
  return `<section class="card"><div class="slot-head"><h3>${label}</h3><div class="row">
    <span class="muted num small">${S.settings.trackKcal && kcal ? fmtN(kcal) + ' kcal' : ''}</span>
    <button class="btn small" data-act="new-meal" data-slot="${id}">+ Añadir</button></div></div>${list}</section>`;
}

export function viewComida() {
  const d = getDay(ui.cur);
  return demoBanner() + dayNav('Comida') + summaryCard(d) + frequentCard() + SLOTS.map(([id, l]) => slotCard(d, id, l)).join('');
}
