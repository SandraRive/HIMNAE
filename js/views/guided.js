/** Tarjeta "Entreno guiado" de la pantalla Entreno: elegir, ver el circuito y empezar */
import { ui } from '../core/state.js';
import { esc } from '../core/utils.js';
import { GUIDED_DURATIONS, GUIDED_EQUIPMENT, GUIDED_LEVELS, GUIDED_TYPES, getExercise, levelById, totalSeconds, typeById } from '../domain/circuits.js';
import { exerciseThumb } from '../ui/animator.js';

function exerciseRow(id, secs) {
  const ex = getExercise(id);
  return `<button class="gx-row" data-act="gx-info" data-id="${id}">
    <span class="gx-thumb">${exerciseThumb(ex)}</span>
    <span class="grow"><b>${esc(ex.name)}</b><span class="muted small">${ex.muscles.map(esc).join(' · ')}</span></span>
    <span class="num muted small">${secs} s</span></button>`;
}

function circuitPreview(c) {
  const type = typeById(c.type), mins = Math.round(totalSeconds(c) / 60);
  const level = c.type === 'movilidad' ? 'Movilidad' : levelById(c.level).label;
  return `<div class="gx-preview">
    <div class="row between"><div><h3>${esc(type.label)} · ${mins} min</h3>
      <p class="muted small">${c.rounds} ${c.rounds === 1 ? 'ronda' : 'rondas'} · ${c.work} s de ejercicio / ${c.rest} s de descanso · ${level}</p></div></div>
    ${c.warmup.length ? `<p class="label">Calentamiento</p><div class="gx-list">${c.warmup.map((id) => exerciseRow(id, 30)).join('')}</div>` : ''}
    <p class="label">Circuito ${c.rounds > 1 ? `· repetir ${c.rounds} veces` : ''}</p>
    <div class="gx-list">${c.exercises.map((id) => exerciseRow(id, c.work)).join('')}</div>
    <p class="hint">Toca un ejercicio para ver cómo se hace.</p>
    <div class="quick"><button class="btn" data-act="gx-new">↻ Otra combinación</button><button class="btn primary" data-act="gx-start">▶ Empezar</button></div>
  </div>`;
}

export function guidedCard() {
  const g = ui.guided, isMob = g.type === 'movilidad';
  const chip = (act, v, label, on) => `<button class="chip" data-act="${act}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  return `<section class="card gx">
    <div class="row between"><h2>Entreno guiado</h2><span class="auto-tag">te lo preparo yo</span></div>
    <p class="muted small">Elige qué te apetece y te monto un circuito con animaciones de cada ejercicio.</p>
    <div class="chips">${GUIDED_TYPES.map((t) => chip('gx-type', t.id, t.label, g.type === t.id)).join('')}</div>
    <div class="gx-opts">
      <div><p class="label">Duración</p><div class="chips">${GUIDED_DURATIONS.map((d) => chip('gx-dur', d, d + ' min', g.duration === d)).join('')}</div></div>
      ${isMob ? '' : `<div><p class="label">Nivel</p><div class="chips">${GUIDED_LEVELS.map((l) => chip('gx-level', l.id, l.label, g.level === l.id)).join('')}</div></div>`}
      <div><p class="label">Tengo</p><div class="chips">${GUIDED_EQUIPMENT.map(([id, l]) => chip('gx-equip', id, l, g.equip.includes(id))).join('')}</div></div>
    </div>
    ${g.circuit ? circuitPreview(g.circuit) : '<button class="btn primary" data-act="gx-new" style="justify-content:center;padding:13px">Crear circuito</button>'}
  </section>`;
}

/** Ficha de un ejercicio (se abre en la hoja inferior) */
export function exerciseInfoSheet() {
  const ex = getExercise(ui.draft.id);
  return `<div class="row between"><h2>${esc(ex.name)}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">✕</button></div>
    <div class="pl-anim" id="gx-anim"></div>
    <div class="chips">${ex.muscles.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
    <ul class="pl-tips">${ex.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    ${ex.reps ? `<p class="hint">Orientativo: ≈ ${ex.reps} repeticiones por serie.</p>` : ''}
    <a class="linkish" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' ejercicio técnica')}" target="_blank" rel="noopener">Ver vídeo de la técnica ↗</a>`;
}
