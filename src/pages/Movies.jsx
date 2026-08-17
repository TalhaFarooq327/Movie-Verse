import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import GenreFilter from "../components/GenreFilter";
import { movies } from "../data/movies";
import "./Movies.css";

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeGenre, setActiveGenre] = useState(searchParams.get("genre") || "All");
  const [sortBy, setSortBy] = useState("rating");
  const [filteredMovies, setFilteredMovies] = useState([]);

  const filterMovies = useCallback(() => {
    let result = [...movies];

    // Genre filter
    if (activeGenre !== "All") {
      result = result.filter((m) => m.genre === activeGenre);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "year") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredMovies(result);
  }, [searchQuery, activeGenre, sortBy]);

  useEffect(() => {
    filterMovies();
  }, [filterMovies]);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (activeGenre !== "All") params.genre = activeGenre;
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeGenre, setSearchParams]);

  const handleGenreChange = (genre) => {
    setActiveGenre(genre);
    setSearchQuery("");
  };

  return (
    <div className="movies-page">
      {/* Page Header */}
      <div className="movies-header">
        <div className="movies-header-bg" />
        <div className="container movies-header-content">
          <h1 className="movies-page-title">
            <span className="title-icon">🎬</span>
            Explore Movies
          </h1>
          <p className="movies-page-subtitle">
            Discover your next favorite film from our curated collection
          </p>
          <div className="movies-search-wrapper">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="container">
        <div className="movies-filters">
          <div className="filters-left">
            <GenreFilter activeGenre={activeGenre} onGenreChange={handleGenreChange} />
          </div>
          <div className="filters-right">
            <label className="sort-label" htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Top Rated</option>
              <option value="year">Newest First</option>
              <option value="title">A–Z</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <span className="results-count">
            {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""}
            {activeGenre !== "All" ? ` in ${activeGenre}` : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </span>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length > 0 ? (
          <div className="movies-grid stagger">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No movies found</h3>
            <p>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : `No movies in the "${activeGenre}" genre yet.`}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => { setSearchQuery(""); setActiveGenre("All"); }}
              id="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
