import { BrowseLink, EmptyState } from '../components/Messages.jsx';

export default function NotFound() {
  return (
    <div className="wrap page">
      <EmptyState title="This page doesn’t exist" action={<BrowseLink>Back to browse</BrowseLink>}>
        The link may be old or mistyped.
      </EmptyState>
    </div>
  );
}
