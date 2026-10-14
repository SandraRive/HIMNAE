/** Acciones de entreno y del formulario de sesión */
import { GROUPS } from '../config/constants.js';
import { ui } from '../core/state.js';
import { mutateDay } from '../core/storage.js';
import { num, todayKey } from '../core/utils.js';
import { exKind, findSession, groupKind } from '../domain/training.js';
import { closeSheet, openSheet, renderSheet } from '../sheets/sheet.js';
import { blankSet, groupsForType, lastTimeHint, newExercise, newSessionDraft, saveSession } from '../sheets/session.js';
import { confirmTap } from '../ui/confirm.js';

const ex = (b) => ui.draft.exercises[num(b.dataset.i)];

export const trainingActions = {
  'new-sess': () => openSheet('sess', newSessionDraft(null, ui.view === 'hoy' ? ui.cur : todayKey())),
  repeat: (b) => openSheet('sess', newSessionDraft(findSession(b.dataset.d, b.dataset.id), todayKey())),
  'edit-sess': (b) => {
    const s = findSession(b.dataset.d, b.dataset.id); if (!s) return;
    const draft = newSessionDraft(s, b.dataset.d);
    draft.exercises.forEach((x, i) => (x.feel = (s.exercises[i] || {}).feel || ''));
    Object.assign(draft, { id: s.id, notes: s.notes || '', editing: true, origDate: b.dataset.d });
    openSheet('sess', draft);
  },
  'del-sess': (b) => confirmTap(b, () => mutateDay(b.dataset.d, (d) => { d.workouts = d.workouts.filter((w) => w.id !== b.dataset.id); })),

  's-type': (b) => {
    const dr = ui.draft; dr.type = b.dataset.v;
    const allowed = groupsForType(dr.type).map((g) => g[0]);
    // Ejercicios aún vacíos se adaptan al nuevo tipo
    dr.exercises.forEach((x) => {
      if (x.group && !allowed.includes(x.group) && !x.name) {
        x.group = dr.type === 'cardio' ? 'cardio' : ''; x.kind = x.group ? groupKind(x.group) : 'peso'; x.sets = [blankSet(x.kind)];
      }
    });
    if ((dr.type === 'fuerza' || dr.type === 'cardio') && !dr.exercises.length) dr.exercises.push(newExercise(dr.type));
    renderSheet();
  },
  'ex-add': () => {
    ui.draft.exercises.push(newExercise(ui.draft.type)); renderSheet();
    const selects = document.querySelectorAll('#sheetBody select[data-k="group"]'); selects[selects.length - 1]?.focus();
  },
  'ex-del': (b) => { ui.draft.exercises.splice(num(b.dataset.i), 1); renderSheet(); },
  'ex-kind': (b) => { const x = ex(b); x.kind = exKind(x) === 'peso' ? 'tiempo' : 'peso'; x.sets = [blankSet(x.kind)]; renderSheet(); },
  'ex-feel': (b) => { const x = ex(b); x.feel = x.feel === b.dataset.v ? '' : b.dataset.v; renderSheet(); },
  // La serie nueva copia los valores de la anterior
  'set-add': (b) => {
    const x = ex(b), last = x.sets[x.sets.length - 1] || blankSet(exKind(x));
    x.sets.push(exKind(x) === 'tiempo' ? { name: '', time: last.time, reps: last.reps, rest: last.rest } : { kg: last.kg, reps: last.reps });
    renderSheet();
  },
  'set-del': (b) => { const x = ex(b); x.sets.splice(num(b.dataset.j), 1); if (!x.sets.length) x.sets.push(blankSet(exKind(x))); renderSheet(); },
  'save-sess': () => { if (saveSession()) closeSheet(); },
};

/** Escritura en los campos del formulario de sesión */
export function onSessionInput(t) {
  if (ui.sheetKind !== 'sess') return;
  const dr = ui.draft;
  if (t.dataset.ex !== undefined) {
    const x = dr.exercises[num(t.dataset.ex)];
    if (t.dataset.set !== undefined) x.sets[num(t.dataset.set)][t.dataset.k] = t.value;
    else if (t.dataset.k === 'name') { x.name = t.value; const h = document.getElementById('hint-' + t.dataset.ex); if (h) h.innerHTML = lastTimeHint(num(t.dataset.ex)); }
    else if (t.dataset.k !== 'group') x[t.dataset.k] = t.value;
    return;
  }
  const fields = { 's-name': 'name', 's-min': 'min', 's-km': 'km', 's-notes': 'notes' };
  if (fields[t.id]) dr[fields[t.id]] = t.value;
  if (t.id === 's-date' && t.value) dr.date = t.value;
}

/** Cambio de grupo muscular: puede cambiar la forma de registrar las series */
export function onSessionChange(t) {
  if (ui.sheetKind !== 'sess' || t.dataset.k !== 'group' || t.dataset.ex === undefined) return false;
  const x = ui.draft.exercises[num(t.dataset.ex)], g = GROUPS.find((z) => z[1] === t.value);
  x.group = g ? g[0] : '';
  const newKind = x.group ? groupKind(x.group) : 'peso';
  const isEmpty = x.sets.every((s) => Object.values(s).every((v) => v === '' || v == null));
  if (newKind !== exKind(x) && isEmpty) { x.kind = newKind; x.sets = [blankSet(newKind)]; }
  renderSheet();
  return true;
}
