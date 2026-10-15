import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import {
  fetchMovieDetail,
  fetchRecommendations,
  STREAM_SERVERS,
} from "../api/tmdb";
import "./MovieDetail.css";

// ── Star Rating component ─────────────────────────────────────
const StarRating = ({ rating }) => {
  const normalized = rating / 2;
  const full = Math.floor(normalized);
  const half = normalized % 1 >= 0.5 ? 1 : 0;
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
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Page state
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(
    location.state?.autoPlay === true
  );

  // Inline player state
  const [activeServer, setActiveServer] = useState(STREAM_SERVERS[0]);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  // Fetch movie data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setMovie(null);
        setImgError(false);
        setPlayerOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const detail = await fetchMovieDetail(id);
        setMovie(detail);

        fetchRecommendations(id)
          .then(setRelated)
          .catch(() => { });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Scroll to top when player opens so player is visible
  useEffect(() => {
    if (playerOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [playerOpen]);

  // Close player on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setPlayerOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openPlayer = () => {
    setActiveServer(STREAM_SERVERS[0]);
    setCinemaMode(false);
    setPlayerKey((k) => k + 1);
    setPlayerOpen(true);
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="movie-detail-page">
        <div className="container detail-container">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
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
    <div className={`movie-detail-page${cinemaMode && playerOpen ? " cinema-mode" : ""}`}>

      {/* ── Inline Video Player (renders at top when Watch Now is clicked) ── */}
      {playerOpen && (
        <div className="inline-player">

          {/* Close button */}
          <button
            className="inline-close-btn"
            onClick={() => { setPlayerOpen(false); setCinemaMode(false); }}
            id="inline-player-close"
            aria-label="Close player"
            title="Close Player"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Server selector */}
          <div className="inline-server-bar">
            <span className="inline-server-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
              Server:
            </span>
            <div className="inline-server-pills">
              {STREAM_SERVERS.map((server) => (
                <button
                  key={server.id}
                  className={`inline-server-pill${activeServer.id === server.id ? " active" : ""}`}
                  onClick={() => setActiveServer(server)}
                >
                  {server.name}
                  <span className="inline-server-badge">{server.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Video iframe */}
          <div className="inline-iframe-wrapper">
            <iframe
              key={playerKey}
              src={activeServer.url(movie.id)}
              title={`Watch ${movie.title}`}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
              referrerPolicy="origin"
            />
          </div>

          {/* Status footer */}
          <div className="inline-player-footer">
            <span className="inline-status-dot" />
            <span>Connected to <strong>{activeServer.name}</strong> · If video is blocked, try a different server above.</span>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div className="detail-backdrop">
        {movie.backdrop && (
          <img src={movie.backdrop} alt={movie.title} />
        )}
        <div className="detail-backdrop-overlay" />
      </div>

      {/* Page content */}
      <div className="container detail-container">



        <div className="detail-layout">
          {/* Poster column */}
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

            <button
              className="btn btn-primary watch-poster-btn"
              onClick={openPlayer}
              id="poster-watch-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </button>
          </div>

          {/* Info column */}
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

            {/* Rating */}
            <div className="detail-meta-row">
              <StarRating rating={movie.rating} />
            </div>

            {/* Meta pills */}
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

            {/* Action buttons */}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                onClick={openPlayer}
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
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

        {/* Recommendations */}
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
    </div>
  );
};

export default MovieDetail;
