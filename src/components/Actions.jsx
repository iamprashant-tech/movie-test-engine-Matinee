import { useTaste } from '../state/TasteContext.jsx';
import { Bookmark, Columns, ThumbDown, ThumbUp } from './Icons.jsx';

export default function Actions({ movie, labels = false }) {
  const { valueOf, rate, inWatchlist, toggleWatch, inCompare, toggleCompare } = useTaste();
  const v = valueOf(movie.key);
  const saved = inWatchlist(movie.key);
  const comparing = inCompare(movie.key);

  return (
    <div className={`actions${labels ? ' with-labels' : ''}`} role="group" aria-label={`Actions for ${movie.title}`}>
      <button
        type="button"
        className={`act like${v === 1 ? ' on' : ''}`}
        aria-pressed={v === 1}
        title="Like"
        onClick={() => rate(movie, 1)}
      >
        <ThumbUp />
        {labels && <span>{v === 1 ? 'Liked' : 'Like'}</span>}
      </button>
      <button
        type="button"
        className={`act dislike${v === -1 ? ' on' : ''}`}
        aria-pressed={v === -1}
        title="Dislike"
        onClick={() => rate(movie, -1)}
      >
        <ThumbDown />
        {labels && <span>{v === -1 ? 'Disliked' : 'Dislike'}</span>}
      </button>
      <button
        type="button"
        className={`act save${saved ? ' on' : ''}`}
        aria-pressed={saved}
        title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        onClick={() => toggleWatch(movie)}
      >
        <Bookmark />
        {labels && <span>{saved ? 'On watchlist' : 'Watchlist'}</span>}
      </button>
      <button
        type="button"
        className={`act cmp${comparing ? ' on' : ''}`}
        aria-pressed={comparing}
        title={comparing ? 'Remove from compare' : 'Add to compare'}
        onClick={() => toggleCompare(movie)}
      >
        <Columns />
        {labels && <span>{comparing ? 'In compare' : 'Compare'}</span>}
      </button>
    </div>
  );
}
