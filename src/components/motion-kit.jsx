import { Fragment, useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

/* ---------------------------------------------------------------------------
 * Título ensamblado letra a letra. El texto accesible va en aria-label y las
 * letras quedan ocultas para lectores de pantalla.
 * ------------------------------------------------------------------------- */
export function SplitText({ text, className = '', delay = 0, per = 0.026 }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })

  if (reduced) return <span className={className}>{text}</span>

  let index = -1
  const words = text.split(' ')

  return (
    <span
      ref={ref}
      className={className}
      style={{ perspective: '700px', display: 'inline-block' }}
    >
      {/* El texto real vive aquí: las letras animadas van ocultas para lectores
          de pantalla y no dejan espacios reales que copiar. */}
      <span className="sr-only">{text}</span>
      {/* select-none para que al seleccionar el titular se copie el texto de
          arriba y no la ristra de letras sueltas. */}
      <span aria-hidden="true" className="select-none">
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((char) => {
              index += 1
              return (
                <motion.span
                  key={index}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: '0.42em', rotateX: -72 }}
                  animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
                  transition={{
                    duration: 0.52,
                    ease: [0.2, 0.8, 0.2, 1],
                    delay: delay + index * per,
                  }}
                >
                  {char}
                </motion.span>
              )
            })}
          </span>
          {/* Separador explícito: un espacio suelto entre spans inline-block se
              colapsa, y dentro del span de la palabra lo come el nowrap. */}
          {wi < words.length - 1 ? (
            <span className="inline-block w-[0.26em]" />
          ) : null}
        </Fragment>
      ))}
      </span>
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * Glitch RGB de una sola pasada cuando el elemento entra en pantalla.
 * ------------------------------------------------------------------------- */
export function Glitch({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!inView || reduced) return
    const timer = setTimeout(() => setOn(true), delay)
    return () => clearTimeout(timer)
  }, [inView, reduced, delay])

  return (
    <span ref={ref} className={`${className} ${on ? 'gm-glitch' : ''}`}>
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * Revelado genérico al entrar en viewport.
 * ------------------------------------------------------------------------- */
export function Reveal({ children, className = '', delay = 0, y = 34, as = 'div' }) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </Tag>
  )
}

/* ---------------------------------------------------------------------------
 * Botón magnético: se desplaza hacia el cursor mientras está encima.
 * ------------------------------------------------------------------------- */
export function Magnetic({ children, strength = 0.32, className = '', ...rest }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  const onMove = (event) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={reduced ? undefined : { x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </motion.a>
  )
}

/* ---------------------------------------------------------------------------
 * Panel con inclinación 3D siguiendo al cursor.
 * ------------------------------------------------------------------------- */
export function Tilt({ children, className = '', max = 7 }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 150, damping: 18 })
  const sy = useSpring(py, { stiffness: 150, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])

  const onMove = (event) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width)
    py.set((event.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Contador que sube cuando la cifra entra en pantalla.
 * ------------------------------------------------------------------------- */
export function Counter({ to, duration = 1500, prefix = '', suffix = '' }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    if (!inView || reduced) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      // easeOutExpo: arranca rápido y frena al final.
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
