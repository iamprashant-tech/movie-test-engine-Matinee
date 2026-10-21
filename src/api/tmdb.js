// TMDB needs a free API key (https://www.themoviedb.org/settings/api).
// Accepts either the v3 key (32 chars) or the v4 "read access token".
import { ApiError, getJson } from './http.js';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';
export const KEY_STORAGE = 'matinee.tmdbKey';

export function getKey() {
  const env = import.meta.env?.VITE_TMDB_KEY || '';
  try {
    return (localStorage.getItem(KEY_STORAGE) || env).trim();
  } catch {
    return env.trim();
  }
}

// When deployed (Vercel) the key lives on the server in /api/tmdb, so visitors need no key.
export const proxy = { enabled: import.meta.env?.VITE_TMDB_PROXY === 'true' };
export const canUse = () => Boolean(getKey()) || proxy.enabled;

function request(path, params = {}, signal) {
  const key = getKey();
  const p = new URLSearchParams({ language: 'en-US', ...params });

  if (!key) {
    if (!proxy.enabled) throw new ApiError(401, 'Add your free TMDB API key to load movies.');
    const q = new URLSearchParams({ path, ...Object.fromEntries(p) });
    return getJson(`/api/tmdb?${q}`, { signal });
  }

  const headers = {};
  if (key.length > 40) headers.Authorization = `Bearer ${key}`;
  else p.set('api_key', key);
  return getJson(`${BASE}${path}?${p}`, { signal, headers });
}

const yearOf = (d) => (d ? Number(String(d).slice(0, 4)) || null : null);

function normalize(m, names) {
  const genreNames = m.genres
    ? m.genres.map((g) => g.name)
    : (m.genre_ids || []).map((id) => names.get(id)).filter(Boolean);
  return {
    key: `tmdb:${m.id}`,
    source: 'tmdb',
    id: String(m.id),
    title: m.title,
    subtitle: m.tagline || '',
    year: yearOf(m.release_date),
    poster: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `${IMG}/w1280${m.backdrop_path}` : null,
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
    overview: m.overview || '',
    genres: genreNames,
    runtime: m.runtime || null,
  };
}

export async function genres(signal) {
  const json = await request('/genre/movie/list', {}, signal);
  return json.genres.map((g) => ({ id: g.id, name: g.name }));
}

export async function list({ page = 1, query = '', genreId = '', signal } = {}) {
  const all = await genres(signal);
  const names = new Map(all.map((g) => [g.id, g.name]));
  let json;
  if (query) {
    json = await request('/search/movie', { query, page, include_adult: 'false' }, signal);
  } else if (genreId) {
    json = await request(
      '/discover/movie',
      { with_genres: genreId, sort_by: 'popularity.desc', page, include_adult: 'false' },
      signal
    );
  } else {
    json = await request('/movie/popular', { page }, signal);
  }
  let results = json.results || [];
  // search endpoint can't filter by genre, so do it here
  if (query && genreId) results = results.filter((m) => (m.genre_ids || []).includes(Number(genreId)));
  return {
    items: results.map((m) => normalize(m, names)),
    hasNext: json.page < json.total_pages,
  };
}

export async function detail(id, signal) {
  const json = await request(`/movie/${id}`, {}, signal);
  return normalize(json);
}

export const maxSurprisePage = 10;
