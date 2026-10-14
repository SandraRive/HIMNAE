/**
 * Confirmación con doble toque para acciones que borran datos.
 * Primer toque: el botón cambia a "¿Seguro? Toca otra vez". Segundo toque: se ejecuta.
 */
export function confirmTap(btn, action) {
  if (btn.dataset.armed === '1') { action(); return; }
  const original = btn.textContent;
  btn.dataset.armed = '1';
  btn.textContent = '¿Seguro? Toca otra vez';
  setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = ''; btn.textContent = original; } }, 3000);
}
