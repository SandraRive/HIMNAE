/**
 * Metas propias por periodo.
 *
 * Meta = { id, text, period: 'day'|'week'|'month'|'year', target?, unit? }
 *  - Sin `target`: se marca como hecha (true).
 *  - Con `target`: se va sumando un número hasta llegar.
 *
 * Dónde se guarda el progreso:
 *  - Diarias → en el propio día (`día.goals[id]`).
 *  - Resto   → en ajustes, `settings.goalDone['id|W2026-10-12']` (semana),
 *              'id|M2026-10' (mes) o 'id|Y2026' (año).
 */
import { S } from '../core/state.js';
import { sortedKeys } from '../core/days.js';
import { mutateDay, setSettings } from '../core/storage.js';
import { DEMO_GOALS, DEMO_GOAL_DONE } from '../core/demo.js';
import { addDays, fmtLong, fmtShort, keyOf, num, parseK, todayKey, weekStart } from '../core/utils.js';

export const getGoals = () => {
  const own = S.settings.goals || [];
  return own.length ? own : S.demo ? DEMO_GOALS : [];
};
export const goalsAreDemo = () => !(S.settings.goals || []).length && S.demo;
export const isDemoGoal = (g) => String(g.id).startsWith('demo-');
export const findGoal = (id) => getGoals().find((g) => g.id === id);

export function periodKey(per, k) {
  if (per === 'day') return k;
  if (per === 'week') return 'W' + weekStart(k);
  if (per === 'month') return 'M' + k.slice(0, 7);
  return 'Y' + k.slice(0, 4);
}

/** Mueve una fecha `n` periodos hacia delante o hacia atrás */
export function shiftPeriod(per, k, n) {
  if (per === 'day') return addDays(k, n);
  if (per === 'week') return addDays(k, 7 * n);
  const d = parseK(k);
  if (per === 'month') return keyOf(new Date(d.getFullYear(), d.getMonth() + n, 1));
  return keyOf(new Date(d.getFullYear() + n, 0, 1));
}

export function periodLabel(per, k) {
  if (per === 'day') return k === todayKey() ? 'Hoy, ' + fmtLong(k) : fmtLong(k);
  if (per === 'week') { const a = weekStart(k); return `Semana del ${fmtShort(a)} al ${fmtShort(addDays(a, 6))}`; }
  if (per === 'month') return parseK(k).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return 'Año ' + k.slice(0, 4);
}

export function getGoalValue(g, k) {
  if (g.period === 'day') { const d = S.days[k]; return d && d.goals ? d.goals[g.id] : undefined; }
  const key = g.id + '|' + periodKey(g.period, k);
  return isDemoGoal(g) ? DEMO_GOAL_DONE[key] : (S.settings.goalDone || {})[key];
}

export const isGoalDone = (g, v) => (g.target ? num(v) >= num(g.target) : !!v);

export function setGoalValue(g, k, v) {
  if (g.period === 'day') {
    mutateDay(k, (d) => { d.goals = { ...(d.goals || {}) }; if (v) d.goals[g.id] = v; else delete d.goals[g.id]; });
    return;
  }
  const done = { ...(S.settings.goalDone || {}) }, key = g.id + '|' + periodKey(g.period, k);
  if (v) done[key] = v; else delete done[key];
  setSettings({ goalDone: done });
}

export function addGoal(goal) { setSettings({ goals: [...(S.settings.goals || []), goal] }); }
export function removeGoal(id) { setSettings({ goals: (S.settings.goals || []).filter((g) => g.id !== id) }); }

/** Total de metas cumplidas (para la XP y las medallas) */
export function goalsDoneCount() {
  const map = {}; getGoals().forEach((g) => (map[g.id] = g));
  let n = 0;
  sortedKeys().forEach((k) => Object.entries(S.days[k].goals || {}).forEach(([id, v]) => { if (map[id] && isGoalDone(map[id], v)) n++; }));
  const done = goalsAreDemo() ? DEMO_GOAL_DONE : S.settings.goalDone || {};
  Object.entries(done).forEach(([key, v]) => { const g = map[key.split('|')[0]]; if (g && isGoalDone(g, v)) n++; });
  return n;
}
