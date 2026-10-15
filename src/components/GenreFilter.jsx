import { UI_GENRES } from "../api/tmdb";
import "./GenreFilter.css";

const GenreFilter = ({ activeGenre, onGenreChange, genres }) => {
  const genreList = genres || UI_GENRES;
  return (
    <div className="genre-filter">
      <div className="genre-pills">
        {genreList.map((genre) => (
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
};

export default GenreFilter;
