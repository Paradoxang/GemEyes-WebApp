# ReplicaOG — la demo cruda

Versión primitiva de Gem Eyes, hecha a propósito para comparar el antes y el
después lado a lado. **No es una fase real del proyecto**: es un punto de partida
forzado, el aspecto que tendría la pieza si se hubiera dejado en la primera prueba
funcional.

```bash
cd ReplicaOG
npm install
npm run dev
```

Levanta en `http://localhost:5175`. El proyecto principal usa el 5174, así que se
pueden tener los dos abiertos a la vez.

## Por qué no es el commit inicial

Partió del primer commit del repo (`e1525dc`), pero ese punto ya estaba bastante
avanzado: traía la tipografía Starbim, la paleta Gumdrop/CherryPop, la capa de
destellos y el precargador. El repositorio se creó tarde y las versiones
anteriores —la primera página montada, la implementación con Anton y paleta
violeta, la intermedia con Syne— **no están en la historia y no se pueden
recuperar**. Como comparación se quedaba corta, se rehízo hacia atrás a mano.

## Qué tiene de primitivo

- **Sin framework de estilos.** Se quitó Tailwind; el CSS está escrito a mano en
  `src/index.css` y son 1,1 kB.
- **Sin tipografías propias.** Arial y las del sistema. Nada de Starbim ni
  Super Bouncer.
- **Sin motor de animación.** Fuera `motion`, `lenis` y `lucide-react`. Sólo
  quedan React y Vite.
- **Colores por defecto.** Fondo blanco, texto casi negro, enlaces azules, bordes
  grises, botones sin estilar.
- **Mirada cruda.** Una sola `<img>` a la que se le cambia el `src` según en qué
  tercio de la pantalla esté el ratón. Sin frames intermedios, sin fundidos y sin
  precarga: el cambio se ve como un corte y a veces parpadea en blanco mientras
  carga la siguiente imagen.
- **Parpadeo con `setInterval`** y tiempos fijos, sin encadenar el destello.
- **Un solo tamaño de imagen** (`*-800.webp`), sin `srcset` ni variantes por
  dispositivo. Tampoco hay capa de destellos.
- **Maquetación en HTML plano**: lista ordenada para los servicios, cuadrícula
  simple para la galería, tabla con bordes para los datos.

## Qué resuelve la versión terminada

| | ReplicaOG | Principal |
|---|---|---|
| Módulos que compila | 17 | 2 204 |
| CSS | 1,1 kB | 38,8 kB |
| JS | 62 kB gzip | 127 kB gzip |
| Cambio de frame | Corte seco, parpadeo en blanco | Ruta por frames intermedios, sin oscurecimiento |
| Parpadeo | `setInterval`, sin destello | Secuencia encadenada con destello |
| Imágenes | Un tamaño | Cuatro anchos + recorte propio para móvil |
| Carga | Ninguna precarga | Precargador con barra de progreso |
| Móvil | Sin adaptar | Encuadre propio y modo ligero |

Los detalles de cada decisión están en el README del proyecto principal.
