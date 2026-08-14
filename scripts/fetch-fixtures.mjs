// Se corre en GitHub Actions (Node, sin navegador -> sin restricción de CORS) para traer
// los partidos de hoy y los próximos días desde la API pública de SofaScore, y dejarlos
// como un archivo JSON estático que la app sirve desde su propio origen. Así el navegador
// del usuario nunca necesita llamar a api.sofascore.com directamente.
import { writeFile, mkdir } from 'node:fs/promises';

const BASE = 'https://api.sofascore.com/api/v1';
const DAYS_AHEAD = 3; // hoy + 2 días

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; FixtureFetcher/1.0)',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function slimEvent(ev) {
  return {
    id: ev.id,
    startTimestamp: ev.startTimestamp,
    status: ev.status ? { code: ev.status.code, description: ev.status.description, type: ev.status.type } : undefined,
    homeTeam: { id: ev.homeTeam?.id, name: ev.homeTeam?.name, shortName: ev.homeTeam?.shortName },
    awayTeam: { id: ev.awayTeam?.id, name: ev.awayTeam?.name, shortName: ev.awayTeam?.shortName },
    homeScore: ev.homeScore ? { current: ev.homeScore.current } : undefined,
    awayScore: ev.awayScore ? { current: ev.awayScore.current } : undefined,
    tournament: {
      name: ev.tournament?.name,
      uniqueTournament: ev.tournament?.uniqueTournament ? { name: ev.tournament.uniqueTournament.name } : undefined,
      category: ev.tournament?.category ? { name: ev.tournament.category.name } : undefined,
    },
  };
}

async function main() {
  const today = new Date();
  const days = {};

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dateKey(d);
    try {
      const data = await fetchJson(`${BASE}/sport/football/scheduled-events/${key}`);
      const events = (data.events ?? []).map(slimEvent);
      days[key] = events;
      console.log(`${key}: ${events.length} partidos`);
    } catch (err) {
      console.error(`No se pudo traer ${key}:`, err.message);
      days[key] = [];
    }
  }

  const out = { generatedAt: new Date().toISOString(), days };
  await mkdir('public/data', { recursive: true });
  await writeFile('public/data/fixtures.json', JSON.stringify(out));
  console.log('Escrito public/data/fixtures.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
