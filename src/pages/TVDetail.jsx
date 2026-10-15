import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import {
  fetchTVDetail,
  fetchTVSeason,
  fetchTVRecommendations,
  TV_STREAM_SERVERS,
  posterUrl,
} from "../api/tmdb";
import "./TVDetail.css";

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
            <linearGradient id="half-grad-tv">
              <stop offset="50%" stopColor="var(--accent-gold)" />
              <stop offset="50%" stopColor="rgba(245,197,24,0.15)" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half-grad-tv)" />
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
const TVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Page state
  const [show, setShow] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Season / Episode state
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEps, setLoadingEps] = useState(false);

  // Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeServer, setActiveServer] = useState(TV_STREAM_SERVERS[0]);
  const [playerKey, setPlayerKey] = useState(0);
  const [playingSeason, setPlayingSeason] = useState(1);
  const [playingEpisode, setPlayingEpisode] = useState(1);

  // Fetch TV show data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setShow(null);
        setImgError(false);
        setPlayerOpen(false);
        setEpisodes([]);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const detail = await fetchTVDetail(id);
        setShow(detail);

        // Default to first season
        const firstSeason = detail.seasons?.[0]?.seasonNumber || 1;
        setActiveSeason(firstSeason);

        fetchTVRecommendations(id)
          .then(setRelated)
          .catch(() => {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch episodes when season changes
  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        setLoadingEps(true);
        const seasonData = await fetchTVSeason(id, activeSeason);
        setEpisodes(seasonData.episodes);
      } catch {
        setEpisodes([]);
      } finally {
        setLoadingEps(false);
      }
    })();
  }, [id, activeSeason, show]);

  // Close player on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setPlayerOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Scroll to top when player opens or episode changes
  useEffect(() => {
    if (playerOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [playerOpen, playingSeason, playingEpisode]);

  const playEpisode = (seasonNum, episodeNum) => {
    setActiveSeason(seasonNum);
    setPlayingSeason(seasonNum);
    setPlayingEpisode(episodeNum);
    setActiveServer(TV_STREAM_SERVERS[0]);
    setPlayerKey((k) => k + 1);
    setPlayerOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="movie-detail-page tv-detail-page">
        <div className="container detail-container">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error || !show) {
    return (
      <div className="movie-detail-page tv-detail-page">
        <div className="container detail-container" style={{ paddingTop: 100 }}>
          <div className="api-error-box">
            <span>⚠️</span>
            <div>
              <strong>Failed to load TV show</strong>
              <p>{error}</p>
            </div>
          </div>
          <Link to="/tv-shows" className="btn btn-ghost">← Back to TV Shows</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-page tv-detail-page">

      {/* ── Inline Video Player ── */}
      {playerOpen && (
        <div className="inline-player">
          <button
            className="inline-close-btn"
            onClick={() => setPlayerOpen(false)}
            id="tv-inline-player-close"
            aria-label="Close player"
            title="Close Player"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Now Playing bar with quick episode step navigation */}
          <div className="tv-now-playing">
            <div className="tv-np-left">
              <span className="tv-np-label">Now Playing</span>
              <span className="tv-np-info">S{playingSeason} · E{playingEpisode}</span>
              {episodes.length > 0 && episodes.find((e) => e.episodeNumber === playingEpisode)?.name && (
                <span className="tv-np-title">— {episodes.find((e) => e.episodeNumber === playingEpisode)?.name}</span>
              )}
            </div>
            <div className="tv-np-nav">
              <button
                className="tv-ep-step-btn"
                disabled={playingEpisode <= 1}
                onClick={() => playEpisode(playingSeason, playingEpisode - 1)}
                title="Previous Episode"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
                Prev Ep
              </button>
              <button
                className="tv-ep-step-btn"
                disabled={episodes.length > 0 && playingEpisode >= episodes.length}
                onClick={() => playEpisode(playingSeason, playingEpisode + 1)}
                title="Next Episode"
              >
                Next Ep
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>

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
              {TV_STREAM_SERVERS.map((server) => (
                <button
                  key={server.id}
                  className={`inline-server-pill${activeServer.id === server.id ? " active" : ""}`}
                  onClick={() => { setActiveServer(server); setPlayerKey((k) => k + 1); }}
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
              src={activeServer.url(show.id, playingSeason, playingEpisode)}
              title={`Watch ${show.title} S${playingSeason}E${playingEpisode}`}
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
        {show.backdrop && (
          <img src={show.backdrop} alt={show.title} />
        )}
        <div className="detail-backdrop-overlay" />
      </div>

      {/* Page content */}
      <div className="container detail-container">
        <div className="detail-layout">
          {/* Poster column */}
          <div className="detail-poster-wrapper">
            <div className="detail-poster">
              {show.poster && !imgError ? (
                <img
                  src={show.poster}
                  alt={show.title}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="poster-fallback">
                  <span>📺</span>
                  <p>{show.title}</p>
                </div>
              )}
              <div className="poster-glow" />
            </div>

            <button
              className="btn btn-primary watch-poster-btn"
              onClick={() => playEpisode(activeSeason, 1)}
              id="tv-poster-watch-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch S{activeSeason} E1
            </button>
          </div>

          {/* Info column */}
          <div className="detail-info">
            {/* Genre labels */}
            <div className="detail-genres">
              <span className="detail-genre-badge tv-badge-accent">TV Series</span>
              {(show.genreLabels || [show.genre]).slice(0, 3).map((g) => (
                <span key={g} className="detail-genre-badge">{g}</span>
              ))}
            </div>

            <h1 className="detail-title">{show.title}</h1>

            {show.tagline && (
              <p className="detail-tagline">"{show.tagline}"</p>
            )}

            {/* Rating */}
            <div className="detail-meta-row">
              <StarRating rating={show.rating} />
            </div>

            {/* Meta pills */}
            <div className="detail-meta-pills">
              <span className="meta-pill">{show.year}{show.lastAirDate ? ` – ${show.lastAirDate.slice(0, 4)}` : ""}</span>
              <span className="meta-pill">{show.totalSeasons} Season{show.totalSeasons !== 1 ? "s" : ""}</span>
              <span className="meta-pill">{show.totalEpisodes} Episode{show.totalEpisodes !== 1 ? "s" : ""}</span>
              {show.episodeRuntime && <span className="meta-pill">{show.episodeRuntime} min/ep</span>}
              {show.status && <span className={`meta-pill status-pill status-${show.status.toLowerCase().replace(/\s+/g, "-")}`}>{show.status}</span>}
            </div>

            {/* Creator(s) */}
            {show.creators && show.creators.length > 0 && (
              <div className="detail-director">
                <span className="detail-label">Created by</span>
                <span>{show.creators.join(", ")}</span>
              </div>
            )}

            {/* Networks */}
            {show.networks && show.networks.length > 0 && (
              <div className="detail-director">
                <span className="detail-label">Network</span>
                <span>{show.networks.join(", ")}</span>
              </div>
            )}

            {/* Overview */}
            <div className="detail-description">
              <h3 className="detail-label">Overview</h3>
              <p>{show.fullDescription}</p>
            </div>

            {/* Action buttons */}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                onClick={() => playEpisode(activeSeason, 1)}
                id="tv-detail-watch-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {show.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${show.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  id="tv-detail-trailer-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Watch Trailer
                </a>
              )}

              <Link to="/tv-shows" className="btn btn-ghost" id="tv-detail-browse-btn">
                Browse More
              </Link>
            </div>

            {/* Cast */}
            {show.cast && show.cast.length > 0 && (
              <div className="detail-cast">
                <h3 className="detail-label">Cast</h3>
                <div className="cast-grid">
                  {show.cast.map((member, i) => (
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

        {/* ── Seasons & Episodes Section ── */}
        <div className="seasons-section">
          <div className="section-header-simple">
            <h2 className="section-title">
              <span className="accent-bar" />
              Seasons & Episodes
            </h2>
          </div>

          {/* Season selector */}
          <div className="season-tabs">
            {(show.seasons || []).map((s) => (
              <button
                key={s.seasonNumber}
                className={`season-tab ${activeSeason === s.seasonNumber ? "active" : ""}`}
                onClick={() => setActiveSeason(s.seasonNumber)}
                id={`season-tab-${s.seasonNumber}`}
              >
                <span className="season-tab-num">S{s.seasonNumber}</span>
                <span className="season-tab-info">{s.episodeCount} eps</span>
              </button>
            ))}
          </div>

          {/* Episode list */}
          <div className="episode-list">
            {loadingEps ? (
              <div className="episodes-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="episode-skeleton shimmer" />
                ))}
              </div>
            ) : episodes.length > 0 ? (
              episodes.map((ep) => (
                <div
                  key={ep.id}
                  className={`episode-card ${playerOpen && playingSeason === activeSeason && playingEpisode === ep.episodeNumber ? "playing" : ""}`}
                  id={`episode-${activeSeason}-${ep.episodeNumber}`}
                  onClick={() => playEpisode(activeSeason, ep.episodeNumber)}
                >
                  {/* Episode still / thumbnail */}
                  <div className="episode-thumb">
                    {ep.still ? (
                      <img src={ep.still} alt={ep.name} loading="lazy" />
                    ) : (
                      <div className="episode-thumb-fallback">
                        <span>E{ep.episodeNumber}</span>
                      </div>
                    )}
                    <div className="episode-play-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {ep.runtime && <span className="episode-runtime">{ep.runtime}m</span>}
                  </div>

                  {/* Episode info */}
                  <div className="episode-info">
                    <div className="episode-header">
                      <span className="episode-number">Episode {ep.episodeNumber}</span>
                      {ep.rating > 0 && (
                        <span className="episode-rating">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {ep.rating}
                        </span>
                      )}
                    </div>
                    <h4 className="episode-title">{ep.name}</h4>
                    {ep.airDate && <span className="episode-date">{ep.airDate}</span>}
                    {ep.overview && <p className="episode-overview">{ep.overview}</p>}
                    <button
                      className="btn btn-ghost btn-sm episode-watch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        playEpisode(activeSeason, ep.episodeNumber);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {playerOpen && playingSeason === activeSeason && playingEpisode === ep.episodeNumber ? "Playing" : "Watch"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-episodes">
                <p>No episodes available for this season yet.</p>
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

export default TVDetail;
