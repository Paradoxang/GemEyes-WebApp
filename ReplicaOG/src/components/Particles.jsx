import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const SPARK_PATH =
  'M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z'

// Posiciones y ritmos tomados del diseño; `repel` marca cuánto huye del cursor.
const ITEMS = [
  { kind: 'star', size: 26, top: '24%', left: '13%', fill: '#FFF0F6', dur: 5.5, delay: 0, repel: 46 },
  { kind: 'star', size: 18, top: '63%', left: '22%', fill: '#FFE9A8', dur: 7, delay: 0.8, repel: 60 },
  { kind: 'star', size: 34, top: '16%', right: '16%', fill: '#A9E5CB', dur: 6.4, delay: 0.3, repel: 38 },
  { kind: 'star', size: 20, top: '71%', right: '11%', fill: '#FFF0F6', dur: 4.8, delay: 1.4, repel: 54 },
  { kind: 'star', size: 15, top: '42%', left: '46%', fill: '#FB6F92', dur: 6, delay: 2.1, repel: 74 },
  { kind: 'box', w: 14, h: 14, top: '38%', left: '7%', bg: '#FFE9A8', op: 0.55, dur: 9, delay: 0, repel: 52 },
  { kind: 'box', w: 8, h: 8, top: '54%', left: '31%', bg: '#FB6F92', op: 0.6, dur: 11, delay: 0.6, repel: 68 },
  { kind: 'box', w: 10, h: 10, top: '30%', right: '27%', bg: '#FFE9A8', op: 0.4, dur: 8, delay: 1.2, repel: 58 },
  { kind: 'box', w: 16, h: 5, top: '78%', right: '33%', bg: '#E01E37', op: 0.5, dur: 10, delay: 2, repel: 44 },
  { kind: 'box', w: 6, h: 18, top: '47%', right: '6%', bg: '#FFE9A8', op: 0.35, dur: 12, delay: 0, repel: 50 },
  { kind: 'box', w: 9, h: 9, top: '86%', left: '58%', bg: '#A9E5CB', op: 0.45, dur: 9.5, delay: 1.7, repel: 62 },
]

/**
 * Capa de partículas del hero.
 *
 * Cada partícula lleva dos capas: la exterior la mueve JS para huir del cursor,
 * la interior flota con una animación CSS propia. Separarlas evita que el
 * `transform` del repelido y el del keyframe se pisen entre sí.
 */
export default function Particles({ className = '' }) {
  const reduced = useReducedMotion()
  const hostRef = useRef(null)
  const nodes = useRef([])

  useEffect(() => {
    if (reduced) return
    const host = hostRef.current
    if (!host) return

    const state = nodes.current.map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }))
    let raf = 0
    let pointer = null

    const onMove = (event) => {
      const rect = host.getBoundingClientRect()
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onLeave = () => {
      pointer = null
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      for (let i = 0; i < state.length; i += 1) {
        const s = state[i]
        if (!s.el) continue
        if (pointer) {
          const b = s.el.offsetLeft + s.el.offsetWidth / 2
          const c = s.el.offsetTop + s.el.offsetHeight / 2
          const dx = b - pointer.x
          const dy = c - pointer.y
          const dist = Math.hypot(dx, dy) || 1
          // Solo reaccionan dentro de un radio; fuera vuelven a su sitio.
          const force = Math.max(0, 1 - dist / 320)
          const push = ITEMS[i].repel * force * force
          s.tx = (dx / dist) * push
          s.ty = (dy / dist) * push
        } else {
          s.tx = 0
          s.ty = 0
        }
        s.x += (s.tx - s.x) * 0.09
        s.y += (s.ty - s.y) * 0.09
        s.el.style.transform = `translate3d(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px,0)`
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div ref={hostRef} aria-hidden="true" className={`pointer-events-none ${className}`}>
      {ITEMS.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            nodes.current[i] = el
          }}
          className="absolute will-change-transform"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            width: item.kind === 'star' ? item.size : item.w,
            height: item.kind === 'star' ? item.size : item.h,
          }}
        >
          <div
            className="h-full w-full"
            style={
              reduced
                ? undefined
                : {
                    animation: `gmTwinkle ${item.dur}s ease-in-out ${item.delay}s infinite`,
                  }
            }
          >
            {item.kind === 'star' ? (
              <svg viewBox="0 0 24 24" className="block h-full w-full">
                <path d={SPARK_PATH} fill={item.fill} />
              </svg>
            ) : (
              <div
                className="h-full w-full"
                style={{ background: item.bg, opacity: item.op }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
