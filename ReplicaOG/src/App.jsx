import { useEffect, useState } from 'react'
import { FRAMES, FRAME_KEYS } from './frames'

/*
 * Demo de Gem Eyes.
 *
 * Version cruda: una sola imagen que cambia de `src` segun donde este el raton,
 * un parpadeo con setInterval y el resto de la pagina en HTML plano. No hay
 * precarga, ni frames intermedios, ni fundidos: el cambio de imagen se ve como
 * un corte y a veces parpadea en blanco mientras carga la siguiente. La version
 * terminada resuelve justo eso.
 */

const SERVICIOS = [
  {
    titulo: 'Identidad en pantalla',
    texto:
      'Definimos como se ve y como se comporta la marca en digital: paleta, tipografia, reticula y los estados que nadie documenta pero todo el mundo nota.',
  },
  {
    titulo: 'Arte que responde',
    texto:
      'Convertimos arte estatico en algo que reacciona. Un retrato que sigue el cursor pesa lo mismo que una foto y se queda en la cabeza mucho mas tiempo.',
  },
  {
    titulo: 'Front-end a medida',
    texto:
      'Programamos la pieza completa, sin plantillas. Accesible, rapida en movil y preparada para que la sigas editando cuando nosotros ya no estemos.',
  },
]

const DATOS = [
  ['Frames ilustrados', '14'],
  ['Zonas de mirada', '9'],
  ['Duracion del parpadeo', '305 ms'],
  ['Peso tras convertir', '-98 %'],
]

export default function App() {
  const [frame, setFrame] = useState('c')

  // Mirada: se mira en que tercio de la pantalla esta el raton y se cambia la
  // imagen. Salto directo, sin pasos intermedios.
  useEffect(() => {
    const alMover = (e) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      const col = x < 0.33 ? 'l' : x > 0.66 ? 'r' : ''
      const fil = y < 0.33 ? 't' : y > 0.66 ? 'b' : ''
      setFrame(fil + col || 'c')
    }
    window.addEventListener('mousemove', alMover)
    return () => window.removeEventListener('mousemove', alMover)
  }, [])

  // Parpadeo cada 4 segundos, con tiempos fijos.
  useEffect(() => {
    const id = setInterval(() => {
      setFrame('b30')
      setTimeout(() => setFrame('b70'), 60)
      setTimeout(() => setFrame('b100'), 120)
      setTimeout(() => setFrame('c'), 220)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div className="topbar">
        <b>Gem Eyes</b>
        <a href="#estudio">Estudio</a>
        <a href="#galeria">Galeria</a>
        <a href="#proceso">Proceso</a>
        <a href="#contacto">Contacto</a>
      </div>

      <div className="wrap">
        <h1>Gem Eyes</h1>
        <p>Dox Designs - Web Developing</p>

        <img
          className="retrato"
          src={FRAMES[frame].src}
          alt={`Retrato ilustrado. Estado: ${FRAMES[frame].label}`}
          width="800"
          height="340"
        />
        <p className="pie">
          Mueve el raton sobre la pagina para que la mirada cambie. Estado actual:{' '}
          {FRAMES[frame].label}.
        </p>

        <p>
          <button type="button" onClick={() => setFrame('spark')}>
            Hacer destellar los ojos
          </button>{' '}
          <button type="button" onClick={() => setFrame('c')}>
            Volver al frente
          </button>
        </p>

        <hr />

        <h2 id="estudio">Tres cosas que hacemos bien</h2>
        <p>
          Somos un estudio pequeno de diseno y desarrollo web. Trabajamos con marcas
          que prefieren una pieza propia antes que una plantilla.
        </p>
        <ol className="lista">
          {SERVICIOS.map((s) => (
            <li key={s.titulo}>
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
            </li>
          ))}
        </ol>

        <hr />

        <h2 id="galeria">Catorce frames, un solo encuadre</h2>
        <p>Todos comparten el mismo encuadre, asi que basta con cambiar cual esta visible.</p>
        <ul className="galeria">
          {FRAME_KEYS.map((k) => (
            <li key={k}>
              <img src={FRAMES[k].src} alt={FRAMES[k].label} loading="lazy" />
              <span>{FRAMES[k].label}</span>
            </li>
          ))}
        </ul>

        <hr />

        <h2 id="proceso">Proceso</h2>
        <table className="tabla">
          <tbody>
            {DATOS.map(([etiqueta, valor]) => (
              <tr key={etiqueta}>
                <th>{etiqueta}</th>
                <td>{valor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <h2 id="contacto">Que te miren a los ojos</h2>
        <p>
          Si tienes una idea que merece algo mas que una plantilla, cuentanosla.
          Miramos el proyecto, te decimos que hariamos y cuanto costaria.
        </p>
        <p>
          <a href="mailto:hola@doxdesigns.co">hola@doxdesigns.co</a>
        </p>
        <p>Respuesta en 48 h, sin compromiso.</p>
      </div>

      <footer>Gem Eyes - Dox Designs. Demo.</footer>
    </div>
  )
}
