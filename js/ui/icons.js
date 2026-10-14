/** Iconos SVG de las pestañas y la casilla de verificación */

const svg = (inner, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${inner}</svg>`;

export const TAB_ICONS = {
  hoy: svg('<path d="M2 12h20"/><rect x="5" y="6" width="3" height="12" rx="1"/><rect x="16" y="6" width="3" height="12" rx="1"/>'),
  entreno: svg('<path d="M13 4l-2 6h6l-6 10 1.5-7H7z"/>'),
  comida: svg('<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 21V3c-2 1-3 4-3 7h3"/>'),
  cuerpo: svg('<circle cx="12" cy="4.5" r="2.2"/><path d="M5 9h14M12 9v6M9 21l3-6 3 6"/>'),
  metas: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
  progreso: svg('<path d="M3 20h18M5 16l4-5 4 3 6-8"/>'),
};

export const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
