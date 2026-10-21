import { Link } from 'react-router-dom';
import { BrowseLink, EmptyState } from '../components/Messages.jsx';
import { sortedGenres } from '../lib/taste.js';
import { useTaste } from '../state/TasteContext.jsx';

export default function Taste() {
  const { genreScores, ratingList, watchlist, resetTaste } = useTaste();
  const genres = sortedGenres(genreScores);
  const liked = ratingList.filter((r) => r.value === 1);
  const disliked = ratingList.filter((r) => r.value === -1);
  const maxAbs = Math.max(1, ...genres.map((g) => Math.abs(g.score)));
  const top = genres.filter((g) => g.score > 0).slice(0, 3);

  if (!ratingList.length) {
    return (
      <div className="wrap page">
        <h1 className="page-title">Taste profile</h1>
        <EmptyState title="No taste profile yet" action={<BrowseLink />}>
          Like or dislike a few titles and your favourite genres show up here.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <h1 className="page-title">Taste profile</h1>

      <section className="fav">
        {top.length ? (
          <>
            <p className="fav-label">Your favourite genres</p>
            <ol className="fav-list">
              {top.map((g) => (
                <li key={g.genre}>{g.genre}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="lede">You haven’t liked anything yet, so there are no favourites to show.</p>
        )}
        <p className="stats">
          {liked.length} liked, {disliked.length} disliked, {watchlist.length} on your watchlist
        </p>
      </section>

      <section>
        <h2 className="section-title">Genre scores</h2>
        <ul className="bars">
          {genres.map((g) => (
            <li key={g.genre}>
              <span className="bar-name">{g.genre}</span>
              <span className="bar-track" aria-hidden="true">
                <span
                  className={`bar-fill${g.score < 0 ? ' neg' : ''}`}
                  style={{ width: `${(Math.abs(g.score) / maxAbs) * 100}%` }}
                />
              </span>
              <span className="bar-val">{g.score > 0 ? `+${g.score}` : g.score}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="two-col">
        <RatedList title="Liked" items={liked} />
        <RatedList title="Disliked" items={disliked} />
      </div>

      <button
        type="button"
        className="btn danger"
        onClick={() => window.confirm('Clear every like and dislike? Your watchlist is kept.') && resetTaste()}
      >
        Reset my taste
      </button>
    </div>
  );
}

function RatedList({ title, items }) {
  return (
    <section>
      <h2 className="section-title">
        {title} <span className="muted">{items.length}</span>
      </h2>
      {items.length ? (
        <ul className="mini-list">
          {items.map(({ movie }) => (
            <li key={movie.key}>
              <Link to={`/movie/${movie.source}/${movie.id}`}>
                {movie.poster ? <img src={movie.poster} alt="" loading="lazy" /> : <span className="mini-ph" />}
                <span>
                  {movie.title}
                  <small>{movie.genres.slice(0, 3).join(', ')}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nothing here yet.</p>
      )}
    </section>
  );
}
