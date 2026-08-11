import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import Portrait from './Portrait'
import Particles from './Particles'
import { Magnetic, SplitText } from './motion-kit'
import { useGazeEngine, usePointerFine } from '../lib/useGazeEngine'

export default function Hero() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const reduced = useReducedMotion()
  const pointerFine = usePointerFine()

  const { frame, triggerSpark, leanX, leanY } = useGazeEngine(stageRef, {
    enabled: !reduced,
    pointerFine,
  })

  const shiftX = useTransform(leanX, [-1, 1], [22, -22])
  const shiftY = useTransform(leanY, [-1, 1], [15, -15])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const stageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-38%'])
  const contentFade = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden px-5 pt-28 pb-16 sm:px-14"
      style={{ isolation: 'isolate' }}
    >
      {/* Capa 0 — los catorce frames más la capa de destellos */}
      <motion.div
        ref={stageRef}
        onClick={triggerSpark}
        className="absolute -inset-[2%] z-0 cursor-pointer bg-void"
        style={reduced ? undefined : { x: shiftX, y: shiftY, scale: stageScale }}
        data-hot
      >
        <motion.div className="h-full w-full" style={reduced ? undefined : { y: stageY }}>
          <Portrait
            frame={frame}
            spark={frame.key === 'spark'}
            contain={!pointerFine}
            className="h-full w-full"
          />
        </motion.div>
      </motion.div>

      {/* Capa 1 — sin oscurecimiento general: el retrato se ve entero.
          Sólo queda una banda muy corta arriba para que el nav se lea, y una
          mancha suave y ceñida detrás del bloque de texto. El corte con la
          marquesina se deja seco a propósito. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg,rgba(28,4,18,.58) 0%,rgba(28,4,18,.18) 9%,rgba(28,4,18,0) 18%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(52% 26% at 50% 84%,rgba(28,4,18,.62) 0%,rgba(28,4,18,.3) 55%,rgba(28,4,18,0) 100%)',
        }}
      />

      <Particles className="absolute inset-0 z-[2]" />

      {/* Capa 3 — bloque de texto compacto, anclado abajo para dejar los ojos libres */}
      <motion.div
        className="relative z-[3] flex w-full max-w-[1100px] flex-col items-center"
        style={reduced ? undefined : { y: contentY, opacity: contentFade }}
      >
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center font-mono text-[11px] tracking-[0.32em] text-chalk uppercase"
          style={{ textShadow: '0 0 18px rgba(28,4,18,.95)' }}
        >
          Dox Designs — Web Developing
        </motion.p>

        <div className="relative mt-4 flex w-full justify-center">
          <motion.div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 h-[62%] w-[42%]"
            initial={reduced ? false : { opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.35 }}
            style={{
              transform: 'translate(-50%,-50%) rotate(-6deg)',
              background:
                'linear-gradient(90deg,rgba(251,111,146,0) 0%,rgba(251,111,146,.42) 26%,rgba(224,30,55,.36) 64%,rgba(251,111,146,0) 100%)',
              filter: 'blur(16px)',
            }}
          />
          {/* Flotación continua: el titular sube y baja despacio y se balancea un
              poco, para que no se sienta pegado al fondo. */}
          <motion.h1
            className="relative m-0 text-center font-display text-[clamp(34px,4.8vw,74px)] leading-[0.95] text-chalk uppercase"
            style={{
              textShadow:
                '0 2px 30px rgba(28,4,18,.9),0 0 70px rgba(28,4,18,.75),0 0 110px rgba(251,111,146,.4)',
            }}
            animate={reduced ? undefined : { y: [0, -11, 0, 7, 0], rotate: [0, -0.7, 0, 0.7, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SplitText text="Gem Eyes" delay={0.2} per={0.055} />
          </motion.h1>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-7"
        >
          <Magnetic
            href="#estudio"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-chalk/25 bg-chalk/10 px-9 py-3.5 font-mono text-[11px] tracking-[0.24em] text-chalk uppercase backdrop-blur-[14px] transition-colors duration-200 hover:border-chalk/60 hover:bg-chalk/20"
          >
            Ver el trabajo
            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          </Magnetic>
        </motion.div>

      </motion.div>
    </section>
  )
}
