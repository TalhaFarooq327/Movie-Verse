import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import GenreFilter from "../components/GenreFilter";
import { SkeletonGrid } from "../components/SkeletonCard";
import { fetchDiscover, searchMovies, GENRE_ID_MAP } from "../api/tmdb";
import "./Movies.css";

const SORT_OPTIONS = [
  { value: "popularity.desc",    label: "Most Popular"  },
  { value: "vote_average.desc",  label: "Top Rated"     },
  { value: "release_date.desc",  label: "Newest First"  },
  { value: "release_date.asc",   label: "Oldest First"  },
  { value: "title.asc",          label: "A – Z"         },
];

// Client-side title sort (TMDB discover doesn't support it)
const sortClientSide = (arr, sortBy) => {
  if (sortBy !== "title.asc") return arr;
  return [...arr].sort((a, b) => a.title.localeCompare(b.title));
};

const Movies = () => {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();

  // ── Derive values directly from URL (reactive to navbar clicks) ──
  const genreFromUrl  = searchParams.get("genre")  || "All";
  const searchFromUrl = searchParams.get("search") || "";

  // ── Local UI state ──
  const [inputValue,  setInputValue]  = useState(searchFromUrl);
  const [sortBy,      setSortBy]      = useState("popularity.desc");
  const [movies,      setMovies]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const debounceRef = useRef(null);
  const isFirstLoad = useRef(true);

  // ── Sync inputValue when URL changes externally (navbar genre clicks clear search) ──
  useEffect(() => {
    setInputValue(searchFromUrl);
  }, [searchFromUrl]);

  // ── Core load function ──
  const loadMovies = useCallback(async (q, genre, pg, append, sort) => {
    try {
      setLoading(true);
      setError(null);

      let results = [];
      let pages   = 1;

      if (q.trim()) {
        // Search mode — client-side sort after fetch
        const data = await searchMovies(q, pg);
        results = sortClientSide(data.results, sort);
        pages   = data.totalPages;
      } else {
        // Discover mode (genre + sort)
        const genreId = genre !== "All" ? GENRE_ID_MAP[genre] : null;
        // title.asc not supported by TMDB; fetch popularity then sort client-side
        const apiSort = sort === "title.asc" ? "popularity.desc" : sort;
        const data    = await fetchDiscover({ genreId, sortBy: apiSort, page: pg });
        results = sortClientSide(data.results, sort);
        pages   = data.totalPages;
      }

      setMovies((prev) => (append ? [...prev, ...results] : results));
      setTotalPages(pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Re-load whenever URL genre/search OR sort changes ──
  useEffect(() => {
    setPage(1);
    loadMovies(searchFromUrl, genreFromUrl, 1, false, sortBy);
  }, [searchFromUrl, genreFromUrl, sortBy, loadMovies]);

  // ── Debounce input → update URL search param ──
  const handleSearchChange = (value) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("search", value.trim());
      if (genreFromUrl !== "All") params.set("genre", genreFromUrl);
      navigate(`/movies?${params.toString()}`, { replace: true });
    }, 400);
  };

  // ── Genre change → update URL (clears search) ──
  const handleGenreChange = (genre) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (genre !== "All") params.set("genre", genre);
    navigate(`/movies?${params.toString()}`, { replace: true });
  };

  // ── Load more ──
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(searchFromUrl, genreFromUrl, nextPage, true, sortBy);
  };

  const handleClearFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate("/movies", { replace: true });
  };

  return (
    <div className="movies-page">
      {/* Header */}
      <div className="movies-header">
        <div className="movies-header-bg" />
        <div className="container movies-header-content">
          <h1 className="movies-page-title">Explore Movies</h1>
          <p className="movies-page-subtitle">
            Discover your next favorite film — powered by TMDB
          </p>
          <div className="movies-search-wrapper">
            <SearchBar value={inputValue} onChange={handleSearchChange} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container">
        <div className="movies-filters">
          <div className="filters-left">
            <GenreFilter activeGenre={genreFromUrl} onGenreChange={handleGenreChange} />
          </div>
          <div className="filters-right">
            <label className="sort-label" htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="results-info">
            <span className="results-count">
              {movies.length} movies
              {genreFromUrl !== "All" && ` in ${genreFromUrl}`}
              {searchFromUrl && ` matching "${searchFromUrl}"`}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="api-error-box">
            <span>⚠</span>
            <div>
              <strong>Failed to load movies</strong>
              <p>{error}</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => loadMovies(searchFromUrl, genreFromUrl, 1, false, sortBy)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {loading && page === 1 ? (
          <SkeletonGrid count={12} />
        ) : movies.length > 0 ? (
          <>
            <div className="movies-grid stagger">
              {movies.map((movie) => (
                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div className="load-more-wrapper">
                <button
                  className="btn btn-ghost load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                  id="load-more-btn"
                >
                  {loading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      Load More
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="no-results">
            <div className="no-results-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3>No movies found</h3>
            <p>
              {searchFromUrl
                ? `No results for "${searchFromUrl}". Try a different search.`
                : `No movies found for "${genreFromUrl}".`}
            </p>
            <button className="btn btn-primary" onClick={handleClearFilters} id="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Movies;
