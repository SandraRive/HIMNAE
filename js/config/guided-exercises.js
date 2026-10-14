/**
 * Catálogo de ejercicios para los entrenos guiados.
 *
 * Cada ejercicio:
 *  - name, group (grupo muscular del historial), tags (en qué circuitos puede salir)
 *  - muscles: nombres que se muestran · hl: zonas que se pintan en rojo en la animación
 *  - equip: material necesario (null = sin material) · gear: material que se dibuja
 *  - frames: poses clave de la animación (ver js/ui/animator.js) · ms: duración de cada transición
 *  - tips: consejos de técnica · reps: repeticiones orientativas (ejercicios de fuerza)
 *
 * Tags: cardio · hiit · piernas · core · superior · movilidad · calentamiento
 */

/** Pose de frente y de perfil con valores de partida (de pie, brazos abajo) */
const F = (o = {}) => ({ view: 'front', torso: 0, aL: [8, 0], aR: [8, 0], lL: [4, 0], lR: [4, 0], ...o });
const S = (o = {}) => ({ view: 'side', torso: 0, aL: [-4, 12], aR: [4, 12], lL: [0, 0], lR: [0, 0], ...o });

export const GUIDED_EXERCISES = {
  /* ---------------- Cardio y HIIT ---------------- */
  'jumping-jacks': {
    name: 'Jumping jacks', group: 'cardio', tags: ['cardio', 'hiit', 'calentamiento'],
    muscles: ['Cardio', 'Hombros', 'Piernas'], hl: ['thigh', 'shin', 'shoulder'], ms: 340,
    frames: [F({ aL: [12, 0], aR: [12, 0], lL: [3, 0], lR: [3, 0] }), F({ aL: [165, 0], aR: [165, 0], lL: [19, 0], lR: [19, 0], lift: 8 })],
    tips: ['Aterriza suave sobre la parte delantera del pie.', 'Brazos estirados por encima de la cabeza.'],
  },
  'high-knees': {
    name: 'Rodillas arriba', group: 'cardio', tags: ['cardio', 'hiit'],
    muscles: ['Cardio', 'Cuádriceps', 'Abdomen'], hl: ['thigh', 'core'], ms: 240,
    frames: [
      S({ lR: [88, 98], lL: [0, 0], aL: [35, 75], aR: [-35, 60], lift: 4 }),
      S({ lL: [88, 98], lR: [0, 0], aR: [35, 75], aL: [-35, 60], lift: 4 }),
    ],
    tips: ['Sube las rodillas a la altura de la cadera.', 'Mantén el tronco recto y mueve los brazos.'],
  },
  'butt-kicks': {
    name: 'Talones al glúteo', group: 'cardio', tags: ['cardio', 'calentamiento'],
    muscles: ['Cardio', 'Isquiotibiales'], hl: ['thigh', 'shin'], ms: 240,
    frames: [
      S({ lR: [-6, 140], lL: [2, 0], aL: [30, 70], aR: [-30, 70], lift: 3 }),
      S({ lL: [-6, 140], lR: [2, 0], aR: [30, 70], aL: [-30, 70], lift: 3 }),
    ],
    tips: ['Lleva el talón hacia el glúteo en cada paso.', 'Ritmo rápido y ligero.'],
  },
  'skaters': {
    name: 'Saltos de patinador', group: 'cardio', tags: ['cardio', 'hiit', 'piernas'],
    muscles: ['Cardio', 'Glúteos', 'Cuádriceps'], hl: ['thigh', 'glute'], ms: 420,
    frames: [
      F({ dx: -26, torso: -8, lL: [6, 28], lR: [-22, 12], aL: [45, 10], aR: [-25, 0] }),
      F({ dx: 26, torso: 8, lR: [6, 28], lL: [-22, 12], aR: [45, 10], aL: [-25, 0] }),
    ],
    tips: ['Salta de lado y aterriza sobre una pierna.', 'Flexiona la rodilla al caer para amortiguar.'],
  },
  'mountain-climbers': {
    name: 'Escaladores', group: 'hiit', tags: ['cardio', 'hiit', 'core'],
    muscles: ['Cardio', 'Abdomen', 'Hombros'], hl: ['core', 'shoulder', 'thigh'], ms: 260, gear: 'mat',
    frames: [
      S({ torso: 75, aL: [0, 0], aR: [0, 0], lR: [-58, 0], lL: [32, 112] }),
      S({ torso: 75, aL: [0, 0], aR: [0, 0], lL: [-58, 0], lR: [32, 112] }),
    ],
    tips: ['Manos bajo los hombros y cadera alineada.', 'Lleva las rodillas al pecho alternando rápido.'],
  },
  'burpees': {
    name: 'Burpees', group: 'hiit', tags: ['hiit', 'cardio'],
    muscles: ['Cardio', 'Pecho', 'Piernas', 'Abdomen'], hl: ['thigh', 'chest', 'core'], ms: 420, thumb: 2,
    frames: [
      S({}),
      S({ torso: 55, aL: [0, 0], aR: [0, 0], lL: [92, 135], lR: [92, 135] }),
      S({ torso: 76, aL: [0, 0], aR: [0, 0], lL: [-56, 0], lR: [-56, 0] }),
      S({ torso: 55, aL: [0, 0], aR: [0, 0], lL: [92, 135], lR: [92, 135] }),
      S({ aL: [172, 0], aR: [178, 0], lift: 18 }),
    ],
    tips: ['Baja con las manos al suelo, salta atrás a plancha y vuelve.', 'Termina con un salto y los brazos arriba.'],
  },
  'squat-jumps': {
    name: 'Sentadilla con salto', group: 'hiit', tags: ['hiit', 'piernas'],
    muscles: ['Cuádriceps', 'Glúteos', 'Gemelos'], hl: ['thigh', 'glute', 'shin'], ms: 430,
    frames: [F({ lL: [40, 62], lR: [40, 62], aL: [22, 0], aR: [22, 0] }), F({ lL: [4, 0], lR: [4, 0], aL: [160, 0], aR: [160, 0], lift: 18 })],
    tips: ['Baja como en una sentadilla y salta con fuerza.', 'Aterriza suave y enlaza con la siguiente.'],
  },
  'shadow-boxing': {
    name: 'Boxeo al aire', group: 'cardio', tags: ['cardio', 'superior'],
    muscles: ['Cardio', 'Hombros', 'Brazos'], hl: ['shoulder', 'upperArm', 'core'], ms: 260,
    frames: [
      S({ lL: [-12, 12], lR: [14, 12], aR: [88, 0], aL: [30, 125], lift: 2 }),
      S({ lL: [-12, 12], lR: [14, 12], aL: [88, 0], aR: [30, 125] }),
    ],
    tips: ['Puñetazos rápidos, guardia arriba con el otro brazo.', 'Rodillas algo flexionadas y botando.'],
  },
  'jump-rope': {
    name: 'Comba (simulada)', group: 'cardio', tags: ['cardio', 'calentamiento'],
    muscles: ['Cardio', 'Gemelos'], hl: ['shin'], ms: 230, gear: 'rope',
    frames: [F({ aL: [28, 40], aR: [28, 40] }), F({ aL: [24, 50], aR: [24, 50], lift: 8 })],
    tips: ['Saltitos pequeños sobre la punta de los pies.', 'Gira las muñecas como si tuvieras la cuerda.'],
  },
  'jog': {
    name: 'Trote en el sitio', group: 'cardio', tags: ['calentamiento', 'cardio'],
    muscles: ['Cardio', 'Piernas'], hl: ['thigh', 'shin'], ms: 300,
    frames: [
      S({ lR: [40, 70], lL: [0, 10], aL: [30, 70], aR: [-25, 70], lift: 3 }),
      S({ lL: [40, 70], lR: [0, 10], aR: [30, 70], aL: [-25, 70], lift: 3 }),
    ],
    tips: ['Ritmo suave para subir pulsaciones.', 'Respira por la nariz si puedes.'],
  },

  /* ---------------- Piernas y glúteo ---------------- */
  'squat': {
    name: 'Sentadilla', group: 'pierna', tags: ['piernas'], reps: 15,
    muscles: ['Cuádriceps', 'Glúteos'], hl: ['thigh', 'glute'], ms: 900,
    frames: [S({}), S({ torso: 34, lL: [86, 122], lR: [86, 122], aL: [78, 0], aR: [82, 0] })],
    tips: ['Lleva la cadera atrás como si te sentaras.', 'Rodillas en la línea de los pies y espalda recta.'],
  },
  'lunge': {
    name: 'Zancada', group: 'pierna', tags: ['piernas'], reps: 12,
    muscles: ['Cuádriceps', 'Glúteos'], hl: ['thigh', 'glute'], ms: 950,
    frames: [S({ lR: [6, 0], lL: [-6, 0] }), S({ lR: [72, 78], lL: [-22, 62], aL: [-6, 10], aR: [6, 10] })],
    tips: ['Paso largo y baja la rodilla de atrás casi al suelo.', 'La rodilla de delante no pasa de la punta del pie.'],
  },
  'glute-bridge': {
    name: 'Puente de glúteo', group: 'gluteo', tags: ['piernas', 'core'], reps: 15,
    muscles: ['Glúteos', 'Isquiotibiales'], hl: ['glute', 'thigh'], ms: 1000, gear: 'mat',
    frames: [
      S({ torso: -92, aL: [88, 0], aR: [88, 0], lL: [128, 124], lR: [128, 124] }),
      S({ torso: -116, aL: [70, 0], aR: [70, 0], lL: [112, 112], lR: [112, 112] }),
    ],
    tips: ['Empuja con los talones y sube la cadera.', 'Aprieta el glúteo arriba un segundo.'],
  },
  'sumo-squat': {
    name: 'Sentadilla sumo', group: 'gluteo', tags: ['piernas'], reps: 15,
    muscles: ['Glúteos', 'Aductores', 'Cuádriceps'], hl: ['thigh', 'glute'], ms: 900,
    frames: [F({ lL: [20, 0], lR: [20, 0], aL: [14, 0], aR: [14, 0] }), F({ lL: [55, 64], lR: [55, 64], aL: [14, 0], aR: [14, 0] })],
    tips: ['Piernas abiertas y puntas hacia fuera.', 'Baja recto y saca las rodillas hacia fuera.'],
  },
  'calf-raise': {
    name: 'Elevación de talones', group: 'gemelo', tags: ['piernas', 'calentamiento'], reps: 20,
    muscles: ['Gemelos'], hl: ['shin'], ms: 700,
    frames: [S({}), S({ lift: 8 })],
    tips: ['Sube despacio hasta la punta de los pies.', 'Baja controlando, sin rebotar.'],
  },
  'donkey-kick': {
    name: 'Patada de glúteo', group: 'gluteo', tags: ['piernas'], reps: 15,
    muscles: ['Glúteos'], hl: ['glute', 'thigh'], ms: 800, gear: 'mat',
    frames: [
      S({ torso: 70, aL: [0, 0], aR: [0, 0], lL: [2, 92], lR: [2, 92] }),
      S({ torso: 70, aL: [0, 0], aR: [0, 0], lL: [2, 92], lR: [-100, 82] }),
    ],
    tips: ['A cuatro patas, sube la pierna con la rodilla doblada.', 'No arquees la espalda baja.'],
  },
  'side-lunge': {
    name: 'Zancada lateral', group: 'pierna', tags: ['piernas'], reps: 12,
    muscles: ['Cuádriceps', 'Aductores', 'Glúteos'], hl: ['thigh', 'glute'], ms: 950,
    frames: [F({ lL: [14, 0], lR: [14, 0] }), F({ dx: -14, torso: -6, lL: [32, 58], lR: [36, 0], aL: [30, -120], aR: [30, -120] })],
    tips: ['Paso amplio a un lado y baja sobre esa pierna.', 'La otra pierna queda estirada.'],
  },

  /* ---------------- Core ---------------- */
  'plank': {
    name: 'Plancha', group: 'abdominales', tags: ['core'],
    muscles: ['Abdomen', 'Hombros'], hl: ['core', 'shoulder'], ms: 1600, gear: 'mat',
    frames: [S({ torso: 82, aL: [0, 90], aR: [0, 90], lL: [-74, 0], lR: [-74, 0] }), S({ torso: 85, aL: [0, 90], aR: [0, 90], lL: [-76, 0], lR: [-76, 0] })],
    tips: ['Codos bajo los hombros y cuerpo en línea recta.', 'Aprieta abdomen y glúteos, no hundas la cadera.'],
  },
  'crunch': {
    name: 'Crunch abdominal', group: 'abdominales', tags: ['core'], reps: 20,
    muscles: ['Abdomen'], hl: ['core'], ms: 850, gear: 'mat',
    frames: [
      S({ torso: -90, aL: [96, 0], aR: [96, 0], lL: [130, 125], lR: [130, 125] }),
      S({ torso: -58, aL: [118, 0], aR: [118, 0], lL: [130, 125], lR: [130, 125] }),
    ],
    tips: ['Despega los hombros del suelo con el abdomen.', 'No tires del cuello.'],
  },
  'dead-bug': {
    name: 'Bicho muerto', group: 'abdominales', tags: ['core'], reps: 12,
    muscles: ['Abdomen'], hl: ['core'], ms: 1000, gear: 'mat',
    frames: [
      S({ torso: -90, aL: [180, 0], aR: [180, 0], lL: [180, 90], lR: [180, 90] }),
      S({ torso: -90, aL: [-100, 0], aR: [180, 0], lL: [180, 90], lR: [100, 0] }),
      S({ torso: -90, aL: [180, 0], aR: [180, 0], lL: [180, 90], lR: [180, 90] }),
      S({ torso: -90, aR: [-100, 0], aL: [180, 0], lR: [180, 90], lL: [100, 0] }),
    ],
    tips: ['Espalda baja pegada al suelo todo el rato.', 'Estira brazo y pierna contrarios a la vez.'],
  },
  'leg-raise': {
    name: 'Elevación de piernas', group: 'abdominales', tags: ['core'], reps: 12,
    muscles: ['Abdomen', 'Flexores de cadera'], hl: ['core', 'thigh'], ms: 1000, gear: 'mat',
    frames: [S({ torso: -90, aL: [88, 0], aR: [88, 0], lL: [100, 0], lR: [100, 0] }), S({ torso: -90, aL: [88, 0], aR: [88, 0], lL: [172, 0], lR: [172, 0] })],
    tips: ['Sube las piernas juntas sin despegar la espalda.', 'Baja despacio sin tocar el suelo.'],
  },
  'superman': {
    name: 'Superman', group: 'espalda', tags: ['core', 'superior', 'movilidad'], reps: 12,
    muscles: ['Espalda baja', 'Glúteos'], hl: ['back', 'glute'], ms: 1000, gear: 'mat',
    frames: [S({ torso: 90, aL: [90, 0], aR: [90, 0], lL: [-90, 0], lR: [-90, 0] }), S({ torso: 80, aL: [112, 0], aR: [112, 0], lL: [-104, 0], lR: [-104, 0] })],
    tips: ['Boca abajo, sube brazos y piernas a la vez.', 'Mira al suelo para no forzar el cuello.'],
  },

  /* ---------------- Tren superior ---------------- */
  'push-up': {
    name: 'Flexiones', group: 'pecho', tags: ['superior'], reps: 10,
    muscles: ['Pecho', 'Tríceps', 'Abdomen'], hl: ['chest', 'upperArm', 'core'], ms: 900, gear: 'mat',
    frames: [
      S({ torso: 78, aL: [0, 0], aR: [0, 0], lL: [-55, 0], lR: [-55, 0] }),
      S({ torso: 88, aL: [-80, 92], aR: [-80, 92], lL: [-67, 0], lR: [-67, 0] }),
    ],
    tips: ['Manos algo más abiertas que los hombros.', 'Si cuesta, apoya las rodillas.'],
  },
  'shoulder-press': {
    name: 'Press de hombros', group: 'hombro', tags: ['superior'], equip: 'mancuernas', gear: 'dumbbells', reps: 12,
    muscles: ['Hombros', 'Tríceps'], hl: ['shoulder', 'upperArm'], ms: 900,
    frames: [F({ aL: [95, 85], aR: [95, 85] }), F({ aL: [168, 6], aR: [168, 6] })],
    tips: ['Empieza con las mancuernas a la altura de las orejas.', 'Sube sin arquear la espalda.'],
  },
  'biceps-curl': {
    name: 'Curl de bíceps', group: 'biceps', tags: ['superior'], equip: 'mancuernas', gear: 'dumbbells', reps: 12,
    muscles: ['Bíceps'], hl: ['upperArm', 'forearm'], ms: 850,
    frames: [S({ aL: [0, 6], aR: [2, 6] }), S({ aL: [4, 138], aR: [6, 140] })],
    tips: ['Codos pegados al cuerpo.', 'Sube y baja controlando, sin balancearte.'],
  },
  'lateral-raise': {
    name: 'Elevaciones laterales', group: 'hombro', tags: ['superior'], equip: 'mancuernas', gear: 'dumbbells', reps: 12,
    muscles: ['Hombros'], hl: ['shoulder'], ms: 900,
    frames: [F({ aL: [10, 4], aR: [10, 4] }), F({ aL: [86, 6], aR: [86, 6] })],
    tips: ['Sube los brazos hasta la altura de los hombros.', 'Codos ligeramente flexionados.'],
  },
  'band-pull-apart': {
    name: 'Aperturas con banda', group: 'hombro', tags: ['superior', 'calentamiento'], equip: 'banda', gear: 'band', reps: 15,
    muscles: ['Hombros', 'Espalda alta'], hl: ['shoulder', 'back'], ms: 950,
    frames: [F({ aL: [158, 0], aR: [158, 0] }), F({ aL: [98, 0], aR: [98, 0] })],
    tips: ['Brazos estirados, abre la banda hacia los lados.', 'Junta las escápulas al abrir.'],
  },
  'row': {
    name: 'Remo inclinado', group: 'espalda', tags: ['superior'], equip: 'mancuernas', gear: 'dumbbells', reps: 12,
    muscles: ['Espalda', 'Bíceps'], hl: ['back', 'upperArm'], ms: 900,
    frames: [S({ torso: 52, lL: [12, 24], lR: [12, 24], aL: [0, 0], aR: [0, 0] }), S({ torso: 52, lL: [12, 24], lR: [12, 24], aL: [-55, 70], aR: [-55, 70] })],
    tips: ['Inclina el tronco con la espalda recta.', 'Lleva los codos hacia atrás, pegados al cuerpo.'],
  },
  'triceps-extension': {
    name: 'Extensión de tríceps', group: 'triceps', tags: ['superior'], equip: 'mancuernas', gear: 'dumbbells', reps: 12,
    muscles: ['Tríceps'], hl: ['upperArm'], ms: 900,
    frames: [S({ aL: [172, 145], aR: [172, 145] }), S({ aL: [172, 4], aR: [172, 4] })],
    tips: ['Codos apuntando al techo y quietos.', 'Estira los brazos por encima de la cabeza.'],
  },
  'arm-circles': {
    name: 'Círculos de brazos', group: 'hombro', tags: ['calentamiento', 'movilidad'],
    muscles: ['Hombros'], hl: ['shoulder'], ms: 300,
    frames: [F({ aL: [78, 0], aR: [78, 0] }), F({ aL: [92, 0], aR: [92, 0] }), F({ aL: [102, 0], aR: [102, 0] }), F({ aL: [90, 0], aR: [90, 0] })],
    tips: ['Brazos en cruz, haz círculos pequeños.', 'Cambia de sentido a mitad.'],
  },

  /* ---------------- Movilidad ---------------- */
  'hip-hinge': {
    name: 'Bisagra de cadera', group: 'pierna', tags: ['movilidad', 'calentamiento'],
    muscles: ['Isquiotibiales', 'Espalda baja'], hl: ['thigh', 'back'], ms: 1100,
    frames: [S({}), S({ torso: 68, lL: [-14, 10], lR: [-14, 10], aL: [10, 0], aR: [14, 0] })],
    tips: ['Lleva la cadera atrás con la espalda recta.', 'Notarás estirar la parte de atrás de las piernas.'],
  },
  'deep-squat': {
    name: 'Sentadilla profunda', group: 'pierna', tags: ['movilidad'],
    muscles: ['Cadera', 'Tobillos'], hl: ['thigh', 'glute'], ms: 1500,
    frames: [S({ torso: 20, lL: [100, 150], lR: [100, 150], aL: [60, 40], aR: [60, 40] }), S({ torso: 28, lL: [102, 152], lR: [102, 152], aL: [70, 30], aR: [70, 30] })],
    tips: ['Baja todo lo que puedas con los talones apoyados.', 'Empuja suave las rodillas hacia fuera con los codos.'],
  },
  'hip-circles': {
    name: 'Círculos de cadera', group: 'pierna', tags: ['calentamiento', 'movilidad'],
    muscles: ['Cadera', 'Abdomen'], hl: ['core', 'glute'], ms: 450,
    frames: [F({ dx: -6, torso: 6, lL: [10, 0], lR: [10, 0], aL: [30, -150], aR: [30, -150] }), F({ torso: 0, lL: [10, 0], lR: [10, 0], aL: [30, -150], aR: [30, -150] }), F({ dx: 6, torso: -6, lL: [10, 0], lR: [10, 0], aL: [30, -150], aR: [30, -150] }), F({ torso: 0, lL: [10, 0], lR: [10, 0], aL: [30, -150], aR: [30, -150] })],
    tips: ['Manos en la cintura, dibuja círculos con la cadera.', 'Cambia de sentido a mitad.'],
  },
  'quad-stretch': {
    name: 'Estiramiento de cuádriceps', group: 'pierna', tags: ['movilidad'],
    muscles: ['Cuádriceps'], hl: ['thigh'], ms: 1500,
    frames: [S({ lR: [-8, 150], aR: [-30, -40], aL: [40, 0] }), S({ lR: [-12, 155], aR: [-34, -40], aL: [44, 0] })],
    tips: ['Coge el pie y llévalo hacia el glúteo.', 'Rodillas juntas; cambia de pierna a mitad.'],
  },
  'forward-fold': {
    name: 'Estiramiento de isquios', group: 'pierna', tags: ['movilidad'],
    muscles: ['Isquiotibiales', 'Espalda'], hl: ['thigh', 'back'], ms: 1500,
    frames: [S({ torso: 100, lL: [-12, 0], lR: [-12, 0], aL: [6, 0], aR: [10, 0] }), S({ torso: 112, lL: [-16, 0], lR: [-16, 0], aL: [10, 0], aR: [14, 0] })],
    tips: ['Deja caer el tronco hacia delante con las piernas estiradas.', 'Respira hondo y relaja el cuello.'],
  },
};
