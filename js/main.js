/**
 * HIMNAE · Punto de entrada.
 * Carga los datos, pinta la pantalla activa y vuelve a pintarla cada vez que algo cambia.
 */
import { DEFAULT_SETTINGS } from './config/constants.js';
import { S, ui, subscribe } from './core/state.js';
import { connectCloud, loadLocal } from './core/storage.js';
import { buildDemoDays } from './core/demo.js';
import { esc } from './core/utils.js';
import { allSessions } from './domain/training.js';
import { knownFoods } from './domain/nutrition.js';
import { TAB_ICONS } from './ui/icons.js';
import { initEvents } from './events.js';
import { viewHoy } from './views/hoy.js';
import { viewEntreno } from './views/entreno.js';
import { viewComida } from './views/comida.js';
import { viewCuerpo } from './views/cuerpo.js';
import { viewMetas } from './views/metas.js';
import { viewProgreso } from './views/progreso.js';

/** Pestañas: [id, nombre, función que pinta la pantalla] */
const VIEWS = [
  ['hoy', 'Hoy', viewHoy],
  ['entreno', 'Entreno', viewEntreno],
  ['comida', 'Comida', viewComida],
  ['cuerpo', 'Cuerpo', viewCuerpo],
  ['metas', 'Metas', viewMetas],
  ['progreso', 'Progreso', viewProgreso],
];

function renderTabs() {
  document.getElementById('tabs').innerHTML = VIEWS.map(([id, label]) =>
    `<button class="tab" data-act="tab" data-v="${id}"${ui.view === id ? ' aria-current="page"' : ''}>${TAB_ICONS[id]}${label}</button>`).join('');
}

/** Sugerencias de los campos de texto (comidas y nombres de sesión ya usados) */
function renderSuggestions() {
  document.getElementById('foodlist').innerHTML = knownFoods().map((f) => `<option value="${esc(f.name)}">`).join('');
  const names = new Set(allSessions().map((w) => w.name).filter(Boolean));
  document.getElementById('sesslist').innerHTML = [...names].map((n) => `<option value="${esc(n)}">`).join('');
}

function render() {
  const view = VIEWS.find((v) => v[0] === ui.view) || VIEWS[0];
  document.getElementById('app').innerHTML = view[2]();
  renderTabs();
  renderSuggestions();
}

function loadData() {
  const local = loadLocal();
  if (local && local.days && Object.keys(local.days).length) { S.days = local.days; S.demo = false; }
  if (local && local.settings) S.settings = { ...DEFAULT_SETTINGS, ...local.settings };
  if (S.demo) S.days = buildDemoDays();
}

loadData();
subscribe(render);
initEvents();
render();
connectCloud();
