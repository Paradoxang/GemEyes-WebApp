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
  por `c`. Con fundido de 260 ms y paso de 140 ms, los frames intermedios nunca
  llegan a opacidad 1, así que el ojo parece deslizarse.
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

## Otras notas

- El retrato va en `contain` en móvil: con `cover`, un 2.36:1 en pantalla vertical
  se recorta tanto que solo queda la nariz. La banda se ancla al tercio superior.
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
| PNG originales | 73,8 MB |
| WebP en disco (4 anchos, 14 frames) | 3,2 MB |
| Lo que baja un móvil (tier 800) | ~354 KB |
| Lo que baja un escritorio 1440×900 (tier 2400) | ~1,5 MB |
| Capa de destellos | 20 KB |
| Fuentes (Starbim + Super Bouncer) | 266 KB |
| JS de la app | 122 KB gzip |
