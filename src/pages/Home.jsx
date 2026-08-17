import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import MovieCard from "../components/MovieCard";
import GenreFilter from "../components/GenreFilter";
import { SkeletonGrid } from "../components/SkeletonCard";
import { fetchTrending, fetchDiscover, GENRE_ID_MAP } from "../api/tmdb";
import "./Home.css";

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [error, setError] = useState(null);

  // Fetch trending on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingTrend(true);
        const results = await fetchTrending();
        setTrending(results);
        setGenreMovies(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTrend(false);
      }
    })();
  }, []);

  // Fetch by genre when tab changes
  useEffect(() => {
    if (loadingTrend) return;
    (async () => {
      if (activeGenre === "All") {
        setGenreMovies(trending);
        return;
      }
      try {
        setLoadingGenre(true);
        const genreId = GENRE_ID_MAP[activeGenre];
        const { results } = await fetchDiscover({ genreId });
        setGenreMovies(results);
      } catch {
        setGenreMovies([]);
      } finally {
        setLoadingGenre(false);
      }
    })();
  }, [activeGenre, trending, loadingTrend]);

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

      {/* Genre Browse */}
      <section className="genre-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="accent-bar" />
                Browse by Genre
              </h2>
              <p className="section-subtitle">Find movies that match your mood</p>
            </div>
          </div>

          <GenreFilter activeGenre={activeGenre} onGenreChange={setActiveGenre} />

          {loadingGenre ? (
            <div style={{ marginTop: "32px" }}>
              <SkeletonGrid count={8} />
            </div>
          ) : genreMovies.length > 0 ? (
            <div className="genre-movie-grid stagger">
              {genreMovies.slice(0, 12).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No movies found</h3>
              <p>Try a different genre</p>
            </div>
          )}

          <div className="genre-cta">
            <Link to="/movies" className="btn btn-primary" id="genre-browse-all-btn">
              Browse All Movies
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">500K+</span>
              <span className="stat-label">Movies in Database</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">6</span>
              <span className="stat-label">Featured Genres</span>
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
