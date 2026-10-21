import { Link } from 'react-router-dom';
import { useSource } from '../state/SourceContext.jsx';

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { openKeyDialog, source, setSource } = useSource();
  const needsKey = error?.status === 401;
  return (
    <div className="empty error" role="alert">
      <h2>{needsKey ? 'A TMDB key is needed' : 'Something went wrong'}</h2>
      <p>{error?.message || 'Please try again.'}</p>
      <div className="row">
        {needsKey ? (
          <button type="button" className="btn primary" onClick={openKeyDialog}>
            Enter TMDB key
          </button>
        ) : null}
        {!needsKey && source !== 'demo' ? (
          <button type="button" className="btn" onClick={() => setSource('demo')}>
            Use offline demo titles
          </button>
        ) : null}
        {onRetry ? (
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const BrowseLink = ({ children = 'Browse titles' }) => (
  <Link to="/" className="btn primary">
    {children}
  </Link>
);
