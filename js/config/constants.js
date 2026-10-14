/**
 * Catálogos y valores por defecto de la app.
 * Aquí se añaden grupos musculares, ejercicios, medidas, etc.
 * No contiene lógica: solo datos.
 */

/** Franjas de comida */
export const SLOTS = [
  ['desayuno', 'Desayuno'], ['comida', 'Comida'], ['merienda', 'Merienda'], ['cena', 'Cena'], ['picoteo', 'Picoteo'],
];

/** Tipos de sesión de entreno */
export const TYPES = [
  ['fuerza', 'Fuerza'], ['cardio', 'Solo cardio'], ['mixto', 'Mixto'], ['deporte', 'Deporte'], ['movilidad', 'Movilidad'],
];

/**
 * Grupos musculares: [id, nombre, forma de registrar las series]
 *  - 'peso'   → kg × repeticiones
 *  - 'tiempo' → nombre / tiempo / repeticiones / descanso
 */
export const GROUPS = [
  ['pecho', 'Pecho', 'peso'], ['espalda', 'Espalda', 'peso'], ['hombro', 'Hombro', 'peso'],
  ['biceps', 'Bíceps', 'peso'], ['triceps', 'Tríceps', 'peso'], ['pierna', 'Pierna', 'peso'],
  ['gluteo', 'Glúteo', 'peso'], ['gemelo', 'Gemelo', 'peso'], ['antebrazo', 'Antebrazo', 'peso'],
  ['abdominales', 'Abdominales', 'tiempo'], ['cardio', 'Cardio', 'tiempo'], ['hiit', 'HIIT / Circuito', 'tiempo'],
  ['otro', 'Otro', 'peso'],
];

/** Ejercicios sugeridos por grupo muscular */
export const EXERCISE_LIBRARY = {
  pecho: ['Press banca', 'Press inclinado con mancuernas', 'Press declinado', 'Aperturas con mancuernas', 'Cruces en polea', 'Press en máquina', 'Contractora (pec deck)', 'Fondos', 'Flexiones'],
  espalda: ['Dominadas', 'Jalón al pecho', 'Remo con barra', 'Remo con mancuerna', 'Remo en polea baja', 'Remo en máquina', 'Pullover en polea', 'Peso muerto', 'Hiperextensiones'],
  hombro: ['Press militar', 'Press con mancuernas sentada', 'Elevaciones laterales', 'Elevaciones frontales', 'Pájaros', 'Face pull', 'Remo al mentón', 'Press Arnold'],
  biceps: ['Curl con barra', 'Curl con mancuernas', 'Curl martillo', 'Curl en polea', 'Curl predicador', 'Curl concentrado', 'Curl en banco inclinado'],
  triceps: ['Extensión en polea', 'Press francés', 'Extensión por encima de la cabeza', 'Patada de tríceps', 'Fondos en banco', 'Press cerrado'],
  pierna: ['Sentadilla', 'Sentadilla goblet', 'Sentadilla búlgara', 'Prensa', 'Zancadas', 'Extensión de cuádriceps', 'Curl femoral', 'Peso muerto rumano', 'Hack squat', 'Step-up'],
  gluteo: ['Hip thrust', 'Puente de glúteo', 'Patada de glúteo en polea', 'Abducción en máquina', 'Peso muerto sumo', 'Hiperextensión para glúteo', 'Frog pump'],
  gemelo: ['Elevación de gemelos de pie', 'Elevación de gemelos sentada', 'Gemelo en prensa'],
  antebrazo: ['Curl de muñeca', 'Curl inverso', 'Farmer walk'],
  abdominales: ['Plancha', 'Plancha lateral', 'Crunch', 'Crunch en polea', 'Elevación de piernas', 'Russian twist', 'Mountain climbers', 'Rueda abdominal', 'Bicho muerto', 'Hollow hold', 'Circuito de core'],
  cardio: ['Carrera continua', 'Cinta', 'Elíptica', 'Bici estática', 'Spinning', 'Remo (máquina)', 'Escaladora', 'Comba', 'Natación', 'Caminar inclinado'],
  hiit: ['Tabata', 'EMOM', 'AMRAP', 'Circuito', 'Burpees', 'Jumping jacks', 'Sprints', 'Kettlebell swing', 'Saltos al cajón'],
  otro: [],
};

export const EQUIP = ['Barra', 'Mancuernas', 'Máquina', 'Polea / cable', 'Multipower', 'Kettlebell', 'Peso corporal', 'Banda elástica'];
export const GRIP = ['Prono', 'Supino', 'Neutro', 'Mixto', 'Ancho', 'Estrecho'];
export const HAND = ['Ambas manos', 'Una mano', 'Alterno'];

/** Cómo te ha ido un ejercicio: [nombre, color, recomendación para la próxima vez] */
export const FEEL = {
  bien: ['Bien', 'var(--green)', 'Te fue bien: prueba a subir un poco el peso o una repetición.'],
  regular: ['Regular', 'var(--yellow)', 'Fue regular: repite el mismo peso hasta que te salga bien.'],
  mal: ['Mal', 'var(--red)', 'Te costó: baja el peso o las repeticiones esta vez.'],
};

/** Medidas corporales (el orden es el número que sale en el muñeco) */
export const MEASURES = [
  { k: 'brazo_d', label: 'Brazo derecho', short: 'Brazo D', pair: 'brazo_i', side: 'Derecho' },
  { k: 'bflex_d', label: 'Brazo flexionado derecho', short: 'Flex. D', pair: 'bflex_i', side: 'Derecho' },
  { k: 'brazo_i', label: 'Brazo izquierdo', short: 'Brazo I', pair: 'brazo_d', side: 'Izquierdo' },
  { k: 'bflex_i', label: 'Brazo flexionado izquierdo', short: 'Flex. I', pair: 'bflex_d', side: 'Izquierdo' },
  { k: 'cintura', label: 'Cintura / ombligo', short: 'Cintura' },
  { k: 'cadera', label: 'Cadera / tripa baja', short: 'Cadera' },
  { k: 'pierna_d', label: 'Pierna derecha', short: 'Pierna D', pair: 'pierna_i', side: 'Derecha' },
  { k: 'pierna_i', label: 'Pierna izquierda', short: 'Pierna I', pair: 'pierna_d', side: 'Izquierda' },
];

/** Posición de cada punto en el muñeco: [x, y, media anchura de la cinta] */
export const MEASURE_POINTS = {
  brazo_d: [90, 106, 15], bflex_d: [85, 131, 15], brazo_i: [170, 106, 15], bflex_i: [175, 131, 15],
  cintura: [130, 140, 31], cadera: [130, 174, 37], pierna_d: [111, 222, 20], pierna_i: [149, 222, 20],
};

export const PERIODS = [['day', 'Diarias'], ['week', 'Semanales'], ['month', 'Mensuales'], ['year', 'Anuales']];

/** Momento del día para los suplementos */
export const WHEN = [
  ['manana', 'Mañana'], ['mediodia', 'Mediodía'], ['noche', 'Noche'], ['pre', 'Pre-entreno'], ['post', 'Post-entreno'], ['cualquiera', 'Cuando sea'],
];

export const SUPPLEMENT_SUGGESTIONS = ['Creatina', 'Proteína whey', 'Vitamina D', 'Magnesio', 'Omega 3', 'Hierro', 'Cafeína', 'Multivitamínico', 'Colágeno', 'Electrolitos'];

/** Ajustes por defecto de una usuaria nueva */
export const DEFAULT_SETTINGS = {
  kcal: 2000, protein: 110, water: 8, weekly: 4, mealsGoal: 4, trackKcal: true,
  supps: [], goals: [], goalDone: {},
};

export const LEVELS = ['Calentando', 'Novata', 'Constante', 'Disciplinada', 'Fuerte', 'Imparable', 'Élite', 'Leyenda'];

/** Puntos de experiencia por acción */
export const XP = {
  workout: 50, pr: 30, measure: 15, goal: 10, mealDay: 10, waterDay: 10, proteinDay: 10, weight: 5, suppDay: 5,
};

export const STORAGE_KEY = 'barra-cargada-v1';
