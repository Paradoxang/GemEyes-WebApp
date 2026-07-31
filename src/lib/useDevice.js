import { useEffect, useState } from 'react'

const query = (q) => (typeof window === 'undefined' ? false : window.matchMedia(q).matches)

function useMedia(q) {
  const [match, setMatch] = useState(() => query(q))
  useEffect(() => {
    const mq = window.matchMedia(q)
    const onChange = (event) => setMatch(event.matches)
    mq.addEventListener('change', onChange)
    setMatch(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [q])
  return match
}

/** true con ratón o trackpad. Sin esto no hay nada que seguir con el cursor. */
export function usePointerFine() {
  return useMedia('(hover: hover) and (pointer: fine)')
}

/** true por debajo del punto donde el retrato pasa al recorte vertical. */
export function useIsMobile() {
  return useMedia('(max-width: 860px)')
}

/**
 * Modo ligero: recorta efectos donde no aportan o donde el equipo no da.
 *
 * Se activa con puntero grueso (móvil y tablet: además de ir peor de CPU, no
 * tienen cursor al que reaccionar, así que la mitad de los efectos son trabajo
 * tirado), con pocos núcleos, o si el usuario pide menos movimiento.
 */
export function useLiteMode() {
  const coarse = useMedia('(pointer: coarse)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [weak, setWeak] = useState(false)

  useEffect(() => {
    const cores = navigator.hardwareConcurrency
    const mem = navigator.deviceMemory
    setWeak((typeof cores === 'number' && cores <= 4) || (typeof mem === 'number' && mem <= 4))
  }, [])

  return coarse || reduced || weak
}
