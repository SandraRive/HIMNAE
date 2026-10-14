/**
 * Conecta los eventos del navegador con las acciones.
 *
 * Todos los botones llevan `data-act="nombre"`. Un único listener de clic
 * busca ese nombre en ACTIONS y ejecuta la función correspondiente.
 * Para añadir un botón nuevo: ponle `data-act` y añade su función en el
 * archivo de acciones de su área.
 */
import { navigationActions } from './actions/navigation.js';
import { dayActions } from './actions/day.js';
import { trainingActions, onSessionInput, onSessionChange } from './actions/training.js';
import { nutritionActions, onMealInput, onNutritionChange } from './actions/nutrition.js';
import { supplementActions, onSupplementInput } from './actions/supplements.js';
import { bodyActions, onBodyChange, onBodyFocus, onBodyKey } from './actions/body.js';
import { goalActions, onGoalsChange } from './actions/goals.js';
import { progressActions, onProgressChange } from './actions/progress.js';
import { dataActions } from './actions/data.js';
import { closeSheet, sheetIsOpen } from './sheets/sheet.js';

const ACTIONS = {
  ...navigationActions, ...dayActions, ...trainingActions, ...nutritionActions,
  ...supplementActions, ...bodyActions, ...goalActions, ...progressActions, ...dataActions,
};

/** Al pulsar Intro en estos campos se pulsa el botón indicado */
const ENTER_SUBMITS = {
  'sp-name': 'supp-add', 'sp-dose': 'supp-add',
  'ng-text': 'g-add', 'ng-target': 'g-add', 'ng-unit': 'g-add',
  wt: 'save-wt',
};

const INPUT_HANDLERS = [onSessionInput, onMealInput, onSupplementInput];
const CHANGE_HANDLERS = [onSessionChange, onNutritionChange, onBodyChange, onGoalsChange, onProgressChange];

export function initEvents() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (btn && ACTIONS[btn.dataset.act]) ACTIONS[btn.dataset.act](btn);
  });

  document.addEventListener('input', (e) => {
    if (e.target.closest('#sheetBody')) INPUT_HANDLERS.forEach((fn) => fn(e.target));
  });

  document.addEventListener('change', (e) => {
    CHANGE_HANDLERS.some((fn) => fn(e.target));
  });

  document.addEventListener('focusin', (e) => onBodyFocus(e.target));

  document.addEventListener('keydown', (e) => {
    if (onBodyKey(e)) return;
    if (e.key === 'Escape' && sheetIsOpen()) { closeSheet(); return; }
    const act = e.key === 'Enter' && ENTER_SUBMITS[e.target.id];
    if (act) document.querySelector(`[data-act="${act}"]`)?.click();
  });
}
