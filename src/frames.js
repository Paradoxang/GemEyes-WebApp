const BASE = '/media'

// Sólo WebP. A 2400px y calidad 80 el AVIF salía más pesado que el WebP para esta
// ilustración, y como el AVIF va primero en el <picture> el navegador acababa
// eligiendo la opción peor.
const WIDTHS = [800, 1200, 1584, 2400]

// Set apaisado intermedio: el arte recortado al 70% del ancho, 1.65:1. Se usa en
// tablets en horizontal y ventanas estrechas donde el retrato se ve entero.
const MOBILE_WIDTHS = [480, 800, 1200]

// Set vertical: recorte centrado en un ojo, 0.62:1. Es el único encuadre que
// llena una pantalla de móvil o tablet en vertical — los dos ojos ocupan el 62%
// del ancho del arte y no caben en un formato alto.
const PORTRAIT_WIDTHS = [560, 900, 1200, 1600]

const srcset = (slug) => WIDTHS.map((w) => `${BASE}/${slug}-${w}.webp ${w}w`).join(', ')
const srcsetMobile = (slug) =>
  MOBILE_WIDTHS.map((w) => `${BASE}/${slug}-m${w}.webp ${w}w`).join(', ')
const srcsetPortrait = (slug) =>
  PORTRAIT_WIDTHS.map((w) => `${BASE}/${slug}-p${w}.webp ${w}w`).join(', ')

const frame = (slug, label, short) => ({
  slug,
  label,
  short: short ?? label,
  webp: srcset(slug),
  mobile: srcsetMobile(slug),
  portrait: srcsetPortrait(slug),
  src: `${BASE}/${slug}-1584.webp`,
  srcMobile: `${BASE}/${slug}-m800.webp`,
  srcPortrait: `${BASE}/${slug}-p900.webp`,
})

/** Relaciones de aspecto de cada encuadre. */
export const ASPECT = 2.357
export const ASPECT_MOBILE = 1.65
export const ASPECT_PORTRAIT = 0.55

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
  mobile: MOBILE_WIDTHS.map((w) => `${BASE}/glints-m${w}.webp ${w}w`).join(', '),
  portrait: PORTRAIT_WIDTHS.map((w) => `${BASE}/glints-p${w}.webp ${w}w`).join(', '),
  src: `${BASE}/glints-1584.webp`,
  srcMobile: `${BASE}/glints-m800.webp`,
  srcPortrait: `${BASE}/glints-p900.webp`,
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
 * Qué archivos debe precargar la pantalla de carga.
 *
 * Tiene que coincidir con lo que el <picture> pedirá después; si no, se descarga
 * un tier que no se usa y luego otro encima. En móvil manda el ancho (el retrato
 * se muestra entero) y en escritorio manda la altura, porque el recorte en
 * `cover` sobre una imagen apaisada se escala por altura.
 */
export function preloadPlan({ width, height, dpr = 1, mobile, portrait }) {
  const scale = Math.min(dpr, 2)

  if (portrait) {
    // Con `cover`: si la ventana es más estrecha que el recorte, la imagen se
    // escala por altura y el ancho pedido es 0.62×alto; si es más ancha, manda
    // el ancho de la ventana.
    const need = Math.max(width, height * ASPECT_PORTRAIT) * scale
    const tier = PORTRAIT_WIDTHS.find((w) => w >= need) ?? PORTRAIT_WIDTHS.at(-1)
    return {
      tier,
      urls: [
        ...FRAME_KEYS.map((k) => `${BASE}/${FRAMES[k].slug}-p${tier}.webp`),
        `${BASE}/glints-p${tier}.webp`,
      ],
    }
  }

  if (mobile) {
    const need = width * scale
    const tier = MOBILE_WIDTHS.find((w) => w >= need) ?? MOBILE_WIDTHS.at(-1)
    return {
      tier,
      urls: [
        ...FRAME_KEYS.map((k) => `${BASE}/${FRAMES[k].slug}-m${tier}.webp`),
        `${BASE}/glints-m${tier}.webp`,
      ],
    }
  }
  const need = Math.max(width, height * ASPECT * 1.04) * scale
  const tier = WIDTHS.find((w) => w >= need) ?? WIDTHS.at(-1)
  return {
    tier,
    urls: [
      ...FRAME_KEYS.map((k) => `${BASE}/${FRAMES[k].slug}-${tier}.webp`),
      `${BASE}/glints-${tier === 1200 ? 1584 : tier}.webp`,
    ],
  }
}
