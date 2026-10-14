/**
 * Formulario de sesión de entreno.
 * Trabaja sobre un borrador (`ui.draft`) y solo lo guarda al pulsar "Guardar sesión".
 */
import { EQUIP, EXERCISE_LIBRARY, FEEL, GRIP, GROUPS, HAND, TYPES } from '../config/constants.js';
import { ui } from '../core/state.js';
import { mutateDay } from '../core/storage.js';
import { clone, esc, fmtShort, num, toast, uid } from '../core/utils.js';
import { allSessions, computePRs, exKind, groupKind, groupLabel, lastTimeFor, sessionKm, setsText, typeLabel } from '../domain/training.js';
import { options } from '../ui/components.js';

/* ---------- Borradores ---------- */

/** Grupos que se ofrecen según el tipo de sesión ('Solo cardio' → solo cardio) */
export function groupsForType(type) {
  if (type === 'cardio') return GROUPS.filter((g) => g[2] === 'tiempo');
  if (type === 'fuerza') return GROUPS.filter((g) => !['cardio', 'hiit'].includes(g[0]));
  return GROUPS;
}

export const blankSet = (kind) => (kind === 'tiempo' ? { name: '', time: '', reps: '', rest: '' } : { kg: '', reps: '' });

export function newExercise(type) {
  const group = type === 'cardio' ? 'cardio' : '';
  const kind = group ? groupKind(group) : 'peso';
  return { group, name: '', kind, equip: '', grip: '', hand: '', feel: '', sets: [blankSet(kind)] };
}

/** Borrador nuevo, opcionalmente copiando una sesión (para "Repetir" o "Editar") */
export function newSessionDraft(src, date) {
  const d = { id: uid(), date, name: '', type: 'fuerza', min: '', km: '', notes: '', exercises: [] };
  if (src) {
    Object.assign(d, { name: src.name || '', type: src.type || 'fuerza', min: src.min || '', km: sessionKm(src) || '' });
    d.exercises = clone(src.exercises || []).map((e) => {
      const kind = exKind(e);
      return {
        group: e.group || '', name: e.name, kind, equip: e.equip || '', grip: e.grip || '', hand: e.hand || '', feel: '',
        sets: (e.sets || []).map((s) => (kind === 'tiempo' ? { name: s.name || '', time: s.time || '', reps: s.reps || '', rest: s.rest || '' } : { kg: s.kg, reps: s.reps })),
      };
    });
  }
  if (!d.exercises.length && (d.type === 'fuerza' || d.type === 'cardio')) d.exercises = [newExercise(d.type)];
  return d;
}

/** Texto de "Última vez..." con la recomendación según cómo fue */
export function lastTimeHint(i) {
  const dr = ui.draft, e = dr.exercises[i], lt = lastTimeFor(e.name, dr.date, dr.id);
  if (!lt) return '';
  const f = FEEL[lt.e.feel];
  return `Última vez (${fmtShort(lt.date)}): <b>${esc(setsText(lt.e))}</b>${f ? `<br><span style="color:${f[1]};font-weight:700">● ${f[0]}</span> · ${f[2]}` : ''}`;
}

/** Sugerencias de ejercicios: biblioteca del grupo + los que ya has usado */
function exerciseOptions(group) {
  const s = new Set(group ? EXERCISE_LIBRARY[group] || [] : Object.values(EXERCISE_LIBRARY).flat());
  allSessions().forEach((w) => (w.exercises || []).forEach((e) => { if (e.name && (!group || e.group === group)) s.add(e.name); }));
  return [...s];
}

/* ---------- Pintado ---------- */

function weightSets(e, i) {
  let h = `<div class="grid3">
      <select data-ex="${i}" data-k="equip" aria-label="Equipo">${options(EQUIP, e.equip, 'Equipo')}</select>
      <select data-ex="${i}" data-k="grip" aria-label="Agarre">${options(GRIP, e.grip, 'Agarre')}</select>
      <select data-ex="${i}" data-k="hand" aria-label="Mano">${options(HAND, e.hand, 'Mano')}</select></div>
    <div class="set-row"><span class="label" style="text-align:center">#</span><span class="label">Kg</span><span class="label">Reps</span><span></span></div>`;
  e.sets.forEach((s, j) => {
    h += `<div class="set-row"><span class="n">${j + 1}</span>
      <input inputmode="decimal" data-ex="${i}" data-set="${j}" data-k="kg" value="${s.kg === '' ? '' : esc(String(s.kg).replace('.', ','))}" aria-label="Kilos serie ${j + 1}">
      <input inputmode="numeric" data-ex="${i}" data-set="${j}" data-k="reps" value="${esc(s.reps)}" aria-label="Repeticiones serie ${j + 1}">
      <button class="btn small ghost" data-act="set-del" data-i="${i}" data-j="${j}" aria-label="Quitar serie">−</button></div>`;
  });
  return h;
}

function timeSets(e, i) {
  let h = '<div class="tset-row"><span></span><span class="label">Nombre</span><span class="label">Tiempo</span><span class="label">Reps</span><span class="label">Descanso</span><span></span></div>';
  e.sets.forEach((s, j) => {
    h += `<div class="tset-row"><span class="n">${j + 1}</span>
      <input data-ex="${i}" data-set="${j}" data-k="name" value="${esc(s.name)}" placeholder="${esc(e.name || 'Ej. Plancha')}" aria-label="Nombre serie ${j + 1}">
      <input data-ex="${i}" data-set="${j}" data-k="time" value="${esc(s.time)}" placeholder="0:45" aria-label="Tiempo serie ${j + 1}">
      <input inputmode="numeric" data-ex="${i}" data-set="${j}" data-k="reps" value="${esc(s.reps)}" placeholder="—" aria-label="Repeticiones serie ${j + 1}">
      <input data-ex="${i}" data-set="${j}" data-k="rest" value="${esc(s.rest)}" placeholder="0:30" aria-label="Descanso serie ${j + 1}">
      <button class="btn small ghost" data-act="set-del" data-i="${i}" data-j="${j}" aria-label="Quitar serie" style="padding:6px">−</button></div>`;
  });
  return h + '<p class="hint">Tiempo y descanso: 45s, 1:30 o 20min.</p>';
}

function exerciseCard(e, i, type) {
  const kind = exKind(e), allowed = groupsForType(type);
  // Si el ejercicio ya tenía un grupo que no encaja con el tipo, se mantiene en la lista
  const groups = e.group && !allowed.find((g) => g[0] === e.group) ? [...allowed, GROUPS.find((g) => g[0] === e.group)] : allowed;
  return `<div class="ex-card">
    <div class="row" style="flex-wrap:nowrap">
      <select data-ex="${i}" data-k="group" style="flex:0 1 140px;min-width:0" aria-label="Grupo muscular">${options(groups.map((g) => g[1]), groupLabel(e.group), type === 'cardio' ? 'Tipo' : 'Grupo')}</select>
      <input list="exl-${i}" placeholder="Ejercicio" data-ex="${i}" data-k="name" value="${esc(e.name)}" style="flex:1 1 0;min-width:0">
      <button class="icon-btn" data-act="ex-del" data-i="${i}" aria-label="Quitar ejercicio">✕</button></div>
    <datalist id="exl-${i}">${exerciseOptions(e.group).map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
    <p class="hint" id="hint-${i}">${lastTimeHint(i)}</p>
    ${kind === 'peso' ? weightSets(e, i) : timeSets(e, i)}
    <div class="row between"><button class="btn small" data-act="set-add" data-i="${i}">+ Serie</button>
      <button class="linkish" data-act="ex-kind" data-i="${i}">${kind === 'peso' ? 'Registrar por tiempo' : 'Registrar por peso'}</button></div>
    <div class="row"><span class="label">¿Cómo te ha ido?</span><div class="chips">
      ${Object.entries(FEEL).map(([id, f]) => `<button class="chip feel" style="--c:${f[1]}" data-act="ex-feel" data-i="${i}" data-v="${id}" aria-pressed="${e.feel === id}">${f[0]}</button>`).join('')}</div></div>
  </div>`;
}

export function sessionSheet() {
  const dr = ui.draft, showKm = ['cardio', 'mixto', 'deporte'].includes(dr.type);
  return `<div class="row between"><h2>${dr.editing ? 'Editar sesión' : 'Nueva sesión'}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">✕</button></div>
    <div class="grid2"><label class="field"><span>Nombre</span><input id="s-name" list="sesslist" placeholder="Ej. Pierna, Torso, Pádel" value="${esc(dr.name)}" autofocus></label>
      <label class="field"><span>Fecha</span><input id="s-date" type="date" value="${dr.date}"></label></div>
    <div class="chips" role="group" aria-label="Tipo">${TYPES.map(([id, l]) => `<button class="chip" data-act="s-type" data-v="${id}" aria-pressed="${dr.type === id}">${l}</button>`).join('')}</div>
    <div class="grid2"><label class="field"><span>Duración (min)</span><input id="s-min" inputmode="numeric" value="${esc(dr.min)}"></label>
      ${showKm ? `<label class="field"><span>Distancia (km, opcional)</span><input id="s-km" inputmode="decimal" value="${esc(dr.km)}"></label>` : ''}</div>
    ${dr.exercises.length ? '<span class="label">Ejercicios</span>' + dr.exercises.map((e, i) => exerciseCard(e, i, dr.type)).join('') : ''}
    <button class="btn" data-act="ex-add">+ Añadir ejercicio</button>
    <label class="field"><span>Notas</span><input id="s-notes" placeholder="Sensaciones, molestias, música..." value="${esc(dr.notes)}"></label>
    <button class="btn primary" data-act="save-sess" style="justify-content:center;padding:13px">Guardar sesión</button>`;
}

/* ---------- Guardado ---------- */

/** Limpia el borrador y lo convierte en una sesión. Devuelve null si está vacío. */
function draftToSession(dr) {
  const exercises = dr.exercises.map((e) => {
    const kind = exKind(e);
    const sets = kind === 'tiempo'
      ? e.sets.filter((s) => s.name || s.time || s.reps || s.rest).map((s) => ({ name: String(s.name).trim(), time: String(s.time).trim(), reps: String(s.reps).trim(), rest: String(s.rest).trim() }))
      : e.sets.filter((s) => num(s.kg) || num(s.reps)).map((s) => ({ kg: num(s.kg), reps: num(s.reps) }));
    const name = String(e.name).trim() || (kind === 'tiempo' && sets[0] && sets[0].name) || '';
    return { group: e.group || '', name, kind, equip: e.equip || '', grip: e.grip || '', hand: e.hand || '', feel: e.feel || '', sets };
  }).filter((e) => e.name);
  if (!exercises.length && !num(dr.min) && !num(dr.km)) return null;
  const w = { id: dr.id, name: String(dr.name).trim() || typeLabel(dr.type), type: dr.type, min: num(dr.min) || null, exercises, notes: String(dr.notes || '').trim() };
  if (num(dr.km)) w.km = num(dr.km);
  return w;
}

/** Guarda la sesión. Devuelve true si se guardó. */
export function saveSession() {
  const dr = ui.draft, w = draftToSession(dr);
  if (!w) { toast('Añade al menos un ejercicio o la duración'); return false; }
  const before = computePRs().prs.length;
  if (dr.editing && dr.origDate && dr.origDate !== dr.date) mutateDay(dr.origDate, (d) => { d.workouts = d.workouts.filter((x) => x.id !== dr.id); });
  mutateDay(dr.date, (d) => { const i = d.workouts.findIndex((x) => x.id === dr.id); if (i >= 0) d.workouts[i] = w; else d.workouts.push(w); });
  const newPRs = computePRs().prs.length - before;
  toast(newPRs > 0 ? `¡Nuevo récord! +${newPRs * 30} XP` : 'Sesión guardada · +50 XP');
  return true;
}
