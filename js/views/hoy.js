/** Pantalla HOY: barra del día, nivel, métricas, metas, suplementos, resumen y peso */
import { LEVELS } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { getDay, sortedKeys } from '../core/days.js';
import { esc, fmtN, fmtShort, inputVal, num } from '../core/utils.js';
import { mealTotals } from '../domain/nutrition.js';
import { getSupps } from '../domain/supplements.js';
import { getGoals } from '../domain/goals.js';
import { sessionKm, sessionVolume, weekCount } from '../domain/training.js';
import { stats } from '../domain/stats.js';
import { barbell } from '../ui/charts.js';
import { dayNav, demoBanner, goalRow, metric, supplementsCard, weekDots } from '../ui/components.js';

/** Discos de la barra según lo que esté activado */
function buildPlates(d) {
  const st = S.settings, t = mealTotals(d), sp = getSupps(), plates = [];
  if (st.trackKcal) {
    plates.push({ name: 'Energía', color: 'var(--red)', pct: t.kcal / st.kcal });
    plates.push({ name: 'Proteína', color: 'var(--blue)', pct: t.p / st.protein });
  } else {
    plates.push({ name: 'Comidas', color: 'var(--red)', pct: (d.meals || []).length / st.mealsGoal });
  }
  plates.push({ name: 'Agua', color: 'var(--yellow)', pct: num(d.water) / st.water });
  if (sp.length) plates.push({ name: 'Suplem.', color: 'var(--orange)', pct: sp.filter((s) => d.supps && d.supps[s.id]).length / sp.length });
  plates.push({ name: 'Entreno', color: 'var(--green)', pct: (d.workouts || []).length ? 1 : 0, bool: true });
  return plates;
}

function barCard(d) {
  const plates = buildPlates(d), loaded = plates.filter((p) => p.pct >= 1).length;
  const legend = plates.map((p) => {
    const value = p.bool ? (p.pct ? 'Sí' : '—') : Math.round(Math.min(1, p.pct) * 100) + '%';
    const color = p.color === 'var(--yellow)' ? 'var(--fg)' : p.color;
    return `<div><b style="color:${color}">${value}</b>${p.name}</div>`;
  }).join('');
  return `<section class="card bar-card"><div class="row between"><span class="label">La barra del día</span><span class="label">${loaded} de ${plates.length} discos cargados</span></div>
    ${barbell(plates)}<div class="legend" style="grid-template-columns:repeat(${plates.length},minmax(0,1fr))">${legend}</div></section>`;
}

function levelCard() {
  const x = stats(), pct = Math.min(100, ((x.xp - x.lo) / (x.hi - x.lo)) * 100);
  return `<section class="card"><div class="level"><div class="lvl-badge">${x.lvl}</div>
    <div class="grow"><p><b>${LEVELS[Math.min(LEVELS.length - 1, x.lvl - 1)]}</b> <span class="muted num">· ${fmtN(x.xp)} XP</span></p>
      <div class="xp-track"><i style="width:${pct}%"></i></div>
      <p class="muted" style="font-size:.78rem">${fmtN(x.hi - x.xp)} XP para el nivel ${x.lvl + 1}</p></div>
    <div class="streak num">${x.streak}<small>días seguidos</small></div></div></section>`;
}

function metricsCard(d) {
  const st = S.settings, t = mealTotals(d);
  let glasses = '';
  for (let i = 0; i < Math.max(st.water, num(d.water)); i++) {
    glasses += `<button class="glass${i < num(d.water) ? ' on' : ''}" data-act="water-set" data-v="${i + 1}" aria-label="${i + 1} vasos"></button>`;
  }
  const food = st.trackKcal
    ? metric('Energía', 'var(--red)', t.kcal, st.kcal, 'kcal') + metric('Proteína', 'var(--blue)', t.p, st.protein, 'g')
    : metric('Comidas registradas', 'var(--red)', (d.meals || []).length, st.mealsGoal, '');
  return `<section class="card">${food}
    <div class="metric"><div class="m-top"><span class="dot" style="--c:var(--yellow)"></span><span class="m-name">Agua</span>
      <span class="m-val">${fmtN(d.water)} <small>/ ${st.water} vasos</small></span>
      <button class="btn small ghost" data-act="water" data-v="-1" aria-label="Quitar un vaso">−</button>
      <button class="btn small" data-act="water" data-v="1" aria-label="Añadir un vaso">+1</button></div>
      <div class="glasses">${glasses}</div></div>
    <div class="metric"><div class="m-top"><span class="dot" style="--c:var(--green)"></span><span class="m-name">Entrenos esta semana</span>
      <span class="m-val">${weekCount(ui.cur)} <small>/ ${st.weekly}</small></span></div>${weekDots(ui.cur)}</div></section>`;
}

function goalsCard() {
  const daily = getGoals().filter((g) => g.period === 'day');
  const body = daily.length
    ? '<div class="list">' + daily.map((g) => goalRow(g, ui.cur)).join('') + '</div>'
    : '<p class="empty">Crea tus propias metas diarias, semanales, mensuales o anuales en la pestaña Metas.</p>';
  return `<section class="card"><div class="row between"><h2>Metas de hoy</h2><button class="btn small ghost" data-act="tab" data-v="metas">Ver todas</button></div>${body}</section>`;
}

function summaryCard(d) {
  const t = mealTotals(d);
  let rows = '';
  (d.workouts || []).forEach((w) => {
    const ex = w.exercises || [];
    const info = [w.min ? w.min + ' min' : '', ex.length ? ex.length + ' ejercicios' : '', sessionVolume(w) ? fmtN(sessionVolume(w)) + ' kg movidos' : '', sessionKm(w) ? fmtN(sessionKm(w), 1) + ' km' : ''].filter(Boolean).join(' · ');
    rows += `<div class="item"><span class="dot" style="--c:var(--green)"></span><div class="grow"><p><b>${esc(w.name || 'Entreno')}</b></p><p class="muted small">${info}</p></div></div>`;
  });
  if ((d.meals || []).length) {
    rows += `<div class="item"><span class="dot" style="--c:var(--red)"></span><div class="grow"><p><b>${d.meals.length} comidas registradas</b></p>
      ${S.settings.trackKcal && t.kcal ? `<p class="muted small">${fmtN(t.kcal)} kcal · ${fmtN(t.p)} g proteína</p>` : ''}</div></div>`;
  }
  return `<section class="card"><h2>Resumen</h2><div class="list">${rows || '<p class="empty">Aún no hay nada registrado este día.</p>'}</div></section>`;
}

function weightCard(d) {
  const lastW = sortedKeys().filter((k) => k <= ui.cur && S.days[k].weight).pop();
  return `<section class="card"><div class="row between"><h2>Peso corporal</h2>
    ${lastW && lastW !== ui.cur ? `<span class="muted small">Último: ${fmtN(S.days[lastW].weight, 1)} kg (${fmtShort(lastW)})</span>` : ''}</div>
    <div class="row"><input id="wt" type="text" inputmode="decimal" placeholder="Ej. 63,8" value="${inputVal(d.weight)}" style="max-width:140px"><span class="muted">kg</span>
    <button class="btn small" data-act="save-wt">Guardar</button><button class="btn small ghost" data-act="tab" data-v="cuerpo">Medidas →</button></div></section>`;
}

export function viewHoy() {
  const d = getDay(ui.cur);
  return demoBanner() + dayNav('Hoy') + barCard(d) + levelCard() + metricsCard(d)
    + '<div class="quick"><button class="btn primary" data-act="new-sess">+ Registrar entreno</button><button class="btn" data-act="new-meal">+ Añadir comida</button></div>'
    + goalsCard() + supplementsCard(d) + summaryCard(d) + weightCard(d);
}
