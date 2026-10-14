/**
 * Datos de ejemplo: un mes de uso inventado para que la app no se vea vacía
 * la primera vez. Desaparecen en cuanto se registra algo real.
 */
import { addDays, parseK, todayKey, uid, weekStart } from './utils.js';
import { blankDay } from './days.js';

export const DEMO_SUPPS = [
  { id: 'demo-crea', name: 'Creatina', dose: '3 g', when: 'manana' },
  { id: 'demo-vitd', name: 'Vitamina D', dose: '1 cápsula', when: 'manana' },
  { id: 'demo-mag', name: 'Magnesio', dose: '300 mg', when: 'noche' },
];

export const DEMO_GOALS = [
  { id: 'demo-g1', text: 'Estirar 10 minutos', period: 'day' },
  { id: 'demo-g2', text: 'Dormir 8 horas', period: 'day' },
  { id: 'demo-g3', text: 'Salir a correr', period: 'week', target: 2, unit: 'veces' },
  { id: 'demo-g4', text: 'Probar un ejercicio nuevo', period: 'week' },
  { id: 'demo-g5', text: 'Correr', period: 'month', target: 40, unit: 'km' },
  { id: 'demo-g6', text: 'Hacer 8 entrenos de pierna', period: 'month', target: 8, unit: 'sesiones' },
  { id: 'demo-g7', text: 'Conseguir una dominada estricta', period: 'year' },
  { id: 'demo-g8', text: 'Sentadilla con 70 kg', period: 'year' },
];

/** Progreso de las metas de ejemplo no diarias: { 'id|periodo': valor } */
export const DEMO_GOAL_DONE = {};

const FOODS = {
  desayuno: [['Avena con plátano', 350, 12, 60, 6], ['Tostada con aguacate y huevo', 380, 16, 30, 22]],
  comida: [['Pollo con arroz', 620, 45, 70, 14], ['Lentejas estofadas', 520, 28, 70, 12], ['Salmón con patata', 580, 38, 45, 24]],
  merienda: [['Yogur griego con nueces', 260, 15, 12, 17], ['Batido de proteína', 160, 30, 5, 2], ['Fruta', 90, 1, 22, 0]],
  cena: [['Ensalada de atún', 420, 32, 18, 24], ['Tortilla francesa con pan', 410, 22, 35, 18]],
};

export function buildDemoDays() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const feel = () => { const r = rnd(); return r < 0.6 ? 'bien' : r < 0.85 ? 'regular' : 'mal'; };
  const days = {}, today = todayKey();
  let monthKm = 0, legMonth = 0; const runsWeek = {};

  for (let i = 27; i >= 0; i--) {
    const k = addDays(today, -i), d = blankDay(k);
    const dow = (parseK(k).getDay() + 6) % 7, wk = Math.floor((27 - i) / 7), inc = wk * 2.5;

    // Comidas, agua, suplementos, metas diarias y peso
    (i === 0 ? ['desayuno'] : ['desayuno', 'comida', 'merienda', 'cena']).forEach((sl) => {
      const f = FOODS[sl][Math.floor(rnd() * FOODS[sl].length)];
      d.meals.push({ id: uid(), slot: sl, name: f[0], kcal: f[1], p: f[2], c: f[3], f: f[4] });
    });
    d.water = i === 0 ? 3 : 5 + Math.floor(rnd() * 4);
    DEMO_SUPPS.forEach((sp) => { if (i === 0 ? sp.id === 'demo-crea' : rnd() < 0.85) d.supps[sp.id] = true; });
    if (i > 0) { if (rnd() < 0.7) d.goals['demo-g1'] = true; if (rnd() < 0.55) d.goals['demo-g2'] = true; }
    if (dow % 2 === 0 || i === 0) d.weight = +(64.2 - (27 - i) * 0.04 + rnd() * 0.4).toFixed(1);

    // Una medición por semana
    if (i % 7 === 0) d.measures = {
      brazo_d: +(28.4 + wk * 0.1).toFixed(1), brazo_i: +(28.1 + wk * 0.1).toFixed(1),
      bflex_d: +(30.2 + wk * 0.2).toFixed(1), bflex_i: +(29.8 + wk * 0.2).toFixed(1),
      cintura: +(71.5 - wk * 0.4).toFixed(1), cadera: +(96 - wk * 0.3).toFixed(1),
      pierna_d: +(55.2 + wk * 0.2).toFixed(1), pierna_i: +(54.8 + wk * 0.2).toFixed(1),
    };

    // Entrenos: pierna (L, J), torso (M, V), cardio + core (S)
    if (dow === 0 || dow === 3) {
      legMonth++;
      d.workouts.push({ id: uid(), name: 'Pierna y glúteo', type: 'fuerza', min: 60, exercises: [
        { group: 'pierna', name: 'Sentadilla', kind: 'peso', equip: 'Barra', grip: '', hand: 'Ambas manos', feel: feel(), sets: [{ kg: 50 + inc, reps: 8 }, { kg: 50 + inc, reps: 8 }, { kg: 50 + inc, reps: 7 }] },
        { group: 'pierna', name: 'Peso muerto rumano', kind: 'peso', equip: 'Mancuernas', grip: 'Neutro', hand: 'Ambas manos', feel: feel(), sets: [{ kg: 16 + inc / 2, reps: 10 }, { kg: 16 + inc / 2, reps: 10 }] },
        { group: 'gluteo', name: 'Hip thrust', kind: 'peso', equip: 'Barra', grip: '', hand: '', feel: feel(), sets: [{ kg: 70 + inc * 2, reps: 10 }, { kg: 70 + inc * 2, reps: 10 }, { kg: 70 + inc * 2, reps: 9 }] },
      ] });
    }
    if (dow === 1 || dow === 4) {
      d.workouts.push({ id: uid(), name: 'Torso', type: 'fuerza', min: 55, exercises: [
        { group: 'pecho', name: 'Press banca', kind: 'peso', equip: 'Barra', grip: 'Prono', hand: 'Ambas manos', feel: feel(), sets: [{ kg: 30 + inc / 2, reps: 8 }, { kg: 30 + inc / 2, reps: 8 }, { kg: 30 + inc / 2, reps: 6 }] },
        { group: 'espalda', name: 'Jalón al pecho', kind: 'peso', equip: 'Polea / cable', grip: 'Ancho', hand: 'Ambas manos', feel: feel(), sets: [{ kg: 35 + inc / 2, reps: 10 }, { kg: 35 + inc / 2, reps: 10 }] },
        { group: 'hombro', name: 'Elevaciones laterales', kind: 'peso', equip: 'Mancuernas', grip: 'Neutro', hand: 'Ambas manos', feel: feel(), sets: [{ kg: 5, reps: 12 }, { kg: 5, reps: 12 }, { kg: 5, reps: 10 }] },
        { group: 'biceps', name: 'Curl martillo', kind: 'peso', equip: 'Mancuernas', grip: 'Neutro', hand: 'Alterno', feel: feel(), sets: [{ kg: 8, reps: 10 }, { kg: 8, reps: 10 }] },
      ] });
    }
    if (dow === 5) {
      const km = +(5 + Math.round(rnd() * 10) / 10).toFixed(1);
      monthKm += km; const ws = weekStart(k); runsWeek[ws] = (runsWeek[ws] || 0) + 1;
      d.workouts.push({ id: uid(), name: 'Rodaje + core', type: 'cardio', min: 45, km, exercises: [
        { group: 'cardio', name: 'Carrera continua', kind: 'tiempo', feel: 'bien', sets: [{ name: 'Rodaje suave', time: '32min', reps: '', rest: '' }] },
        { group: 'abdominales', name: 'Circuito de core', kind: 'tiempo', feel: feel(), sets: [
          { name: 'Plancha', time: '45s', reps: '', rest: '15s' }, { name: 'Crunch', time: '', reps: '20', rest: '15s' },
          { name: 'Elevación de piernas', time: '', reps: '15', rest: '30s' }, { name: 'Plancha lateral', time: '30s', reps: '', rest: '30s' },
        ] },
      ] });
    }
    days[k] = d;
  }

  Object.entries(runsWeek).forEach(([ws, n]) => (DEMO_GOAL_DONE['demo-g3|W' + ws] = n));
  DEMO_GOAL_DONE['demo-g4|W' + addDays(weekStart(today), -7)] = true;
  DEMO_GOAL_DONE['demo-g5|M' + today.slice(0, 7)] = +monthKm.toFixed(1);
  DEMO_GOAL_DONE['demo-g6|M' + today.slice(0, 7)] = Math.min(legMonth, 6);
  return days;
}
