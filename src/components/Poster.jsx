import { useState } from 'react';

export default function Poster({ movie, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!movie.poster || failed) {
    return (
      <div className={`poster poster-empty ${className}`} role="img" aria-label={`No poster for ${movie.title}`}>
        <span>{movie.title}</span>
      </div>
    );
  }
  return (
    <div className={`poster ${className}`}>
      <img src={movie.poster} alt={`Poster for ${movie.title}`} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
