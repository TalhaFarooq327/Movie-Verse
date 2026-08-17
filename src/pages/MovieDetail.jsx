import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieById, movies } from "../data/movies";
import MovieCard from "../components/MovieCard";
import "./MovieDetail.css";

const StarRating = ({ rating }) => {
  const full = Math.floor(rating / 2);
  const half = rating % 2 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="star-display">
      {[...Array(full)].map((_, i) => (
        <svg key={`f${i}`} viewBox="0 0 24 24" fill="currentColor" className="star-filled">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half === 1 && (
        <svg viewBox="0 0 24 24" fill="currentColor" className="star-half">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
        </svg>
      )}
      {[...Array(empty)].map((_, i) => (
        <svg key={`e${i}`} viewBox="0 0 24 24" fill="currentColor" className="star-empty">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="rating-value">{rating}/10</span>
    </div>
  );
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [trailerModal, setTrailerModal] = useState(false);

  useEffect(() => {
    const found = getMovieById(id);
    if (!found) {
      navigate("/movies");
      return;
    }
    setMovie(found);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, navigate]);

  if (!movie) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  const related = movies
    .filter((m) => m.genre === movie.genre && m.id !== movie.id)
    .slice(0, 5);

  const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  return (
    <div className="movie-detail-page">
      {/* Backdrop */}
      <div className="detail-backdrop">
        <img
          src={movie.backdrop}
          alt={movie.title}
          onError={(e) => (e.target.src = movie.poster)}
        />
        <div className="detail-backdrop-overlay" />
      </div>

      {/* Main Content */}
      <div className="container detail-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)} id="detail-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="detail-layout">
          {/* Poster */}
          <div className="detail-poster-wrapper">
            <div className="detail-poster">
              {!imgError ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="poster-fallback">
                  <span>🎬</span>
                  <p>{movie.title}</p>
                </div>
              )}
              <div className="poster-glow" />
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-genre-badge">{movie.genre}</div>

            <h1 className="detail-title">{movie.title}</h1>

            {/* Meta Row */}
            <div className="detail-meta-row">
              <StarRating rating={movie.rating} />
              <span className="detail-divider">·</span>
              <span className="detail-year">{movie.year}</span>
              <span className="detail-divider">·</span>
              <span className="detail-duration">{movie.duration}</span>
            </div>

            {/* Director */}
            {movie.director && (
              <div className="detail-director">
                <span className="detail-label">Director</span>
                <span>{movie.director}</span>
              </div>
            )}

            {/* Description */}
            <div className="detail-description">
              <h3 className="detail-label">Overview</h3>
              <p>{movie.fullDescription || movie.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                id="detail-trailer-btn"
                onClick={() => setTrailerModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <polygon points="10,8 16,12 10,16 10,8" />
                </svg>
                Watch Trailer
              </button>
              <a
                href={movie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                id="detail-youtube-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Open on YouTube
              </a>
              <Link to="/movies" className="btn btn-ghost" id="detail-browse-btn">
                Browse More
              </Link>
            </div>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="detail-cast">
                <h3 className="detail-label">Cast</h3>
                <div className="cast-grid">
                  {movie.cast.map((member, index) => (
                    <div key={index} className="cast-card">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="cast-avatar"
                        onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1c1c28&color=a0a0b8`)}
                      />
                      <div className="cast-info">
                        <span className="cast-name">{member.name}</span>
                        <span className="cast-role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Movies */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="section-header-simple">
              <h2 className="section-title">
                <span className="accent-bar" />
                More {movie.genre} Movies
              </h2>
            </div>
            <div className="related-grid stagger">
              {related.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerModal && (
        <div className="trailer-modal" onClick={() => setTrailerModal(false)}>
          <div className="trailer-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="trailer-close"
              onClick={() => setTrailerModal(false)}
              id="trailer-close-btn"
              aria-label="Close trailer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="trailer-iframe-wrapper">
              <iframe
                src={getYouTubeEmbedUrl(movie.trailer)}
                title={`${movie.title} - Official Trailer`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
