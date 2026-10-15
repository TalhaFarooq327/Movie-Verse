import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { searchMulti } from "../api/tmdb";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled,        setScrolled]        = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [liveResults,     setLiveResults]     = useState([]);
  const [loadingLive,     setLoadingLive]     = useState(false);
  const [showDropdown,    setShowDropdown]    = useState(false);

  const searchWrapRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close mobile menu and dropdown when route changes
  useEffect(() => {
    setMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname, location.search]);

  // Live multi-search as user types
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setLiveResults([]);
      setLoadingLive(false);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoadingLive(true);
        const data = await searchMulti(query, 1);
        setLiveResults((data.results || []).slice(0, 6));
      } catch {
        setLiveResults([]);
      } finally {
        setLoadingLive(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const handleSelectResult = (item) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(item.mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner container">

        {/* Logo — left */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Movie<span className="logo-accent">Verse</span></span>
        </Link>

        {/* Nav links — center */}
        <ul className="navbar-links">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/movies" className={({ isActive }) => isActive ? "active" : ""}>Movies</NavLink></li>
          <li><NavLink to="/tv-shows" className={({ isActive }) => isActive ? "active" : ""}>TV Shows</NavLink></li>
        </ul>

        {/* Search — right */}
        <div className="navbar-search-wrapper" ref={searchWrapRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search movies & shows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowDropdown(true);
              }}
              id="navbar-search-input"
              autoComplete="off"
            />
            <button type="submit" id="navbar-search-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Quick search live preview dropdown */}
          {showDropdown && searchQuery.trim().length >= 2 && (
            <div className="navbar-search-dropdown">
              {loadingLive ? (
                <div className="navbar-dropdown-loading">
                  <div className="dropdown-spinner" />
                  <span>Searching movies & shows...</span>
                </div>
              ) : liveResults.length > 0 ? (
                <>
                  <div className="navbar-dropdown-list">
                    {liveResults.map((item) => (
                      <div
                        key={`${item.id}-${item.mediaType}`}
                        className="navbar-dropdown-item"
                        onClick={() => handleSelectResult(item)}
                      >
                        <div className="dropdown-thumb">
                          {item.poster ? (
                            <img src={item.poster} alt={item.title} />
                          ) : (
                            <span className="dropdown-thumb-fallback">🎬</span>
                          )}
                        </div>
                        <div className="dropdown-info">
                          <div className="dropdown-title-row">
                            <span className="dropdown-title">{item.title}</span>
                            <span className={`dropdown-badge ${item.mediaType === "tv" ? "tv-badge" : "movie-badge"}`}>
                              {item.mediaType === "tv" ? "TV Series" : "Movie"}
                            </span>
                          </div>
                          <div className="dropdown-meta">
                            <span>{item.year}</span>
                            {item.rating > 0 && (
                              <span className="dropdown-rating">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                {item.rating}
                              </span>
                            )}
                            <span className="dropdown-genre">{item.genre}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="navbar-dropdown-footer"
                    onClick={handleSearch}
                  >
                    View all results for "<strong>{searchQuery}</strong>" →
                  </button>
                </>
              ) : (
                <div className="navbar-dropdown-empty">
                  No movies or TV shows found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="hamburger-btn"
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <ul>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/movies" onClick={() => setMenuOpen(false)}>Movies</NavLink></li>
          <li><NavLink to="/tv-shows" onClick={() => setMenuOpen(false)}>TV Shows</NavLink></li>
        </ul>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies & shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
