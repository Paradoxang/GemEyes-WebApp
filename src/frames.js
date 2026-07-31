const BASE = '/media'

// Sólo WebP. A 2400px y calidad 80 el AVIF salía más pesado que el WebP para esta
// ilustración (2.034 KB frente a 1.525 KB en el juego completo), y como el AVIF va
// primero en el <picture> el navegador acababa eligiendo la opción peor.
const WIDTHS = [800, 1200, 1584, 2400]

const srcset = (slug) => WIDTHS.map((w) => `${BASE}/${slug}-${w}.webp ${w}w`).join(', ')

const frame = (slug, label, short) => ({
  slug,
  label,
  short: short ?? label,
  webp: srcset(slug),
  src: `${BASE}/${slug}-1584.webp`,
  full: `${BASE}/${slug}-2400.webp`,
})

/** Relación de aspecto nativa de los frames. */
export const ASPECT = 2.357

export const GAZE = {
  tl: frame('framediagonalizquierdaarriba', 'Mirada arriba a la izquierda', 'Arriba izq.'),
  t: frame('framemirandoarriba', 'Mirada hacia arriba', 'Arriba'),
  tr: frame('framediagonalderechoarriba', 'Mirada arriba a la derecha', 'Arriba der.'),
  l: frame('framemirandaizquierda', 'Mirada a la izquierda', 'Izquierda'),
  c: frame('framecentral', 'Mirada al frente', 'Al frente'),
  r: frame('framemirandoderecha', 'Mirada a la derecha', 'Derecha'),
  bl: frame('framediagonalizquierdaabajo', 'Mirada abajo a la izquierda', 'Abajo izq.'),
  b: frame('framemirandoabajo', 'Mirada hacia abajo', 'Abajo'),
  br: frame('framediagonalderechoabajo', 'Mirada abajo a la derecha', 'Abajo der.'),
}

export const BLINK = {
  b30: frame('frameojoscerrados30porciento', 'Párpados al 30%', '30%'),
  b70: frame('frameojoscerrados70porciento', 'Párpados al 70%', '70%'),
  b100: frame('frameojoscerradoscompleto', 'Ojos cerrados', 'Cerrados'),
}

export const SPECIAL = {
  spark: frame('frameojosdestellando', 'Ojos destellando', 'Destello'),
  idle: frame('framealeatorio', 'Mirada perdida', 'Mirada perdida'),
}

export const FRAMES = { ...GAZE, ...BLINK, ...SPECIAL }
export const GAZE_KEYS = Object.keys(GAZE)
export const FRAME_KEYS = Object.keys(FRAMES)

/** Capa de destellos extraída del frame de ojos brillantes. */
export const GLINTS = {
  webp: [800, 1584, 2400].map((w) => `${BASE}/glints-${w}.webp ${w}w`).join(', '),
  src: `${BASE}/glints-1584.webp`,
}

export const GRID = {
  tl: [-1, -1],
  t: [0, -1],
  tr: [1, -1],
  l: [-1, 0],
  c: [0, 0],
  r: [1, 0],
  bl: [-1, 1],
  b: [0, 1],
  br: [1, 1],
}

const KEY_AT = Object.fromEntries(
  Object.entries(GRID).map(([key, [x, y]]) => [`${x},${y}`, key]),
)

/** Pasos intermedios para ir de una mirada a otra, sin incluir el origen. */
export function pathBetween(from, to) {
  if (!GRID[from] || !GRID[to]) return [to]
  const [tx, ty] = GRID[to]
  let [x, y] = GRID[from]
  const steps = []
  while (x !== tx || y !== ty) {
    x += Math.sign(tx - x)
    y += Math.sign(ty - y)
    steps.push(KEY_AT[`${x},${y}`])
  }
  return steps
}

export const TOUR = ['c', 'tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l']

/**
 * Elige el tier que hace falta según el ancho de ventana, para que el precargador
 * descargue exactamente lo que el <picture> va a pedir después.
 */
export function tierFor(width, height, dpr = 1) {
  // Mismo cálculo que el `sizes` del retrato: con `cover` sobre una imagen 2.36:1
  // el ancho necesario lo marca la altura de la ventana, no su ancho.
  const cssNeed = Math.max(width, height * ASPECT * 1.04)
  const need = cssNeed * Math.min(dpr, 2)
  return WIDTHS.find((w) => w >= need) ?? WIDTHS[WIDTHS.length - 1]
}

export const preloadList = (tier) => [
  ...FRAME_KEYS.map((k) => `${BASE}/${FRAMES[k].slug}-${tier}.webp`),
  `${BASE}/glints-${tier === 1200 ? 1584 : tier}.webp`,
]
