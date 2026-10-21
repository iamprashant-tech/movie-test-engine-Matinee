// Taste scoring: every like adds +2 to each genre of that title,
// every dislike takes 1 away. A title's score is the sum of its genres' scores.
export const LIKE_POINTS = 2;
export const DISLIKE_POINTS = -1;

export function buildGenreScores(ratingList) {
  const scores = {};
  for (const { movie, value } of ratingList) {
    const pts = value === 1 ? LIKE_POINTS : DISLIKE_POINTS;
    for (const g of movie.genres || []) scores[g] = (scores[g] || 0) + pts;
  }
  return scores;
}

export function explainMovie(genres, scores) {
  const parts = (genres || [])
    .map((genre) => ({ genre, points: scores[genre] || 0 }))
    .filter((p) => p.points !== 0)
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  return { total: parts.reduce((t, p) => t + p.points, 0), parts };
}

export function rankForYou(candidates, ratedKeys, scores) {
  return candidates
    .filter((m) => !ratedKeys.has(m.key))
    .map((movie) => ({ movie, ...explainMovie(movie.genres, scores) }))
    .sort((a, b) => b.total - a.total || (b.movie.rating || 0) - (a.movie.rating || 0));
}

export function sortedGenres(scores) {
  return Object.entries(scores)
    .map(([genre, score]) => ({ genre, score }))
    .sort((a, b) => b.score - a.score || a.genre.localeCompare(b.genre));
}

export const favouriteGenreNames = (scores) =>
  sortedGenres(scores)
    .filter((g) => g.score > 0)
    .map((g) => g.genre);
