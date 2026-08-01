import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FRAMES, FRAME_KEYS, GLINTS, GRID } from '../frames'

/**
 * En `cover` el recorte manda: la imagen es apaisada y el hueco es más alto que
 * ancho, así que se escala por altura y el ancho necesario es ~2,45× la altura de
 * la ventana, no el ancho. Con `100vw` el navegador pedía un tier menor del
 * necesario y el retrato salía reescalado hacia arriba.
 * En móvil el retrato se ve entero, así que manda el ancho.
 */
const SIZES_COVER = '245vh'
const SIZES_MOBILE = '100vw'
// Recorte vertical con `cover`: en pantallas más estrechas que 0.55 la imagen se
// escala por altura y hace falta 55vh de ancho; en las más anchas manda el ancho.
const SIZES_PORTRAIT = '(max-aspect-ratio: 55/100) 55vh, 100vw'

/**
 * Los 14 frames apilados. La opacidad se maneja a mano y no con Framer porque el
 * fundido necesita una regla concreta:
 *
 *   El frame SALIENTE se queda opaco por debajo mientras el ENTRANTE sube de 0 a 1
 *   por encima.
 *
 * Si ambos se cruzan (uno bajando y otro subiendo) sus opacidades suman menos de 1
 * a mitad de camino y se transparenta el fondo oscuro de la página: eso producía
 * un oscurecimiento visible en cada cambio de dirección.
 */
export default function Portrait({
  frame,
  mobile = false,
  portrait = false,
  spark = false,
  className = '',
  style,
}) {
  const { key, fade } = frame
  const layers = useRef({})
  const current = useRef('c')
  const lastGaze = useRef([0, 0])

  useEffect(() => {
    const els = layers.current
    const incoming = els[key]
    if (!incoming || key === current.current) return
    const outgoing = els[current.current]

    for (const k in els) {
      if (k === key || k === current.current) continue
      els[k].style.transition = 'none'
      els[k].style.opacity = '0'
      els[k].style.zIndex = '0'
    }

    if (outgoing) {
      outgoing.style.transition = 'none'
      outgoing.style.opacity = '1'
      outgoing.style.zIndex = '1'
    }

    incoming.style.transition = 'none'
    incoming.style.opacity = '0'
    incoming.style.zIndex = '2'
    void incoming.offsetWidth // fuerza el reflow antes de animar
    incoming.style.transition = `opacity ${fade}ms cubic-bezier(.4,0,.2,1)`
    incoming.style.opacity = '1'

    current.current = key
  }, [key, fade])

  // Los destellos se extrajeron del frame "ojos destellando", anclados a las
  // pupilas centradas. Desplazarlos con la mirada hace que el brillo acompañe al
  // ojo en vez de quedarse clavado en el centro.
  if (GRID[key]) lastGaze.current = GRID[key]
  const [gx, gy] = lastGaze.current

  const sizes = portrait ? SIZES_PORTRAIT : mobile ? SIZES_MOBILE : SIZES_COVER
  // En vertical el recorte ya tiene la forma de la pantalla, así que `cover`
  // llena sin dejar bandas y recorta poquísimo.
  const objectFit = mobile ? 'fill' : 'cover'
  const objectPosition = portrait ? '50% 50%' : mobile ? '50% 50%' : '50% 44%'
  const pick = (f) =>
    portrait
      ? { src: f.srcPortrait, srcSet: f.portrait }
      : mobile
        ? { src: f.srcMobile, srcSet: f.mobile }
        : { src: f.src, srcSet: f.webp }

  return (
    <div
      role="img"
      aria-label={`Retrato ilustrado con ojos de gema. Estado actual: ${FRAMES[key].label}.`}
      className={`relative overflow-hidden bg-void ${className}`}
      style={style}
    >
      {FRAME_KEYS.map((k) => (
        <div
          key={k}
          ref={(el) => {
            if (el) layers.current[k] = el
          }}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ opacity: k === 'c' ? 1 : 0, zIndex: k === 'c' ? 2 : 0 }}
        >
          <img
            {...pick(FRAMES[k])}
            sizes={sizes}
            alt=""
            decoding={k === 'c' ? 'sync' : 'async'}
            fetchPriority={k === 'c' ? 'high' : 'low'}
            draggable="false"
            className="h-full w-full"
            style={{ objectFit, objectPosition }}
          />
        </div>
      ))}

      <motion.img
        {...pick(GLINTS)}
        sizes={sizes}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
        style={{ objectFit, objectPosition, mixBlendMode: 'screen' }}
        animate={{
          opacity: spark ? [0.68, 0.92, 0.68] : [0.2, 0.42, 0.2],
          x: `${gx * 1.5}%`,
          y: `${gy * 1.9}%`,
          scale: spark ? 1.06 : 1,
        }}
        transition={{
          opacity: { duration: spark ? 1.1 : 4.2, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 0.34, ease: 'easeOut' },
          y: { duration: 0.34, ease: 'easeOut' },
          scale: { duration: 0.45, ease: 'easeOut' },
        }}
      />
    </div>
  )
}
