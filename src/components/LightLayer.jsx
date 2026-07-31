import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

/** Orbes de luz a la deriva. Cada uno con su propio ritmo para que nunca rimen. */
const ORBS = [
  { size: 620, x: '-8%', y: '6%', from: 'rgba(251,111,146,.20)', dur: 26, dx: 70, dy: -50 },
  { size: 460, x: '72%', y: '22%', from: 'rgba(255,233,168,.16)', dur: 34, dx: -90, dy: 60 },
  { size: 540, x: '18%', y: '58%', from: 'rgba(224,30,55,.14)', dur: 30, dx: 60, dy: 70 },
  { size: 380, x: '64%', y: '76%', from: 'rgba(169,229,203,.10)', dur: 38, dx: -50, dy: -70 },
]

/**
 * Capa de luz global. Va fija detrás del contenido, así que acompaña a todas las
 * secciones sin repetirse en cada una: orbes que derivan, un halo que sigue al
 * cursor y dos franjas de luz que se desplazan con el scroll.
 */
export default function LightLayer() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const rayY = useTransform(scrollYProgress, [0, 1], ['-12%', '26%'])
  const rayRotate = useTransform(scrollYProgress, [0, 1], [-14, -4])
  const rayFade = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.6, 0.2])

  const mx = useMotionValue(-500)
  const my = useMotionValue(-500)
  const haloX = useSpring(mx, { stiffness: 40, damping: 20, mass: 1.1 })
  const haloY = useSpring(my, { stiffness: 40, damping: 20, mass: 1.1 })
  const raf = useRef(0)

  useEffect(() => {
    if (reduced) return
    const onMove = (event) => {
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        mx.set(event.clientX)
        my.set(event.clientY)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [reduced, mx, my])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.from}, transparent 68%)`,
            filter: 'blur(24px)',
          }}
          animate={
            reduced
              ? undefined
              : { x: [0, orb.dx, 0], y: [0, orb.dy, 0], scale: [1, 1.12, 1] }
          }
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Franjas de luz que barren la página al hacer scroll */}
      <motion.div
        className="absolute -left-1/4 h-[46vh] w-[150%]"
        style={{
          top: rayY,
          rotate: rayRotate,
          opacity: reduced ? 0.3 : rayFade,
          background:
            'linear-gradient(94deg,transparent 0%,rgba(251,111,146,.10) 28%,rgba(224,30,55,.13) 47%,rgba(255,233,168,.09) 66%,transparent 100%)',
          filter: 'blur(36px)',
        }}
      />

      {/* Halo que persigue al cursor por toda la página */}
      {!reduced && (
        <motion.div
          className="absolute top-0 left-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            x: haloX,
            y: haloY,
            background:
              'radial-gradient(circle, rgba(251,111,146,.13), rgba(255,233,168,.05) 42%, transparent 66%)',
            filter: 'blur(18px)',
          }}
        />
      )}
    </div>
  )
}
