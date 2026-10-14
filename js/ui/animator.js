/**
 * Motor de animación de ejercicios.
 *
 * Cada ejercicio se describe con varias "poses clave" (keyframes) de un muñeco
 * articulado. El motor calcula la posición de cada articulación (cinemática
 * directa), interpola suavemente entre poses y dibuja el resultado en SVG.
 *
 * Pose = {
 *   view: 'front' | 'side',     // de frente o de perfil (mirando a la derecha)
 *   torso: grados,              // 0 = erguido, 90 = tumbado boca abajo (cabeza a la derecha)
 *   aL, aR: [hombro, codo],     // brazos
 *   lL, lR: [cadera, rodilla],  // piernas
 *   lift: px,                   // salto (separación del suelo)
 *   dx: px,                     // desplazamiento lateral
 * }
 * Ángulos de brazos y piernas: 0 = apuntando al suelo.
 *  - De frente: positivo = hacia fuera del cuerpo.
 *  - De perfil: positivo = hacia delante. La rodilla positiva dobla la pierna hacia atrás.
 */

const LEN = { torso: 56, neck: 7, head: 11, ua: 27, fa: 25, th: 35, sh: 35, shW: 15, hipW: 9 };
const W = 200, H = 210, GROUND = 196;
const rad = (d) => (d * Math.PI) / 180;
const add = (p, d, len) => ({ x: p.x + d.x * len, y: p.y + d.y * len });
const dir = (deg, sign) => ({ x: Math.sin(rad(deg)) * sign, y: Math.cos(rad(deg)) });

/** Calcula las articulaciones de una pose */
export function solve(p) {
  const front = p.view === 'front';
  const t = rad(p.torso || 0);
  const up = { x: Math.sin(t), y: -Math.cos(t) };
  const across = { x: Math.cos(t), y: Math.sin(t) };
  const pelvis = { x: 0, y: 0 };
  const neck = add(pelvis, up, LEN.torso);
  const head = add(neck, up, LEN.neck + LEN.head);

  const sw = front ? LEN.shW : 0, hw = front ? LEN.hipW : 0;
  const shL = add(neck, across, -sw), shR = add(neck, across, sw);
  const hipL = add(pelvis, across, -hw), hipR = add(pelvis, across, hw);

  // De frente el lado izquierdo del dibujo "sale" hacia la izquierda (signo -1)
  const sL = front ? -1 : 1, sR = 1;
  const arm = (sh, [a, e], s) => { const el = add(sh, dir(a, s), LEN.ua); return { sh, el, ha: add(el, dir(a + e, s), LEN.fa) }; };
  const leg = (hp, [h, k], s) => { const kn = add(hp, dir(h, s), LEN.th); return { hp, kn, ft: add(kn, dir(h - k, s), LEN.sh) }; };

  return {
    pelvis, neck, head, shL, shR, hipL, hipR,
    armL: arm(shL, p.aL, sL), armR: arm(shR, p.aR, sR),
    legL: leg(hipL, p.lL, sL), legR: leg(hipR, p.lR, sR),
  };
}

/** Interpola dos poses (t entre 0 y 1) */
function lerpPose(a, b, t) {
  const m = (x, y) => x + (y - x) * t;
  const pair = (x, y) => [m(x[0], y[0]), m(x[1], y[1])];
  return {
    view: a.view, torso: m(a.torso || 0, b.torso || 0), lift: m(a.lift || 0, b.lift || 0), dx: m(a.dx || 0, b.dx || 0),
    aL: pair(a.aL, b.aL), aR: pair(a.aR, b.aR), lL: pair(a.lL, b.lL), lR: pair(a.lR, b.lR),
  };
}

/** Coloca el muñeco apoyado en el suelo y centrado */
function place(j, p) {
  const pts = [j.head, j.neck, j.pelvis, j.armL.el, j.armL.ha, j.armR.el, j.armR.ha, j.legL.kn, j.legL.ft, j.legR.kn, j.legR.ft];
  const lowest = Math.max(...pts.map((q) => q.y), j.head.y + LEN.head);
  const ox = W / 2 + (p.dx || 0), oy = GROUND - lowest - (p.lift || 0);
  const mv = (q) => ({ x: q.x + ox, y: q.y + oy });
  return {
    pelvis: mv(j.pelvis), neck: mv(j.neck), head: mv(j.head), shL: mv(j.shL), shR: mv(j.shR), hipL: mv(j.hipL), hipR: mv(j.hipR),
    armL: { sh: mv(j.armL.sh), el: mv(j.armL.el), ha: mv(j.armL.ha) }, armR: { sh: mv(j.armR.sh), el: mv(j.armR.el), ha: mv(j.armR.ha) },
    legL: { hp: mv(j.legL.hp), kn: mv(j.legL.kn), ft: mv(j.legL.ft) }, legR: { hp: mv(j.legR.hp), kn: mv(j.legR.kn), ft: mv(j.legR.ft) },
  };
}

const seg = (a, b, w, color, extra = '') =>
  `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
const mid = (a, b, f = 0.5) => ({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });

const BODY = 'var(--muted)', FAR = 'var(--steel)', MUSCLE = 'var(--red)', GEAR = 'var(--fg)';

/** Dibuja una pose. `hl` = zonas a resaltar; `gear` = material */
export function drawPose(pose, hl = [], gear = null) {
  const j = place(solve(pose), pose), front = pose.view === 'front', has = (k) => hl.includes(k);
  let s = `<line x1="8" y1="${GROUND + 1}" x2="${W - 8}" y2="${GROUND + 1}" stroke="var(--line)" stroke-width="2" stroke-linecap="round"/>`;
  if (gear === 'mat') s += `<line x1="22" y1="${GROUND - 1}" x2="${W - 22}" y2="${GROUND - 1}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;

  const limb = (L, far, upper, lower, wU, wL, hlU, hlL) => {
    const c = far && !front ? FAR : BODY, o = far && !front ? ' opacity=".75"' : '';
    let out = seg(L[upper[0]], L[upper[1]], wU, c, o) + seg(L[lower[0]], L[lower[1]], wL, c, o);
    if (hlU) out += seg(L[upper[0]], L[upper[1]], wU - 3, MUSCLE, o);
    if (hlL) out += seg(L[lower[0]], L[lower[1]], wL - 3, MUSCLE, o);
    return out;
  };
  const arm = (A, far) => limb(A, far, ['sh', 'el'], ['el', 'ha'], 9, 7, has('upperArm'), has('forearm'));
  const leg = (Lg, far) => limb(Lg, far, ['hp', 'kn'], ['kn', 'ft'], 12, 9, has('thigh'), has('shin'));

  // Lado lejano primero (de perfil)
  s += leg(j.legL, true) + arm(j.armL, true);

  // Tronco
  if (front) {
    const poly = [j.shL, j.shR, j.hipR, j.hipL].map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
    s += `<polygon points="${poly}" fill="${BODY}" stroke="${BODY}" stroke-width="8" stroke-linejoin="round"/>`;
    if (has('chest')) s += seg(mid(j.shL, j.hipL, 0.22), mid(j.shR, j.hipR, 0.22), 10, MUSCLE);
    if (has('core')) s += seg(mid(j.shL, j.hipL, 0.62), mid(j.shR, j.hipR, 0.62), 14, MUSCLE, ' opacity=".9"') + seg(mid(j.neck, j.pelvis, 0.45), mid(j.neck, j.pelvis, 0.95), 10, MUSCLE);
    if (has('back')) s += `<polygon points="${[j.shL, j.shR, mid(j.shR, j.hipR, 0.6), mid(j.shL, j.hipL, 0.6)].map((q) => `${q.x},${q.y}`).join(' ')}" fill="${MUSCLE}" opacity=".7"/>`;
  } else {
    s += seg(j.pelvis, j.neck, 20, BODY);
    if (has('back')) s += seg(mid(j.pelvis, j.neck, 0.25), mid(j.pelvis, j.neck, 0.95), 14, MUSCLE, ' opacity=".85"');
    if (has('chest')) s += seg(mid(j.pelvis, j.neck, 0.68), mid(j.pelvis, j.neck, 0.95), 12, MUSCLE);
    if (has('core')) s += seg(mid(j.pelvis, j.neck, 0.12), mid(j.pelvis, j.neck, 0.6), 12, MUSCLE);
  }
  if (has('glute')) {
    if (front) s += seg(j.hipL, j.hipR, 13, MUSCLE);
    else s += `<circle cx="${j.pelvis.x}" cy="${j.pelvis.y}" r="8" fill="${MUSCLE}"/>`;
  }
  s += seg(j.neck, j.head, 6, BODY) + `<circle cx="${j.head.x.toFixed(1)}" cy="${j.head.y.toFixed(1)}" r="${LEN.head}" fill="${BODY}"/>`;

  // Lado cercano
  s += leg(j.legR, false) + arm(j.armR, false);
  if (has('shoulder')) {
    s += `<circle cx="${j.shR.x}" cy="${j.shR.y}" r="7" fill="${MUSCLE}"/>`;
    if (front) s += `<circle cx="${j.shL.x}" cy="${j.shL.y}" r="7" fill="${MUSCLE}"/>`;
  }

  // Material
  if (gear === 'band') s += seg(j.armL.ha, j.armR.ha, 3, 'var(--orange)');
  if (gear === 'dumbbells') [j.armL.ha, j.armR.ha].forEach((h) => { s += `<rect x="${h.x - 9}" y="${h.y - 4}" width="18" height="8" rx="3" fill="${GEAR}"/>`; });
  if (gear === 'rope') s += `<path d="M${j.armL.ha.x} ${j.armL.ha.y} Q ${W / 2} ${GROUND + 6} ${j.armR.ha.x} ${j.armR.ha.y}" fill="none" stroke="var(--orange)" stroke-width="2"/>`;
  return s;
}

/** Pose en un momento del bucle (t de 0 a 1 recorre todas las poses) */
export function poseAt(frames, t) {
  if (frames.length === 1) return frames[0];
  const n = frames.length, x = (((t % 1) + 1) % 1) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
  const ease = 0.5 - Math.cos(f * Math.PI) / 2;
  return lerpPose(frames[i], frames[(i + 1) % n], ease);
}

export const svgOpen = (cls = 'anim') => `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">`;

/** Imagen fija de un ejercicio (para listas) */
export function exerciseThumb(ex) {
  const frame = ex.frames[Math.min(ex.thumb ?? 1, ex.frames.length - 1)];
  return svgOpen('anim-thumb') + drawPose(frame, ex.hl, ex.gear) + '</svg>';
}

/**
 * Anima un ejercicio dentro de un elemento. Devuelve una función para pararlo.
 * Respeta "reducir movimiento" del sistema: entonces va más despacio.
 */
export function animate(el, ex) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const period = (ex.ms || 800) * ex.frames.length * (reduce ? 2.5 : 1);
  let raf = 0, start = performance.now(), stopped = false;
  const tick = (now) => {
    if (stopped) return;
    el.innerHTML = svgOpen() + drawPose(poseAt(ex.frames, ((now - start) % period) / period), ex.hl, ex.gear) + '</svg>';
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}
