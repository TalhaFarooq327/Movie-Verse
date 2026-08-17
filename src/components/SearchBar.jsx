import "./SearchBar.css";

const SearchBar = ({ value, onChange, placeholder = "Search movies, genres, directors..." }) => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          id="movie-search-input"
          autoComplete="off"
        />
        {value && (
          <button
            className="search-clear"
            onClick={() => onChange("")}
            id="search-clear-btn"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {value && (
        <p className="search-hint">Searching for "<strong>{value}</strong>"</p>
      )}
    </div>
  );
};

export default SearchBar;
