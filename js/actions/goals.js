/** Acciones de metas y de las cifras de los objetivos automáticos */
import { ui, notify } from '../core/state.js';
import { setSettings } from '../core/storage.js';
import { num, todayKey, toast, uid } from '../core/utils.js';
import { addGoal, findGoal, getGoalValue, isDemoGoal, periodKey, removeGoal, setGoalValue, shiftPeriod } from '../domain/goals.js';
import { confirmTap } from '../ui/confirm.js';

/** Si se toca una meta de ejemplo, se lleva a la usuaria a crear la suya */
function nudgeFromDemo() {
  toast('Estas metas son de ejemplo. Escribe la tuya abajo para empezar.');
  ui.view = 'metas'; notify();
  setTimeout(() => document.getElementById('ng-text')?.focus(), 50);
}

export const goalActions = {
  'g-per': (b) => { ui.gPer = b.dataset.v; notify(); },
  'g-prev': () => { ui.gRef = shiftPeriod(ui.gPer, ui.gRef, -1); notify(); },
  'g-next': () => {
    const next = shiftPeriod(ui.gPer, ui.gRef, 1);
    if (periodKey(ui.gPer, next) > periodKey(ui.gPer, todayKey())) return;
    ui.gRef = next > todayKey() ? todayKey() : next; notify();
  },
  'g-add': () => {
    const text = document.getElementById('ng-text').value.trim();
    if (!text) { toast('Escribe tu meta'); return; }
    const target = num(document.getElementById('ng-target').value), unit = document.getElementById('ng-unit').value.trim();
    const goal = { id: uid(), text, period: ui.gPer };
    if (target > 0) { goal.target = target; if (unit) goal.unit = unit; }
    addGoal(goal); toast('Meta añadida');
  },
  'g-tick': (b) => {
    const g = findGoal(b.dataset.id); if (!g) return;
    if (isDemoGoal(g)) return nudgeFromDemo();
    const nowDone = !getGoalValue(g, b.dataset.k);
    setGoalValue(g, b.dataset.k, nowDone ? true : null);
    if (nowDone) toast('¡Meta cumplida! +10 XP');
  },
  'g-inc': (b) => {
    const g = findGoal(b.dataset.id); if (!g) return;
    if (isDemoGoal(g)) return nudgeFromDemo();
    const v = num(getGoalValue(g, b.dataset.k)) + 1;
    setGoalValue(g, b.dataset.k, v);
    if (v >= num(g.target) && v - 1 < num(g.target)) toast('¡Meta cumplida! +10 XP');
  },
  'g-del': (b) => confirmTap(b, () => removeGoal(b.dataset.id)),
};

/** Casillas de cifras de objetivos automáticos (Metas → "Cambiar estas cifras") */
const SETTING_INPUTS = { 'g-kcal': 'kcal', 'g-protein': 'protein', 'g-water': 'water', 'g-weekly': 'weekly', 'g-mealsGoal': 'mealsGoal' };

export function onGoalsChange(t) {
  if (t.dataset && t.dataset.goal) {
    const g = findGoal(t.dataset.goal); if (!g) return true;
    if (isDemoGoal(g)) { nudgeFromDemo(); return true; }
    const v = num(t.value);
    setGoalValue(g, t.dataset.k, v || null);
    if (g.target && v >= num(g.target)) toast('¡Meta cumplida! +10 XP');
    return true;
  }
  if (SETTING_INPUTS[t.id]) {
    const v = Math.round(num(t.value));
    if (v > 0) { setSettings({ [SETTING_INPUTS[t.id]]: v }); toast('Objetivo actualizado'); }
    return true;
  }
  return false;
}
