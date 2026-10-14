/**
 * Estado global de la app.
 *
 *  - `S`  → los datos de la usuaria (días y ajustes). Es lo que se guarda.
 *  - `ui` → el estado de la interfaz (pestaña, día visible, formulario abierto...). No se guarda.
 *
 * Cuando algo cambia se llama a `notify()` y todas las funciones suscritas
 * (en la práctica, `render()` de main.js) vuelven a pintar la pantalla.
 */
import { DEFAULT_SETTINGS } from '../config/constants.js';
import { todayKey } from './utils.js';

export const S = {
  days: {},                         // { 'AAAA-MM-DD': Día }
  settings: { ...DEFAULT_SETTINGS },
  demo: true,                       // true mientras se muestran datos de ejemplo
  mode: 'local',                    // 'local' (navegador) o 'db' (cuenta en claude.ai)
};

export const ui = {
  view: 'hoy',
  cur: todayKey(),          // día que se ve en Hoy y Comida
  draft: null,              // formulario abierto
  sheetKind: null,          // 'sess' | 'meal' | 'supp'
  quickSlot: null,          // franja elegida para las comidas frecuentes
  exSel: null,              // ejercicio elegido en Progreso
  progGroup: 'todos',
  progMetric: 'max',        // 'max' | 'rm' | 'vol'
  measDate: todayKey(),
  measSel: 'cintura',
  gPer: 'day',              // periodo visible en Metas
  gRef: todayKey(),
};

const listeners = new Set();
export const subscribe = (fn) => listeners.add(fn);
export const notify = () => listeners.forEach((fn) => fn());
