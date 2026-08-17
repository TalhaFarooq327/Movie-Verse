import { Link } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card" id={`movie-card-${movie.id}`}>
      {/* Poster */}
      <div className="movie-card-poster">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x450/1c1c28/a0a0b8?text=${encodeURIComponent(movie.title)}`;
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
