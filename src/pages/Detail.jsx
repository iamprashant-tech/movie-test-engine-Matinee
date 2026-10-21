import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProvider, isSource } from '../api/index.js';
import Actions from '../components/Actions.jsx';
import Poster from '../components/Poster.jsx';
import { ErrorState } from '../components/Messages.jsx';
import { Star } from '../components/Icons.jsx';
import { explainMovie } from '../lib/taste.js';
import { useTaste } from '../state/TasteContext.jsx';

export default function Detail() {
  const { source, id } = useParams();
  const key = `${source}:${id}`;
  const { genreScores, findStored } = useTaste();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isSource(source)) return;
    const ac = new AbortController();
    setMovie(null);
    setError(null);
    getProvider(source)
      .detail(id, ac.signal)
      .then(setMovie)
      .catch((e) => e.name !== 'AbortError' && setError(e));
    return () => ac.abort();
  }, [source, id, retry]);

  if (!isSource(source)) {
    return (
      <div className="wrap page">
        <ErrorState error={{ message: 'That link doesn’t point to a title.' }} />
      </div>
    );
  }

  const shown = movie || findStored(key);

  if (!shown) {
    return (
      <div className="wrap page">
        {error ? (
          <ErrorState error={error} onRetry={() => setRetry((n) => n + 1)} />
        ) : (
          <div className="detail" role="status" aria-label="Loading title">
            <div className="poster sk big" />
            <div>
              <div className="sk sk-line" style={{ width: '60%', height: 36 }} />
              <div className="sk sk-line" style={{ width: '30%', marginTop: 14 }} />
              <div className="sk sk-line" style={{ width: '100%', height: 120, marginTop: 24 }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const { total, parts } = explainMovie(shown.genres, genreScores);

  return (
    <div className="detail-page">
      {shown.backdrop ? (
        <div className="backdrop" style={{ backgroundImage: `url(${shown.backdrop})` }} aria-hidden="true" />
      ) : null}
      <div className="wrap page">
        <Link to="/" className="back">
          Back to browse
        </Link>
        {error && !movie ? <p className="flash">Showing your saved copy. {error.message}</p> : null}
        <div className="detail">
          <Poster movie={shown} className="big" />
          <div className="detail-info">
            <h1>{shown.title}</h1>
            {shown.subtitle ? <p className="subtitle">{shown.subtitle}</p> : null}
            <p className="facts">
              {shown.year ? <span>{shown.year}</span> : null}
              {shown.runtime ? <span>{Math.floor(shown.runtime / 60) ? `${Math.floor(shown.runtime / 60)}h ` : ''}{shown.runtime % 60}m</span> : null}
              {shown.rating ? (
                <span className="rate">
                  <Star /> {shown.rating.toFixed(1)} / 10
                </span>
              ) : null}
            </p>
            <ul className="tags">
              {shown.genres.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <p className="overview">{shown.overview || 'No synopsis available for this title.'}</p>

            <Actions movie={shown} labels />

            <div className="taste-note">
              <h2>How it fits your taste</h2>
              {parts.length ? (
                <>
                  <p>
                    Score <strong>{total > 0 ? `+${total}` : total}</strong>
                  </p>
                  <ul className="tags plain">
                    {parts.map((p) => (
                      <li key={p.genre} className={p.points < 0 ? 'neg' : 'pos'}>
                        {p.genre} {p.points > 0 ? '+' : ''}
                        {p.points}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="muted">Rate a few titles in these genres and a score shows up here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
