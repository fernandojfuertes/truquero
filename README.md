# 🥇🗡️ Truquero 🍷🪾

Marcador digital de Truco argentino. Sin dependencias, sin instalación — abrís y jugás.

## Características

### Modos de juego

**Modo tradicional (2 equipos)**
- Equipos de 1, 2 o 3 jugadores
- Marcador hasta 30 puntos (15 malas + 15 buenas) o 15 puntos (set único)
- Display de segmentos al estilo del marcador clásico de truco

**Modo Gallo (3 jugadores)**
- Alianza rotativa 2 vs 1 por mano
- Mano 1: A+B vs C / Mano 2: B+C vs A / Mano 3: C+A vs B
- Botón "Sig. Mano" para rotar la alianza
- Compatible con modo 15 puntos

### Historial de partidas
- Solo disponible en modo tradicional (no Gallo)
- Estadísticas por modalidad (1v1, 2v2, 3v3)
- Registro de victorias, derrotas y racha actual por equipo
- Las partidas se guardan al llegar al puntaje objetivo (15 o 30)
- Al guardar, el marcador se reinicia automáticamente para una nueva partida

### Otras funciones
- Modo oscuro / claro
- Sonido al sumar y restar puntos
- Persistencia automática (se guarda el estado al cerrar)
- Optimizado para mobile (portrait y landscape)
- Instalable en pantalla de inicio (iOS/Android)

## Uso

Abrí `index.html` en el navegador, o accedé desde el link del repositorio via GitHub Pages.

### Controles

| Botón | Acción |
|-------|--------|
| `+ / -` | Sumar o restar punto al equipo |
| `+ Gallo` | Activar modo Gallo (3 jugadores) |
| `Sig. Mano` | Rotar la alianza en modo Gallo |
| `Puntos` | Configurar partida con nombre de jugadores |
| `Historial` | Ver estadísticas y partidas guardadas |
| `Reiniciar` | Volver a cero |
| `15` / `30` | Alternar entre modo 15 y 30 puntos |
| `◑` | Alternar modo oscuro/claro |

## Tecnología

Vanilla JS + CSS + HTML. Sin frameworks, sin dependencias, sin build step.

- Estado persistido en `localStorage`
- Sonidos generados con Web Audio API
- Display de segmentos construido con CSS puro
