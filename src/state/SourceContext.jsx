import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { KEY_STORAGE, canUse } from '../api/tmdb.js';

const Ctx = createContext(null);
const SOURCE_STORE = 'matinee.source';

function initialSource() {
  let saved = null;
  try {
    saved = localStorage.getItem(SOURCE_STORE);
  } catch {}
  if (saved === 'jikan' || saved === 'demo') return saved;
  if (saved === 'tmdb' && canUse()) return 'tmdb';
  return canUse() ? 'tmdb' : 'jikan';
}

export function SourceProvider({ children }) {
  const [source, setSourceState] = useState(initialSource);
  const [hasKey, setHasKey] = useState(canUse());
  const [dialogOpen, setDialogOpen] = useState(false);

  const persist = (s) => {
    try {
      localStorage.setItem(SOURCE_STORE, s);
    } catch {}
  };

  const setSource = useCallback((s) => {
    if (s === 'tmdb' && !canUse()) {
      setDialogOpen(true);
      return;
    }
    setSourceState(s);
    persist(s);
  }, []);

  const saveKey = useCallback((raw) => {
    const key = raw.trim();
    if (!key) return;
    try {
      localStorage.setItem(KEY_STORAGE, key);
    } catch {}
    setHasKey(true);
    setSourceState('tmdb');
    persist('tmdb');
    setDialogOpen(false);
  }, []);

  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(KEY_STORAGE);
    } catch {}
    setHasKey(canUse());
    const next = canUse() ? 'tmdb' : 'jikan';
    setSourceState(next);
    persist(next);
    setDialogOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      source,
      setSource,
      hasKey,
      saveKey,
      clearKey,
      dialogOpen,
      openKeyDialog: () => setDialogOpen(true),
      closeKeyDialog: () => setDialogOpen(false),
    }),
    [source, setSource, hasKey, saveKey, clearKey, dialogOpen]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSource = () => useContext(Ctx);
