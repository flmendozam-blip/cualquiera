# ⚽ Analizador de Apuestas Deportivas

Aplicación web (React + TypeScript + Vite + Tailwind) para analizar partidos de fútbol
reales y recibir una recomendación de apuesta (simple o combinada) apuntando a una cuota
objetivo de **1.5–2.0**.

## Qué hace

1. **Partidos y cuotas reales**: el panel "🌍 Partidos reales y cuotas (The Odds API)"
   lista partidos próximos o en vivo de las ligas que elijas, con sus cuotas 1X2 reales
   (incluida Betano cuando está disponible) — no hace falta elegir equipos a mano. Si un
   rival no está en la base curada, se crea automáticamente con datos editables.
2. **O indícalo a mano**: elige local, visitante, fecha y competición entre ~25 equipos
   conocidos precargados, o cualquier equipo que hayas traído del panel de arriba.
3. **Motor de análisis**: calcula goles esperados (modelo de Poisson) a partir del
   ataque/defensa de cada equipo, y los ajusta según forma reciente, ventaja de
   localía, descanso/fatiga, bajas relevantes, historial de enfrentamientos directos
   (H2H) y el tipo de competición (liga, copa, derbi, amistoso, etc.). También modela
   córners y tarjetas (ajustadas por el promedio de rigurosidad del árbitro asignado).
4. **Recomendación con cuota objetivo**: de los 16 mercados calculados (1X2, doble
   oportunidad, más/menos 2.5 goles, ambos anotan, más/menos córners, más/menos remates al
   arco, más/menos tarjetas), destaca los que caen en el rango 1.5–2.0 de cuota estimada.
5. **Boleto simple o combinado**: agrega selecciones de uno o varios partidos y la app
   calcula la cuota y probabilidad combinada en tiempo real, avisando si el riesgo es
   demasiado alto.

## Por qué The Odds API y no SofaScore

Primero se intentó listar partidos con la API pública (no oficial) de SofaScore, pero
bloquea el acceso automatizado con un 403 — tanto llamadas directas desde el navegador
(CORS) como desde un servidor (se probó en GitHub Actions y también fue bloqueado, señal
de que filtran por reputación de IP/bot, no solo CORS). No tiene sentido intentar evadir
esa protección, así que la app usa **[The Odds API](https://the-odds-api.com/)**: un
proveedor pensado justamente para que apps de terceros consuman partidos y cuotas reales
por un canal oficial y documentado. No se hace scraping de Betano en ningún momento.

Para usar este panel: creá una cuenta gratuita en the-odds-api.com (plan free: 500
solicitudes/mes), pegá tu API key en el panel (se guarda solo en tu navegador), cargá las
ligas disponibles y buscá partidos. Cada búsqueda de partidos consume una solicitud de tu
cuota, por eso es un paso manual y no automático.

## Detalle real del partido (córners, remates, árbitro) — API-Football

Cada partido analizado tiene un botón **"🔎 Traer datos reales del partido"** que consulta
[API-Football](https://rapidapi.com/api-sports/api/api-football) (vía RapidAPI): a
diferencia de SofaScore, está pensada para que apps de terceros la llamen directo con una
API key propia, así que no choca con CORS. Trae:

- Córners y remates al arco reales de los últimos partidos de cada equipo, **separados
  por local/visitante** — el modelo usa el promedio como local del equipo que juega en
  casa y el promedio como visitante del que juega afuera, en vez de un promedio genérico.
- El árbitro asignado al partido, que se asigna automáticamente en la sección de árbitro.

Necesita tu propia API key gratuita de RapidAPI (plan free: 100 solicitudes/día — un
análisis completo de un partido consume entre 10 y 15, así que alcanza para varios
partidos por día). Si no tenés API key o la consulta falla, el análisis sigue funcionando
con los promedios editables de siempre.

## Árbitros

Cada partido tiene una sección de árbitro: podés asignar uno existente, crear uno nuevo
con su promedio de tarjetas por partido, o dejar que lo asigne automáticamente el botón de
arriba. Ese promedio, junto con el de tarjetas de ambos equipos, alimenta el mercado de
más/menos tarjetas — todo editable desde su propio panel.

## Datos de los equipos

Los datos de identidad (nombre, liga, país) de los ~25 equipos precargados son reales.
Los valores de forma reciente, rating, ataque/defensa, descanso, córners, tarjetas, bajas
e historial H2H son una **semilla editable**: hacé clic en el nombre de cualquier equipo
dentro de un partido para abrir su editor y actualizar esos valores con la información
real y actual antes de analizar, y usá el editor de "Historial H2H" dentro de cada
partido para cargar los enfrentamientos reales entre esos dos equipos. Los equipos que
traigas desde el panel de partidos reales arrancan con valores promedio neutros que
también podés ajustar ahí mismo.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
```

Se despliega automáticamente a GitHub Pages en cada push a la rama de este proyecto
(`.github/workflows/deploy.yml`).

## Aviso

Herramienta analítica y educativa. No garantiza resultados. Juega con responsabilidad.
