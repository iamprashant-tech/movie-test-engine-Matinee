import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProvider, SOURCES } from '../api/index.js';
import Poster from '../components/Poster.jsx';
import { Close, Search } from '../components/Icons.jsx';
import useDebounce from '../hooks/useDebounce.js';
import { explainMovie } from '../lib/taste.js';
import { useSource } from '../state/SourceContext.jsx';
import { useTaste } from '../state/TasteContext.jsx';

function Picker({ onPick, takenKeys }) {
  const { source } = useSource();
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 500);
  const [state, setState] = useState({ items: [], loading: false, error: '' });

  useEffect(() => {
    if (!q) {
      setState({ items: [], loading: false, error: '' });
      return;
    }
    const ac = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));
    getProvider(source)
      .list({ query: q, signal: ac.signal })
      .then((r) => setState({ items: r.items.slice(0, 6), loading: false, error: '' }))
      .catch((e) => e.name !== 'AbortError' && setState({ items: [], loading: false, error: e.message }));
    return () => ac.abort();
  }, [q, source]);

  return (
    <div className="picker">
      <div className="search small">
        <Search />
        <label className="sr" htmlFor="pick-q">
          Search {SOURCES[source].label.toLowerCase()} to compare
        </label>
        <input id="pick-q" type="search" placeholder="Search a title" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
      </div>
      {state.loading ? <p className="muted">Searching...</p> : null}
      {state.error ? <p className="flash">{state.error}</p> : null}
      <ul className="mini-list">
        {state.items
          .filter((m) => !takenKeys.has(m.key))
          .map((m) => (
            <li key={m.key}>
              <button type="button" onClick={() => onPick(m)}>
                {m.poster ? <img src={m.poster} alt="" /> : <span className="mini-ph" />}
                <span>
                  {m.title}
                  <small>{m.year || ''}</small>
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

const fmtRuntime = (m) => (m ? `${Math.floor(m / 60) ? `${Math.floor(m / 60)}h ` : ''}${m % 60}m` : 'Unknown');

export default function Compare() {
  const { compare, toggleCompare, genreScores } = useTaste();
  const slots = [compare[0] || null, compare[1] || null];
  const taken = new Set(compare.map((m) => m.key));
  const scores = slots.map((m) => (m ? explainMovie(m.genres, genreScores).total : null));

  const higher = (a, b) => (a != null && b != null && a !== b ? (a > b ? 0 : 1) : -1);
  const rateWin = higher(slots[0]?.rating, slots[1]?.rating);
  const tasteWin = higher(scores[0], scores[1]);
  const yearWin = higher(slots[0]?.year, slots[1]?.year);
  const runWin = -1;

  const row = (label, render, win = -1) => (
    <tr>
      <th scope="row">{label}</th>
      {slots.map((m, i) => (
        <td key={i} className={win === i ? 'win' : ''}>
          {m ? render(m, i) : <span className="muted">-</span>}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="wrap page">
      <h1 className="page-title">Compare</h1>
      <p className="lede">Put two titles side by side. Add them with the compare button on any card, or search below.</p>

      <div className="table-scroll">
        <table className="compare">
          <thead>
            <tr>
              <td />
              {slots.map((m, i) => (
                <th key={i} scope="col" className="cmp-head">
                  {m ? (
                    <div className="cmp-title">
                      <Link to={`/movie/${m.source}/${m.id}`}>
                        <Poster movie={m} />
                        <span>{m.title}</span>
                      </Link>
                      <button type="button" className="icon-btn" onClick={() => toggleCompare(m)} aria-label={`Remove ${m.title}`}>
                        <Close />
                      </button>
                    </div>
                  ) : i === compare.length ? (
                    <Picker takenKeys={taken} onPick={toggleCompare} />
                  ) : (
                    <p className="muted">Empty slot</p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {row('Rating', (m) => (m.rating ? `${m.rating.toFixed(1)} / 10` : 'Not rated'), rateWin)}
            {row('Year', (m) => m.year || 'Unknown', yearWin)}
            {row('Runtime', (m) => fmtRuntime(m.runtime), runWin)}
            {row('Genres', (m) => m.genres.join(', ') || 'None listed')}
            {row(
              'Your taste score',
              (m, i) => (scores[i] > 0 ? `+${scores[i]}` : scores[i]),
              tasteWin
            )}
            {row('Synopsis', (m) => <span className="synopsis">{m.overview || 'No synopsis available.'}</span>)}
          </tbody>
        </table>
      </div>
      <p className="muted small-print">Highlighted values are the higher of the two.</p>
    </div>
  );
}
