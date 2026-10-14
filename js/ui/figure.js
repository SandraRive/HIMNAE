/**
 * Muñeco de frente con los puntos de medida numerados.
 * El punto seleccionado se rellena y muestra una cinta métrica.
 */
import { MEASURES, MEASURE_POINTS } from '../config/constants.js';
import { num } from '../core/utils.js';

export function bodyFigure(selected, values) {
  const outline = [], fill = [];
  // Cada extremidad se dibuja dos veces (borde + relleno) para que las uniones no se vean
  const limb = (x1, y1, x2, y2, w) => {
    outline.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--steel)" stroke-width="${w + 4}" stroke-linecap="round"/>`);
    fill.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--surface-2)" stroke-width="${w}" stroke-linecap="round"/>`);
  };
  limb(96, 82, 80, 150, 21); limb(80, 150, 74, 212, 16);        // brazo derecho (a la izquierda del dibujo)
  limb(164, 82, 180, 150, 21); limb(180, 150, 186, 212, 16);    // brazo izquierdo
  limb(112, 186, 109, 252, 30); limb(109, 252, 107, 312, 21);   // pierna derecha
  limb(148, 186, 151, 252, 30); limb(151, 252, 153, 312, 21);   // pierna izquierda

  let s = '<svg class="figure" viewBox="0 0 260 340" role="img" aria-label="Figura con los puntos de medida">' + outline.join('') + fill.join('');
  s += '<path d="M92 72 Q130 62 168 72 L160 150 Q164 168 170 188 L90 188 Q96 168 100 150 Z" fill="var(--surface-2)" stroke="var(--steel)" stroke-width="2" stroke-linejoin="round"/>';
  s += '<rect x="121" y="54" width="18" height="16" fill="var(--surface-2)"/><circle cx="130" cy="36" r="21" fill="var(--surface-2)" stroke="var(--steel)" stroke-width="2"/>';
  s += '<circle cx="130" cy="146" r="1.8" fill="var(--steel)"/>';

  MEASURES.forEach((m, i) => {
    const [x, y, hw] = MEASURE_POINTS[m.k], has = values && num(values[m.k]);
    s += `<g class="mk${selected === m.k ? ' sel' : ''}${has ? ' has' : ''}" data-act="meas-sel" data-k="${m.k}" tabindex="0" role="button" aria-label="${m.label}">
      <line class="tape" x1="${x - hw}" y1="${y}" x2="${x + hw}" y2="${y}" stroke="var(--yellow)" stroke-width="4" stroke-dasharray="5 3" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${i + 1}</text></g>`;
  });

  s += '<text x="108" y="334" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">DCHA</text>';
  s += '<text x="152" y="334" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">IZQ</text>';
  return s + '</svg>';
}
