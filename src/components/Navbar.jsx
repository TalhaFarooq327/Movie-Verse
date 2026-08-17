import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
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
          <li>
            <NavLink
              to="/movies?genre=Action"
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Action"); }}
            >Action</NavLink>
          </li>
          <li>
            <NavLink
              to="/movies?genre=Comedy"
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Comedy"); }}
            >Comedy</NavLink>
          </li>
          <li>
            <NavLink
              to="/movies?genre=Horror"
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Horror"); }}
            >Horror</NavLink>
          </li>
          <li>
            <NavLink
              to="/movies?genre=Sci-Fi"
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Sci-Fi"); }}
            >Sci-Fi</NavLink>
          </li>
        </ul>

        {/* Search — right */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="navbar-search-input"
          />
          <button type="submit" id="navbar-search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

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
          <li><NavLink to="/movies" onClick={() => setMenuOpen(false)}>All Movies</NavLink></li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Action"); setMenuOpen(false); }}>Action</a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Comedy"); setMenuOpen(false); }}>Comedy</a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Horror"); setMenuOpen(false); }}>Horror</a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Sci-Fi"); setMenuOpen(false); }}>Sci-Fi</a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Drama"); setMenuOpen(false); }}>Drama</a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/movies?genre=Romance"); setMenuOpen(false); }}>Romance</a>
          </li>
        </ul>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
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
