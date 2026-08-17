import { useRef } from "react";
import { Link } from "react-router-dom";
import "./FeaturedRow.css";

const FeaturedRow = ({ movies = [] }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const amount = 600;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (movies.length === 0) return null;

  return (
    <div className="featured-row-wrapper">
      <div className="featured-row-header">
        <h2 className="section-title">
          <span className="accent-bar" />
          Featured Films
        </h2>
        <div className="featured-row-arrows">
          <button className="row-arrow" onClick={() => scroll("left")} id="featured-prev" aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button className="row-arrow" onClick={() => scroll("right")} id="featured-next" aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="featured-row" ref={rowRef}>
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="featured-card"
            id={`featured-card-${movie.id}`}
          >
            <div className="featured-card-poster">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} loading="lazy" />
              ) : (
                <div className="featured-card-fallback">{movie.title}</div>
              )}
              <div className="featured-card-overlay">
                <div className="featured-play-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="featured-card-info">
              <p className="featured-card-title">{movie.title}</p>
              <div className="featured-card-meta">
                <span className="featured-card-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {movie.rating}
                </span>
                <span className="featured-card-year">{movie.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedRow;
