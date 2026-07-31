import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Scroll con inercia. Se desactiva en táctil (el scroll nativo del móvil ya es
 * bueno y Lenis se pelea con el rebote del sistema) y con prefers-reduced-motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduced || coarse) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    let raf
    const tick = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Los enlaces internos deben seguir funcionando con el scroll interceptado.
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null
      if (!link) return
      const id = link.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target, { offset: -80 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])
}
