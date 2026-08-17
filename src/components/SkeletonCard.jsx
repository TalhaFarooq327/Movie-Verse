import "./SkeletonCard.css";

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-poster shimmer" />
    <div className="skeleton-info">
      <div className="skeleton-line long shimmer" />
      <div className="skeleton-line short shimmer" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
