<div align="center">
# 🥇🗡️ Truquero 🍷🪾
 
### Marcador digital de Truco argentino
 
**Sin dependencias · Sin instalación · Abrís y jugás**
 
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML-5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![No Build](https://img.shields.io/badge/Build-None-success?style=flat-square)](#tecnología)
 
</div>
 
## 📋 Tabla de contenidos
 
- [Características](#-características)
  - [Modos de juego](#modos-de-juego)
  - [Historial de partidas](#historial-de-partidas)
  - [Otras funciones](#otras-funciones)
- [Uso](#-uso)
  - [Controles](#controles)
- [Tecnología](#-tecnología)
- [📖 Reglamento oficial del Truco Argentino](#-reglamento-oficial--truco-argentino)
  - [01 — Introducción](#01--introducción)
  - [02 — Las cartas y su jerarquía](#02--las-cartas-y-su-jerarquía)
  - [03 — Inicio del juego y el reparto](#03--inicio-del-juego-y-el-reparto)
  - [04 — El envido](#04--el-envido)
  - [05 — El truco](#05--el-truco)
  - [06 — La flor](#06--la-flor)
  - [07 — Las señas](#07--las-señas)
  - [08 — El puntaje y cómo ganar](#08--el-puntaje-y-cómo-ganar)
  - [09 — Normas de conducta y disposiciones generales](#09--normas-de-conducta-y-disposiciones-generales)
---
 
## ✨ Características
 
### Modos de juego
 
> **Modo tradicional (2 equipos)**
> - Equipos de 1, 2 o 3 jugadores
> - Marcador hasta 30 puntos (15 malas + 15 buenas) o 15 puntos (set único)
> - Display de segmentos al estilo del marcador clásico de truco
 
> **Modo Gallo (3 jugadores)**
> - Alianza rotativa 2 vs 1 por mano
> - Mano 1: A+B vs C / Mano 2: B+C vs A / Mano 3: C+A vs B
> - Botón `Sig. Mano` para rotar la alianza
> - Compatible con modo 15 puntos
 
### Historial de partidas
 
- Solo disponible en modo tradicional (no Gallo)
- Estadísticas por modalidad (1v1, 2v2, 3v3)
- Registro de victorias, derrotas y racha actual por equipo
- Las partidas se guardan al llegar al puntaje objetivo (15 o 30)
- Al guardar, el marcador se reinicia automáticamente para una nueva partida
### Otras funciones
 
- 🌗 Modo oscuro / claro
- 🔊 Sonido al sumar y restar puntos
- 💾 Persistencia automática (se guarda el estado al cerrar)
- 📱 Optimizado para mobile (portrait y landscape)
- 📲 Instalable en pantalla de inicio (iOS/Android)
---
 
## 🚀 Uso
 
Abrí `index.html` en el navegador, o accedé desde el link del repositorio vía GitHub Pages.
 
### Controles
 
| Botón | Acción |
|:---:|:---|
| `+` / `-` | Sumar o restar punto al equipo |
| `+ Gallo` | Activar modo Gallo (3 jugadores) |
| `Sig. Mano` | Rotar la alianza en modo Gallo |
| `Puntos` | Configurar partida con nombre de jugadores |
| `Historial` | Ver estadísticas y partidas guardadas |
| `Reiniciar` | Volver a cero |
| `15` / `30` | Alternar entre modo 15 y 30 puntos |
| `◑` | Alternar modo oscuro/claro |
 
---
 
## 🛠 Tecnología
 
**Vanilla JS + CSS + HTML.** Sin frameworks, sin dependencias, sin build step.
 
- Estado persistido en `localStorage`
- Sonidos generados con **Web Audio API**
- Display de segmentos construido con CSS puro
---
 
<div align="center">
# 📖 REGLAMENTO OFICIAL — TRUCO ARGENTINO
 
*Basado en la tradición popular argentina y el reglamento de la Asociación Argentina de Truco (ASART) — Juegos Evita.*
**Edición 2025.**
 
</div>
---
 
### 01 — Introducción
 
El Truco Argentino es uno de los juegos de naipes más arraigados en la cultura popular del país, derivado del Truc catalán que los inmigrantes españoles trajeron al Río de la Plata y que con el tiempo adquirió características propias e inconfundibles. Se disputa con una baraja española de cuarenta cartas, excluyendo los ochos, los nueves y los comodines. Pueden participar dos, cuatro o seis jugadores: en el caso de cuatro, se conforman dos parejas; con seis, se forman dos tríos que se enfrentan entre sí.
 
El propósito del juego es acumular treinta puntos antes que el adversario. La primera mitad del recorrido, los quince puntos iniciales, se denomina popularmente *las malas*; la segunda mitad, *las buenas*. También existe la variante reducida a quince puntos. Cada mano ofrece la oportunidad de sumar a través de dos instancias diferenciadas: el envido, que evalúa el potencial combinatorio de las cartas según su palo, y el truco, que determina quién domina la baza. La astucia, el engaño permitido y la comunicación silenciosa entre compañeros mediante señas reglamentarias son elementos tan centrales como las cartas mismas.
 
---
 
### 02 — Las cartas y su jerarquía
 
El mazo utilizado es la baraja española reducida a cuarenta naipes, obtenida al retirar los ochos, los nueves y los comodines del juego completo. Los cuatro palos que intervienen son Espada, Basto, Oro y Copa.
 
Para la disputa del truco, las cartas tienen una jerarquía precisa que no coincide con el orden numérico. El as de espadas ocupa el primer lugar y recibe el nombre de *ancho de espadas*; le sigue el as de bastos. En tercer y cuarto puesto se ubican, respectivamente, el siete de espadas y el siete de oros, conocidos como manillas. A continuación vienen los treses de todos los palos con igual valor entre sí, luego los doses, y después los ases de oro y copa —llamados *ases falsos* porque tienen menor rango que los anteriores—. Siguen las figuras: doces (sotas), onces (caballos) y dieces (reyes), todos emparejados por denominación sin distinción de palo. Por debajo se encuentran los sietes de copa y basto —*sietes falsos*—, y finalmente los seises, cincos y cuatros en orden descendente.
 
Para el cálculo del envido, solo cuentan los naipes numerados del uno al siete; las figuras —sota, caballo y rey— tienen valor cero en esta instancia.
 
<details>
<summary><b>🃏 Tabla de Jerarquía — Truco</b></summary>
<br>
| Rango | Carta | Nota |
|:---:|:---|:---|
| 1° | As de Espadas | *El ancho de espadas* — carta más alta del juego |
| 2° | As de Bastos | *El ancho de bastos* |
| 3° | Siete de Espadas | *La manilla de espadas* |
| 4° | Siete de Oros | *La manilla de oros* |
| 5° | Treses | Todos los palos, igual valor entre sí |
| 6° | Doses | Todos los palos |
| 7° | As de Oros / As de Copas | *Ases falsos* — igual valor entre sí |
| 8° | Doces (Sotas) | Todos los palos |
| 9° | Onces (Caballos) | Todos los palos |
| 10° | Dieces (Reyes) | Todos los palos |
| 11° | Siete de Copa / Siete de Basto | *Sietes falsos* — igual valor entre sí |
| 12°→ | Seises, Cincos, Cuatros | En orden descendente por número |
 
</details>
---
 
### 03 — Inicio del juego y el reparto
 
Al comienzo de cada partida se establece por corte o sorteo quién tendrá la condición de **mano** en la primera ronda. El jugador mano es quien abre el juego tirando la primera carta de la mano; esta posición confiere ventaja en situaciones de empate, ya que ante bazas igualadas o envidos empatados, quien es mano resulta ganador.
 
Quien reparte baraja el mazo y distribuye tres cartas a cada participante, entregándolas de a una en sentido horario. Completado el reparto, los jugadores observan sus cartas sin mostrarlas a nadie. En las manos posteriores, el turno de repartir se corre al jugador ubicado a la derecha de quien acaba de hacerlo.
 
En las modalidades de cuatro o seis jugadores, los integrantes de cada equipo no se sientan juntos sino alternados con sus rivales: compañero, rival, compañero, rival, en sentido circular. Está estrictamente prohibido exhibir las propias cartas, ya sea a compañeros o a adversarios, antes de ponerlas sobre la mesa.
 
---
 
### 04 — El envido
 
El envido es la primera instancia de apuesta dentro de cada mano y consiste en comparar el valor combinado de las cartas de cada jugador según sus palos. Solo puede cantarse antes de que todos los participantes hayan jugado su primera carta; transcurrido ese momento sin que nadie lo proponga, la oportunidad queda clausurada para esa mano.
 
El valor de envido de una mano se calcula del siguiente modo: si el jugador posee dos o tres cartas del mismo palo, toma los dos valores más altos entre ellas y les suma veinte puntos. Cuando las tres cartas pertenecen a palos distintos, el valor es simplemente el número más alto de las tres. Las figuras —sota, caballo y rey— valen cero en este cómputo. La puntuación máxima alcanzable es treinta y tres, lograda con siete, seis y cualquier carta del mismo palo.
 
La escala de apuestas asciende así: envido vale dos puntos; envido envido, cuatro; real envido suma tres puntos adicionales a lo acumulado; falta envido otorga lo que le reste al equipo rival para completar la partida. Las respuestas posibles son *quiero*, con lo que se disputa, o *no quiero*, con lo que quien cantó cobra el valor mínimo de la apuesta en curso. Si se acepta, cada equipo declara su puntaje en voz alta y gana quien tenga el mayor; ante igualdad, prevalece quien sea mano.
 
<details>
<summary><b>💰 Tabla de Apuestas — Envido</b></summary>
<br>
| Canto | Si se acepta | Si se rechaza |
|:---|:---:|:---:|
| **Envido** | 2 puntos | 1 pto al que cantó |
| **Envido Envido** | 4 puntos | 2 ptos al que cantó |
| **Real Envido** | +3 puntos adicionales | 1 pto al que cantó |
| **Falta Envido** | Lo que le falta al rival | 1 pto al que cantó |
 
</details>
---
 
### 05 — El truco
 
El truco es la parte central del juego: cada equipo disputa tres bazas por mano y gana quien logre dos de ellas. Una baza la gana quien arroja la carta de mayor rango según la jerarquía establecida; en caso de que dos o más cartas enfrentadas tengan el mismo valor, la baza se denomina **parda**.
 
La primera baza la abre el jugador que es mano; las siguientes las inicia quien ganó la baza anterior. Cualquier jugador puede cantar truco antes de poner su carta sobre la mesa. La escala de apuestas es la siguiente: sin ningún canto, ganar la mano vale un punto; si se canta truco y el rival lo acepta, el ganador cobra dos puntos —si lo rechaza, quien cantó cobra uno—; el equipo que aceptó el truco puede luego subir a retruco por tres puntos —si no se quiere, el otro cobra dos—; finalmente puede llegarse a vale cuatro, que otorga cuatro puntos al ganador —tres si se rechaza—. Solo puede elevar la apuesta el equipo que aceptó el canto anterior.
 
Cuando la primera baza resulta parda, queda en suspenso y la define quien gane la segunda. Si la segunda también empata, la tercera decide sin importar el resultado de las anteriores. Si las tres bazas son pardas, gana el equipo que tiene la mano. **Irse al mazo** significa que un jugador descarta sus cartas boca abajo resignando la mano; su equipo pierde con el valor vigente de la apuesta.
 
<details>
<summary><b>⚔️ Tabla de Apuestas — Truco</b></summary>
<br>
| Apuesta | Si se acepta y gana | Si se rechaza |
|:---|:---:|:---:|
| **Sin canto** | 1 punto | — |
| **Truco** | 2 puntos | 1 pto al que cantó |
| **Retruco** | 3 puntos | 2 ptos al que cantó |
| **Vale Cuatro** | 4 puntos | 3 ptos al que cantó |
 
</details>
---
 
### 06 — La flor
 
Se tiene flor cuando las tres cartas repartidas a un jugador pertenecen al mismo palo. Quien disponga de esta combinación tiene la obligación de declararla al inicio de la mano, antes de cualquier canto de envido o truco; si no lo hace y el rival lo descubre, el equipo infractor pierde la mano.
 
La presencia de flor invalida la instancia de envido: no se canta ni se disputa. En cambio, el jugador con flor suma tres puntos de forma directa, sin necesidad de que el rival la acepte. Para cobrar esos puntos, debe exhibir sus cartas una vez concluido el truco.
 
Si el equipo contrario también posee una flor, la situación abre su propia escala de apuestas: el rival puede responder con *con flor me gano*, sumando otros tres puntos; el primer equipo puede replicar con *contraflor*, elevando el valor; y la apuesta máxima es *contraflor al resto*, equivalente a lo que le falte al rival para ganar la partida. En caso de empate en el valor de la flor, gana quien sea mano.
 
> [!NOTE]
> Antes del inicio de cada partida los jugadores deben acordar si se disputa **con o sin flor**; en partidas sin flor, esta sección del reglamento no tiene aplicación.
 
---
 
### 07 — Las señas
 
Las señas son el sistema de comunicación gestual y discreta que los compañeros de equipo emplean para transmitirse información sobre sus cartas sin que los rivales puedan percibirlo. Constituyen un elemento definitorio de la identidad del Truco Argentino y su uso reglamentario es tanto un derecho como un recurso estratégico.
 
Solo se admiten las señas contempladas en este reglamento; cualquier código privado acordado fuera de sus disposiciones está prohibido y, de ser detectado en competencias formales, puede acarrear la descalificación del equipo. Las señas deben ejecutarse con discreción y sin cubrirse el rostro; los gestos ostensibles o exagerados pueden ser invalidados por el árbitro.
 
> [!TIP]
> Está expresamente permitido realizar señas falsas con el propósito de confundir al adversario, asumiendo el riesgo de inducir a error al propio compañero.
 
<details>
<summary><b>👁 Señas reglamentarias</b></summary>
<br>
| Seña | Gesto |
|:---|:---|
| **As de Espadas** | Elevar levemente ambas cejas |
| **As de Bastos** | Guiño suave de un ojo |
| **Siete de Espadas** | Mover apenas la nariz |
| **Siete de Oros** | Desplazar la comisura de los labios hacia un lado |
| **Cartas favorables** | Inflar suavemente los cachetes |
| **Cartas de poco valor** | Fruncir el ceño de forma contenida |
 
</details>
---
 
### 08 — El puntaje y cómo ganar
 
Cada partida se disputa a treinta puntos, salvo que al inicio los jugadores acuerden la variante reducida a quince. Los primeros quince puntos del recorrido se denominan *las malas*; al alcanzarlos, el equipo reinicia su conteo desde cero para disputar *las buenas*, que comprenden los quince puntos restantes. Gana quien complete los treinta antes que el adversario.
 
La contabilidad puede llevarse con porotos, fichas, palitos o anotaciones en papel; en torneos, la lleva un árbitro designado. Los puntos se obtienen de las siguientes fuentes: el truco aporta entre uno y cuatro puntos según la apuesta alcanzada; el envido contribuye con dos puntos en su forma básica, cuatro en envido envido, tres adicionales en el real envido, o una cantidad variable en el falta envido; la flor, cuando se disputa, otorga tres puntos directos, con valores adicionales posibles en su propia escala de apuestas.
 
Si los puntos obtenidos en el envido son suficientes para que un equipo complete la partida, ese equipo gana de inmediato y el truco de esa mano ya no se juega. En torneos organizados, las partidas pueden estructurarse al mejor de tres chicos, donde cada chico equivale a una partida de treinta puntos.
 
---
 
### 09 — Normas de conducta y disposiciones generales
 
El comportamiento de los jugadores durante el juego está regulado por las siguientes disposiciones. Una carta colocada boca arriba sobre la mesa se considera jugada y no puede ser retirada ni reemplazada bajo ninguna circunstancia. Los cantos —envido, truco y sus respectivas subidas— así como las respuestas deben pronunciarse en voz alta y con los términos precisos establecidos en este reglamento; el uso de expresiones ambiguas puede derivar en la pérdida de puntos o de la mano.
 
No es posible cantar truco mientras el envido permanezca pendiente de resolución; primero debe cerrarse la instancia del envido antes de pasar a la del truco. El engaño verbal —afirmar tener cartas que no se poseen, gesticular con confianza ante una mano débil— es una práctica lícita e inherente al juego. Sin embargo, los insultos, las actitudes intimidatorias y cualquier conducta que menoscabe el respeto entre participantes están expresamente prohibidos.
 
En competencias con árbitro, toda disputa sobre una jugada, un canto o la aplicación de una regla debe elevarse al árbitro designado, cuya resolución es definitiva e inapelable. Al inicio de cada partida, los jugadores deben acordar explícitamente: si se jugará con o sin flor, si la partida es a quince o treinta puntos, y si se admiten señas reglamentarias o se juega sin señas.
 
---
 
<div align="center">
*Este reglamento fue consolidado a partir del reglamento oficial de los Juegos Evita (Argentina.gob.ar / ASART) y las fuentes más consistentes del truco jugado en Argentina.*
 
<br>
**🥇🗡️ Truquero 🍷🪾**
 
</div>
 
