import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Portrait from './Portrait'
import Particles from './Particles'
import { SplitText } from './motion-kit'
import { useGazeEngine } from '../lib/useGazeEngine'
import { useIsMobile, useIsPortrait, useLiteMode, usePointerFine } from '../lib/useDevice'
import { ASPECT_MOBILE } from '../frames'

export default function Hero() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const reduced = useReducedMotion()
  const pointerFine = usePointerFine()
  const isMobile = useIsMobile()
  const isPortrait = useIsPortrait()
  const lite = useLiteMode()

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

  const kicker = (
    <motion.p
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="text-center text-[11px] tracking-[0.32em] text-chalk uppercase"
      style={{ textShadow: '0 0 18px rgba(28,4,18,.95)' }}
    >
      Dox Designs — Web Developing
    </motion.p>
  )

  const title = (
    <motion.h1
      className="relative m-0 text-center font-display text-[clamp(42px,10vw,98px)] leading-[0.95] text-chalk uppercase"
      style={{
        textShadow:
          '0 2px 30px rgba(28,4,18,.9),0 0 70px rgba(28,4,18,.75),0 0 110px rgba(251,111,146,.4)',
      }}
      animate={reduced ? undefined : { y: [0, -11, 0, 7, 0], rotate: [0, -0.7, 0, 0.7, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <SplitText text="Gem Eyes" delay={0.2} per={0.055} />
    </motion.h1>
  )

  // Pantalla vertical (móvil y tablet de pie) y escritorio comparten estructura:
  // el retrato ocupa toda la pantalla y el texto va encima. Sólo cambia el
  // encuadre de las imágenes. La banda apaisada queda para el caso raro de una
  // ventana estrecha y achatada, como un móvil girado.
  const fullBleed = isPortrait || !isMobile

  if (!fullBleed) {
    return (
      <section
        id="top"
        ref={sectionRef}
        className="relative flex min-h-svh flex-col justify-center gap-9 overflow-hidden px-5 pt-28 pb-16"
      >
        <motion.div
          ref={stageRef}
          onClick={triggerSpark}
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative -mx-5 cursor-pointer"
        >
          <Portrait
            frame={frame}
            mobile
            spark={frame.key === 'spark'}
            className="w-full"
            style={{ aspectRatio: ASPECT_MOBILE }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg,rgba(28,4,18,.85) 0%,rgba(28,4,18,0) 16%,rgba(28,4,18,0) 84%,rgba(28,4,18,.85) 100%)',
            }}
          />
        </motion.div>

        <div className="relative flex flex-col items-center">
          {kicker}
          <div className="mt-3">{title}</div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden px-5 pt-28 pb-24 sm:px-14"
      style={{ isolation: 'isolate' }}
    >
      <motion.div
        ref={stageRef}
        onClick={triggerSpark}
        className="absolute -inset-[2%] z-0 cursor-pointer bg-void"
        style={reduced || isPortrait ? undefined : { x: shiftX, y: shiftY, scale: stageScale }}
        data-hot
      >
        <motion.div
          className="h-full w-full"
          style={reduced || lite ? undefined : { y: stageY }}
        >
          <Portrait
            frame={frame}
            portrait={isPortrait}
            spark={frame.key === 'spark'}
            className="h-full w-full"
          />
        </motion.div>
      </motion.div>

      {/* Sin oscurecimiento general: sólo una banda corta arriba para que el nav
          se lea y una mancha ceñida detrás del bloque de texto. */}
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
          background: isPortrait
            ? 'radial-gradient(78% 24% at 50% 88%,rgba(28,4,18,.8) 0%,rgba(28,4,18,.42) 55%,rgba(28,4,18,0) 100%)'
            : 'radial-gradient(52% 26% at 50% 84%,rgba(28,4,18,.62) 0%,rgba(28,4,18,.3) 55%,rgba(28,4,18,0) 100%)',
        }}
      />

      {!lite && <Particles className="absolute inset-0 z-[2]" />}

      <motion.div
        className="relative z-[3] flex w-full max-w-[1100px] flex-col items-center"
        style={reduced ? undefined : { y: contentY, opacity: contentFade }}
      >
        {kicker}
        <div className="relative mt-4 flex w-full justify-center">
          {!isPortrait && (
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
          )}
          {title}
        </div>
      </motion.div>
    </section>
  )
}
