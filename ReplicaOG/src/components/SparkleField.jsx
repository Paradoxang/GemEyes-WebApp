import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const SPARK_PATH =
  'M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z'

const TINTS = ['#FFF0F6', '#FB6F92', '#FFE9A8', '#FF8FAB', '#E01E37', '#A9E5CB']

/** PRNG con semilla: el reparto es aleatorio pero idéntico en cada render. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildItems(seed, count) {
  const rnd = mulberry32(seed)
  return Array.from({ length: count }, (_, i) => {
    // Uno de cada tres es la capa de destellos del propio arte, ampliada o
    // reducida; el resto son estrellas de cuatro puntas.
    const isGlint = i % 3 === 0
    return {
      isGlint,
      top: `${Math.round(rnd() * 108 - 6)}%`,
      left: `${Math.round(rnd() * 112 - 8)}%`,
      size: isGlint
        ? Math.round(180 + rnd() * 620) // el asset se estira mucho a propósito
        : Math.round(10 + rnd() * 54),
      rot: Math.round(rnd() * 360),
      dur: +(4 + rnd() * 9).toFixed(1),
      delay: +(rnd() * 6).toFixed(1),
      tint: TINTS[Math.floor(rnd() * TINTS.length)],
      depth: +(0.25 + rnd() * 1).toFixed(2), // cuánto se mueve con el cursor
      // Muchos brillos pero suaves: la densidad hace el efecto, no la intensidad.
      // Subidos de golpe llegan a lavar el color del retrato.
      opacity: +(0.08 + rnd() * 0.26).toFixed(2),
    }
  })
}

/**
 * Campo de destellos. Reparte la capa de brillos del arte a distintas escalas —
 * desde diminuta hasta cubriendo media pantalla — mezclada con estrellas, todo en
 * blend `screen` para que sume luz. Cada pieza late a su ritmo y el conjunto se
 * desplaza con el cursor a distintas profundidades.
 */
export default function SparkleField({
  seed = 1,
  count = 15,
  className = '',
  fixed = false,
  parallax = 26,
}) {
  const reduced = useReducedMotion()
  const items = useMemo(() => buildItems(seed, count), [seed, count])
  const hostRef = useRef(null)
  const nodes = useRef([])

  useEffect(() => {
    if (reduced || !parallax) return
    const host = hostRef.current
    if (!host) return

    const state = items.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }))
    let raf = 0

    const onMove = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      for (let i = 0; i < state.length; i += 1) {
        state[i].tx = -nx * parallax * items[i].depth
        state[i].ty = -ny * parallax * items[i].depth
      }
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      for (let i = 0; i < state.length; i += 1) {
        const s = state[i]
        const el = nodes.current[i]
        if (!el) continue
        s.x += (s.tx - s.x) * 0.06
        s.y += (s.ty - s.y) * 0.06
        el.style.transform = `translate3d(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px,0)`
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [items, parallax, reduced])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden ${className}`}
      style={{ mixBlendMode: 'screen' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            nodes.current[i] = el
          }}
          className="absolute will-change-transform"
          style={{ top: item.top, left: item.left }}
        >
          <div
            style={{
              width: item.size,
              height: item.isGlint ? item.size / 2.357 : item.size,
              '--gm-rot': `${item.rot}deg`,
              opacity: reduced ? item.opacity * 0.6 : undefined,
              animation: reduced
                ? undefined
                : `gmBloom ${item.dur}s ease-in-out ${item.delay}s infinite`,
              transform: `rotate(${item.rot}deg)`,
            }}
          >
            {item.isGlint ? (
              <img
                src="/media/glints-800.webp"
                alt=""
                draggable="false"
                className="h-full w-full object-contain"
                style={{ opacity: item.opacity }}
              />
            ) : (
              <svg viewBox="0 0 24 24" className="block h-full w-full">
                <path d={SPARK_PATH} fill={item.tint} opacity={item.opacity} />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
