import { useState } from 'react';

const STEPS = [
  {
    title: '1. Elige el partido',
    body: 'Selecciona local, visitante, fecha y competición. Cada equipo trae datos de ejemplo (forma, ataque/defensa, localía) que puedes editar con la información real y actual.',
  },
  {
    title: '2. Motor estadístico (Poisson)',
    body: 'A partir del ataque/defensa de cada equipo se calculan los goles esperados (xG). Luego se ajustan por forma reciente, descanso, bajas, historial H2H y el tipo de competición.',
  },
  {
    title: '3. Probabilidad → cuota',
    body: 'Con el xG se construye la distribución de resultados y se obtiene la probabilidad de cada mercado (1X2, doble oportunidad, más/menos 2.5 goles, ambos anotan). La probabilidad se convierte en una cuota estimada de mercado.',
  },
  {
    title: '4. Zona objetivo 1.5–2.0',
    body: 'Marcamos con 🎯 los mercados cuya cuota cae en el rango 1.5–2.0: buscan un equilibrio entre probabilidad razonablemente alta y una ganancia que valga la pena.',
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
