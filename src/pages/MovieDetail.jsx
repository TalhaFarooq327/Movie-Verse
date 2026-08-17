import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import {
  fetchMovieDetail,
  fetchRecommendations,
  vidSrcMovieUrl,
  posterUrl,
} from "../api/tmdb";
import "./MovieDetail.css";

// ── Star Rating component ─────────────────────────────────────
const StarRating = ({ rating }) => {
  const normalized = rating / 2; // TMDB is out of 10, stars out of 5
  const full  = Math.floor(normalized);
  const half  = normalized % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div className="star-display">
      {[...Array(full)].map((_, i) => (
        <svg key={`f${i}`} viewBox="0 0 24 24" className="star-filled">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half === 1 && (
        <svg viewBox="0 0 24 24" className="star-half">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="var(--accent-gold)" />
              <stop offset="50%" stopColor="rgba(245,197,24,0.15)" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half-grad)" />
        </svg>
      )}
      {[...Array(empty)].map((_, i) => (
        <svg key={`e${i}`} viewBox="0 0 24 24" className="star-empty">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="rating-value">{rating} / 10</span>
    </div>
  );
};

// ── VidSrc Player Modal ───────────────────────────────────────
const PlayerModal = ({ tmdbId, title, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="player-modal" onClick={onClose}>
      <div className="player-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="player-modal-header">
          <h3>{title}</h3>
          <button className="player-close-btn" onClick={onClose} id="player-close-btn" aria-label="Close player">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="player-iframe-wrapper">
          <iframe
            src={vidSrcMovieUrl(tmdbId)}
            title={`Watch ${title}`}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
          />
        </div>
        <p className="player-disclaimer">
          Streaming via VidSrc. If the video doesn't load, try refreshing or check your ad-blocker settings.
        </p>
      </div>
    </div>
  );
};

// ── Skeleton for the detail page ─────────────────────────────
const DetailSkeleton = () => (
  <div className="detail-skeleton">
    <div className="detail-layout">
      <div className="skeleton-poster-lg shimmer" />
      <div className="detail-info">
        <div className="shimmer detail-sk-badge" />
        <div className="shimmer detail-sk-title" />
        <div className="shimmer detail-sk-meta" />
        <div className="shimmer detail-sk-line" />
        <div className="shimmer detail-sk-line" />
        <div className="shimmer detail-sk-line short" />
        <div className="detail-sk-btns">
          <div className="shimmer detail-sk-btn" />
          <div className="shimmer detail-sk-btn" />
        </div>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const MovieDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [movie,        setMovie]        = useState(null);
  const [related,      setRelated]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [playerOpen,   setPlayerOpen]   = useState(
    location.state?.autoPlay === true
  );
  const [imgError,     setImgError]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setMovie(null);
        setImgError(false);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const detail = await fetchMovieDetail(id);
        setMovie(detail);

        // Recommendations in background
        fetchRecommendations(id)
          .then(setRelated)
          .catch(() => {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Close player on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setPlayerOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (loading) {
    return (
      <div className="movie-detail-page">
        <div className="container detail-container">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-page">
        <div className="container detail-container" style={{ paddingTop: 100 }}>
          <div className="api-error-box">
            <span>⚠️</span>
            <div>
              <strong>Failed to load movie</strong>
              <p>{error}</p>
            </div>
          </div>
          <Link to="/movies" className="btn btn-ghost">← Back to Movies</Link>
        </div>
      </div>
    );
  }

  const formatMoney = (n) =>
    n > 0 ? `$${(n / 1_000_000).toFixed(1)}M` : "N/A";

  return (
    <div className="movie-detail-page">
      {/* Backdrop */}
      <div className="detail-backdrop">
        {movie.backdrop && (
          <img src={movie.backdrop} alt={movie.title} />
        )}
        <div className="detail-backdrop-overlay" />
      </div>

      <div className="container detail-container">
        {/* Back */}
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
              {movie.poster && !imgError ? (
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

            {/* Watch button beneath poster on desktop */}
            <button
              className="btn btn-primary watch-poster-btn"
              onClick={() => setPlayerOpen(true)}
              id="poster-watch-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </button>
          </div>

          {/* Info */}
          <div className="detail-info">
            {/* Genre labels */}
            <div className="detail-genres">
              {(movie.genreLabels || [movie.genre]).slice(0, 4).map((g) => (
                <span key={g} className="detail-genre-badge">{g}</span>
              ))}
            </div>

            <h1 className="detail-title">{movie.title}</h1>

            {movie.tagline && (
              <p className="detail-tagline">"{movie.tagline}"</p>
            )}

            {/* Rating + meta */}
            <div className="detail-meta-row">
              <StarRating rating={movie.rating} />
            </div>

            <div className="detail-meta-pills">
              <span className="meta-pill">{movie.year}</span>
              {movie.duration && <span className="meta-pill">{movie.duration}</span>}
              {movie.voteCount && (
                <span className="meta-pill">{movie.voteCount.toLocaleString()} votes</span>
              )}
            </div>

            {/* Director */}
            {movie.director && (
              <div className="detail-director">
                <span className="detail-label">Director</span>
                <span>{movie.director}</span>
              </div>
            )}

            {/* Overview */}
            <div className="detail-description">
              <h3 className="detail-label">Overview</h3>
              <p>{movie.fullDescription}</p>
            </div>

            {/* Budget / Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="detail-financials">
                {movie.budget > 0 && (
                  <div className="financial-card">
                    <span className="financial-label">Budget</span>
                    <span className="financial-value">{formatMoney(movie.budget)}</span>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="financial-card">
                    <span className="financial-label">Revenue</span>
                    <span className="financial-value">{formatMoney(movie.revenue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                onClick={() => setPlayerOpen(true)}
                id="detail-watch-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {movie.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  id="detail-trailer-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch Trailer
                </a>
              )}

              <Link to="/movies" className="btn btn-ghost" id="detail-browse-btn">
                Browse More
              </Link>
            </div>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="detail-cast">
                <h3 className="detail-label">Cast</h3>
                <div className="cast-grid">
                  {movie.cast.map((member, i) => (
                    <div key={i} className="cast-card">
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1c1c28&color=a0a0b8`
                        }
                        alt={member.name}
                        className="cast-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1c1c28&color=a0a0b8`;
                        }}
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

        {/* Related / Recommendations */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="section-header-simple">
              <h2 className="section-title">
                <span className="accent-bar" />
                You May Also Like
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

      {/* VidSrc Player Modal */}
      {playerOpen && (
        <PlayerModal
          tmdbId={movie.id}
          title={movie.title}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;
