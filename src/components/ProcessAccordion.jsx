import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

// Los títulos evitan tildes y eñes a propósito: Starbim dibuja las vocales
// acentuadas sin acento y la eñe sin virgulilla, así que "Diseñamos" saldría
// "DISENAMOS", que es una falta.
const STEPS = [
  {
    title: 'Escuchamos',
    body: 'Empezamos por entender el negocio, no la web. Qué vendes, a quién, qué te está costando y qué pasa cuando alguien llega a tu página y no hace nada. De ahí sale todo lo demás.',
  },
  {
    title: 'Acotamos',
    body: 'Decidimos juntos qué entra y qué no. Una pieza pequeña y bien rematada rinde más que una grande a medio hacer, así que preferimos cerrar el alcance antes de abrir el editor.',
  },
  {
    title: 'Dibujamos',
    body: 'Montamos la retícula, la tipografía y la paleta, y probamos los estados reales: qué se ve mientras carga, qué pasa si un texto es el doble de largo, cómo se comporta en un móvil de gama media.',
  },
  {
    title: 'Programamos',
    body: 'Front-end a medida, sin plantillas. Accesible de serie, imágenes servidas en el tamaño que toca y las animaciones que aportan algo, no las que solo pesan.',
  },
  {
    title: 'Medimos',
    body: 'Antes de entregar comprobamos lo que se puede comprobar: rendimiento en equipos flojos, comportamiento táctil, contraste y lectores de pantalla. Si algo no da la talla, se arregla.',
  },
  {
    title: 'Entregamos',
    body: 'Te queda el código, la documentación de cómo está montado y lo necesario para seguir editándolo cuando nosotros ya no estemos. Sin dependencias raras ni cajas negras.',
  },
]

export default function ProcessAccordion() {
  const [open, setOpen] = useState(0)
  const reduced = useReducedMotion()
  const id = useId()

  return (
    <div className="mt-12 border-t border-edge">
      {STEPS.map((step, i) => {
        const abierto = i === open
        const panelId = `${id}-panel-${i}`
        const botonId = `${id}-boton-${i}`
        return (
          <div key={step.title} className="border-b border-edge">
            <h3 className="m-0">
              <button
                id={botonId}
                type="button"
                aria-expanded={abierto}
                aria-controls={panelId}
                // Pulsar el que ya está abierto lo cierra: deja ver la lista
                // entera de un vistazo, como el índice que es.
                onClick={() => setOpen(abierto ? -1 : i)}
                className="group flex w-full cursor-pointer items-baseline gap-4 py-3 text-left sm:gap-6"
              >
                <span
                  className={`w-4 shrink-0 self-start pt-2 text-[13px] tabular-nums transition-colors duration-300 ${
                    abierto ? 'text-pink' : 'text-blush/55 group-hover:text-blush/85'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`font-display text-[clamp(26px,5.2vw,54px)] leading-[1.06] uppercase transition-colors duration-300 ${
                    abierto
                      ? 'text-chalk'
                      : 'text-blush/25 group-hover:text-blush/55'
                  }`}
                  style={
                    abierto
                      ? { textShadow: '0 0 46px rgba(251,111,146,.45)' }
                      : undefined
                  }
                >
                  {step.title}
                </span>
              </button>
            </h3>

            {/* El panel se queda siempre en el DOM y sólo se le anima el alto: si
                se desmonta al cerrar, el `aria-controls` del botón apunta a un
                elemento que no existe, que es ARIA inválido. */}
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={botonId}
              hidden={!abierto}
              initial={false}
              animate={{ height: abierto ? 'auto' : 0, opacity: abierto ? 1 : 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }
              }
              className="overflow-hidden"
              style={{ display: 'block' }}
            >
              <p className="m-0 max-w-[62ch] pb-6 pl-8 text-[15px] leading-[1.7] text-blush sm:pl-10">
                {step.body}
              </p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
