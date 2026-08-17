import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Movie<span className="logo-accent">Verse</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/movies" className={({ isActive }) => isActive ? "active" : ""}>Movies</NavLink></li>
          <li><NavLink to="/movies?genre=Action" className={({ isActive }) => isActive ? "active" : ""}>Action</NavLink></li>
          <li><NavLink to="/movies?genre=Comedy" className={({ isActive }) => isActive ? "active" : ""}>Comedy</NavLink></li>
          <li><NavLink to="/movies?genre=Horror" className={({ isActive }) => isActive ? "active" : ""}>Horror</NavLink></li>
        </ul>

        {/* Desktop Search */}
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
          <li><NavLink to="/movies?genre=Action" onClick={() => setMenuOpen(false)}>Action</NavLink></li>
          <li><NavLink to="/movies?genre=Comedy" onClick={() => setMenuOpen(false)}>Comedy</NavLink></li>
          <li><NavLink to="/movies?genre=Horror" onClick={() => setMenuOpen(false)}>Horror</NavLink></li>
          <li><NavLink to="/movies?genre=Sci-Fi" onClick={() => setMenuOpen(false)}>Sci-Fi</NavLink></li>
          <li><NavLink to="/movies?genre=Drama" onClick={() => setMenuOpen(false)}>Drama</NavLink></li>
          <li><NavLink to="/movies?genre=Romance" onClick={() => setMenuOpen(false)}>Romance</NavLink></li>
        </ul>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">Search</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
