import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildGenreScores } from '../lib/taste.js';

const Ctx = createContext(null);
const STORE = 'matinee.v1';

// keep what we save small: enough to show a card without refetching
const slim = (m) => ({
  key: m.key,
  source: m.source,
  id: m.id,
  title: m.title,
  subtitle: m.subtitle || '',
  year: m.year,
  poster: m.poster,
  backdrop: m.backdrop,
  rating: m.rating,
  overview: (m.overview || '').slice(0, 600),
  genres: m.genres || [],
  runtime: m.runtime || null,
});

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE));
    return {
      ratings: raw?.ratings || {},
      watchlist: raw?.watchlist || {},
      compare: Array.isArray(raw?.compare) ? raw.compare : [],
    };
  } catch {
    return { ratings: {}, watchlist: {}, compare: [] };
  }
}

export function TasteProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {}
  }, [state]);

  // keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORE) setState(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const rate = useCallback((movie, value) => {
    setState((s) => {
      const ratings = { ...s.ratings };
      if (ratings[movie.key]?.value === value) delete ratings[movie.key];
      else ratings[movie.key] = { movie: slim(movie), value };
      return { ...s, ratings };
    });
  }, []);

  const toggleWatch = useCallback((movie) => {
    setState((s) => {
      const watchlist = { ...s.watchlist };
      if (watchlist[movie.key]) delete watchlist[movie.key];
      else watchlist[movie.key] = slim(movie);
      return { ...s, watchlist };
    });
  }, []);

  const toggleCompare = useCallback((movie) => {
    setState((s) => {
      const has = s.compare.some((m) => m.key === movie.key);
      const compare = has
        ? s.compare.filter((m) => m.key !== movie.key)
        : [...s.compare, slim(movie)].slice(-2);
      return { ...s, compare };
    });
  }, []);

  const resetTaste = useCallback(() => setState((s) => ({ ...s, ratings: {} })), []);

  const value = useMemo(() => {
    const ratingList = Object.values(state.ratings);
    const watchlist = Object.values(state.watchlist);
    return {
      ratingList,
      watchlist,
      compare: state.compare,
      genreScores: buildGenreScores(ratingList),
      ratedKeys: new Set(Object.keys(state.ratings)),
      valueOf: (key) => state.ratings[key]?.value || 0,
      inWatchlist: (key) => Boolean(state.watchlist[key]),
      inCompare: (key) => state.compare.some((m) => m.key === key),
      findStored: (key) => state.ratings[key]?.movie || state.watchlist[key] || null,
      rate,
      toggleWatch,
      toggleCompare,
      resetTaste,
    };
  }, [state, rate, toggleWatch, toggleCompare, resetTaste]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTaste = () => useContext(Ctx);
