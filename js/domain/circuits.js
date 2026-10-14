/**
 * Entrenos guiados: genera un circuito según el tipo, la duración, el nivel
 * y el material disponible, lo convierte en pasos para el reproductor y,
 * al terminar, en una sesión del historial.
 */
import { GUIDED_EXERCISES } from '../config/guided-exercises.js';
import { uid } from '../core/utils.js';

export const GUIDED_TYPES = [
  { id: 'cardio', label: 'Cardio', tags: ['cardio'], count: 6, sessionType: 'cardio' },
  { id: 'hiit', label: 'HIIT', tags: ['hiit'], count: 5, sessionType: 'cardio' },
  { id: 'piernas', label: 'Piernas y glúteo', tags: ['piernas'], count: 5, sessionType: 'fuerza' },
  { id: 'core', label: 'Core', tags: ['core'], count: 5, sessionType: 'fuerza' },
  { id: 'superior', label: 'Tren superior', tags: ['superior'], count: 5, sessionType: 'fuerza' },
  { id: 'full', label: 'Full body', tags: ['piernas', 'core', 'superior', 'hiit'], count: 6, sessionType: 'mixto', balanced: true },
  { id: 'movilidad', label: 'Movilidad', tags: ['movilidad'], count: 6, sessionType: 'movilidad', noWarmup: true },
];

export const GUIDED_LEVELS = [
  { id: 'suave', label: 'Suave', work: 30, rest: 30 },
  { id: 'media', label: 'Media', work: 40, rest: 20 },
  { id: 'intensa', label: 'Intensa', work: 45, rest: 15 },
];

export const GUIDED_DURATIONS = [10, 20, 30];
export const GUIDED_EQUIPMENT = [['mancuernas', 'Mancuernas'], ['banda', 'Banda elástica']];

const ROUND_REST = 45, WARMUP_SECS = 30, WARMUP_COUNT = 2;

export const getExercise = (id) => GUIDED_EXERCISES[id];
export const typeById = (id) => GUIDED_TYPES.find((t) => t.id === id) || GUIDED_TYPES[0];
export const levelById = (id) => GUIDED_LEVELS.find((l) => l.id === id) || GUIDED_LEVELS[1];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const allowed = (ex, equip) => !ex.equip || equip.includes(ex.equip);

/** Elige los ejercicios del circuito */
function pickExercises(type, equip) {
  const pool = Object.keys(GUIDED_EXERCISES).filter((id) => {
    const ex = GUIDED_EXERCISES[id];
    return allowed(ex, equip) && ex.tags.some((t) => type.tags.includes(t));
  });
  if (!type.balanced) return shuffle(pool).slice(0, type.count);
  // Full body: un poco de todo, alternando zonas
  const byTag = type.tags.map((tag) => shuffle(pool.filter((id) => GUIDED_EXERCISES[id].tags.includes(tag))));
  const picked = [];
  for (let i = 0; picked.length < type.count && i < 20; i++) {
    const list = byTag[i % byTag.length], next = list.find((id) => !picked.includes(id));
    if (next) picked.push(next);
  }
  return picked;
}

/** Crea un circuito nuevo */
export function generateCircuit({ type: typeId, level: levelId, duration, equip }) {
  const type = typeById(typeId), level = type.id === 'movilidad' ? { id: 'movilidad', work: 40, rest: 10 } : levelById(levelId);
  const exercises = pickExercises(type, equip);
  const warmup = type.noWarmup ? [] : shuffle(Object.keys(GUIDED_EXERCISES).filter((id) => {
    const ex = GUIDED_EXERCISES[id];
    return ex.tags.includes('calentamiento') && allowed(ex, equip) && !exercises.includes(id);
  })).slice(0, WARMUP_COUNT);
  const roundSecs = exercises.length * (level.work + level.rest) + ROUND_REST;
  const rounds = Math.max(1, Math.round((duration * 60 - warmup.length * WARMUP_SECS) / roundSecs));
  return { id: uid(), type: type.id, level: level.id, duration, equip, warmup, exercises, work: level.work, rest: level.rest, rounds, roundRest: ROUND_REST };
}

/**
 * Lista de pasos para el reproductor.
 * Paso = { kind: 'warm' | 'work' | 'rest', ex, secs, round, n (número de ejercicio) }
 */
export function circuitSteps(c) {
  const steps = [];
  let n = 0;
  c.warmup.forEach((ex) => steps.push({ kind: 'warm', ex, secs: WARMUP_SECS, round: 0, n: ++n }));
  if (c.warmup.length) steps.push({ kind: 'rest', ex: c.exercises[0], secs: 15, round: 1, label: 'Prepárate' });
  for (let r = 1; r <= c.rounds; r++) {
    c.exercises.forEach((ex, i) => {
      steps.push({ kind: 'work', ex, secs: c.work, round: r, n: ++n });
      const lastInRound = i === c.exercises.length - 1, lastOfAll = lastInRound && r === c.rounds;
      if (lastOfAll) return;
      if (lastInRound) steps.push({ kind: 'rest', ex: c.exercises[0], secs: c.roundRest, round: r + 1, label: `Fin de la ronda ${r}` });
      else steps.push({ kind: 'rest', ex: c.exercises[i + 1], secs: c.rest, round: r, label: 'Descanso' });
    });
  }
  return steps;
}

export const totalSeconds = (c) => circuitSteps(c).reduce((a, s) => a + s.secs, 0);
export const exerciseSteps = (steps) => steps.filter((s) => s.kind !== 'rest').length;

/** Convierte lo realizado en una sesión del historial */
export function circuitToSession(c, doneSteps, elapsedSecs, feel) {
  const type = typeById(c.type), byEx = new Map();
  doneSteps.filter((s) => s.kind === 'work').forEach((s) => {
    const ex = GUIDED_EXERCISES[s.ex];
    if (!byEx.has(s.ex)) byEx.set(s.ex, { group: ex.group, name: ex.name, kind: 'tiempo', equip: '', grip: '', hand: '', feel, sets: [] });
    byEx.get(s.ex).sets.push({ name: ex.name, time: `${s.secs}s`, reps: ex.reps ? String(ex.reps) : '', rest: `${c.rest}s` });
  });
  return {
    id: uid(),
    name: 'Circuito ' + type.label.toLowerCase(),
    type: type.sessionType,
    min: Math.max(1, Math.round(elapsedSecs / 60)),
    exercises: [...byEx.values()],
    notes: `Entreno guiado · ${levelById(c.level).label || 'Movilidad'} · ${c.work}s / ${c.rest}s`,
  };
}
