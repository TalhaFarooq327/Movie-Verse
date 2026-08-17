import { useState } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import MovieCard from "../components/MovieCard";
import GenreFilter from "../components/GenreFilter";
import { movies, genres, trendingMovies, getMoviesByGenre } from "../data/movies";
import "./Home.css";

const Home = () => {
  const [activeGenre, setActiveGenre] = useState("All");

  const filteredMovies = getMoviesByGenre(activeGenre);

  return (
    <div className="home-page">
      {/* Hero */}
      <HeroBanner />

      {/* Trending Section */}
      <section className="section trending-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="accent-bar" />
                🔥 Trending Now
              </h2>
              <p className="section-subtitle">The most popular movies right now</p>
            </div>
            <Link to="/movies" className="view-all-link" id="trending-view-all">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          <div className="trending-grid stagger">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* Genre Highlight */}
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

          {filteredMovies.length > 0 ? (
            <div className="genre-movie-grid stagger">
              {filteredMovies.map((movie) => (
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

      {/* Stats Banner */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">20+</span>
              <span className="stat-label">Movies Available</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">6</span>
              <span className="stat-label">Genres</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">9.3</span>
              <span className="stat-label">Highest Rating</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free to Browse</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
