/** Pantalla ENTRENO: semana actual e historial de sesiones */
import { FEEL } from '../config/constants.js';
import { S } from '../core/state.js';
import { esc, fmtLong, fmtN, todayKey } from '../core/utils.js';
import { allSessions, computePRs, groupLabel, normName, sessionKm, sessionVolume, setsText, typeLabel, weekCount } from '../domain/training.js';
import { demoBanner, feelLegend, weekDots } from '../ui/components.js';
import { guidedCard } from './guided.js';

function exerciseLine(w, e, marks) {
  const f = FEEL[e.feel], isPr = marks[w.id + '|' + normName(e.name)];
  const meta = [e.equip, e.grip, e.hand && e.hand !== 'Ambas manos' ? e.hand : ''].filter(Boolean).join(' · ');
  return `<div class="ex-line">${f ? `<span class="dot" style="--c:${f[1]}" title="${f[0]}"></span>` : ''}<b>${esc(e.name)}</b>
    ${e.group ? `<span class="tag">${groupLabel(e.group)}</span>` : ''}<span class="muted num">${esc(setsText(e))}</span>
    ${meta ? `<span class="muted" style="font-size:.8rem">${esc(meta)}</span>` : ''}${isPr ? '<span class="tag pr">Récord</span>' : ''}</div>`;
}

function sessionBlock(w, marks) {
  const vol = sessionVolume(w), km = sessionKm(w);
  const info = [w.min ? w.min + ' min' : '', vol ? fmtN(vol) + ' kg' : '', km ? fmtN(km, 1) + ' km' : ''].filter(Boolean).join(' · ');
  return `<div class="sess"><div class="row between"><div class="row"><h3>${esc(w.name || typeLabel(w.type))}</h3><span class="tag">${typeLabel(w.type)}</span></div>
      <span class="muted num small">${info}</span></div>
    ${(w.exercises || []).map((e) => exerciseLine(w, e, marks)).join('')}
    ${w.notes ? `<p class="muted small">${esc(w.notes)}</p>` : ''}
    <div class="row"><button class="btn small" data-act="repeat" data-id="${w.id}" data-d="${w.date}">Repetir hoy</button>
      <button class="btn small ghost" data-act="edit-sess" data-id="${w.id}" data-d="${w.date}">Editar</button>
      <button class="btn small ghost danger" data-act="del-sess" data-id="${w.id}" data-d="${w.date}">Borrar</button></div></div>`;
}

export function viewEntreno() {
  const { marks } = computePRs();
  let html = '', lastDate = null;
  allSessions().reverse().slice(0, 40).forEach((w) => {
    if (w.date !== lastDate) { html += `<p class="date-head">${fmtLong(w.date)}</p>`; lastDate = w.date; }
    html += sessionBlock(w, marks);
  });
  return demoBanner()
    + '<div class="row between"><h1>Entreno</h1><button class="btn primary" data-act="new-sess">+ Nueva sesión</button></div>'
    + `<section class="card"><div class="row between"><span class="label">Esta semana</span><span class="num"><b>${weekCount(todayKey())}</b> <span class="muted">/ ${S.settings.weekly} sesiones</span></span></div>${weekDots(todayKey())}</section>`
    + guidedCard()
    + `<section class="card"><div class="row between"><h2>Historial</h2><span class="chart-legend">${feelLegend()}</span></div>
       ${html || '<p class="empty">Todavía no hay sesiones. Pulsa «Nueva sesión» para registrar la primera.</p>'}</section>`;
}
