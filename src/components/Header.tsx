export function Header() {
  return (
    <header className="flex flex-col gap-2 mb-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center text-xl">⚽</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Analizador de Apuestas Deportivas</h1>
          <p className="text-sm text-slate-400">Fútbol · equipos conocidos · apuestas simples y combinadas</p>
        </div>
      </div>
    </header>
  );
}
