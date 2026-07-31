import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

const LINKS = [
  { href: '#estudio', label: 'Estudio' },
  { href: '#galeria', label: 'Galería' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#contacto', label: 'Contacto' },
]

// Entrada escalonada: cada pieza del nav cae desde arriba con un pequeño rebote.
const item = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0 },
}

export default function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const reduced = useReducedMotion()

  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 24))

  return (
    <>
      <motion.header
        initial={reduced ? false : 'hidden'}
        animate="show"
        transition={{ staggerChildren: 0.07, delayChildren: 0.25 }}
        className="fixed top-0 right-0 left-0 z-30 border-b"
        style={{
          background: solid ? 'rgba(28,4,18,.86)' : 'transparent',
          backdropFilter: solid ? 'blur(18px)' : 'none',
          borderBottomColor: solid ? 'rgba(110,19,57,.9)' : 'transparent',
          transition: 'background .35s ease, border-color .35s ease, backdrop-filter .35s ease',
        }}
      >
        <div
          className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-14"
          style={{
            paddingTop: solid ? 18 : 30,
            paddingBottom: solid ? 18 : 30,
            transition: 'padding .35s ease',
          }}
        >
          {/* El wordmark flota igual que el titular del hero, para que rimen. */}
          <motion.a
            href="#top"
            variants={item}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display text-[15px] tracking-[0.22em] whitespace-nowrap text-chalk uppercase"
            style={{ textShadow: '0 0 26px rgba(251,111,146,.6)' }}
          >
            <motion.span
              className="inline-block"
              animate={reduced ? undefined : { y: [0, -3.5, 0, 2.5, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            >
              Gem Eyes
            </motion.span>
          </motion.a>

          <nav aria-label="Secciones" className="hidden items-center gap-10 lg:flex">
            {LINKS.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                variants={item}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={reduced ? undefined : { y: -2 }}
                className="group relative text-[11px] tracking-[0.25em] text-blush uppercase transition-colors duration-200 hover:text-chalk"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-pink transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </nav>

          {/* Botón principal en rosa chillón: es el único bloque de color sólido
              del nav, así que se lleva toda la atención. */}
          <motion.a
            href="#contacto"
            variants={item}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            className="relative inline-flex items-center gap-2.5 rounded-full bg-pink px-6 py-3 text-[11px] font-bold tracking-[0.25em] whitespace-nowrap text-void uppercase shadow-[0_0_28px_rgba(251,111,146,.6)] ring-2 ring-bubblegum/70 transition-colors duration-200 hover:bg-bubblegum"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-pink"
              animate={reduced ? undefined : { opacity: [0.55, 0, 0.55], scale: [1, 1.28, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
              style={{ filter: 'blur(10px)', zIndex: -1 }}
            />
            Hablemos
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </motion.a>
        </div>
      </motion.header>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[-190px] left-[6%] z-31 hidden h-[420px] w-[420px] opacity-75 md:block"
      >
        <motion.svg
          viewBox="0 0 420 420"
          className="block h-full w-full"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
        >
          <g fill="none" stroke="#FB6F92" strokeWidth="1.4">
            <circle cx="210" cy="210" r="118" opacity=".55" />
            <circle cx="210" cy="210" r="152" opacity=".38" stroke="#E01E37" />
            <circle cx="210" cy="210" r="188" opacity=".22" />
          </g>
        </motion.svg>
      </div>
    </>
  )
}
