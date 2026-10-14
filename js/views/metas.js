/** Pantalla METAS: metas propias por periodo, metas automáticas y datos */
import { PERIODS } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { getDay, sortedKeys } from '../core/days.js';
import { esc, fmtN, num, todayKey } from '../core/utils.js';
import { getGoals, getGoalValue, isGoalDone, periodKey, periodLabel } from '../domain/goals.js';
import { mealTotals } from '../domain/nutrition.js';
import { getSupps } from '../domain/supplements.js';
import { sessionKm, sessionVolume, weekCount } from '../domain/training.js';
import { demoBanner, goalRow, metric, weekDots } from '../ui/components.js';

const PLACEHOLDER = { day: 'Ej. Estirar 10 minutos', week: 'Ej. Salir a correr', month: 'Ej. Correr', year: 'Ej. Conseguir una dominada' };

/** Lo que la app cuenta sola en cada periodo */
function autoSection(per, k) {
  const st = S.settings;
  if (per === 'day') {
    const d = getDay(k), t = mealTotals(d), sp = getSupps();
    const food = st.trackKcal
      ? metric('Energía', 'var(--red)', t.kcal, st.kcal, 'kcal') + metric('Proteína', 'var(--blue)', t.p, st.protein, 'g')
      : metric('Comidas registradas', 'var(--red)', (d.meals || []).length, st.mealsGoal, '');
    const supps = sp.length ? metric('Suplementos', 'var(--orange)', sp.filter((s) => d.supps && d.supps[s.id]).length, sp.length, '') : '';
    const inputs = st.trackKcal
      ? `<label class="field"><span>Energía diaria (kcal)</span><input id="g-kcal" type="number" inputmode="numeric" value="${st.kcal}"></label>
         <label class="field"><span>Proteína diaria (g)</span><input id="g-protein" type="number" inputmode="numeric" value="${st.protein}"></label>`
      : `<label class="field"><span>Comidas al día</span><input id="g-mealsGoal" type="number" inputmode="numeric" value="${st.mealsGoal}"></label>`;
    return food + metric('Agua', 'var(--yellow)', num(d.water), st.water, 'vasos') + supps
      + `<details><summary class="linkish" style="cursor:pointer">Cambiar estas cifras</summary>
         <div class="grid2" style="margin-top:10px">${inputs}<label class="field"><span>Agua (vasos de 250 ml)</span><input id="g-water" type="number" inputmode="numeric" value="${st.water}"></label></div>
         <p class="hint" style="margin-top:8px">Pon cifras orientativas que te sirvan. Un profesional de nutrición o deporte puede ayudarte a ajustarlas.</p></details>`;
  }
  if (per === 'week') {
    return metric('Entrenos', 'var(--green)', weekCount(k), st.weekly, '') + weekDots(k)
      + `<label class="field" style="max-width:220px"><span>Entrenos por semana</span><input id="g-weekly" type="number" inputmode="numeric" value="${st.weekly}"></label>`;
  }
  const prefix = per === 'month' ? k.slice(0, 7) : k.slice(0, 4);
  let n = 0, km = 0, vol = 0;
  sortedKeys().filter((x) => x.startsWith(prefix)).forEach((x) => (S.days[x].workouts || []).forEach((w) => { n++; km += sessionKm(w); vol += sessionVolume(w); }));
  return per === 'month'
    ? `<div class="grid2"><div><p class="label">Entrenos este mes</p><p class="big num">${n}</p></div><div><p class="label">Km este mes</p><p class="big num">${fmtN(km, 1)}</p></div></div>`
    : `<div class="grid2"><div><p class="label">Entrenos este año</p><p class="big num">${n}</p></div><div><p class="label">Kilos movidos</p><p class="big num">${fmtN(vol)}</p></div></div>`;
}

function dataSection() {
  const status = S.mode === 'db'
    ? '<span class="status" style="--c:var(--green)"><i></i>Guardado en tu cuenta. Lo verás igual en el móvil y en el ordenador.</span>'
    : '<span class="status" style="--c:var(--yellow)"><i></i>Guardado solo en este navegador.</span>';
  return `<section class="card"><h2>Tus datos</h2>${status}
    <div class="row"><button class="btn" data-act="export">Copiar copia de seguridad</button></div>
    <label class="field"><span>Restaurar desde una copia (pega aquí el texto)</span><textarea id="imp" placeholder='{"days":{...},"settings":{...}}'></textarea></label>
    <div class="row"><button class="btn" data-act="import">Restaurar</button><button class="btn danger" data-act="reset">Borrar todos mis datos</button></div></section>
    <section class="card"><h2>Cómo se calcula la XP</h2><p class="muted small">50 por entreno, 30 por récord, 15 por medición, 10 por cada meta cumplida y por cada día con comidas, con el agua cumplida o con la proteína cumplida, 5 por registrar el peso y 5 por cada día con todos los suplementos marcados. Un récord salta cuando tu mejor serie de un ejercicio supera el máximo estimado que tenías.</p></section>`;
}

export function viewMetas() {
  const per = ui.gPer, k = ui.gRef;
  const isCurrent = periodKey(per, k) === periodKey(per, todayKey());
  const goals = getGoals().filter((g) => g.period === per);
  const doneN = goals.filter((g) => isGoalDone(g, getGoalValue(g, k))).length;
  const perName = PERIODS.find((p) => p[0] === per)[1].toLowerCase().replace(/s$/, '');

  return '<h1>Metas</h1>' + demoBanner()
    + `<div class="chips" role="tablist">${PERIODS.map(([id, l]) => `<button class="chip" data-act="g-per" data-v="${id}" aria-pressed="${per === id}">${l}</button>`).join('')}</div>`
    + `<div class="dayhead"><button class="icon-btn" data-act="g-prev" aria-label="Anterior">‹</button>
        <div class="mid"><h2>${esc(periodLabel(per, k))}</h2><p>${goals.length ? `${doneN} de ${goals.length} metas cumplidas` : 'Sin metas propias todavía'}</p></div>
        <button class="icon-btn" data-act="g-next" aria-label="Siguiente"${isCurrent ? ' disabled' : ''}>›</button></div>`
    + `<section class="card"><h2>Tus metas</h2>
        ${goals.length ? '<div class="list">' + goals.map((g) => goalRow(g, k, { removable: true })).join('') + '</div>' : '<p class="empty">Escribe aquí abajo tu primera meta.</p>'}
        <div class="ex-card"><span class="label">Nueva meta ${perName}</span>
          <label class="field"><span>Qué quieres conseguir</span><input id="ng-text" placeholder="${PLACEHOLDER[per]}"></label>
          <div class="grid2"><label class="field"><span>Cifra objetivo (opcional)</span><input id="ng-target" inputmode="decimal" placeholder="Ej. 40"></label>
            <label class="field"><span>Unidad (opcional)</span><input id="ng-unit" placeholder="Ej. km, veces, páginas"></label></div>
          <p class="hint">Sin cifra, la marcas como hecha. Con cifra, vas sumando hasta llegar.</p>
          <button class="btn primary" data-act="g-add" style="justify-content:center">Añadir meta</button></div></section>`
    + `<section class="card"><div class="row between"><h2>Se cuentan solas</h2><span class="auto-tag">automático</span></div>${autoSection(per, k)}</section>`
    + dataSection();
}
