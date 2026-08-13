# ⚽ Analizador de Apuestas Deportivas

Aplicación web (React + TypeScript + Vite + Tailwind) para analizar partidos de fútbol
entre equipos conocidos y recibir una recomendación de apuesta (simple o combinada)
apuntando a una cuota objetivo de **1.5–2.0**.

## Qué hace

1. **Explora partidos reales**: el panel "🌍 Explorar partidos reales (SofaScore)" lista
   los partidos programados o en vivo de cualquier competición y equipo del mundo para la
   fecha que elijas — no solo equipos conocidos — y con un clic trae forma reciente real,
   descanso, córners, tarjetas, historial H2H y el árbitro asignado.
2. **O indícalo a mano**: elige local, visitante, fecha y competición entre ~25 equipos
   conocidos precargados, o cualquier equipo que hayas traído desde SofaScore.
3. **Motor de análisis**: calcula goles esperados (modelo de Poisson) a partir del
   ataque/defensa de cada equipo, y los ajusta según forma reciente, ventaja de
   localía, descanso/fatiga, bajas relevantes, historial de enfrentamientos directos
   (H2H) y el tipo de competición (liga, copa, derbi, amistoso, etc.). También modela
   córners y tarjetas (ajustadas por el promedio de rigurosidad del árbitro asignado).
4. **Recomendación con cuota objetivo**: de los 14 mercados calculados (1X2, doble
   oportunidad, más/menos 2.5 goles, ambos anotan, más/menos córners, más/menos
   tarjetas), destaca los que caen en el rango 1.5–2.0 de cuota estimada.
5. **Boleto simple o combinado**: agrega selecciones de uno o varios partidos y la app
   calcula la cuota y probabilidad combinada en tiempo real, avisando si el riesgo es
   demasiado alto.

## Partidos reales y equipos "no conocidos" (SofaScore)

El panel **"🌍 Explorar partidos reales"** usa la API pública (no documentada
oficialmente) de SofaScore para listar partidos reales de cualquier liga o copa del
mundo. Al pulsar "+ Analizar" en un partido:

- Si el equipo no está en la base curada, se crea automáticamente con datos neutros
  editables (no hace falta que sea un equipo "conocido").
- Se intenta traer, en paralelo y con manejo de errores: forma reciente real (últimos 5
  resultados y goles), días de descanso desde el último partido, promedio real de
  córners/tarjetas de los últimos partidos, historial de enfrentamientos directos, y el
  nombre del árbitro asignado.
- Como es una API no oficial, algún dato puede no venir disponible; en ese caso el
  análisis usa promedios neutros que puedes corregir a mano desde el editor de equipo o
  de árbitro.

## Mercado de tarjetas y árbitros

Cada partido tiene una sección de árbitro: si SofaScore trae su nombre se asigna
automáticamente (con un promedio de tarjetas neutro hasta que lo ajustes), o puedes
asignar/crear uno manualmente. Ese promedio, junto con el de tarjetas de ambos equipos,
alimenta el mercado de más/menos tarjetas — puedes editarlo en cualquier momento desde su
propio panel.

## Cuotas reales (Betano y otras casas)

El panel **"🔌 Cuotas reales"** conecta con [The Odds API](https://the-odds-api.com/), un
agregador independiente de cuotas de casas de apuestas reales (Betano incluida cuando
está disponible en la región) por un canal oficial — la app no hace scraping de Betano.
Pega tu propia API key gratuita (se guarda solo en tu navegador), carga las ligas
disponibles y busca partidos próximos o en vivo con sus cuotas 1X2 reales. Cada partido
que analices desde ahí queda comparado, dentro de su tarjeta, contra la recomendación del
modelo. La app no coloca apuestas por ti: la selección final siempre la haces tú en Betano.

## Datos de los equipos

Los datos de identidad (nombre, liga, país) son reales. Los valores de forma reciente,
rating, ataque/defensa, descanso, bajas e historial H2H son una **semilla editable**:
haz clic en el nombre de cualquier equipo dentro de un partido para abrir su editor y
actualizar esos valores con la información real y actual antes de analizar, y usa el
editor de "Historial H2H" dentro de cada partido para cargar los enfrentamientos reales
entre esos dos equipos.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
```

## Aviso

Herramienta analítica y educativa. No garantiza resultados. Juega con responsabilidad.
