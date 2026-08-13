# ⚽ Analizador de Apuestas Deportivas

Aplicación web (React + TypeScript + Vite + Tailwind) para analizar partidos de fútbol
entre equipos conocidos y recibir una recomendación de apuesta (simple o combinada)
apuntando a una cuota objetivo de **1.5–2.0**.

## Qué hace

1. **Indica un partido**: elige local, visitante, fecha y competición entre ~25 equipos
   conocidos de las grandes ligas europeas y sudamericanas.
2. **Motor de análisis**: calcula goles esperados (modelo de Poisson) a partir del
   ataque/defensa de cada equipo, y los ajusta según forma reciente, ventaja de
   localía, descanso/fatiga, bajas relevantes, historial de enfrentamientos directos
   (H2H) y el tipo de competición (liga, copa, derbi, amistoso, etc.).
3. **Recomendación con cuota objetivo**: de los 10 mercados calculados (1X2, doble
   oportunidad, más/menos 2.5 goles, ambos anotan), destaca los que caen en el rango
   1.5–2.0 de cuota estimada.
4. **Boleto simple o combinado**: agrega selecciones de uno o varios partidos y la app
   calcula la cuota y probabilidad combinada en tiempo real, avisando si el riesgo es
   demasiado alto.

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
