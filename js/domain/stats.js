/**
 * Estadísticas globales: rachas, XP, nivel y contadores para las medallas.
 */
import { XP } from '../config/constants.js';
import { S } from '../core/state.js';
import { sortedKeys } from '../core/days.js';
import { addDays, hasAny, num, todayKey, weekStart } from '../core/utils.js';
import { computePRs, sessionVolume, weekCount } from './training.js';
import { mealTotals } from './nutrition.js';
import { allSuppsTaken } from './supplements.js';
import { goalsDoneCount } from './goals.js';

/** Un día cuenta para la racha si tiene entreno o comidas */
const isActive = (k) => { const d = S.days[k]; return !!(d && ((d.workouts || []).length || (d.meals || []).length)); };

export function currentStreak() {
  let k = todayKey(); if (!isActive(k)) k = addDays(k, -1);
  let n = 0; while (isActive(k)) { n++; k = addDays(k, -1); }
  return n;
}

export function bestStreak() {
  let best = 0, run = 0, prev = null;
  sortedKeys().forEach((k) => { if (!isActive(k)) return; run = prev && addDays(prev, 1) === k ? run + 1 : 1; prev = k; best = Math.max(best, run); });
  return best;
}

export function stats() {
  const keys = sortedKeys(), st = S.settings, pr = computePRs();
  let workouts = 0, mealDays = 0, waterDays = 0, protDays = 0, weights = 0, bigSession = 0, suppDays = 0, measN = 0;
  let suppRun = 0, suppBest = 0, prevSupp = null;

  keys.forEach((k) => {
    const d = S.days[k];
    workouts += (d.workouts || []).length;
    if ((d.meals || []).length) mealDays++;
    if (num(d.water) >= st.water) waterDays++;
    if (st.trackKcal && mealTotals(d).p >= st.protein) protDays++;
    if (d.weight) weights++;
    if (hasAny(d.measures)) measN++;
    (d.workouts || []).forEach((w) => (bigSession = Math.max(bigSession, sessionVolume(w))));
    if (allSuppsTaken(d)) {
      suppDays++; suppRun = prevSupp && addDays(prevSupp, 1) === k ? suppRun + 1 : 1; prevSupp = k; suppBest = Math.max(suppBest, suppRun);
    }
  });

  const weeksMet = new Set(); keys.forEach((k) => { if (weekCount(k) >= st.weekly) weeksMet.add(weekStart(k)); });
  const goalsN = goalsDoneCount();

  const xp = workouts * XP.workout + mealDays * XP.mealDay + waterDays * XP.waterDay + protDays * XP.proteinDay
    + weights * XP.weight + suppDays * XP.suppDay + measN * XP.measure + goalsN * XP.goal + pr.prs.length * XP.pr;
  // Cada nivel pide 100 XP más que el anterior
  const lvl = Math.floor((Math.sqrt(1 + (8 * xp) / 100) - 1) / 2) + 1;
  const lo = (100 * (lvl - 1) * lvl) / 2, hi = (100 * lvl * (lvl + 1)) / 2;

  return {
    workouts, mealDays, waterDays, protDays, weights, bigSession, suppDays, suppBest, measN, goalsN,
    prCount: pr.prs.length, weeksMet: weeksMet.size, xp, lvl, lo, hi,
    streak: currentStreak(), best: bestStreak(), pr,
  };
}
