export function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="poster sk" />
      <div className="card-body">
        <div className="sk sk-line" style={{ width: '80%' }} />
        <div className="sk sk-line" style={{ width: '50%', marginTop: 8 }} />
        <div className="sk sk-line" style={{ width: '100%', height: 30, marginTop: 14 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="grid" role="status" aria-label="Loading titles">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
