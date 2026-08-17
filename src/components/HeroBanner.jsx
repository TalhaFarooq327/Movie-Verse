import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { featuredMovie } from "../data/movies";
import "./HeroBanner.css";

const HeroBanner = () => {
  const movie = featuredMovie;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`hero ${loaded ? "loaded" : ""}`}>
      {/* Backdrop */}
      <div className="hero-backdrop">
        <img src={movie.backdrop} alt={movie.title} onError={(e) => (e.target.src = movie.poster)} />
        <div className="hero-overlay" />
        <div className="hero-overlay-bottom" />
      </div>

      {/* Noise texture */}
      <div className="hero-noise" />

      {/* Content */}
      <div className="container hero-content">
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
          <span className="hero-duration">{movie.duration}</span>
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
          <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" id="hero-trailer-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16 10,8" fill="currentColor" stroke="none" />
            </svg>
            Watch Trailer
          </a>
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
