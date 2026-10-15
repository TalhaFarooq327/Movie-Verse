import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import MovieCard from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { fetchTrending, fetchTrendingTV } from "../api/tmdb";
import "./Home.css";

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingTV, setLoadingTV] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trending movies on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingTrend(true);
        const results = await fetchTrending();
        setTrending(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTrend(false);
      }
    })();
  }, []);

  // Fetch trending TV on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingTV(true);
        const results = await fetchTrendingTV();
        setTrendingTV(results);
      } catch {
        // silently fail — TV section just won't show
      } finally {
        setLoadingTV(false);
      }
    })();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner — silently cycles through trending backdrops */}
      <HeroBanner movies={trending} />

      {/* Trending Section */}
      <section className="section trending-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="accent-bar" />
                Trending This Week
              </h2>
              <p className="section-subtitle">Most popular movies right now</p>
            </div>
            <Link to="/movies" className="view-all-link" id="trending-view-all">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          {error && (
            <div className="api-error">
              Could not load movies — check your network connection.
            </div>
          )}

          {loadingTrend ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="trending-grid stagger">
              {trending.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending TV Shows */}
      <section className="section trending-tv-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="accent-bar accent-bar-purple" />
                Trending TV Shows
              </h2>
              <p className="section-subtitle">Binge-worthy series everyone's watching</p>
            </div>
            <Link to="/tv-shows" className="view-all-link" id="trending-tv-view-all">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          {loadingTV ? (
            <SkeletonGrid count={8} />
          ) : trendingTV.length > 0 ? (
            <div className="trending-grid stagger">
              {trendingTV.map((show) => (
                <MovieCard key={show.id} movie={show} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">500K+</span>
              <span className="stat-label">Movies & Shows</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">3+</span>
              <span className="stat-label">Streaming Servers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">4K</span>
              <span className="stat-label">Stream Quality</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free to Watch</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
