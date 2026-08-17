import { genres } from "../data/movies";
import "./GenreFilter.css";

const GenreFilter = ({ activeGenre, onGenreChange }) => {
  const genreEmojis = {
    All: "🎬",
    Action: "💥",
    Comedy: "😂",
    Horror: "👻",
    "Sci-Fi": "🚀",
    Drama: "🎭",
    Romance: "❤️",
  };

  return (
    <div className="genre-filter">
      <div className="genre-pills">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`genre-pill ${activeGenre === genre ? "active" : ""}`}
            onClick={() => onGenreChange(genre)}
            id={`genre-pill-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
          >
            <span className="genre-emoji">{genreEmojis[genre]}</span>
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
