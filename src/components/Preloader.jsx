import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { preloadList, tierFor } from '../frames'

const SPARK_PATH =
  'M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z'

/**
 * Pantalla de carga. Descarga el tier de imágenes que la ventana va a pedir de
 * verdad, así el retrato nunca aparece a medio resolver ni salta de nitidez al
 * llegar una versión mayor. Se cae sola a los 9 s si algo se atasca.
 */
export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const tier = tierFor(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
    const urls = preloadList(tier)
    let done = 0
    let cancelled = false

    const finish = () => {
      if (cancelled) return
      cancelled = true
      setProgress(100)
      // Un respiro para que se vea el 100 % antes de descubrir la página.
      setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 420)
    }

    const bump = () => {
      done += 1
      if (cancelled) return
      setProgress(Math.round((done / urls.length) * 100))
      if (done === urls.length) finish()
    }

    for (const url of urls) {
      const img = new Image()
      img.onload = bump
      img.onerror = bump // un frame que falle no debe dejar la página bloqueada
      img.src = url
    }

    const bail = setTimeout(finish, 9000)
    return () => {
      cancelled = true
      clearTimeout(bail)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-7 bg-void"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(251,111,146,.20), transparent 62%)',
            }}
          />

          <motion.svg
            viewBox="0 0 24 24"
            className="relative h-12 w-12"
            animate={{ rotate: 360, scale: [1, 1.18, 1] }}
            transition={{
              rotate: { duration: 5.5, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <path d={SPARK_PATH} fill="#FB6F92" />
          </motion.svg>

          <p className="relative font-display text-[clamp(28px,5vw,54px)] text-chalk uppercase">
            Gem Eyes
          </p>

          <div className="relative h-[3px] w-[min(300px,62vw)] overflow-hidden rounded-full bg-edge">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cherry via-pink to-butter"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          <p
            className="relative text-[11px] tracking-[0.3em] text-blush uppercase"
            role="status"
            aria-live="polite"
          >
            Cargando {progress}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
