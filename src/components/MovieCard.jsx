import { Link } from 'react-router-dom';
import Actions from './Actions.jsx';
import Poster from './Poster.jsx';
import { Star } from './Icons.jsx';

export default function MovieCard({ movie, match }) {
  const href = `/movie/${movie.source}/${movie.id}`;
  return (
    <article className="card">
      <Link to={href} className="card-link" aria-label={`${movie.title}${movie.year ? `, ${movie.year}` : ''}`}>
        <Poster movie={movie} />
        {movie.rating ? (
          <span className="badge rating">
            <Star /> {movie.rating.toFixed(1)}
          </span>
        ) : null}
        {match ? (
          <span className={`badge match${match.total < 0 ? ' neg' : ''}`}>
            {match.total > 0 ? `+${match.total}` : match.total}
          </span>
        ) : null}
      </Link>
      <div className="card-body">
        <h3 className="card-title">
          <Link to={href}>{movie.title}</Link>
        </h3>
        <p className="card-meta">
          {[movie.year, movie.genres.slice(0, 2).join(', ')].filter(Boolean).join('  |  ') || 'No details yet'}
        </p>
        {match?.parts.length ? (
          <p className="card-why">
            {match.parts
              .slice(0, 2)
              .map((p) => `${p.genre} ${p.points > 0 ? '+' : ''}${p.points}`)
              .join(', ')}
          </p>
        ) : null}
        <Actions movie={movie} />
      </div>
    </article>
  );
}
