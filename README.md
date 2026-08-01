# Gem Eyes — Dox Designs

Landing construida sobre el diseño de Claude Design (proyecto *Gem Eyes web
development*), con 14 frames ilustrados a mano como hero a pantalla completa.

```bash
npm run dev
```

Queda en `http://localhost:5174`. Build de producción con `npm run build`.

## Stack

| Pieza | Para qué |
|---|---|
| Vite 8 + React 19 | Base |
| Tailwind v4 | Estilos y tokens |
| `motion` v12 (Framer Motion) | Toda la animación |
| `lenis` | Scroll con inercia (desactivado en táctil y reduced-motion) |
| `lucide-react` | Iconos SVG |

## Tipografía

**Starbim** para títulos y **Super Bouncer** para todo lo demás, autoalojadas en
`public/fonts` y declaradas con `@font-face` en `src/index.css`.

Dos rarezas de **Starbim** que condicionan el copy:

- **La "A" se dibuja como una estrella ★.** "HACEMOS" sale "H★CEMOS". Es un rasgo
  de la fuente, no un fallo.
- **Las vocales acentuadas se dibujan sin acento.** El glifo existe (no sale
  cuadrito) pero "ILUSTRACIÓN" se ve "ILUSTRACION", que en español es una falta.
  Por eso el segundo servicio se llama "Arte que responde" y no "Ilustración que
  responde". **Cualquier título nuevo debe evitar acentos**, o usar Super Bouncer.
  Tampoco tiene `¿ ¡ — ·`.

**Super Bouncer** es una tipografía de display, no de texto corrido; el cuerpo va a
17 px con interlineado 1.78 para compensar. Si algún bloque de texto crece mucho,
conviene revisar si sigue siendo cómodo de leer.

## Paleta

Gumdrop / CherryPop: base cereza casi negra, rosas chicle y rojo cereza, con
mantequilla y menta como acentos para que no todo sea el mismo rosa. Tokens en
`src/index.css`.

| Token | Valor | Uso |
|---|---|---|
| `void` / `void-deep` | `#1C0412` / `#12030A` | Fondo y footer |
| `panel` / `edge` | `#3B0B20` / `#6E1339` | Paneles y bordes |
| `pink` | `#FB6F92` | Rosa principal |
| `cherry` | `#E01E37` | Rojo cereza, acento fuerte |
| `bubblegum` / `gumdrop` | `#FF8FAB` / `#FFB3C6` | Rosas de apoyo |
| `butter` / `mint` | `#FFE9A8` / `#A9E5CB` | Acentos que rompen el rosa |
| `chalk` / `blush` | `#FFF0F6` / `#F3AEC6` | Texto principal y secundario |

## El fundido entre frames — `src/components/Portrait.jsx`

La regla que hace que el cambio de frame no se note:

> El frame **saliente** se queda opaco por debajo mientras el **entrante** sube de
> 0 a 1 por encima.

Si los dos se cruzan (uno bajando y otro subiendo), a mitad de camino sus opacidades
suman menos de 1 y se transparenta el fondo oscuro de la página. Eso producía un
oscurecimiento visible en cada cambio de dirección del cursor. Manteniendo el
saliente a 1 por debajo, la suma nunca baja de 1 y sólo se ve morfear la pupila.

Por eso la opacidad se maneja de forma imperativa con refs y transiciones CSS, y no
con `animate` de Framer: hace falta control exacto del orden z y del reflow entre
poner el entrante a 0 y arrancar su transición.

## El motor de ojos — `src/lib/useGazeEngine.js`

Cuatro capas con prioridad **destello/parpadeo > distracción > mirada**.

- **Mirada suave.** No salta entre frames: calcula la ruta por la rejilla 3×3
  (`pathBetween` en `src/frames.js`) y pasa por los intermedios. De `l` a `r` cruza
  por `c`. Con fundido de 195 ms y paso de 105 ms, los frames intermedios nunca
  llegan a opacidad 1, así que el ojo parece deslizarse. (Eran 260/140; se subió un
  cuarto la velocidad. El parpadeo no se tocó.)
- **Parpadeo con corte seco.** 30 → 70 → 100 → 70 → 30 sin fundido. Si se funde,
  deja de leerse como parpadeo y parece una disolvencia.
- **Destello encadenado.** Después de *cada* parpadeo entra el frame de ojos
  brillantes, con fundido de entrada y salida.
- **Bucle en móvil.** Sin cursor la mirada recorre el anillo completo y se distrae
  cada cinco pasos. Entre eso y el ciclo de parpadeo se ven los catorce frames.

Ajustes en las constantes del principio del archivo: `GAZE_FADE`, `GAZE_STEP`,
`BLINK_SEQUENCE`, `SPARK_HOLD`, `BLINK_GAP`, `WANDER_GAP`.

## Los brillos

**Capa de destellos** (`public/media/glints-*.webp`, 20 KB). Se generó restando el
frame base al frame de "ojos destellando" y quedándose sólo con lo que el segundo
añade por encima de un umbral de luminancia de 80. El resultado son los destellos
aislados sobre fondo transparente.

Se superpone con `mix-blend-mode: screen` sobre el frame que toque, así que los ojos
brillan mirando en cualquier dirección y no sólo de frente. Como está anclada a las
pupilas centradas, la capa se desplaza con la mirada (`gx`/`gy` en `Portrait.jsx`)
para que el brillo acompañe al ojo. Pulsa despacio en reposo y sube de golpe durante
el destello.

Para regenerarla con otro umbral hay que rehacer el script de extracción; el umbral
bajo (60) deja demasiado ruido de los bordes y el alto (100) queda casi invisible.

**Capa de luz global** (`src/components/LightLayer.jsx`). Va fija detrás del
contenido, así que acompaña a todas las secciones sin repetirse en cada una: cuatro
orbes que derivan con ritmos distintos, dos franjas de luz que barren la página con
el scroll y un halo que persigue al cursor. Para que se vea, las secciones deben
tener fondo semitransparente — por eso el fondo del cierre usa `rgba` y no hex.

**Campos de destellos** (`src/components/SparkleField.jsx`). Reparten la capa de
brillos del arte a escalas muy distintas — desde 10 px hasta 800 px — mezclada con
estrellas, todo en blend `screen`. El reparto sale de un PRNG con semilla, así que
es aleatorio pero idéntico en cada render; cambiando `seed` sale otra distribución.
Hay dos campos fijos a pantalla completa (uno detrás y otro delante del contenido)
y uno por sección.

La densidad es alta pero la opacidad de cada pieza es baja (0,08–0,34). Subirla
lava el color del retrato y quema los ojos: el efecto lo hace la cantidad, no la
intensidad.

## Imágenes y carga

Los frames se sirven **sólo en WebP**, en cuatro anchos (800/1200/1584/2400). Se
probó AVIF y a 2400 px salía más pesado que WebP para esta ilustración (2.034 KB
frente a 1.525 KB el juego completo); como el AVIF va primero en `<picture>`, el
navegador acababa eligiendo la opción peor.

**Cuidado con el `sizes`.** El retrato va en `cover` sobre una imagen 2.36:1 dentro
de un hueco más alto que ancho, así que se escala por altura: el ancho que hace
falta es ~2,45× la altura de la ventana, no su ancho. Con `sizes="100vw"` el
navegador pedía el tier de 1584 y reescalaba hacia arriba, anulando la mejora de
calidad. Por eso `SIZES_COVER = '245vh'` en `Portrait.jsx`, y `tierFor()` en
`frames.js` hace el mismo cálculo para que el precargador baje exactamente lo mismo.

Cuatro de los catorce originales sólo miden 1584 px de ancho
(`FrameDiagonalDerechoAbajo`, `FrameDiagonalIzquierdaAbajo`,
`FrameOjosCerrados70Porciento`, `FrameOjosDestellando`). Se reescalan igualmente a
2400 para que no haya un salto de nitidez al cambiar de dirección, pero **no ganan
detalle**: si tienes los originales a resolución completa, reexportarlos mejoraría
esos cuatro.

**Precargador** (`src/components/Preloader.jsx`): descarga el tier que la ventana va
a pedir de verdad antes de descubrir la página, con barra de progreso. Se cae solo a
los 9 s si algo se atasca, y un frame que falle no bloquea la carga.

**Los PNG originales no están en el repo.** Los catorce `Frame*.png` (73,8 MB) están
en `.gitignore`: siguen en la carpeta del proyecto pero fuera del control de
versiones, para que un clon pese 4 MB en vez de 78. Si los necesitas para regenerar
los WebP, pídeselos a quien tenga el arte fuente.

## Móvil

Hay **dos encuadres** del mismo arte:

| Encuadre | Archivos | Aspecto | Cuándo |
|---|---|---|---|
| Completo | `*-800…2400.webp` | 2.36:1 | Escritorio |
| Móvil | `*-m480…1200.webp` | 1.51:1 | Hasta 860 px de ancho |

El móvil es el arte recortado al 64 % del ancho: conserva los dos ojos con margen
y ocupa bastante más alto que el encuadre completo, que en un teléfono se queda en
una banda fina. La banda se pinta además a **112 vw**, desbordando por los lados,
para que los ojos salgan más grandes sin recortar nada del encuadre. En un móvil
de 390 px eso da 437×289 en vez de los 390×165 del arte sin recortar.

**Hubo un intento de hero a pantalla completa en vertical y se revirtió.** Consistía
en un recorte 0.55:1 de un solo ojo — la única forma geométrica de llenar una
pantalla alta, porque los dos ojos juntos ocupan el 62 % del ancho del arte. Llenaba
bien, pero se perdía la animación completa. Si algún día se retoma: el ojo izquierdo
va de 0.195 a 0.414 del ancho (centro **0.3045**, medido detectando el contorno del
párpado por columnas, no a ojo), y hay que recordar que `cover` sobre una pantalla
más estrecha que el recorte se come otro tanto por los lados.

**Rendimiento — modo ligero** (`src/lib/useDevice.js`). Se activa con puntero
grueso, pocos núcleos o `prefers-reduced-motion`, y recorta lo que no aporta:

- Se apagan **todos los bucles de parallax por cursor** (campos de destellos,
  partículas del hero, halo de la capa de luz). En táctil no hay cursor, así que
  eran seis `requestAnimationFrame` moviendo ~90 nodos por frame para nada.
- Menos piezas por campo de destellos, menos orbes y blur más corto.
- El `Tilt` de las tarjetas devuelve un `div` plano: sin cursor no se dispara nunca
  y sólo añadía una capa de composición por tarjeta.

Medido con la CPU 6× ralentizada: **18 → 24 FPS**, animaciones CSS simultáneas
99 → 33, nodos 739 → 497, imágenes 51 → 32.

## El acordeón del proceso — `src/components/ProcessAccordion.jsx`

Índice numerado al estilo de la referencia: los títulos cerrados quedan apagados,
el abierto se enciende y despliega su párrafo. Pulsar el abierto lo cierra, así se
puede ver la lista entera de un vistazo.

**El panel se queda siempre en el DOM** y sólo se le anima el alto. Si se desmonta
al cerrar (con `AnimatePresence`), el `aria-controls` del botón apunta a un
elemento que no existe, que es ARIA inválido.

Los títulos evitan tildes y eñes: Starbim dibuja las acentuadas sin acento y la eñe
sin virgulilla, así que "Diseñamos" saldría "DISENAMOS".

## El degradado animado — `src/components/AnimatedGradient.jsx`

Shader WebGL2 de fondo en la sección de contacto. Es una adaptación del componente
original, que venía para **shadcn + TypeScript + Next.js**: se quitaron los tipos,
el `"use client"`, el helper `cn` y el `WebGLErrorBoundary` externo (el respaldo va
integrado). El shader es el mismo.

Tres cosas añadidas por el camino:

- **Se pausa fuera de pantalla.** El shader corre a pantalla completa; con
  `useInView` el bucle se detiene y el contexto se libera mientras la sección no se
  ve, que es la mayor parte de la página. También se apaga entero en modo ligero.
- **El lienzo se limita a 1.5× de densidad.** Pintar un shader a resolución retina
  completa no se nota aquí y cuesta bastante.
- **Hace falta un velo entre el degradado y el texto.** Sin él, el párrafo cae
  sobre las zonas rosas claras del shader y se vuelve ilegible. Va en `z-0` como el
  degradado pero después en el DOM, así que lo tapa a él y no al contenido.

Si WebGL2 falla, se pinta el degradado CSS que había antes en vez de dejar hueco.

## Los post-its — `src/components/PostIts.jsx`

Notas de **cristal tintado** clavadas con chincheta y unidas por un hilo de puntos.
El fondo de cada una es un degradado de rosa y cereza con alfa bajo, el desenfoque
lo pone `backdrop-filter` y un reflejo diagonal es lo que las hace leerse como
vidrio y no como un panel translúcido cualquiera.

Tres detalles que costaron un par de vueltas:

- **El hilo va por encima de las tarjetas 2 y 3**, no por los huecos entre
  columnas. El hueco de la retícula son 32 px y la línea quedaba tapada; el
  desnivel entre notas (0 / 104 / 28 px) deja una franja despejada arriba por la
  que sí se ve.
- **No usar `pathLength` de Framer para dibujarla.** Lo implementa con el propio
  `strokeDasharray`, así que pisa el punteado y la deja continua. Se anima
  `strokeDashoffset` en su lugar, que además hace que los puntos se enhebren.
- **`vectorEffect="non-scaling-stroke"` es obligatorio.** El `viewBox` va estirado
  con `preserveAspectRatio="none"` para poder colocar el trazado en porcentajes, y
  eso deforma también el patrón de guiones: sin ese atributo salen cuatro rayas
  largas en vez de una línea de puntos.

**La galería es una cinta en rotación continua, no un carril con scroll.** La pista
lleva los catorce frames dos veces y se desplaza el 50 % de su ancho, así que al
cerrar el ciclo la copia queda donde estaba la original y el salto no se ve. Se pausa
al pasar el cursor por encima.

Esto además resuelve de raíz un problema que dio guerra: tanto el `scroll-snap`
horizontal como el `drag` de Framer se comían el swipe vertical de la página al
llegar a esta sección, y se quedaba clavada ahí (medido: 19 px de avance con snap,
385 sin él). Al ser sólo una animación, el dedo pasa de largo. **No volver a poner
scroll horizontal ni drag en este carril.**

## Otras notas
- `SplitText` guarda el texto real en un `sr-only` y marca las letras animadas como
  `aria-hidden` + `select-none`: el lector de pantalla anuncia el titular completo y
  al seleccionar se copia limpio.
- `src/frames.js` apunta al WebP a propósito. El conversor genera un fallback PNG de
  ~2,4 MB por frame cuando la imagen tiene canal alfa; no se sirven.

## Pendiente de revisión

- **Los textos son un primer borrador.** Servicios, galería y cierre están escritos
  a partir de lo que decía el diseño, no de información real del estudio.
- **`hola@doxdesigns.co` es inventado.** Sustituir por el correo real en
  `src/components/Sections.jsx` (`Closing` y `Footer`).
- **No hay menú en móvil.** El diseño oculta los enlaces del nav bajo 860 px sin
  poner nada en su lugar; se mantuvo así.

## Peso

Lo que descarga un visitante es **un solo tier**, no todo el disco.

| | |
|---|---|
| PNG originales (fuera del repo) | 73,8 MB |
| Clon del repo | 4,2 MB |
| WebP en disco (4 anchos, 14 frames) | 3,2 MB |
| Lo que baja un móvil (tier 800) | ~354 KB |
| Lo que baja un escritorio 1440×900 (tier 2400) | ~1,5 MB |
| Capa de destellos | 20 KB |
| Fuentes (Starbim + Super Bouncer) | 266 KB |
| JS de la app | 122 KB gzip |
