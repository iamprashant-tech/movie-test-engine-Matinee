import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SOURCES, surpriseMovie } from '../api/index.js';
import { useSource } from '../state/SourceContext.jsx';
import { useTaste } from '../state/TasteContext.jsx';
import { Shuffle } from './Icons.jsx';

export default function Header() {
  const { source, setSource } = useSource();
  const { watchlist, compare, ratedKeys } = useTaste();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function surprise() {
    setBusy(true);
    setNote('');
    try {
      const m = await surpriseMovie(source, ratedKeys);
      navigate(`/movie/${m.source}/${m.id}`);
    } catch (e) {
      setNote(e.status === 401 ? 'Add a TMDB key first.' : 'Could not pick one. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand" aria-label="Matinee home">
          Matinee<span className="dot" />
        </Link>

        <nav className="nav" aria-label="Main">
          <NavLink to="/" end className={link}>
            Browse
          </NavLink>
          <NavLink to="/for-you" className={link}>
            For you
          </NavLink>
          <NavLink to="/watchlist" className={link}>
            Watchlist{watchlist.length ? <span className="count">{watchlist.length}</span> : null}
          </NavLink>
          <NavLink to="/compare" className={link}>
            Compare{compare.length ? <span className="count">{compare.length}</span> : null}
          </NavLink>
          <NavLink to="/taste" className={link}>
            Taste
          </NavLink>
        </nav>

        <div className="tools">
          <div className="seg" role="group" aria-label="Catalogue">
            {Object.values(SOURCES).map((s) => (
              <button
                key={s.id}
                type="button"
                className={source === s.id ? 'on' : ''}
                aria-pressed={source === s.id}
                onClick={() => setSource(s.id)}
                title={`Data from ${s.credit}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn primary surprise" onClick={surprise} disabled={busy}>
            <Shuffle /> {busy ? 'Picking...' : 'Surprise me'}
          </button>
        </div>
      </div>
      {note ? (
        <p className="wrap flash" role="status">
          {note}
        </p>
      ) : null}
    </header>
  );
}
