/** Pantalla PROGRESO: pesos por ejercicio, músculos, constancia, volumen, marcas y medallas */
import { FEEL } from '../config/constants.js';
import { S, ui } from '../core/state.js';
import { addDays, esc, fmtN, fmtShort, todayKey, weekStart } from '../core/utils.js';
import { exerciseHistory, groupLabel, normName, sessionVolume, setsByGroup } from '../domain/training.js';
import { getSupps } from '../domain/supplements.js';
import { stats } from '../domain/stats.js';
import { barChart, lineChart } from '../ui/charts.js';
import { demoBanner, feelLegend } from '../ui/components.js';

const METRICS = [['max', 'Peso máximo'], ['rm', '1RM estimado'], ['vol', 'Volumen']];
const METRIC_HELP = {
  max: 'El kilo más alto que levantaste en cada sesión.',
  rm: 'Máximo estimado a 1 repetición (fórmula de Epley) de tu mejor serie.',
  vol: 'Kilos × repeticiones de todas las series.',
};

function weightsCard() {
  const hist = exerciseHistory(), groups = [...new Set(Object.values(hist).map((h) => h.group))];
  if (ui.progGroup !== 'todos' && !groups.includes(ui.progGroup)) ui.progGroup = 'todos';
  const list = Object.values(hist).filter((h) => ui.progGroup === 'todos' || h.group === ui.progGroup).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (!ui.exSel || !list.find((h) => h.name === ui.exSel)) ui.exSel = list[0]?.name || null;
  const H = ui.exSel ? hist[normName(ui.exSel)] : null;

  let body = '<p class="empty">Registra un entreno de fuerza para ver la evolución de tus pesos.</p>';
  if (H) {
    const pts = H.entries.map((e) => ({ k: e.k, y: Math.round(e[ui.progMetric] * 10) / 10, c: FEEL[e.feel] ? FEEL[e.feel][1] : 'var(--steel)' }));
    const recent = H.entries.slice(-5).reverse().map((e) => {
      const f = FEEL[e.feel];
      return `<div class="pr-row"><span class="num">${fmtShort(e.k)} · <b>${fmtN(e.best.kg, 2)} kg × ${fmtN(e.best.reps)}</b></span>
        <span>${f ? `<span class="tag" style="background:${f[1]};border-color:${f[1]};color:#fff">${f[0]}</span>` : '<span class="muted small">Sin valorar</span>'}</span></div>`;
    }).join('');
    const last = H.entries[H.entries.length - 1];
    body = `<div class="chips">${METRICS.map(([id, l]) => `<button class="chip" data-act="p-metric" data-v="${id}" aria-pressed="${ui.progMetric === id}">${l}</button>`).join('')}</div>
      ${lineChart([{ pts, color: 'var(--red)' }], { unit: 'kg', dec: 1 })}
      <div class="chart-legend">${feelLegend()}<span><i class="dot" style="--c:var(--steel)"></i>Sin valorar</span></div>
      <p class="muted small">${METRIC_HELP[ui.progMetric]}</p><div>${recent}</div>
      ${last && FEEL[last.feel] ? `<p class="hint"><b>Próxima vez:</b> ${FEEL[last.feel][2]}</p>` : ''}`;
  }
  const groupChips = groups.length
    ? `<div class="chips"><button class="chip" data-act="p-group" data-v="todos" aria-pressed="${ui.progGroup === 'todos'}">Todos</button>${groups.map((g) => `<button class="chip" data-act="p-group" data-v="${g}" aria-pressed="${ui.progGroup === g}">${groupLabel(g)}</button>`).join('')}</div>` : '';
  const select = list.length ? `<select id="exsel" aria-label="Ejercicio">${list.map((e) => `<option${e.name === ui.exSel ? ' selected' : ''}>${esc(e.name)}</option>`).join('')}</select>` : '';
  return `<section class="card"><h2>Progreso de pesos</h2>${groupChips}${select}${body}</section>`;
}

function musclesCard() {
  const arr = Object.entries(setsByGroup(addDays(todayKey(), -29))).sort((a, b) => b[1] - a[1]), max = Math.max(1, ...arr.map((a) => a[1]));
  const body = arr.length
    ? arr.map(([g, n]) => `<div class="hbar"><span>${groupLabel(g) || 'Otro'}</span><div class="track"><i style="width:${(n / max) * 100}%;background:var(--green)"></i></div><span class="num muted">${n}</span></div>`).join('') + '<p class="muted small">Número de series por grupo muscular.</p>'
    : '<p class="empty">Indica el grupo muscular al registrar ejercicios y verás aquí el reparto.</p>';
  return `<section class="card"><h2>Músculos trabajados · 30 días</h2>${body}</section>`;
}

function heatmapCard() {
  const today = todayKey(), start = addDays(weekStart(today), -77);
  let cells = '';
  ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach((l, r) => {
    cells += `<span>${r % 2 === 0 ? l : ''}</span>`;
    for (let c = 0; c < 12; c++) {
      const k = addDays(start, c * 7 + r), d = S.days[k];
      let lv = 0;
      if (d) { const wo = (d.workouts || []).length, me = (d.meals || []).length; lv = wo && me ? 3 : wo ? 2 : me ? 1 : 0; }
      cells += `<i class="l${lv}${k > today ? ' fut' : ''}" title="${fmtShort(k)}"></i>`;
    }
  });
  return `<section class="card"><h2>Constancia · 12 semanas</h2><div class="heat">${cells}</div>
    <p class="muted" style="font-size:.75rem">Más claro: solo comidas · intermedio: solo entreno · intenso: entreno y comidas</p></section>`;
}

function volumeCard() {
  const ws = weekStart(todayKey()), items = [];
  for (let i = 7; i >= 0; i--) {
    const start = addDays(ws, -7 * i); let v = 0;
    for (let j = 0; j < 7; j++) { const d = S.days[addDays(start, j)]; if (d) (d.workouts || []).forEach((w) => (v += sessionVolume(w))); }
    items.push({ label: fmtShort(start), v: Math.round(v) });
  }
  return `<section class="card"><h2>Volumen semanal</h2><p class="muted small">Kilos totales movidos (peso × repeticiones) por semana.</p>${barChart(items)}</section>`;
}

function supplementsCard() {
  const sp = getSupps(); if (!sp.length) return '';
  const today = todayKey();
  const rows = sp.map((s) => {
    let n = 0; for (let i = 0; i < 30; i++) { const d = S.days[addDays(today, -i)]; if (d && d.supps && d.supps[s.id]) n++; }
    return `<div class="adh"><p><b>${esc(s.name)}</b></p><div class="track"><i style="width:${(n / 30) * 100}%;background:var(--orange)"></i></div><span class="num muted">${n}/30</span></div>`;
  }).join('');
  return `<section class="card"><h2>Suplementación · 30 días</h2><div>${rows}</div></section>`;
}

function recordsCard(x) {
  const prs = Object.values(x.pr.best).sort((a, b) => b.v - a.v).slice(0, 8);
  const body = prs.length
    ? '<div>' + prs.map((p) => `<div class="pr-row"><span><b>${esc(p.name)}</b> <span class="muted num">${fmtN(p.set.kg, 2)} kg × ${fmtN(p.set.reps)}</span></span><span class="num muted">≈ ${fmtN(p.v, 1)} kg · ${fmtShort(p.date)}</span></div>`).join('') + '</div>'
    : '<p class="empty">Aquí aparecerán tus mejores series.</p>';
  return `<section class="card"><h2>Tus marcas</h2>${body}</section>`;
}

function badgesCard(x) {
  const badges = [
    ['1', 'Primer entreno', x.workouts >= 1, 'var(--green)'], ['10', '10 entrenos', x.workouts >= 10, 'var(--green)'], ['50', '50 entrenos', x.workouts >= 50, 'var(--green)'],
    ['3d', 'Racha de 3 días', x.best >= 3, 'var(--red)'], ['7d', 'Racha de 7 días', x.best >= 7, 'var(--red)'], ['30d', 'Racha de 30 días', x.best >= 30, 'var(--red)'],
    ['PR', 'Primer récord', x.prCount >= 1, 'var(--yellow)'], ['10PR', '10 récords', x.prCount >= 10, 'var(--yellow)'],
    ['H₂O', '7 días hidratada', x.waterDays >= 7, 'var(--blue)'], ['S', 'Semana completa', x.weeksMet >= 1, 'var(--green)'], ['1t', 'Sesión de 1.000 kg', x.bigSession >= 1000, 'var(--steel)'],
    ['cm', 'Primera medición', x.measN >= 1, 'var(--orange)'], ['4cm', '4 mediciones', x.measN >= 4, 'var(--orange)'],
    ['★', 'Primera meta', x.goalsN >= 1, 'var(--blue)'], ['25★', '25 metas', x.goalsN >= 25, 'var(--blue)'],
    ['7✓', 'Suplementos 7 días seguidos', x.suppBest >= 7, 'var(--orange)'],
  ];
  return `<section class="card"><h2>Medallas</h2><div class="badges">${badges.map((b) => `<div class="badge${b[2] ? ' on' : ''}" style="--c:${b[3]}"><div class="medal">${b[0]}</div>${b[1]}</div>`).join('')}</div></section>`;
}

export function viewProgreso() {
  const x = stats();
  const big = (l, v, u = '') => `<div><p class="label">${l}</p><p class="big">${v}${u ? ` <small class="muted" style="font-size:1rem">${u}</small>` : ''}</p></div>`;
  return demoBanner() + '<h1>Progreso</h1>'
    + `<section class="card"><div class="grid4">${big('Entrenos', x.workouts)}${big('Récords', x.prCount)}${big('Mejor racha', x.best, 'días')}${big('Nivel', x.lvl)}</div></section>`
    + weightsCard() + musclesCard() + heatmapCard() + volumeCard() + supplementsCard() + recordsCard(x) + badgesCard(x);
}
