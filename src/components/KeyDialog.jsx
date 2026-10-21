import { useEffect, useRef, useState } from 'react';
import { useSource } from '../state/SourceContext.jsx';
import { getKey } from '../api/tmdb.js';
import { Close } from './Icons.jsx';

export default function KeyDialog() {
  const { dialogOpen, closeKeyDialog, saveKey, clearKey } = useSource();
  const [value, setValue] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (!dialogOpen) return;
    setValue('');
    input.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeKeyDialog();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogOpen, closeKeyDialog]);

  if (!dialogOpen) return null;
  const stored = Boolean(getKey());

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && closeKeyDialog()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="key-title">
        <button type="button" className="icon-btn close" onClick={closeKeyDialog} aria-label="Close">
          <Close />
        </button>
        <h2 id="key-title">Use real movies from TMDB</h2>
        <p>
          TMDB is free but needs a personal key. Create one at{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org/settings/api
          </a>
          , then paste the API key (or the read access token) here. It stays in this browser only.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveKey(value);
          }}
        >
          <label htmlFor="tmdb-key">TMDB API key</label>
          <input
            id="tmdb-key"
            ref={input}
            type="password"
            autoComplete="off"
            spellCheck="false"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="row">
            <button type="submit" className="btn primary" disabled={!value.trim()}>
              Save and switch to movies
            </button>
            {stored ? (
              <button type="button" className="btn" onClick={clearKey}>
                Remove saved key
              </button>
            ) : null}
          </div>
        </form>
        <p className="hint">No key? Anime films from Jikan work without one.</p>
      </div>
    </div>
  );
}
