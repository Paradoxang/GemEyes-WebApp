# ReplicaOG — punto de partida congelado

Copia del proyecto tal y como estaba en el **primer commit del repo**
(`e1525dc`, "Gem Eyes: landing interactiva con retrato de seguimiento de mirada").
Existe sólo para comparar el antes y el después lado a lado. **No se toca.**

```bash
cd ReplicaOG
npm install
npm run dev
```

Levanta en `http://localhost:5175`. El proyecto principal usa el 5174, así que se
pueden tener los dos abiertos a la vez.

## Qué NO es esto

El repositorio se creó tarde, cuando la página ya llevaba varias iteraciones
encima. Estas versiones anteriores **no están en la historia de git y no se pueden
recuperar**:

- La primera página que se montó (paleta rosa claro, tipografías Archivo / Space
  Grotesk, secciones distintas).
- La primera implementación del diseño de Claude Design (tipografía Anton, paleta
  violeta nocturna con acentos magenta y cian).
- La versión intermedia con Syne.

Así que este punto de partida ya trae la tipografía Starbim + Super Bouncer, la
paleta Gumdrop/CherryPop, la capa de destellos y el precargador.

## Qué cambió desde aquí

Lo que se ve distinto al comparar con el proyecto principal:

| | ReplicaOG (antes) | Principal (después) |
|---|---|---|
| Hero | Con botón "Ver el trabajo", titular a 74 px | Sin botón, titular a 98 px |
| Servicios | Paneles con borde y marcas "+" | Post-its de cristal tintado con chincheta e hilo |
| Proceso | Sólo la banda de datos | Acordeón de seis pasos + banda de datos |
| Galería | Carril arrastrable con 7 frames | Cinta en rotación continua con los 14 |
| Cierre | Degradado CSS estático | Shader WebGL2 animado |
| Móvil | Encuadre completo 2.36:1, sin optimizar | Recorte propio 1.51:1, modo ligero, texturas limitadas |
| Mirada | Fundido 260 ms / paso 140 ms | 195 ms / 105 ms |

Los detalles de cada cambio están en el README del proyecto principal.
