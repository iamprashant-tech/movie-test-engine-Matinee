import * as tmdb from './tmdb.js';
import * as jikan from './jikan.js';
import * as demo from './demo.js';

export const SOURCES = {
  tmdb: { id: 'tmdb', label: 'Movies', credit: 'TMDB', api: tmdb },
  jikan: { id: 'jikan', label: 'Anime films', credit: 'Jikan', api: jikan },
  demo: { id: 'demo', label: 'Offline demo', credit: 'the built-in sample list', api: demo },
};

export const getProvider = (source) => (SOURCES[source] || SOURCES.jikan).api;
export const isSource = (s) => Object.prototype.hasOwnProperty.call(SOURCES, s);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Candidate titles for "For You": a few popular pages + the top of your best genres. */
export async function buildPool(source, favouriteGenres, signal) {
  const p = getProvider(source);
  const all = await p.genres(signal);
  const ids = favouriteGenres
    .slice(0, 2)
    .map((name) => all.find((g) => g.name === name)?.id)
    .filter(Boolean);

  const jobs = [1, 2, 3]
    .map((page) => p.list({ page, signal }))
    .concat(ids.map((genreId) => p.list({ genreId, signal })));
  const settled = await Promise.allSettled(jobs);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const ok = settled.filter((s) => s.status === 'fulfilled');
  if (!ok.length) throw settled[0].reason;

  const seen = new Map();
  for (const s of ok) for (const m of s.value.items) if (!seen.has(m.key)) seen.set(m.key, m);
  return [...seen.values()];
}

/** One random title the user hasn't rated yet. */
export async function surpriseMovie(source, skipKeys = new Set(), signal) {
  const p = getProvider(source);
  const page = 1 + Math.floor(Math.random() * p.maxSurprisePage);
  let { items } = await p.list({ page, signal });
  if (!items.length) ({ items } = await p.list({ page: 1, signal }));
  const fresh = items.filter((m) => !skipKeys.has(m.key));
  const choice = pick(fresh.length ? fresh : items);
  if (!choice) throw new Error('No titles to pick from right now.');
  return choice;
}
