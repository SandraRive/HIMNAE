/**
 * Reproductor del entreno guiado (pantalla completa).
 *
 * Recorre los pasos del circuito con un temporizador: animación del ejercicio,
 * cuenta atrás, descansos con vista previa del siguiente, pitidos en 3-2-1,
 * pausa, anterior/siguiente y pantalla final para guardar en el historial.
 */
import { FEEL } from '../config/constants.js';
import { esc, fmtDur, toast, todayKey } from '../core/utils.js';
import { mutateDay } from '../core/storage.js';
import { circuitSteps, circuitToSession, exerciseSteps, getExercise, typeById } from '../domain/circuits.js';
import { animate } from '../ui/animator.js';

const el = () => document.getElementById('player');
let P = null; // estado del reproductor mientras está abierto

/* ---------- Sonido y pantalla encendida ---------- */
let audio = null;
function beep(freq = 880, ms = 120) {
  if (!P || P.muted) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + ms / 1000);
  } catch (e) { /* sin sonido */ }
}
async function keepAwake() { try { P.wake = await navigator.wakeLock?.request('screen'); } catch (e) { /* no disponible */ } }
function releaseAwake() { try { P?.wake?.release(); } catch (e) { /* nada */ } }

/* ---------- Pintado ---------- */
const youtube = (name) => `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' ejercicio técnica')}`;

function renderStep() {
  const s = P.steps[P.i], ex = getExercise(s.ex), type = typeById(P.circuit.type);
  const isRest = s.kind === 'rest', total = exerciseSteps(P.steps);
  const nDone = P.steps.slice(0, P.i).filter((x) => x.kind !== 'rest').length + (isRest ? 0 : 1);
  const head = s.kind === 'warm' ? 'Calentamiento' : isRest ? s.label : `Ronda ${s.round}/${P.circuit.rounds}`;
  el().innerHTML = `
    <div class="pl-top">
      <button class="icon-btn" data-act="pl-menu" aria-label="Pausar y ver opciones">✕</button>
      <div class="pl-title"><b>${esc(type.label)}</b><span>${esc(head)}</span></div>
      <button class="icon-btn" data-act="pl-mute" aria-label="${P.muted ? 'Activar sonido' : 'Silenciar'}">${P.muted ? '🔇' : '🔊'}</button>
    </div>
    <div class="pl-progress"><i style="width:${(P.i / P.steps.length) * 100}%"></i></div>
    <div class="pl-body${isRest ? ' rest' : ''}">
      <p class="pl-count">${isRest ? 'Siguiente' : `Ejercicio ${nDone}/${total}`}</p>
      <h2 class="pl-name">${esc(ex.name)}</h2>
      <div class="pl-anim" id="pl-anim"></div>
      <div class="chips pl-muscles">${ex.muscles.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
      <div class="pl-timer num" id="pl-timer">${fmtDur(P.left)}</div>
      <p class="pl-hint">${isRest ? 'Respira y prepárate' : ex.reps ? `≈ ${ex.reps} repeticiones con buena técnica` : '¡Dale a tope!'}</p>
      <ul class="pl-tips">${ex.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <a class="linkish" href="${youtube(ex.name)}" target="_blank" rel="noopener">Ver vídeo de la técnica ↗</a>
    </div>
    <div class="pl-controls">
      <button class="icon-btn big" data-act="pl-prev" aria-label="Anterior"${P.i === 0 ? ' disabled' : ''}>⏮</button>
      <button class="btn primary pl-play" data-act="pl-toggle">${P.paused ? '▶ Seguir' : '⏸ Pausa'}</button>
      <button class="icon-btn big" data-act="pl-next" aria-label="Siguiente">⏭</button>
    </div>
    ${P.menu ? `<div class="pl-menu card"><h3>Entreno en pausa</h3>
      <button class="btn primary" data-act="pl-resume">Seguir entrenando</button>
      <button class="btn" data-act="pl-finish">Terminar y guardar lo hecho</button>
      <button class="btn danger" data-act="pl-quit">Salir sin guardar</button></div>` : ''}`;
  P.stopAnim?.();
  P.stopAnim = animate(document.getElementById('pl-anim'), ex);
}

function renderEnd() {
  P.stopAnim?.(); P.stopAnim = null;
  const done = P.steps.filter((s, i) => i < P.i && s.kind !== 'rest').length;
  el().innerHTML = `
    <div class="pl-top"><span></span><div class="pl-title"><b>¡Entreno completado!</b><span>${esc(typeById(P.circuit.type).label)}</span></div><span></span></div>
    <div class="pl-body pl-end">
      <div class="pl-medal">✓</div>
      <div class="grid2"><div><p class="label">Tiempo</p><p class="big num">${fmtDur(P.elapsed)}</p></div><div><p class="label">Ejercicios hechos</p><p class="big num">${done}</p></div></div>
      <p class="label">¿Cómo te ha ido?</p>
      <div class="chips">${Object.entries(FEEL).map(([id, f]) => `<button class="chip feel" style="--c:${f[1]}" data-act="pl-feel" data-v="${id}" aria-pressed="${P.feel === id}">${f[0]}</button>`).join('')}</div>
      <button class="btn primary" data-act="pl-save" style="justify-content:center;padding:13px">Guardar en mi historial</button>
      <button class="btn ghost" data-act="pl-quit">Cerrar sin guardar</button>
    </div>`;
}

/* ---------- Temporizador ---------- */
function goTo(i) {
  if (i >= P.steps.length) { P.i = P.steps.length; P.finished = true; beep(1046, 400); renderEnd(); return; }
  P.i = Math.max(0, i); P.left = P.steps[P.i].secs; P.lastBeep = null;
  if (P.steps[P.i].kind !== 'rest') beep(988, 220);
  renderStep();
}

function tick() {
  if (!P || P.paused || P.finished) return;
  const now = Date.now(), dt = (now - P.last) / 1000; P.last = now;
  P.elapsed += dt; P.left -= dt;
  const secs = Math.ceil(P.left);
  if (secs <= 3 && secs > 0 && P.lastBeep !== secs) { P.lastBeep = secs; beep(660, 90); }
  if (P.left <= 0) { goTo(P.i + 1); return; }
  const t = document.getElementById('pl-timer'); if (t) t.textContent = fmtDur(Math.max(0, P.left));
}

/* ---------- API ---------- */
export function startPlayer(circuit) {
  P = { circuit, steps: circuitSteps(circuit), i: 0, left: 0, elapsed: 0, paused: false, muted: false, menu: false, feel: '', last: Date.now() };
  el().hidden = false; document.body.style.overflow = 'hidden';
  keepAwake(); beep(0, 1); // desbloquea el audio con el toque de "Empezar"
  P.timer = setInterval(tick, 200);
  goTo(0);
}

function closePlayer() {
  if (!P) return;
  clearInterval(P.timer); P.stopAnim?.(); releaseAwake();
  P = null; el().hidden = true; el().innerHTML = ''; document.body.style.overflow = '';
}

function save() {
  const done = P.steps.slice(0, P.i);
  if (!done.some((s) => s.kind === 'work')) { toast('Aún no has hecho ningún ejercicio'); return; }
  const session = circuitToSession(P.circuit, done, P.elapsed, P.feel);
  mutateDay(todayKey(), (d) => d.workouts.push(session));
  closePlayer(); toast('Entreno guardado · +50 XP');
}

export const playerActions = {
  'pl-toggle': () => { P.paused = !P.paused; P.last = Date.now(); renderStep(); },
  'pl-prev': () => goTo(P.i - 1),
  'pl-next': () => goTo(P.i + 1),
  'pl-mute': () => { P.muted = !P.muted; renderStep(); },
  'pl-menu': () => { P.paused = true; P.menu = true; renderStep(); },
  'pl-resume': () => { P.paused = false; P.menu = false; P.last = Date.now(); renderStep(); },
  'pl-finish': () => { P.finished = true; P.menu = false; renderEnd(); },
  'pl-quit': () => closePlayer(),
  'pl-feel': (b) => { P.feel = P.feel === b.dataset.v ? '' : b.dataset.v; renderEnd(); },
  'pl-save': () => save(),
};

export const playerIsOpen = () => !!P;
/** Espacio = pausa; flechas = anterior/siguiente */
export function onPlayerKey(e) {
  if (!P || P.finished || P.menu) return false;
  if (e.key === ' ') { e.preventDefault(); playerActions['pl-toggle'](); return true; }
  if (e.key === 'ArrowRight') { goTo(P.i + 1); return true; }
  if (e.key === 'ArrowLeft') { goTo(P.i - 1); return true; }
  if (e.key === 'Escape') { playerActions['pl-menu'](); return true; }
  return false;
}
