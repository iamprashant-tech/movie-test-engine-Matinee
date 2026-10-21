// Jikan = unofficial MyAnimeList API. No key needed. Rate limit is ~3 req/s,
// so every request goes through a small queue.
import { getJson, sleep } from './http.js';

const BASE = 'https://api.jikan.moe/v4';
const BLOCKED = new Set(['Hentai', 'Erotica', 'Ecchi']);

let chain = Promise.resolve();
function gate(task) {
  const run = chain.then(task);
  chain = run.then(
    () => sleep(400),
    () => sleep(400)
  );
  return run;
}

function minutes(text) {
  if (!text) return null;
  const h = /(\d+)\s*hr/.exec(text);
  const m = /(\d+)\s*min/.exec(text);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return total || null;
}

export function normalize(a) {
  const source = a.genres?.length ? a.genres : a.themes || [];
  return {
    key: `jikan:${a.mal_id}`,
    source: 'jikan',
    id: String(a.mal_id),
    title: a.title_english || a.title,
    subtitle: a.title_japanese || '',
    year: a.year || a.aired?.prop?.from?.year || null,
    poster: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
    backdrop: null,
    rating: a.score || null,
    overview: a.synopsis || '',
    genres: source.map((g) => g.name).filter((n) => !BLOCKED.has(n)),
    runtime: minutes(a.duration),
  };
}

export async function genres(signal) {
  const json = await getJson(`${BASE}/genres/anime?filter=genres`, { signal, gate });
  return (json.data || [])
    .filter((g) => !BLOCKED.has(g.name))
    .map((g) => ({ id: g.mal_id, name: g.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function list({ page = 1, query = '', genreId = '', signal } = {}) {
  const p = new URLSearchParams({
    type: 'movie',
    sfw: 'true',
    order_by: 'members',
    sort: 'desc',
    limit: '24',
    page: String(page),
  });
  if (query) p.set('q', query);
  if (genreId) p.set('genres', String(genreId));
  const json = await getJson(`${BASE}/anime?${p}`, { signal, gate });
  const seen = new Set();
  const items = [];
  for (const a of json.data || []) {
    if (seen.has(a.mal_id)) continue;
    seen.add(a.mal_id);
    items.push(normalize(a));
  }
  return { items, hasNext: Boolean(json.pagination?.has_next_page) };
}

export async function detail(id, signal) {
  const json = await getJson(`${BASE}/anime/${id}`, { signal, gate });
  return normalize(json.data);
}

export const maxSurprisePage = 8;
