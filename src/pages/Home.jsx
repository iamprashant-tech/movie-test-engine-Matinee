import { useEffect, useRef, useState } from 'react';
import { getProvider, SOURCES } from '../api/index.js';
import MovieCard from '../components/MovieCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/Messages.jsx';
import { Search } from '../components/Icons.jsx';
import useDebounce from '../hooks/useDebounce.js';
import { useSource } from '../state/SourceContext.jsx';
import { useTaste } from '../state/TasteContext.jsx';

const dedupe = (list) => [...new Map(list.map((m) => [m.key, m])).values()];

export default function Home() {
  const { source } = useSource();
  const { ratingList } = useTaste();
  const provider = getProvider(source);

  const [query, setQuery] = useState('');
  const q = useDebounce(query.trim(), 500); // search fires once typing pauses
  const [sel, setSel] = useState({ source, id: '' });
  const genreId = sel.source === source ? sel.id : '';
  const [genres, setGenres] = useState([]);
  const [data, setData] = useState({ items: [], page: 1, hasNext: false, loading: true, error: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState('');
  const [retry, setRetry] = useState(0);
  const token = useRef(0);

  useEffect(() => {
    setGenres([]);
    const ac = new AbortController();
    provider
      .genres(ac.signal)
      .then(setGenres)
      .catch(() => {});
    return () => ac.abort();
  }, [source, retry]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ac = new AbortController();
    const mine = ++token.current;
    setMoreError('');
    setData({ items: [], page: 1, hasNext: false, loading: true, error: null });
    provider
      .list({ page: 1, query: q, genreId, signal: ac.signal })
      .then((r) => setData({ items: r.items, page: 1, hasNext: r.hasNext, loading: false, error: null }))
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setData({ items: [], page: 1, hasNext: false, loading: false, error: e });
      });
    return () => ac.abort();
  }, [source, q, genreId, retry]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMore() {
    const mine = token.current;
    setLoadingMore(true);
    setMoreError('');
    try {
      const r = await provider.list({ page: data.page + 1, query: q, genreId });
      if (mine !== token.current) return;
      setData((d) => ({ ...d, items: dedupe([...d.items, ...r.items]), page: d.page + 1, hasNext: r.hasNext }));
    } catch (e) {
      if (mine === token.current) setMoreError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }

  const genreName = genres.find((g) => String(g.id) === String(genreId))?.name;
  const heading = q ? `Results for “${q}”` : genreName ? `Popular in ${genreName}` : 'Popular right now';
  const typing = query.trim() !== q;

  return (
    <div className="wrap page">
      <section className="intro">
        <h1>Rate a few titles and Matinee works out the rest.</h1>
        <p>
          {ratingList.length
            ? `You've rated ${ratingList.length}. Keep going, the For you list gets sharper with each one.`
            : 'Like what you love, dislike what you don’t. Your picks build a taste profile that ranks everything else.'}
        </p>
      </section>

      <div className="toolbar">
        <div className="search">
          <Search />
          <label className="sr" htmlFor="q">
            Search {SOURCES[source].label.toLowerCase()}
          </label>
          <input
            id="q"
            type="search"
            placeholder={`Search ${SOURCES[source].label.toLowerCase()}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {typing ? <span className="typing">searching...</span> : null}
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filter by genre">
        <button type="button" className={`chip${genreId === '' ? ' on' : ''}`} onClick={() => setSel({ source, id: '' })}>
          All genres
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip${String(genreId) === String(g.id) ? ' on' : ''}`}
            aria-pressed={String(genreId) === String(g.id)}
            onClick={() => setSel({ source, id: g.id })}
          >
            {g.name}
          </button>
        ))}
      </div>

      <h2 className="section-title">{heading}</h2>

      {data.loading ? (
        <SkeletonGrid />
      ) : data.error ? (
        <ErrorState error={data.error} onRetry={() => setRetry((n) => n + 1)} />
      ) : data.items.length === 0 ? (
        <EmptyState title="Nothing matched">
          Try a shorter title or clear the genre filter.
        </EmptyState>
      ) : (
        <>
          <div className="grid">
            {data.items.map((m) => (
              <MovieCard key={m.key} movie={m} />
            ))}
          </div>
          <div className="more">
            {moreError ? <p className="flash">{moreError}</p> : null}
            {data.hasNext ? (
              <button type="button" className="btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Show more'}
              </button>
            ) : (
              <p className="muted">That's everything for this search.</p>
            )}
          </div>
        </>
      )}
      <p className="credit">
        Data from {SOURCES[source].credit}.
        {source === 'tmdb' ? ' This product uses the TMDB API but is not endorsed or certified by TMDB.' : ''}
      </p>
    </div>
  );
}
