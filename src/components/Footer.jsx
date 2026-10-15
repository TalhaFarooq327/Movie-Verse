import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>🎬</span> Movie<span className="logo-accent">Verse</span>
            </Link>
            <p className="footer-tagline">
              Your ultimate destination for movies & TV series. Explore, discover, and stream without limits.
            </p>
          </div>

          {/* Links */}
          <div className="footer-links-group">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/movies">Movies</Link></li>
              <li><Link to="/tv-shows">TV Shows</Link></li>
              <li><Link to="/search">Search</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Popular Genres</h4>
            <ul>
              <li><Link to="/movies?genre=Action">Action</Link></li>
              <li><Link to="/movies?genre=Comedy">Comedy</Link></li>
              <li><Link to="/movies?genre=Sci-Fi">Sci-Fi</Link></li>
              <li><Link to="/movies?genre=Drama">Drama</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} MovieVerse. All rights reserved. Made with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/talha-farooq327/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-author-link"
              id="footer-author-linkedin"
            >
              Talha Farooq
            </a>{" "}
            for cinema & TV lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
