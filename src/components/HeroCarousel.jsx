import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HeroCarousel.css";

const INTERVAL = 6000; // ms per slide

const HeroCarousel = ({ movies = [] }) => {
  const [current, setCurrent]   = useState(0);
  const [progress, setProgress] = useState(0);
  const stripRef                = useRef(null);
  const progressRef             = useRef(null);
  const timerRef                = useRef(null);

  // Auto-advance + progress bar
  const startTimer = (index) => {
    clearInterval(progressRef.current);
    clearTimeout(timerRef.current);
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / INTERVAL) * 100, 100);
      setProgress(pct);
    }, 40);

    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, INTERVAL);
  };

  useEffect(() => {
    if (movies.length === 0) return;
    setProgress(0);
    startTimer(current);

    // Scroll active thumb into view
    if (stripRef.current) {
      const child = stripRef.current.children[current];
      child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    return () => {
      clearInterval(progressRef.current);
      clearTimeout(timerRef.current);
    };
  }, [current, movies.length]);

  const goTo = (i) => {
    if (i === current) return;
    setCurrent(i);
    setProgress(0);
  };

  const goPrev = () => goTo((current - 1 + movies.length) % movies.length);
  const goNext = () => goTo((current + 1) % movies.length);

  // Skeleton
  if (movies.length === 0) {
    return (
      <section className="hero-carousel hero-skeleton">
        <div className="hero-skeleton-bg shimmer" />
        <div className="container carousel-content">
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

  const movie = movies[current];

  return (
    <section className="hero-carousel">
      {/* ── Backdrop slides ── */}
      <div className="carousel-backdrop">
        {movies.map((m, i) => (
          <div key={m.id} className={`carousel-slide ${i === current ? "active" : ""}`}>
            {m.backdrop && <img src={m.backdrop} alt={m.title} />}
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="hero-overlay-bottom" />
      </div>

      {/* ── Content ── */}
      <div className="container carousel-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Featured Film
        </div>

        <h1 className="hero-title">{movie.title}</h1>

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

        <p className="hero-description">{movie.description}</p>

        <div className="hero-actions">
          <Link to={`/movie/${movie.id}`} className="btn btn-primary" id="hero-watch-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </Link>
          <Link to={`/movie/${movie.id}`} className="btn btn-ghost" id="hero-details-btn">
            More Info
          </Link>
          <Link to="/movies" className="btn btn-ghost" id="hero-browse-btn">
            Browse All
          </Link>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button className="carousel-arrow prev" onClick={goPrev} id="carousel-prev" aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button className="carousel-arrow next" onClick={goNext} id="carousel-next" aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* ── Thumbnail strip ── */}
      <div className="carousel-strip-wrapper">
        {/* Progress bar above strip */}
        <div className="carousel-progress-track">
          <div className="carousel-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="carousel-strip" ref={stripRef}>
          {movies.map((m, i) => (
            <button
              key={m.id}
              className={`carousel-thumb ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
              id={`carousel-thumb-${m.id}`}
              aria-label={`Feature ${m.title}`}
            >
              {m.poster ? (
                <img src={m.poster} alt={m.title} loading="lazy" />
              ) : (
                <div className="thumb-fallback">{m.title}</div>
              )}
              <div className="thumb-overlay">
                <span className="thumb-title">{m.title}</span>
                <span className="thumb-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {m.rating}
                </span>
              </div>
              {i === current && (
                <div className="thumb-progress-border" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {movies.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
