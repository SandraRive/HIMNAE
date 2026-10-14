/**
 * Hoja inferior donde se abren los formularios.
 * Cada formulario vive en su propio archivo y se registra aquí por nombre.
 */
import { ui } from '../core/state.js';
import { sessionSheet } from './session.js';
import { mealSheet } from './meal.js';
import { supplementSheet } from './supplement.js';

const SHEETS = { sess: sessionSheet, meal: mealSheet, supp: supplementSheet };

export function renderSheet() {
  document.getElementById('sheetBody').innerHTML = SHEETS[ui.sheetKind]();
}

export function openSheet(kind, draft) {
  ui.sheetKind = kind; ui.draft = draft;
  renderSheet();
  document.getElementById('sheet').hidden = false;
  setTimeout(() => document.querySelector('#sheetBody [autofocus]')?.focus(), 30);
}

export function closeSheet() {
  document.getElementById('sheet').hidden = true;
  ui.draft = null; ui.sheetKind = null;
}

export const sheetIsOpen = () => !document.getElementById('sheet').hidden;
