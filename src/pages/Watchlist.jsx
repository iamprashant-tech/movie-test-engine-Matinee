import MovieCard from '../components/MovieCard.jsx';
import { BrowseLink, EmptyState } from '../components/Messages.jsx';
import { useTaste } from '../state/TasteContext.jsx';

export default function Watchlist() {
  const { watchlist } = useTaste();
  return (
    <div className="wrap page">
      <h1 className="page-title">Watchlist</h1>
      <p className="lede">Titles you saved for later. They stay here until you remove them.</p>
      {watchlist.length ? (
        <div className="grid">
          {watchlist.map((m) => (
            <MovieCard key={m.key} movie={m} />
          ))}
        </div>
      ) : (
        <EmptyState title="Your watchlist is empty" action={<BrowseLink />}>
          Tap the bookmark on any title to save it.
        </EmptyState>
      )}
    </div>
  );
}
