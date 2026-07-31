import { motion, useScroll, useSpring } from 'motion/react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Cursor from './components/Cursor'
import LightLayer from './components/LightLayer'
import Preloader from './components/Preloader'
import SparkleField from './components/SparkleField'
import { Closing, Footer, Gallery, Marquee, Stats, Studio } from './components/Sections'
import { useSmoothScroll } from './lib/useSmoothScroll'
import { useLiteMode } from './lib/useDevice'

export default function App() {
  useSmoothScroll()
  const lite = useLiteMode()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  return (
    <>
      <Preloader />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-chalk focus:px-5 focus:py-3 focus:text-[11px] focus:tracking-[0.2em] focus:text-void focus:uppercase"
      >
        Saltar al contenido
      </a>

      {/* Va fija detrás de todo: las secciones sin fondo propio la dejan pasar. */}
      <LightLayer />
      <SparkleField seed={7} count={16} fixed parallax={34} className="z-[1]" />
      <Cursor />
      <Nav />

      {/* Barra de progreso de lectura */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 right-0 left-0 z-40 h-[2px] origin-left bg-gradient-to-r from-cherry via-pink to-butter"
        style={{ scaleX: progress }}
      />

      <main id="contenido" className="relative z-10">
        <Hero />
        <Marquee />
        <Studio />
        <Gallery />
        <Stats />
        <Closing />
      </main>

      {/* Campo por encima del contenido, muy tenue, para que los brillos también
          pasen por delante de los paneles y no sólo por detrás. Se cae entero en
          modo ligero: es una capa de composición a pantalla completa. */}
      {!lite && (
        <SparkleField
          seed={23}
          count={10}
          fixed
          parallax={52}
          className="z-[45] opacity-30"
        />
      )}

      <div className="relative z-10">
        <Footer />
      </div>
    </>
  )
}
