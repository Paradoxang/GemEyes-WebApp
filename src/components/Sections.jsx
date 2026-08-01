import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Counter, Glitch, Magnetic, Reveal, SplitText, Tilt } from './motion-kit'
import SparkleField from './SparkleField'
import PostIts from './PostIts'
import ProcessAccordion from './ProcessAccordion'
import AnimatedGradient from './AnimatedGradient'
import { useLiteMode, usePointerFine } from '../lib/useDevice'
import { FRAMES } from '../frames'

const SPARK_PATH =
  'M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z'

const Spark = ({ size = 12, fill = '#1C0412', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`block flex-none ${className}`}
  >
    <path d={SPARK_PATH} fill={fill} />
  </svg>
)

const Corners = () => (
  <>
    {[
      'top-[-4.5px] left-[-4.5px]',
      'top-[-4.5px] right-[-4.5px]',
      'bottom-[-4.5px] left-[-4.5px]',
      'bottom-[-4.5px] right-[-4.5px]',
    ].map((pos) => (
      <svg
        key={pos}
        width="9"
        height="9"
        viewBox="0 0 9 9"
        aria-hidden="true"
        className={`absolute ${pos}`}
      >
        <path d="M4.5 0 V9 M0 4.5 H9" stroke="#FB6F92" strokeWidth="1" />
      </svg>
    ))}
  </>
)

const Kicker = ({ children }) => (
  <span className="font-mono text-[11px] tracking-[0.25em] text-pink uppercase">
    {children}
  </span>
)

/* ========================================================================== */

const TICKER = [
  'Diseño web',
  'Ilustración interactiva',
  'Front-end a medida',
  'Motion y micro-interacción',
  'Dox Designs',
]

export function Marquee() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  // La marquesina acelera ligeramente conforme se baja por la página.
  const skew = useTransform(scrollYProgress, [0, 1], [0, -4])

  const row = (hidden) => (
    <div className="flex items-center gap-9 px-4 py-3.5" aria-hidden={hidden || undefined}>
      {TICKER.map((word, i) => (
        <span key={`${word}-${i}`} className="flex items-center gap-9">
          <span className="font-mono text-[12px] tracking-[0.26em] whitespace-nowrap text-void uppercase">
            {word}
          </span>
          <Spark />
        </span>
      ))}
    </div>
  )

  return (
    <motion.div
      style={reduced ? undefined : { skewY: skew }}
      className="relative z-[4] flex items-center overflow-hidden border-y border-chalk/25 bg-pink shadow-[0_0_60px_rgba(251,111,146,.45)]"
    >
      <div
        className="flex w-max"
        style={reduced ? undefined : { animation: 'gmMarquee 34s linear infinite' }}
      >
        {row(false)}
        {row(true)}
      </div>
    </motion.div>
  )
}

/* ========================================================================== */

const SERVICES = [
  {
    n: '01',
    title: 'Identidad en pantalla',
    body: 'Definimos cómo se ve y cómo se comporta la marca en digital: paleta, tipografía, retícula y los estados que nadie documenta pero todo el mundo nota.',
  },
  {
    n: '02',
    // Sin tilde a propósito: Starbim dibuja las vocales acentuadas sin acento, y
    // "ILUSTRACIÓN" salía como "ILUSTRACION", que es una falta.
    title: 'Arte que responde',
    body: 'Convertimos arte estático en algo que reacciona. Un retrato que sigue el cursor pesa lo mismo que una foto y se queda en la cabeza mucho más tiempo.',
  },
  {
    n: '03',
    title: 'Front-end a medida',
    body: 'Programamos la pieza completa, sin plantillas. Accesible, rápida en móvil y preparada para que la sigas editando cuando nosotros ya no estemos.',
  },
]

export function Studio() {
  return (
    <section id="estudio" className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-14 md:py-32">
      <SparkleField seed={11} count={12} parallax={20} />
      <div className="relative flex flex-col gap-12">
        <div className="flex max-w-[820px] flex-col gap-4">
          <Reveal>
            <Kicker>01 — El estudio</Kicker>
          </Reveal>
          <h2 className="m-0 max-w-[16ch] font-display text-[clamp(28px,4vw,58px)] leading-[0.98] text-chalk uppercase">
            <Glitch>
              <SplitText text="Tres cosas que hacemos bien" per={0.018} />
            </Glitch>
          </h2>
          <Reveal delay={0.1}>
            <p className="m-0 max-w-[58ch] text-[17px] text-blush">
              Somos un estudio pequeño de diseño y desarrollo web. Trabajamos con
              marcas que prefieren una pieza propia antes que una plantilla, y que
              entienden que la diferencia está en los detalles que se mueven.
            </p>
          </Reveal>
        </div>

        <PostIts />
      </div>
    </section>
  )
}

/* ========================================================================== */

// Los catorce, en un orden que recorre el anillo de miradas y va intercalando los
// estados especiales, para que la cinta no parezca una lista ordenada.
const SHOWCASE = [
  'c', 'tl', 't', 'tr', 'spark', 'r', 'br', 'b', 'b100', 'bl', 'l', 'b70', 'idle', 'b30',
]

export function Gallery() {
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)

  return (
    <section id="galeria" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[12%] -left-[8%] h-[520px] w-[520px] rounded-full blur-[30px]"
        style={{
          background: 'radial-gradient(circle,rgba(251,111,146,.18),transparent 68%)',
        }}
      />
      <SparkleField seed={31} count={13} parallax={24} />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-5 sm:px-14">
        <Reveal>
          <Kicker>02 — Galería</Kicker>
        </Reveal>
        <h2 className="m-0 max-w-[16ch] font-display text-[clamp(28px,4vw,58px)] leading-[0.98] text-chalk uppercase">
          <Glitch>
            <SplitText text="Catorce frames, un solo encuadre" per={0.016} />
          </Glitch>
        </h2>
        <Reveal delay={0.1}>
          <p className="m-0 max-w-[56ch] text-[17px] text-blush">
            Todos comparten el mismo encuadre, así que basta con cambiar cuál está
            visible para que el retrato cobre vida. Aquí van los catorce, en bucle.
          </p>
        </Reveal>
      </div>

      {/* Cinta en rotación continua. La pista lleva los catorce frames dos veces
          y se desplaza el 50% de su ancho, así que al terminar el ciclo la copia
          queda exactamente donde estaba la original y el salto no se ve.

          Nada de scroll horizontal ni de `drag` de Framer aquí: ambos se comían
          el swipe vertical de la página al llegar a esta sección. Al ser sólo
          una animación, el dedo pasa de largo y la página sigue bajando. */}
      <div
        className="gm-noscrollbar relative mt-12 flex overflow-hidden py-1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex w-max gap-5 pr-5"
          style={
            reduced
              ? undefined
              : {
                  animation: 'gmMarquee 58s linear infinite',
                  animationPlayState: paused ? 'paused' : 'running',
                }
          }
        >
          {[0, 1].map((copia) =>
            SHOWCASE.map((key, i) => (
              <figure
                key={`${copia}-${key}`}
                className="m-0 w-[min(420px,72vw)] flex-none"
                aria-hidden={copia === 1 || undefined}
              >
                <div className="relative overflow-hidden rounded-[12px] border border-edge shadow-[0_0_40px_rgba(251,111,146,.14)] transition-colors duration-300 hover:border-pink/60">
                  <img
                    src={FRAMES[key].src}
                    srcSet={FRAMES[key].webp}
                    sizes="420px"
                    alt={copia === 0 ? FRAMES[key].label : ''}
                    width={2400}
                    height={1018}
                    loading="lazy"
                    draggable="false"
                    className="block h-[196px] w-full object-cover"
                    style={{ objectPosition: '50% 46%' }}
                  />
                </div>
                <figcaption className="mt-3 text-[11px] tracking-[0.25em] text-blush uppercase">
                  {String(i + 1).padStart(2, '0')} · {FRAMES[key].short}
                </figcaption>
              </figure>
            )),
          )}
        </div>

        {/* Difuminado en los extremos para que las piezas entren y salgan sin
            cortarse de golpe contra el borde. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28"
          style={{ background: 'linear-gradient(90deg,#1C0412,rgba(28,4,18,0))' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28"
          style={{ background: 'linear-gradient(270deg,#1C0412,rgba(28,4,18,0))' }}
        />
      </div>
    </section>
  )
}

/* ========================================================================== */

const STATS = [
  { to: 14, label: 'Frames ilustrados' },
  { to: 9, label: 'Zonas de mirada' },
  { to: 305, suffix: ' MS', label: 'Dura un parpadeo' },
  { to: 98, prefix: '−', suffix: ' %', label: 'De peso tras convertir' },
]

export function Stats() {
  return (
    <section id="proceso" className="relative mx-auto max-w-[1440px] overflow-hidden px-5 py-24 sm:px-14 md:py-32">
      <SparkleField seed={47} count={11} parallax={18} />
      <Reveal>
        <Kicker>03 — Proceso</Kicker>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="m-0 mt-4 max-w-[16ch] font-display text-[clamp(28px,4vw,58px)] leading-[0.98] text-chalk uppercase">
          Como trabajamos
        </h2>
      </Reveal>

      <ProcessAccordion />

      <div className="mt-16 grid grid-cols-2 border-t border-edge md:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.08}
            className={`px-6 pt-11 pb-2 ${i < STATS.length - 1 ? 'md:border-r md:border-edge' : ''} ${i % 2 === 0 ? 'border-r border-edge md:border-r' : ''}`}
          >
            <span
              className="block font-display text-[clamp(38px,4.6vw,68px)] leading-[0.95] text-chalk"
              style={{ textShadow: '0 0 44px rgba(251,111,146,.3)' }}
            >
              <Counter to={stat.to} prefix={stat.prefix} />
              {stat.suffix ? (
                <span className="text-[0.42em] tracking-[0.02em]">{stat.suffix}</span>
              ) : null}
            </span>
            <span className="mt-3.5 block font-mono text-[10px] tracking-[0.26em] text-blush uppercase">
              {stat.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ========================================================================== */

// Preset del degradado animado con la paleta Gem Eyes: base cereza casi negra,
// violeta de los paneles y el rosa principal como color vivo.
const GRADIENT = {
  color1: '#1C0412',
  color2: '#3B0B20',
  color3: '#FB6F92',
  rotation: -45,
  proportion: 60,
  scale: 0.6,
  speed: 12,
  distortion: 40,
  swirl: 80,
  swirlIterations: 10,
  softness: 100,
  offset: 200,
  shape: 'Edge',
  shapeSize: 50,
}

const GRADIENT_FALLBACK =
  'radial-gradient(120% 80% at 50% 40%,rgba(74,12,36,.9) 0%,rgba(44,7,20,.88) 46%,rgba(28,4,18,.86) 100%)'

export function Closing() {
  const ref = useRef(null)
  const lite = useLiteMode()
  // El shader corre a pantalla completa: sólo mientras la sección se ve. Fuera de
  // pantalla el bucle se detiene, que es la mitad de la página.
  const enPantalla = useInView(ref, { amount: 0.15 })

  return (
    <section
      id="contacto"
      ref={ref}
      className="relative flex min-h-[86svh] flex-col items-center justify-center gap-6 overflow-hidden border-t border-edge px-5 py-24 text-center sm:px-14 md:py-32"
      style={{ background: GRADIENT_FALLBACK }}
    >
      <AnimatedGradient
        config={GRADIENT}
        noise={{ opacity: 0.35, scale: 1 }}
        paused={lite || !enPantalla}
        fallbackBackground={GRADIENT_FALLBACK}
        className="z-0"
      />

      {/* Velo entre el degradado y el texto. Sin él, el párrafo cae sobre las
          zonas rosas claras del shader y se vuelve ilegible. Va en z-0 como el
          degradado y después en el DOM, así que lo tapa a él pero no al
          contenido, que viene más abajo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(75% 62% at 50% 50%,rgba(28,4,18,.82) 0%,rgba(28,4,18,.66) 55%,rgba(28,4,18,.5) 100%)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[26px]"
        style={{
          background: 'radial-gradient(circle,rgba(251,111,146,.2),transparent 62%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <SparkleField seed={59} count={16} parallax={30} />
      <Spark size={26} fill="#A9E5CB" className="relative animate-[gmTwinkle_6s_ease-in-out_infinite]" />
      <Reveal>
        <Kicker>04 — Contacto</Kicker>
      </Reveal>
      <h2 className="relative m-0 max-w-[14ch] font-display text-[clamp(34px,5.4vw,86px)] leading-[0.98] text-chalk uppercase">
        <Glitch>
          <SplitText text="Que te miren a los ojos" per={0.03} />
        </Glitch>
      </h2>
      <Reveal delay={0.1}>
        <p className="relative m-0 max-w-[54ch] text-[17px] text-blush">
          Si tienes una idea que merece algo más que una plantilla, cuéntanosla.
          Miramos el proyecto, te decimos qué haríamos y cuánto costaría, sin rodeos.
        </p>
      </Reveal>
      <Reveal delay={0.16}>
        <Magnetic
          href="mailto:hola@doxdesigns.co"
          className="relative mt-2 inline-flex items-center gap-3 rounded-full bg-chalk/90 px-11 py-4 font-mono text-[12px] tracking-[0.24em] text-void uppercase shadow-[0_0_48px_rgba(251,111,146,.4)] backdrop-blur-[10px] transition-shadow duration-200 hover:shadow-[0_0_72px_rgba(251,111,146,.65)]"
        >
          Empezar un proyecto
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Magnetic>
      </Reveal>
      <Reveal delay={0.22}>
        <span className="relative font-mono text-[10px] tracking-[0.26em] text-blush/60 uppercase">
          Respuesta en 48 h · sin compromiso
        </span>
      </Reveal>
    </section>
  )
}

/* ========================================================================== */

const FOOT = [
  {
    title: 'Estudio',
    links: [
      ['Servicios', '#estudio'],
      ['Galería', '#galeria'],
      ['Proceso', '#proceso'],
    ],
  },
  {
    title: 'Contacto',
    links: [
      ['Email', 'mailto:hola@doxdesigns.co'],
      ['Instagram', '#contacto'],
      ['GitHub', '#contacto'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacidad', '#contacto'],
      ['Cookies', '#contacto'],
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-edge bg-void-deep">
      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-14 px-5 pt-16 pb-8 sm:px-14">
        <div className="flex max-w-[280px] flex-col gap-3.5">
          <span className="font-display text-[26px] text-chalk uppercase">Gem Eyes</span>
          <span className="font-mono text-[10px] tracking-[0.26em] text-blush uppercase">
            Dox Designs — Web Developing
          </span>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {FOOT.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-[0.26em] text-pink uppercase">
                {col.title}
              </span>
              {col.links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="font-mono text-[11px] tracking-[0.14em] text-blush uppercase transition-colors duration-200 hover:text-chalk"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-3 border-t border-edge/60 px-5 pt-5 pb-10 sm:px-14">
        <span className="font-mono text-[10px] tracking-[0.2em] text-blush/45 uppercase">
          © 2026 Dox Designs · Todos los derechos reservados
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-blush/45 uppercase">
          Ilustración y frames propios
        </span>
      </div>
    </footer>
  )
}
