/** Acciones del entreno guiado (elegir opciones, crear circuito, empezar) */
import { ui, notify } from '../core/state.js';
import { num } from '../core/utils.js';
import { generateCircuit } from '../domain/circuits.js';
import { openSheet } from '../sheets/sheet.js';
import { startPlayer } from '../player/player.js';

const regenerate = () => { ui.guided.circuit = generateCircuit(ui.guided); };
/** Cambiar una opción rehace el circuito si ya había uno */
const setOption = (patch) => { Object.assign(ui.guided, patch); if (ui.guided.circuit) regenerate(); notify(); };

export const guidedActions = {
  'gx-type': (b) => setOption({ type: b.dataset.v }),
  'gx-dur': (b) => setOption({ duration: num(b.dataset.v) }),
  'gx-level': (b) => setOption({ level: b.dataset.v }),
  'gx-equip': (b) => {
    const list = ui.guided.equip, v = b.dataset.v;
    setOption({ equip: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });
  },
  'gx-new': () => { regenerate(); notify(); },
  'gx-start': () => { if (ui.guided.circuit) startPlayer(ui.guided.circuit); },
  'gx-info': (b) => openSheet('exinfo', { id: b.dataset.id }),
};
