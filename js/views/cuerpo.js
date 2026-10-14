/** Pantalla CUERPO: muñeco con medidas, evolución y tabla de historial */
import { MEASURES } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { getDay } from '../core/days.js';
import { fmtN, fmtShort, inputVal, num, todayKey } from '../core/utils.js';
import { measureByKey, measureDays, measureSeries, weightSeries } from '../domain/measures.js';
import { lineChart } from '../ui/charts.js';
import { demoBanner } from '../ui/components.js';
import { bodyFigure } from '../ui/figure.js';

/** Gráfica de la medida elegida (y su pareja derecha/izquierda si la tiene) */
export function measureChart() {
  const m = measureByKey(ui.measSel) || MEASURES[4];
  const series = [{ name: m.side || m.label, color: 'var(--accent)', pts: measureSeries(m.k) }];
  if (m.pair) series.push({ name: measureByKey(m.pair).side, color: 'var(--orange)', pts: measureSeries(m.pair), dash: true });
  const p = series[0].pts;
  let delta = '';
  if (p.length >= 2) {
    const dv = p[p.length - 1].y - p[0].y;
    delta = `<p class="small"><span class="muted">Desde el ${fmtShort(p[0].k)}:</span>
      <b class="num ${dv > 0 ? 'delta-up' : dv < 0 ? 'delta-down' : ''}">${dv > 0 ? '+' : ''}${fmtN(dv, 1)} cm</b>
      <span class="muted">(${fmtN(p[0].y, 1)} → ${fmtN(p[p.length - 1].y, 1)} cm)</span></p>`;
  }
  return `<h3>${m.label}</h3>${delta}${lineChart(series, { unit: 'cm', dec: 1 })}`;
}

/** Cambia la medida seleccionada sin repintar toda la pantalla (para no perder el foco) */
export function selectMeasure(k) {
  ui.measSel = k;
  document.querySelectorAll('.mk').forEach((el) => el.classList.toggle('sel', el.dataset.k === k));
  document.querySelectorAll('.mfield').forEach((el) => el.classList.toggle('sel', el.dataset.mk === k));
  document.querySelectorAll('.chip[data-act="meas-sel"]').forEach((el) => el.setAttribute('aria-pressed', el.dataset.k === k));
  const c = document.getElementById('measChart');
  if (c) c.innerHTML = measureChart();
}

function formCard() {
  const d = getDay(ui.measDate), mv = d.measures || {};
  const fields = MEASURES.map((m, i) => `<label class="field mfield${ui.measSel === m.k ? ' sel' : ''}" data-mk="${m.k}">
    <span><i class="ndot">${i + 1}</i>${m.label}</span><input id="ms-${m.k}" inputmode="decimal" placeholder="cm" value="${inputVal(mv[m.k])}"></label>`).join('');
  return `<section class="card"><div class="row between"><h2>Nueva medición</h2><span class="muted small">En centímetros</span></div>
    <div class="body-wrap">
      <div>${bodyFigure(ui.measSel, mv)}<p class="hint" style="text-align:center">Toca un número para ver dónde medir</p></div>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
        <div class="grid2"><label class="field"><span>Fecha</span><input id="m-date" type="date" value="${ui.measDate}" max="${todayKey()}"></label>
          <label class="field"><span>Peso (kg)</span><input id="mw" inputmode="decimal" placeholder="Ej. 63,8" value="${inputVal(d.weight)}"></label></div>
        <div class="meas-grid">${fields}</div>
        <p class="hint">Mide siempre a la misma hora y en el mismo punto. El brazo flexionado se mide en la parte más gruesa del bíceps, apretando.</p>
        <button class="btn primary" data-act="save-meas" style="justify-content:center;padding:12px">Guardar medición</button>
      </div></div></section>`;
}

function historyCard() {
  const keys = measureDays().reverse();
  if (!keys.length) return '<section class="card"><h2>Historial de medidas</h2><p class="empty">Cuando guardes tu primera medición aparecerá aquí.</p></section>';
  const rows = keys.map((k) => {
    const r = S.days[k];
    return `<tr><td>${fmtShort(k)} ${k.slice(0, 4)}</td><td>${r.weight ? fmtN(r.weight, 1) : '—'}</td>
      ${MEASURES.map((m) => `<td>${num(r.measures[m.k]) ? fmtN(r.measures[m.k], 1) : '—'}</td>`).join('')}
      <td><button class="btn small ghost" data-act="meas-edit" data-d="${k}">Editar</button></td></tr>`;
  }).join('');
  return `<section class="card"><h2>Historial de medidas</h2><div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Fecha</th><th>Peso</th>${MEASURES.map((m) => `<th>${m.short}</th>`).join('')}<th></th></tr></thead>
    <tbody>${rows}</tbody></table></div></section>`;
}

export function viewCuerpo() {
  const chips = MEASURES.map((m, i) => `<button class="chip" data-act="meas-sel" data-k="${m.k}" aria-pressed="${ui.measSel === m.k}">${i + 1} · ${m.short}</button>`).join('');
  return demoBanner() + '<h1>Cuerpo</h1>' + formCard()
    + `<section class="card"><h2>Evolución</h2><div class="chips">${chips}</div><div id="measChart">${measureChart()}</div></section>`
    + `<section class="card"><h2>Peso corporal</h2>${lineChart([{ pts: weightSeries(), color: 'var(--blue)' }], { unit: 'kg', dec: 1 })}</section>`
    + historyCard();
}
