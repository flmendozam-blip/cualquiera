import { useState } from 'react';

const STEPS = [
  {
    title: '1. Partidos reales del día',
    body: 'La app se conecta a SofaScore y te muestra los partidos que se juegan hoy, próximos días o en vivo — no hace falta elegir equipos a mano. Toca "Analizar" en el que te interese.',
  },
  {
    title: '2. Datos reales al instante',
    body: 'Al analizarlo, trae forma reciente, descanso, córners, tarjetas, H2H y árbitro asignado del partido real. Si algo no está disponible, usa un promedio editable.',
  },
  {
    title: '3. Motor estadístico (Poisson)',
    body: 'Con esos datos se calculan goles, córners y tarjetas esperados, ajustados por localía, historial H2H, rigurosidad del árbitro y el tipo de competición.',
  },
  {
    title: '4. Zona objetivo 1.5–2.0',
    body: 'Marcamos con 🎯 los mercados (1X2, córners, tarjetas, más/menos goles, ambos anotan) cuya cuota cae en el rango 1.5–2.0: buscan equilibrio entre probabilidad alta y una ganancia que valga la pena.',
  },
  {
    title: '5. Simple o combinada',
    body: 'Agrega una selección al boleto para una apuesta simple, o varias de distintos partidos para una combinada. La cuota combinada es el producto de las cuotas de cada pata — cuantas más patas, más riesgo.',
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-white font-semibold">📘 Cómo funciona este análisis</span>
        <span className="text-slate-400 text-sm">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-slate-800/50 rounded-xl p-3.5">
              <p className="text-sm font-semibold text-pitch-400 mb-1">{s.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
