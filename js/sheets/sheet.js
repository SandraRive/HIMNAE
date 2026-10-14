/**
 * Hoja inferior donde se abren los formularios.
 * Cada formulario vive en su propio archivo y se registra aquí por nombre.
 */
import { ui } from '../core/state.js';
import { getExercise } from '../domain/circuits.js';
import { animate } from '../ui/animator.js';
import { exerciseInfoSheet } from '../views/guided.js';
import { sessionSheet } from './session.js';
import { mealSheet } from './meal.js';
import { supplementSheet } from './supplement.js';

const SHEETS = { sess: sessionSheet, meal: mealSheet, supp: supplementSheet, exinfo: exerciseInfoSheet };

/** Algunas hojas tienen animación: se arranca al pintar y se para al cerrar */
let stopAnimation = null;

export function renderSheet() {
  stopAnimation?.(); stopAnimation = null;
  document.getElementById('sheetBody').innerHTML = SHEETS[ui.sheetKind]();
  const anim = document.getElementById('gx-anim');
  if (anim && ui.sheetKind === 'exinfo') stopAnimation = animate(anim, getExercise(ui.draft.id));
}

export function openSheet(kind, draft) {
  ui.sheetKind = kind; ui.draft = draft;
  renderSheet();
  document.getElementById('sheet').hidden = false;
  setTimeout(() => document.querySelector('#sheetBody [autofocus]')?.focus(), 30);
}

export function closeSheet() {
  stopAnimation?.(); stopAnimation = null;
  document.getElementById('sheet').hidden = true;
  ui.draft = null; ui.sheetKind = null;
}

export const sheetIsOpen = () => !document.getElementById('sheet').hidden;
