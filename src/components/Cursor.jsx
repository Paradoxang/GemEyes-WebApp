import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { usePointerFine } from '../lib/useDevice'

/**
 * Cursor propio: un punto que sigue al puntero sin retardo y un anillo que llega
 * con muelle. El anillo crece sobre cualquier elemento interactivo.
 * Solo se activa con puntero fino; en táctil no se monta.
 */
export default function Cursor({ enabled = true }) {
  const pointerFine = usePointerFine()
  const active = enabled && pointerFine
  const [hot, setHot] = useState(false)
  const [visible, setVisible] = useState(false)
  const raf = useRef(0)

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { stiffness: 260, damping: 26, mass: 0.5 })
  const ringY = useSpring(dotY, { stiffness: 260, damping: 26, mass: 0.5 })

  useEffect(() => {
    if (!active) return
    document.body.classList.add('cursor-none-fine')

    const onMove = (event) => {
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        dotX.set(event.clientX)
        dotY.set(event.clientY)
      })
      setVisible(true)
      const el = event.target
      setHot(
        !!(el instanceof Element) &&
          !!el.closest('a, button, [role="button"], input, [data-hot]'),
      )
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      document.body.classList.remove('cursor-none-fine')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [active, dotX, dotY])

  if (!active) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute top-0 left-0"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="rounded-full border border-pink/70"
          animate={{
            width: hot ? 52 : 30,
            height: hot ? 52 : 30,
            x: hot ? -26 : -15,
            y: hot ? -26 : -15,
            borderColor: hot ? 'rgba(255,233,168,.9)' : 'rgba(251,111,146,.7)',
            boxShadow: hot
              ? '0 0 26px rgba(255,233,168,.45)'
              : '0 0 16px rgba(251,111,146,.35)',
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        />
      </motion.div>

      <motion.div
        style={{ x: dotX, y: dotY }}
        className="absolute top-0 left-0"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-chalk"
          animate={{ width: hot ? 5 : 7, height: hot ? 5 : 7 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        />
      </motion.div>
    </div>
  )
}
