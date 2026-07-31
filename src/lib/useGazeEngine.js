import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import { GAZE_KEYS, TOUR, pathBetween } from '../frames'

// --- Mirada -----------------------------------------------------------------
// El fundido dura más que el intervalo entre pasos a propósito: los frames
// intermedios nunca llegan a opacidad 1, así que el ojo parece deslizarse en vez
// de saltar. Esto es lo que hace que "casi no se note el cambio de frame".
const GAZE_FADE = 260
const GAZE_STEP = 140

// --- Parpadeo ---------------------------------------------------------------
// Corte seco (fade 0) en cada fase: si se funde, deja de leerse como parpadeo y
// parece una disolvencia.
const BLINK_SEQUENCE = [
  ['b30', 55],
  ['b70', 55],
  ['b100', 90],
  ['b70', 55],
  ['b30', 50],
]

// --- Destello ---------------------------------------------------------------
// Entra fundido justo al abrir los ojos, se sostiene y sale suave.
const SPARK_IN = 150
const SPARK_HOLD = 700
const SPARK_OUT = 240

// El hueco entre parpadeos es más largo que en la versión anterior porque ahora
// cada ciclo arrastra también el destello (~1,1 s extra).
const BLINK_GAP = [3800, 7500]
const WANDER_GAP = 1500 // ritmo del recorrido en móvil
const IDLE_AFTER = 7000
const IDLE_HOLD = 1700
const DEADZONE_X = 0.18
const DEADZONE_Y = 0.22

const randomIn = ([min, max]) => min + Math.random() * (max - min)
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Motor del retrato.
 *
 * Capas por prioridad: destello/parpadeo (override) > distracción > mirada.
 * La mirada se recorre paso a paso por la rejilla; el parpadeo y el destello
 * van encadenados en una sola secuencia cancelable.
 */
export function useGazeEngine(targetRef, { enabled = true, pointerFine = true } = {}) {
  const [frame, setFrame] = useState({ key: 'c', fade: GAZE_FADE })

  const gaze = useRef('c') // mirada objetivo
  const shown = useRef('c') // frame de mirada que se está mostrando
  const override = useRef(null) // parpadeo / destello / distracción
  const walkTimer = useRef(null)
  const chain = useRef([])
  const lastMove = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const leanX = useSpring(rawX, { stiffness: 70, damping: 20, mass: 0.7 })
  const leanY = useSpring(rawY, { stiffness: 70, damping: 20, mass: 0.7 })

  const paint = useCallback((key, fade) => {
    setFrame((prev) => (prev.key === key && prev.fade === fade ? prev : { key, fade }))
  }, [])

  const render = useCallback(() => {
    if (override.current) paint(override.current.key, override.current.fade)
    else paint(shown.current, GAZE_FADE)
  }, [paint])

  // --- Caminar hasta la mirada objetivo pasando por los frames intermedios ---
  const walk = useCallback(() => {
    clearTimeout(walkTimer.current)
    const steps = pathBetween(shown.current, gaze.current)
    if (!steps.length) return

    const advance = () => {
      const next = steps.shift()
      if (!next) return
      shown.current = next
      if (!override.current) paint(next, GAZE_FADE)
      if (steps.length) walkTimer.current = setTimeout(advance, GAZE_STEP)
    }
    advance()
  }, [paint])

  const setGaze = useCallback(
    (key) => {
      if (key === gaze.current) return
      gaze.current = key
      walk()
    },
    [walk],
  )

  // --- Secuencia parpadeo -> destello ---------------------------------------
  const clearChain = useCallback(() => {
    chain.current.forEach(clearTimeout)
    chain.current = []
  }, [])

  const runBlink = useCallback(() => {
    clearChain()
    let at = 0

    for (const [key, ms] of BLINK_SEQUENCE) {
      const when = at
      chain.current.push(
        setTimeout(() => {
          override.current = { key, fade: 0 }
          render()
        }, when),
      )
      at += ms
    }

    // El destello entra justo cuando los párpados terminan de abrirse.
    chain.current.push(
      setTimeout(() => {
        override.current = { key: 'spark', fade: SPARK_IN }
        render()
      }, at),
    )
    at += SPARK_IN + SPARK_HOLD

    // Vuelta a la mirada con un fundido largo para que no haya corte.
    chain.current.push(
      setTimeout(() => {
        override.current = null
        paint(shown.current, SPARK_OUT)
      }, at),
    )
    at += SPARK_OUT

    chain.current.push(setTimeout(runBlink, at + randomIn(BLINK_GAP)))
  }, [clearChain, paint, render])

  // --- Seguimiento del cursor ------------------------------------------------
  useEffect(() => {
    if (!enabled || !pointerFine) return
    let raf = 0

    const read = () => {
      raf = 0
      const el = targetRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      // Radio = distancia del centro del retrato al borde más lejano, para que el
      // recorrido útil se reparta sobre el área que el cursor puede alcanzar.
      const rx = Math.max(cx, window.innerWidth - cx)
      const ry = Math.max(cy, window.innerHeight - cy)

      const dx = clamp((pointer.current.x - cx) / rx, -1, 1)
      const dy = clamp((pointer.current.y - cy) / ry, -1, 1)

      const col = dx < -DEADZONE_X ? 'l' : dx > DEADZONE_X ? 'r' : ''
      const row = dy < -DEADZONE_Y ? 't' : dy > DEADZONE_Y ? 'b' : ''
      setGaze(row + col || 'c')

      rawX.set(dx)
      rawY.set(dy)
    }

    const onMove = (event) => {
      lastMove.current = performance.now()
      pointer.current = { x: event.clientX, y: event.clientY }
      if (!raf) raf = requestAnimationFrame(read)
    }

    lastMove.current = performance.now()
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, pointerFine, targetRef, rawX, rawY, setGaze])

  // --- Bucle constante en móvil ---------------------------------------------
  // Sin cursor no hay nada que seguir, así que la mirada recorre el anillo
  // completo y de vez en cuando se distrae: entre eso y el parpadeo con destello
  // se acaban viendo los catorce frames.
  useEffect(() => {
    if (!enabled || pointerFine) return
    let step = 0
    let timer

    const tick = () => {
      step += 1
      if (step % 5 === 0) {
        override.current = { key: 'idle', fade: GAZE_FADE }
        render()
        timer = setTimeout(() => {
          override.current = null
          render()
          timer = setTimeout(tick, WANDER_GAP)
        }, IDLE_HOLD)
        return
      }
      setGaze(TOUR[step % TOUR.length])
      timer = setTimeout(tick, WANDER_GAP)
    }

    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [enabled, pointerFine, render, setGaze])

  // --- Distracción tras inactividad (solo con cursor) ------------------------
  useEffect(() => {
    if (!enabled || !pointerFine) return
    let release
    const tick = setInterval(() => {
      if (performance.now() - lastMove.current < IDLE_AFTER) return
      if (override.current) return // no pisar un parpadeo en curso
      lastMove.current = performance.now()
      override.current = { key: 'idle', fade: GAZE_FADE }
      render()
      release = setTimeout(() => {
        if (override.current?.key === 'idle') {
          override.current = null
          render()
        }
      }, IDLE_HOLD)
    }, 1000)
    return () => {
      clearInterval(tick)
      clearTimeout(release)
    }
  }, [enabled, pointerFine, render])

  // --- Arranque del ciclo parpadeo/destello ---------------------------------
  useEffect(() => {
    if (!enabled) return
    const first = setTimeout(runBlink, randomIn([1200, 2800]))
    return () => {
      clearTimeout(first)
      clearChain()
      clearTimeout(walkTimer.current)
      override.current = null
    }
  }, [enabled, runBlink, clearChain])

  /** Destello a demanda (clic o toque sobre el retrato). */
  const triggerSpark = useCallback(() => {
    if (!enabled) return
    clearChain()
    override.current = { key: 'spark', fade: SPARK_IN }
    render()
    chain.current.push(
      setTimeout(() => {
        override.current = null
        paint(shown.current, SPARK_OUT)
        chain.current.push(setTimeout(runBlink, randomIn(BLINK_GAP)))
      }, SPARK_IN + SPARK_HOLD),
    )
  }, [enabled, clearChain, render, paint, runBlink])

  return { frame, triggerSpark, leanX, leanY }
}

export { GAZE_KEYS }
