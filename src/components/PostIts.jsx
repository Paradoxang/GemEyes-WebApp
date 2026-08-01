import { motion, useReducedMotion } from 'motion/react'
import { usePointerFine } from '../lib/useDevice'

/**
 * Tarjetas tipo post-it clavadas con chincheta y unidas por una línea de puntos,
 * como el tablero de la referencia.
 *
 * El desnivel entre notas es fuerte a propósito: además de romper la fila, deja
 * hueco suficiente para que la línea que las enhebra se vea. Con las tres a la
 * misma altura la línea quedaba tapada por las propias tarjetas.
 */
const NOTES = [
  {
    n: '01',
    title: 'Identidad en pantalla',
    body: 'Definimos cómo se ve y cómo se comporta la marca en digital: paleta, tipografía, retícula y los estados que nadie documenta pero todo el mundo nota.',
    tint: '#FFE7D6',
    accent: '#E8613C',
    rot: -2.4,
    offset: 0,
  },
  {
    n: '02',
    title: 'Arte que responde',
    body: 'Convertimos arte estático en algo que reacciona. Un retrato que sigue el cursor pesa lo mismo que una foto y se queda en la cabeza mucho más tiempo.',
    tint: '#DCE4FB',
    accent: '#4C63C9',
    rot: 1.8,
    offset: 104,
  },
  {
    n: '03',
    title: 'Front-end a medida',
    body: 'Programamos la pieza completa, sin plantillas. Accesible, rápida en móvil y preparada para que la sigas editando cuando nosotros ya no estemos.',
    tint: '#EEDCFB',
    accent: '#8B44C4',
    rot: -1.2,
    offset: 28,
  },
]

function Pin({ color }) {
  return (
    <svg
      width="38"
      height="42"
      viewBox="0 0 38 42"
      aria-hidden="true"
      className="absolute -top-4 left-1/2 z-10 -translate-x-1/2"
    >
      <ellipse cx="19" cy="37" rx="6" ry="2.4" fill="rgba(20,3,12,.3)" />
      <rect x="17.8" y="19" width="2.4" height="18" rx="1.2" fill="#3A0A1E" opacity=".6" />
      <circle cx="19" cy="14" r="11" fill={color} />
      <circle cx="14.8" cy="9.8" r="3.9" fill="#FFF" opacity=".55" />
      <circle cx="19" cy="14" r="11" fill="none" stroke="rgba(20,3,12,.22)" strokeWidth="1.1" />
    </svg>
  )
}

const dash = {
  fill: 'none',
  stroke: 'rgba(243,174,198,.6)',
  strokeWidth: 2,
  strokeDasharray: '5 9',
  strokeLinecap: 'round',
  // Sin esto el viewBox estirado deforma también el patrón de guiones y salen
  // cuatro rayas largas en vez de una línea de puntos.
  vectorEffect: 'non-scaling-stroke',
}

export default function PostIts() {
  const reduced = useReducedMotion()
  const pointerFine = usePointerFine()

  // Nada de `pathLength`: Framer lo implementa con el propio strokeDasharray y se
  // carga el punteado, dejando la línea continua. Animando el desfase se mantienen
  // los puntos y encima parecen enhebrarse a lo largo del hilo.
  const draw = (delay) => ({
    initial: reduced ? false : { opacity: 0, strokeDashoffset: 160 },
    whileInView: { opacity: 1, strokeDashoffset: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1.4, ease: 'easeOut', delay },
  })

  return (
    <div className="relative mt-16">
      {/* Hilos que enhebran las chinchetas. Van por la franja despejada que dejan
          los desniveles entre notas, por encima de las tarjetas 2 y 3: metidos
          entre columnas quedaban tapados, porque el hueco es estrechísimo.
          El viewBox va estirado para situarlos en porcentajes del contenedor. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      >
        <motion.path d="M 30 7 C 37 1, 43 17, 49 26" {...dash} {...draw(0.45)} />
        <motion.path d="M 57 24 C 66 19, 73 5, 80 10" {...dash} {...draw(0.75)} />
      </svg>

      {/* Apilado en móvil: el hilo baja entre una nota y la siguiente. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
      >
        <motion.path d="M 42 30 C 56 34, 58 38, 48 43" {...dash} {...draw(0.4)} />
        <motion.path d="M 52 65 C 38 69, 40 73, 54 78" {...dash} {...draw(0.6)} />
      </svg>

      <ul className="relative grid gap-16 md:grid-cols-3 md:gap-8">
        {NOTES.map((note, i) => (
          <motion.li
            key={note.n}
            className="relative list-none md:[margin-top:var(--gm-offset)]"
            style={{ '--gm-offset': `${note.offset}px` }}
            initial={reduced ? false : { opacity: 0, y: 40, rotate: note.rot * 3.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: note.rot }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.62, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.16 }}
            whileHover={
              reduced || !pointerFine
                ? undefined
                : { rotate: 0, y: -10, scale: 1.025, transition: { duration: 0.28 } }
            }
          >
            <Pin color={note.accent} />
            <div
              className="relative h-full rounded-[3px] px-7 pt-10 pb-8"
              style={{
                background: note.tint,
                boxShadow:
                  '0 22px 40px -16px rgba(10,2,8,.8), 0 4px 12px -4px rgba(10,2,8,.5)',
              }}
            >
              <span
                className="font-display text-[24px] leading-none"
                style={{ color: note.accent }}
              >
                {note.n}
              </span>
              <h3 className="mt-3 mb-2.5 font-display text-[20px] leading-[1.1] text-[#241019] uppercase">
                {note.title}
              </h3>
              <p className="m-0 text-[14px] leading-[1.6] text-[#4A3340]">{note.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
