import { useEffect, useMemo, useState } from 'react';
import { buildPool } from '../api/index.js';
import MovieCard from '../components/MovieCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import { EmptyState, ErrorState, BrowseLink } from '../components/Messages.jsx';
import { favouriteGenreNames, rankForYou, LIKE_POINTS, DISLIKE_POINTS } from '../lib/taste.js';
import { useSource } from '../state/SourceContext.jsx';
import { useTaste } from '../state/TasteContext.jsx';

export default function ForYou() {
  const { source } = useSource();
  const { genreScores, ratedKeys, ratingList } = useTaste();
  const favs = useMemo(() => favouriteGenreNames(genreScores), [genreScores]);
  const favKey = favs.slice(0, 2).join('|');

  const [pool, setPool] = useState({ source: null, items: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!ratingList.length) {
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    buildPool(source, favs, ac.signal)
      .then((items) => {
        setPool({ source, items });
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e);
        setLoading(false);
      });
    return () => ac.abort();
  }, [source, favKey, retry, ratingList.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const ranked = useMemo(
    () => (pool.source === source ? rankForYou(pool.items, ratedKeys, genreScores).slice(0, 48) : []),
    [pool, source, ratedKeys, genreScores]
  );

  return (
    <div className="wrap page">
      <h1 className="page-title">For you</h1>
      <p className="lede">
        Every like adds {LIKE_POINTS} to the title’s genres, every dislike takes {Math.abs(DISLIKE_POINTS)} away. Each
        title below is scored by adding up its genres, highest first.
      </p>

      {!ratingList.length ? (
        <EmptyState title="Nothing to base this on yet" action={<BrowseLink />}>
          Like or dislike a few titles and your ranked list appears here.
        </EmptyState>
      ) : error && !ranked.length ? (
        <ErrorState error={error} onRetry={() => setRetry((n) => n + 1)} />
      ) : loading && !ranked.length ? (
        <SkeletonGrid count={12} />
      ) : ranked.length === 0 ? (
        <EmptyState title="You've rated everything we found" action={<BrowseLink>Find more to rate</BrowseLink>}>
          Browse another genre or switch catalogue to keep going.
        </EmptyState>
      ) : (
        <div className="grid">
          {ranked.map((r) => (
            <MovieCard key={r.movie.key} movie={r.movie} match={r} />
          ))}
        </div>
      )}
    </div>
  );
}
