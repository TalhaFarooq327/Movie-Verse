import { UI_GENRES } from "../api/tmdb";
import "./GenreFilter.css";

const GenreFilter = ({ activeGenre, onGenreChange }) => (
  <div className="genre-filter">
    <div className="genre-pills">
      {UI_GENRES.map((genre) => (
        <button
          key={genre}
          className={`genre-pill ${activeGenre === genre ? "active" : ""}`}
          onClick={() => onGenreChange(genre)}
          id={`genre-pill-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
        >
          {genre}
        </button>
      ))}
    </div>
  </div>
);

export default GenreFilter;
