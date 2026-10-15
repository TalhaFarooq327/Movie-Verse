import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import GenreFilter from "../components/GenreFilter";
import { SkeletonGrid } from "../components/SkeletonCard";
import { fetchDiscoverTV, searchTV, TV_GENRE_ID_MAP, UI_TV_GENRES } from "../api/tmdb";
import "./TVShows.css";

const SORT_OPTIONS = [
  { value: "popularity.desc",    label: "Most Popular"  },
  { value: "vote_average.desc",  label: "Top Rated"     },
  { value: "first_air_date.desc",label: "Newest First"  },
  { value: "first_air_date.asc", label: "Oldest First"  },
];

const sortClientSide = (arr, sortBy) => {
  if (sortBy !== "name.asc") return arr;
  return [...arr].sort((a, b) => a.title.localeCompare(b.title));
};

const TVShows = () => {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();

  const genreFromUrl  = searchParams.get("genre")  || "All";
  const searchFromUrl = searchParams.get("search") || "";

  const [inputValue,  setInputValue]  = useState(searchFromUrl);
  const [sortBy,      setSortBy]      = useState("popularity.desc");
  const [shows,       setShows]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(searchFromUrl);
  }, [searchFromUrl]);

  const loadShows = useCallback(async (q, genre, pg, append, sort) => {
    try {
      setLoading(true);
      setError(null);

      let results = [];
      let pages   = 1;

      if (q.trim()) {
        const data = await searchTV(q, pg);
        results = sortClientSide(data.results, sort);
        pages   = data.totalPages;
      } else {
        const genreId = genre !== "All" ? TV_GENRE_ID_MAP[genre] : null;
        const data    = await fetchDiscoverTV({ genreId, sortBy: sort, page: pg });
        results = sortClientSide(data.results, sort);
        pages   = data.totalPages;
      }

      setShows((prev) => (append ? [...prev, ...results] : results));
      setTotalPages(pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadShows(searchFromUrl, genreFromUrl, 1, false, sortBy);
  }, [searchFromUrl, genreFromUrl, sortBy, loadShows]);

  const handleSearchChange = (value) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("search", value.trim());
      if (genreFromUrl !== "All") params.set("genre", genreFromUrl);
      navigate(`/tv-shows?${params.toString()}`, { replace: true });
    }, 400);
  };

  const handleGenreChange = (genre) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (genre !== "All") params.set("genre", genre);
    navigate(`/tv-shows?${params.toString()}`, { replace: true });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadShows(searchFromUrl, genreFromUrl, nextPage, true, sortBy);
  };

  const handleClearFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate("/tv-shows", { replace: true });
  };

  return (
    <div className="movies-page tv-shows-page">
      {/* Header */}
      <div className="movies-header tv-header">
        <div className="movies-header-bg" />
        <div className="container movies-header-content">
          <h1 className="movies-page-title">
            <span className="tv-title-icon">📺</span>
            Explore TV Shows
          </h1>
          <p className="movies-page-subtitle">
            Discover binge-worthy series — powered by TMDB
          </p>
          <div className="movies-search-wrapper">
            <SearchBar
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Search TV shows..."
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container">
        <div className="movies-filters">
          <div className="filters-left">
            <GenreFilter
              activeGenre={genreFromUrl}
              onGenreChange={handleGenreChange}
              genres={UI_TV_GENRES}
            />
          </div>
          <div className="filters-right">
            <label className="sort-label" htmlFor="tv-sort-select">Sort:</label>
            <select
              id="tv-sort-select"
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
              {shows.length} shows
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
              <strong>Failed to load TV shows</strong>
              <p>{error}</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => loadShows(searchFromUrl, genreFromUrl, 1, false, sortBy)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {loading && page === 1 ? (
          <SkeletonGrid count={12} />
        ) : shows.length > 0 ? (
          <>
            <div className="movies-grid stagger">
              {shows.map((show) => (
                <MovieCard key={`${show.id}-${show.title}`} movie={show} />
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div className="load-more-wrapper">
                <button
                  className="btn btn-ghost load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                  id="tv-load-more-btn"
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
            <h3>No TV shows found</h3>
            <p>
              {searchFromUrl
                ? `No results for "${searchFromUrl}". Try a different search.`
                : `No shows found for "${genreFromUrl}".`}
            </p>
            <button className="btn btn-primary" onClick={handleClearFilters} id="tv-clear-filters-btn">
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TVShows;
