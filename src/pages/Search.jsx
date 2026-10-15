import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import { SkeletonGrid } from "../components/SkeletonCard";
import { searchMulti, searchMovies, searchTV } from "../api/tmdb";
import "./Search.css";

const SORT_OPTIONS = [
  { value: "popularity.desc",   label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated"    },
  { value: "newest",            label: "Newest First" },
  { value: "oldest",            label: "Oldest First" },
  { value: "title.asc",         label: "A – Z"        },
];

const TYPE_TABS = [
  { id: "all",   label: "All"      },
  { id: "movie", label: "Movies"   },
  { id: "tv",    label: "TV Shows" },
];

const sortResults = (arr, sortBy) => {
  const sorted = [...arr];
  switch (sortBy) {
    case "vote_average.desc":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "newest":
      return sorted.sort((a, b) => (b.year || "0").localeCompare(a.year || "0"));
    case "oldest":
      return sorted.sort((a, b) => (a.year || "9999").localeCompare(b.year || "9999"));
    case "title.asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "popularity.desc":
    default:
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryFromUrl = searchParams.get("q") || searchParams.get("search") || "";
  const typeFromUrl  = searchParams.get("type") || "all";

  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [activeType, setActiveType] = useState(typeFromUrl);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debounceRef = useRef(null);

  // Sync input with URL param changes
  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setActiveType(typeFromUrl);
  }, [typeFromUrl]);

  // Core search fetch function
  const executeSearch = useCallback(async (query, type, pg, append, sort) => {
    if (!query.trim()) {
      setResults([]);
      setTotalPages(1);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data;
      if (type === "movie") {
        data = await searchMovies(query, pg);
      } else if (type === "tv") {
        data = await searchTV(query, pg);
      } else {
        data = await searchMulti(query, pg);
      }

      const sorted = sortResults(data.results || [], sort);
      setResults((prev) => (append ? [...prev, ...sorted] : sorted));
      setTotalPages(data.totalPages || 1);
      if (!append) {
        setTotalCount(data.totalResults || data.results?.length || 0);
      }
    } catch (err) {
      setError(err.message);
      if (!append) setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when URL query, type, or sort change
  useEffect(() => {
    setPage(1);
    executeSearch(queryFromUrl, activeType, 1, false, sortBy);
  }, [queryFromUrl, activeType, sortBy, executeSearch]);

  const handleInputChange = (val) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (val.trim()) params.set("q", val.trim());
      if (activeType !== "all") params.set("type", activeType);
      navigate(`/search?${params.toString()}`, { replace: true });
    }, 400);
  };

  const handleTypeChange = (typeId) => {
    setActiveType(typeId);
    const params = new URLSearchParams();
    if (queryFromUrl.trim()) params.set("q", queryFromUrl.trim());
    if (typeId !== "all") params.set("type", typeId);
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(queryFromUrl, activeType, nextPage, true, sortBy);
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="container">
          <div className="search-header-inner">
            <span className="search-badge">Universal Search</span>
            <h1 className="search-title">
              {queryFromUrl ? (
                <>Results for <span className="search-query-highlight">"{queryFromUrl}"</span></>
              ) : (
                "Search Movies & TV Shows"
              )}
            </h1>
            <p className="search-subtitle">
              Browse through millions of movies and TV series all in one place
            </p>

            {/* In-page search bar */}
            <div className="search-bar-wrap">
              <SearchBar
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Search movies, TV shows, anime, franchises..."
              />
            </div>

            {/* Filter tabs: All | Movies | TV Shows */}
            <div className="search-tabs-row">
              <div className="search-type-tabs">
                {TYPE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`search-type-tab ${activeType === tab.id ? "active" : ""}`}
                    onClick={() => handleTypeChange(tab.id)}
                    id={`search-type-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              {results.length > 0 && (
                <div className="search-sort-wrap">
                  <label htmlFor="search-sort-select">Sort by:</label>
                  <select
                    id="search-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="search-sort-select"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="container search-content">
        {error && (
          <div className="api-error-box">
            <span>⚠️</span>
            <div>
              <strong>Failed to fetch search results</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading state on new search */}
        {loading && page === 1 && (
          <div className="search-loading">
            <SkeletonGrid count={12} />
          </div>
        )}

        {/* Empty query state */}
        {!queryFromUrl && !loading && (
          <div className="search-empty-prompt">
            <span className="search-empty-icon">🔍</span>
            <h3>Looking for something to watch?</h3>
            <p>Type a title above to search across our full catalog of movies and TV shows.</p>
          </div>
        )}

        {/* No results found */}
        {queryFromUrl && !loading && results.length === 0 && !error && (
          <div className="no-results search-no-results">
            <span className="no-results-icon">🎬</span>
            <h3>No titles found for "{queryFromUrl}"</h3>
            <p>Try checking for typos or searching for alternative keywords.</p>
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <>
            <div className="search-meta-bar">
              <span className="search-count-label">
                Found {results.length}{totalCount > results.length ? ` of ${totalCount}+` : ""} title{results.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="search-grid stagger">
              {results.map((item, index) => (
                <MovieCard key={`${item.id}-${item.mediaType}-${index}`} movie={item} />
              ))}
            </div>

            {/* Load more button */}
            {page < totalPages && (
              <div className="search-load-more">
                <button
                  className="btn btn-ghost load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                  id="search-load-more-btn"
                >
                  {loading ? "Loading more..." : "Load More Titles"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
