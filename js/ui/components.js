/**
 * Piezas de interfaz que se repiten en varias pantallas.
 * Todas devuelven HTML en forma de texto.
 */
import { FEEL } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { addDays, esc, fmtLong, fmtN, fmtShort, num, todayKey, weekStart } from '../core/utils.js';
import { getGoalValue, isGoalDone, periodLabel, shiftPeriod } from '../domain/goals.js';
import { getSupps, whenLabel, whenOrder } from '../domain/supplements.js';
import { TICK } from './icons.js';

export function demoBanner() {
  if (!S.demo) return '';
  return `<div class="banner"><p><b>Estás viendo datos de ejemplo.</b> Así se ve la app con un mes de uso. En cuanto registres algo tuyo, el ejemplo desaparece.</p>
    <button class="btn small" data-act="clear-demo">Empezar en blanco</button></div>`;
}

/** Cabecera con flechas para cambiar de día */
export function dayNav(title) {
  const isToday = ui.cur === todayKey();
  return `<div class="dayhead">
    <button class="icon-btn" data-act="prev" aria-label="Día anterior">‹</button>
    <div class="mid"><h1>${isToday ? title : fmtShort(ui.cur)}</h1><p>${fmtLong(ui.cur)}</p></div>
    <button class="icon-btn" data-act="next" aria-label="Día siguiente"${isToday ? ' disabled' : ''}>›</button></div>`;
}

/** Nombre + barra de progreso + 'valor / objetivo' */
export function metric(name, color, val, goal, unit) {
  const pct = goal ? Math.min(100, (val / goal) * 100) : 0;
  return `<div class="metric"><div class="m-top"><span class="dot" style="--c:${color}"></span><span class="m-name">${name}</span>
    <span class="m-val">${fmtN(val)} <small>/ ${fmtN(goal)} ${unit}</small></span></div>
    <div class="track"><i style="width:${pct}%;background:${color}"></i></div></div>`;
}

/** L M X J V S D con los días entrenados en verde */
export function weekDots(k) {
  const ws = weekStart(k);
  return '<div class="week-dots">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((l, i) => {
    const kk = addDays(ws, i), on = S.days[kk] && (S.days[kk].workouts || []).length;
    return `<div class="wd${on ? ' on' : ''}${kk === k ? ' today' : ''}"><span></span>${l}</div>`;
  }).join('') + '</div>';
}

export const feelLegend = () =>
  Object.values(FEEL).map((f) => `<span><i class="dot" style="--c:${f[1]}"></i>${f[0]}</span>`).join('');

/** <option>s de un <select> */
export const options = (list, val, placeholder) =>
  `<option value="">${placeholder}</option>` + list.map((x) => `<option${x === val ? ' selected' : ''}>${esc(x)}</option>`).join('');

/** Tarjeta de suplementación del día */
export function supplementsCard(d) {
  const sp = getSupps();
  if (!sp.length) {
    return `<section class="card"><h2>Suplementación</h2>
      <p class="empty">Añade lo que tomes (creatina, proteína, vitaminas...) y márcalo cada día con un toque.</p>
      <div class="row"><button class="btn" data-act="supp-manage">+ Añadir suplemento</button></div></section>`;
  }
  const done = sp.filter((x) => d.supps && d.supps[x.id]).length;
  const rows = [...sp].sort((a, b) => whenOrder(a.when) - whenOrder(b.when)).map((x) => {
    const on = !!(d.supps && d.supps[x.id]);
    let strip = '';
    for (let i = 6; i >= 0; i--) {
      const k = addDays(ui.cur, -i), dd = S.days[k];
      strip += `<i class="${dd && dd.supps && dd.supps[x.id] ? 'on' : ''}${i === 0 ? ' cur' : ''}" title="${fmtShort(k)}"></i>`;
    }
    return `<div class="supp"><button class="tick" data-act="supp-tick" data-id="${x.id}" aria-pressed="${on}" aria-label="${esc(x.name)}">${TICK}</button>
      <div class="grow"><p><b>${esc(x.name)}</b></p><p class="muted small">${[x.dose, whenLabel(x.when)].filter(Boolean).map(esc).join(' · ')}</p></div>
      <div class="strip" aria-label="Últimos 7 días">${strip}</div></div>`;
  }).join('');
  return `<section class="card"><div class="row between"><h2>Suplementación</h2>
    <div class="row"><span class="label">${done} de ${sp.length}${done === sp.length ? ' · completo' : ''}</span>
    <button class="btn small ghost" data-act="supp-manage">Gestionar</button></div></div><div class="list">${rows}</div></section>`;
}

/** Fila de una meta: casilla (sin cifra) o progreso (con cifra) */
export function goalRow(g, k, { removable = false } = {}) {
  const v = getGoalValue(g, k), done = isGoalDone(g, v);
  const del = removable ? `<button class="btn small ghost danger" data-act="g-del" data-id="${g.id}" aria-label="Quitar meta">✕</button>` : '';
  if (g.target) {
    const pct = Math.min(100, (num(v) / num(g.target)) * 100);
    return `<div class="supp"><div class="ring${done ? ' done' : ''}">${Math.round(pct)}%</div>
      <div class="grow"><p><b>${esc(g.text)}</b></p>
        <div class="track" style="margin-top:4px"><i style="width:${pct}%;background:${done ? 'var(--green)' : 'var(--accent)'}"></i></div>
        <p class="muted small num">${fmtN(v, 1)} / ${fmtN(g.target, 1)} ${esc(g.unit || '')}</p></div>
      <input class="gin" data-goal="${g.id}" data-k="${k}" inputmode="decimal" value="${v ? String(v).replace('.', ',') : ''}" placeholder="0" aria-label="Llevas">
      <button class="btn small" data-act="g-inc" data-id="${g.id}" data-k="${k}">+1</button>${del}</div>`;
  }
  let strip = '';
  for (let i = 6; i >= 0; i--) {
    const kk = shiftPeriod(g.period, k, -i);
    strip += `<i class="${getGoalValue(g, kk) ? 'on' : ''}${i === 0 ? ' cur' : ''}" title="${esc(periodLabel(g.period, kk))}"></i>`;
  }
  return `<div class="supp"><button class="tick" data-act="g-tick" data-id="${g.id}" data-k="${k}" aria-pressed="${done}" aria-label="${esc(g.text)}">${TICK}</button>
    <div class="grow"><p><b>${esc(g.text)}</b></p></div><div class="strip" aria-label="Últimos periodos">${strip}</div>${del}</div>`;
}
