import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HeroBanner.css";

const INTERVAL = 6000; // ms between auto-changes

const HeroBanner = ({ movies = [], movie: singleMovie }) => {
  // Support both single movie (legacy) and movies array (auto-scroll)
  const slides = movies.length > 0 ? movies : singleMovie ? [singleMovie] : [];
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded]   = useState(false);
  const timerRef              = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance silently in background
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  // Skeleton when no data yet
  if (slides.length === 0) {
    return (
      <section className="hero hero-skeleton">
        <div className="hero-skeleton-bg shimmer" />
        <div className="container hero-content">
          <div className="hero-skeleton-badge shimmer" />
          <div className="hero-skeleton-title shimmer" />
          <div className="hero-skeleton-meta shimmer" />
          <div className="hero-skeleton-desc shimmer" />
          <div className="hero-skeleton-desc short shimmer" />
          <div className="hero-skeleton-btns">
            <div className="shimmer hero-skeleton-btn" />
            <div className="shimmer hero-skeleton-btn" />
          </div>
        </div>
      </section>
    );
  }

  const movie = slides[current];

  return (
    <section className={`hero ${loaded ? "loaded" : ""}`}>
      {/* ── Auto-cycling backdrops (hidden crossfade) ── */}
      <div className="hero-backdrop">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`hero-slide ${i === current ? "active" : ""}`}
          >
            {m.backdrop && (
              <img
                src={m.backdrop}
                alt={m.title}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="hero-overlay-bottom" />
      </div>

      <div className="hero-noise" />

      {/* ── Content ── */}
      <div className="container hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Featured Film
        </div>

        <h1 className="hero-title" key={movie.id}>{movie.title}</h1>

        <div className="hero-meta">
          <span className="hero-rating">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating}
          </span>
          <span className="hero-year">{movie.year}</span>
          {movie.duration && <span className="hero-duration">{movie.duration}</span>}
          <span className="hero-genre">{movie.genre}</span>
        </div>

        <p className="hero-description" key={`desc-${movie.id}`}>{movie.description}</p>

        <div className="hero-actions">
          <Link to={`/movie/${movie.id}`} className="btn btn-primary" id="hero-watch-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </Link>
          <Link to={`/movie/${movie.id}`} className="btn btn-ghost" id="hero-info-btn">
            More Info
          </Link>
          <Link to="/movies" className="btn btn-ghost" id="hero-browse-btn">
            Browse All
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default HeroBanner;
