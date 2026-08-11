// Catálogo de la demo: un único tamaño y una ruta por frame. Sin `srcset`, sin
// variantes por dispositivo y sin capa de destellos.
const BASE = '/media'

const frame = (slug, label) => ({ src: `${BASE}/${slug}-800.webp`, label })

export const FRAMES = {
  tl: frame('framediagonalizquierdaarriba', 'Arriba izquierda'),
  t: frame('framemirandoarriba', 'Arriba'),
  tr: frame('framediagonalderechoarriba', 'Arriba derecha'),
  l: frame('framemirandaizquierda', 'Izquierda'),
  c: frame('framecentral', 'Al frente'),
  r: frame('framemirandoderecha', 'Derecha'),
  bl: frame('framediagonalizquierdaabajo', 'Abajo izquierda'),
  b: frame('framemirandoabajo', 'Abajo'),
  br: frame('framediagonalderechoabajo', 'Abajo derecha'),
  b30: frame('frameojoscerrados30porciento', 'Parpados 30%'),
  b70: frame('frameojoscerrados70porciento', 'Parpados 70%'),
  b100: frame('frameojoscerradoscompleto', 'Ojos cerrados'),
  spark: frame('frameojosdestellando', 'Destello'),
  idle: frame('framealeatorio', 'Mirada perdida'),
}

export const FRAME_KEYS = Object.keys(FRAMES)
