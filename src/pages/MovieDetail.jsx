import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import {
  fetchMovieDetail,
  fetchRecommendations,
  STREAM_SERVERS,
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

// ── Upgraded Video Streaming Player Modal ───────────────────────────────
const PlayerModal = ({ tmdbId, title, year, rating, onClose }) => {
  const navigate                        = useNavigate();
  const [activeServer, setActiveServer] = useState(STREAM_SERVERS[0]);
  const [cinemaMode, setCinemaMode]     = useState(false);
  const [key, setKey]                   = useState(0); // forces iframe refresh
  const [searchQuery, setSearchQuery]   = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={`player-modal ${cinemaMode ? "cinema-mode" : ""}`} onClick={onClose}>
      {/* ── Player Navbar Bar ── */}
      <nav className="player-top-nav" onClick={(e) => e.stopPropagation()}>
        <div className="player-nav-inner">
          {/* Left: Back button + Logo */}
          <div className="player-nav-left">
            <button
              className="player-back-btn"
              onClick={onClose}
              id="player-nav-back-btn"
              title="Close player & go back"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Back</span>
            </button>

            <div className="player-nav-divider" />

            <div
              className="player-nav-logo"
              onClick={() => handleNav("/")}
              role="button"
              tabIndex={0}
              title="Go to Home"
            >
              <span className="logo-icon">🎬</span>
              <span className="logo-text">Movie<span className="logo-accent">Verse</span></span>
            </div>
          </div>

          {/* Center: Nav links */}
          <ul className="player-nav-links">
            <li><button onClick={() => handleNav("/")}>Home</button></li>
            <li><button onClick={() => handleNav("/movies")}>Movies</button></li>
            <li><button onClick={() => handleNav("/movies?genre=Action")}>Action</button></li>
            <li><button onClick={() => handleNav("/movies?genre=Comedy")}>Comedy</button></li>
            <li><button onClick={() => handleNav("/movies?genre=Horror")}>Horror</button></li>
            <li><button onClick={() => handleNav("/movies?genre=Sci-Fi")}>Sci-Fi</button></li>
          </ul>

          {/* Right: Search + Close */}
          <div className="player-nav-right">
            <form className="player-nav-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="player-search-input"
              />
              <button type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <button
              className="player-close-btn"
              onClick={onClose}
              id="player-close-btn"
              aria-label="Close player"
              title="Exit Player"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Video Player Modal Container ── */}
      <div className="player-modal-inner" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="player-modal-header">
          <div className="player-title-box">
            <span className="player-badge">NOW STREAMING</span>
            <h3 className="player-movie-title">{title}</h3>
            {year && <span className="player-meta-tag">{year}</span>}
            <span className="player-quality-tag">HD 1080p</span>
          </div>

          <div className="player-header-actions">
            <button
              className={`player-tool-btn ${cinemaMode ? "active" : ""}`}
              onClick={() => setCinemaMode(!cinemaMode)}
              title="Toggle Cinema Mode (Lights Off)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              <span>{cinemaMode ? "Lights On" : "Lights Off"}</span>
            </button>

            <button
              className="player-tool-btn"
              onClick={handleRefresh}
              title="Reload Video Player"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              <span>Reload</span>
            </button>
          </div>
        </div>

        {/* Server Selector Bar */}
        <div className="player-server-bar">
          <span className="server-bar-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            Server:
          </span>
          <div className="server-pills">
            {STREAM_SERVERS.map((server) => (
              <button
                key={server.id}
                className={`server-pill ${activeServer.id === server.id ? "active" : ""}`}
                onClick={() => setActiveServer(server)}
              >
                <span className="server-name">{server.name}</span>
                <span className="server-badge">{server.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video Iframe Frame */}
        <div className="player-iframe-wrapper">
          <iframe
            key={key}
            src={activeServer.url(tmdbId)}
            title={`Watch ${title}`}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            referrerPolicy="origin"
          />
        </div>

        {/* Player Footer */}
        <div className="player-footer-bar">
          <div className="player-status-info">
            <span className="status-dot" />
            <span>Connected to <strong>{activeServer.name}</strong> • If controls or video are blocked, switch server above.</span>
          </div>
        </div>
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
        <button
          className="back-btn"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate("/movies");
            }
          }}
          id="detail-back-btn"
        >
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
          year={movie.year}
          rating={movie.rating}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;
