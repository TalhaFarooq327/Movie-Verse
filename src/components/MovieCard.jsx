import { Link } from "react-router-dom";
import "./MovieCard.css";

const FALLBACK_POSTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%231c1c28"/><circle cx="150" cy="200" r="42" fill="%23252538"/><text x="50%" y="213" font-size="34" text-anchor="middle" fill="%23a0a0b8">🎬</text><text x="50%" y="275" font-family="system-ui,sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="%237b7b95">No Poster Available</text></svg>`;

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/${movie.mediaType === "tv" ? "tv" : "movie"}/${movie.id}`} className="movie-card" id={`movie-card-${movie.id}`}>
      {/* Poster */}
      <div className="movie-card-poster">
        <img
          src={movie.poster || FALLBACK_POSTER}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_POSTER;
          }}
        />
        {/* Overlay */}
        <div className="movie-card-overlay">
          <div className="play-btn" aria-label={`Play ${movie.title}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="card-overlay-info">
            <p className="card-description">{movie.description}</p>
            <span className="card-duration">{movie.duration}</span>
          </div>
        </div>
        {/* Genre badge */}
        <div className="card-genre-badge">{movie.genre}</div>
        {/* TV badge */}
        {movie.mediaType === "tv" && <div className="card-tv-badge">TV</div>}
      </div>

      {/* Info */}
      <div className="movie-card-info">
        <div className="card-title-row">
          <h3 className="card-title">{movie.title}</h3>
        </div>
        <div className="card-meta">
          <span className="card-rating">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating}
          </span>
          <span className="card-year">{movie.year}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
