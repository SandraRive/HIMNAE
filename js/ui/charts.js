/**
 * Gráficas en SVG, sin librerías:
 *  - barbell()   → la barra olímpica de Hoy
 *  - lineChart() → líneas en el tiempo (una o varias series)
 *  - barChart()  → barras por semana
 * Todos los colores salen de las variables CSS, así funcionan en tema claro y oscuro.
 */
import { esc, fmtN, fmtShort, parseK } from '../core/utils.js';

/** Marcas "redondas" para el eje Y */
export function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const step0 = (max - min) / n, mag = 10 ** Math.floor(Math.log10(step0)), e = step0 / mag;
  const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
  for (let v = lo; v <= hi + step * 1e-6; v += step) t.push(+v.toFixed(6));
  return t;
}

/**
 * Barra con discos. Cada disco: { pct: 0..1, color }.
 * Los discos se rellenan según el porcentaje y quedan sólidos al 100 %.
 */
export function barbell(plates) {
  const H = [100, 88, 76, 64, 52], w = 13, g = 3, cy = 60;
  let s = '<svg class="bar-svg" viewBox="0 0 360 120" role="img" aria-label="Barra con los objetivos del día como discos">';
  s += `<rect x="12" y="${cy - 4}" width="336" height="8" rx="4" fill="var(--steel)"/>`;
  s += `<rect x="30" y="${cy - 7}" width="100" height="14" rx="3" fill="var(--steel)"/><rect x="230" y="${cy - 7}" width="100" height="14" rx="3" fill="var(--steel)"/>`;
  for (let x = 150; x <= 210; x += 6) s += `<line x1="${x}" y1="${cy - 4}" x2="${x + 3}" y2="${cy + 4}" stroke="var(--surface)" stroke-width="1" opacity=".55"/>`;
  s += `<rect x="124" y="${cy - 13}" width="8" height="26" rx="2" fill="var(--fg)"/><rect x="228" y="${cy - 13}" width="8" height="26" rx="2" fill="var(--fg)"/>`;
  plates.forEach((p, i) => {
    const h = H[i], y = cy - h / 2, xl = 124 - (i + 1) * (w + g), xr = 236 + g + i * (w + g);
    const fh = Math.max(0, Math.min(1, p.pct)) * h;
    [xl, xr].forEach((x) => {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--surface-2)" stroke="${p.color}" stroke-width="2"/>`;
      if (fh > 0) s += `<rect x="${x + 1}" y="${cy - fh / 2}" width="${w - 2}" height="${fh}" rx="2" fill="${p.color}"${p.pct >= 1 ? '' : ' opacity=".55"'}/>`;
    });
  });
  return s + '</svg>';
}

/**
 * Gráfica de líneas.
 * series: [{ name, color, dash?, pts: [{ k: 'AAAA-MM-DD', y, c?: colorDelPunto }] }]
 */
export function lineChart(series, { unit = '', dec = 1 } = {}) {
  series = series.filter((s) => s.pts.length);
  if (!series.length || series.every((s) => s.pts.length < 2)) {
    return '<p class="empty">Hacen falta al menos dos registros para dibujar la gráfica.</p>';
  }
  const W = 600, H = 230, L = 46, R = 78, T = 18, B = 30;
  const all = series.flatMap((s) => s.pts), tx = (p) => parseK(p.k).getTime();
  const xs = all.map(tx), x0 = Math.min(...xs), x1 = Math.max(...xs);
  const ys = all.map((p) => p.y), ticks = niceTicks(Math.min(...ys), Math.max(...ys)), y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const X = (t) => L + (x1 === x0 ? 0.5 : (t - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);

  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  ticks.forEach((t) => {
    s += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${fmtN(t, dec)}</text>`;
  });

  const ends = [];
  series.forEach((se) => {
    const pts = [...se.pts].sort((a, b) => tx(a) - tx(b));
    const d = pts.map((p, i) => (i ? 'L' : 'M') + X(tx(p)).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ');
    if (series.length === 1) {
      s += `<path d="${d} L${X(tx(pts[pts.length - 1])).toFixed(1)} ${Y(y0)} L${X(tx(pts[0])).toFixed(1)} ${Y(y0)} Z" fill="${se.color}" opacity=".12"/>`;
    }
    s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"${se.dash ? ' stroke-dasharray="6 4"' : ''}/>`;
    pts.forEach((p) => { if (p.c) s += `<circle cx="${X(tx(p))}" cy="${Y(p.y)}" r="4.5" fill="${p.c}" stroke="var(--surface)" stroke-width="1.5"/>`; });
    const lp = pts[pts.length - 1];
    s += `<circle cx="${X(tx(lp))}" cy="${Y(lp.y)}" r="5" fill="${lp.c || se.color}" stroke="var(--surface)" stroke-width="2"/>`;
    ends.push({ x: X(tx(lp)), y: Y(lp.y), v: lp.y });
  });

  // Etiquetas del último valor, separadas si se pisan
  ends.sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
  ends.forEach((e) => { s += `<text x="${e.x + 9}" y="${e.y + 4}" style="fill:var(--fg);font-weight:700">${fmtN(e.v, dec)} ${unit}</text>`; });

  const first = all.reduce((a, b) => (tx(a) < tx(b) ? a : b)), last = all.reduce((a, b) => (tx(a) > tx(b) ? a : b));
  s += `<text x="${L}" y="${H - 8}">${fmtShort(first.k)}</text><text x="${W - R}" y="${H - 8}" text-anchor="end">${fmtShort(last.k)}</text></svg>`;
  if (series.length > 1) s += '<div class="chart-legend">' + series.map((se) => `<span><i class="dot" style="--c:${se.color}"></i>${esc(se.name)}</span>`).join('') + '</div>';
  return s;
}

/** Barras: items = [{ label, v }]. La última barra (semana actual) va resaltada. */
export function barChart(items, { color = 'var(--green)' } = {}) {
  const W = 600, H = 220, L = 52, R = 12, T = 22, B = 30;
  const ticks = niceTicks(0, Math.max(1, ...items.map((i) => i.v))), y1 = ticks[ticks.length - 1];
  const bw = (W - L - R) / items.length, Y = (v) => T + (1 - v / y1) * (H - T - B);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  ticks.forEach((t) => { s += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${fmtN(t)}</text>`; });
  items.forEach((it, i) => {
    const x = L + i * bw + bw * 0.18, w = bw * 0.64, y = Y(it.v), last = i === items.length - 1;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(0, Y(0) - y)}" rx="4" fill="${color}" opacity="${last ? 1 : 0.55}"/>`;
    s += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${it.label}</text>`;
    if (last && it.v) s += `<text x="${x + w / 2}" y="${y - 6}" text-anchor="middle" style="fill:var(--fg);font-weight:700">${fmtN(it.v)}</text>`;
  });
  return s + '</svg>';
}
