// ============================================================
//  TMDB API SERVICE
// ============================================================

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const IMG_BASE = "https://image.tmdb.org/t/p";
export const posterUrl = (path, size = "w500") => path ? `${IMG_BASE}/${size}${path}` : null;
export const backdropUrl = (path, size = "original") => path ? `${IMG_BASE}/${size}${path}` : null;

// TMDB genre_id → display label map
export const GENRE_MAP = {
  28: "Action",
  35: "Comedy",
  27: "Horror",
  878: "Sci-Fi",
  18: "Drama",
  10749: "Romance",
  12: "Adventure",
  16: "Animation",
  80: "Crime",
  99: "Documentary",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  10402: "Music",
  9648: "Mystery",
  10752: "War",
  37: "Western",
  53: "Thriller",
};

// Reverse: label → id
export const GENRE_ID_MAP = Object.fromEntries(
  Object.entries(GENRE_MAP).map(([id, name]) => [name, Number(id)])
);

// Genre tabs shown in the UI
export const UI_GENRES = ["All", "Action", "Comedy", "Horror", "Sci-Fi", "Drama", "Romance"];

// ── Fetch helper ─────────────────────────────────────────────
async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Shape a raw TMDB movie result into our app's shape ───────
export function shapeMovie(raw) {
  const genreLabel =
    raw.genres?.[0]?.name ??
    GENRE_MAP[raw.genre_ids?.[0]] ??
    "Movie";

  return {
    id: raw.id,
    title: raw.title || raw.name || "Untitled",
    genre: genreLabel,
    genreIds: raw.genre_ids || raw.genres?.map((g) => g.id) || [],
    rating: raw.vote_average ? Math.round(raw.vote_average * 10) / 10 : 0,
    year: raw.release_date ? raw.release_date.slice(0, 4) : "N/A",
    poster: posterUrl(raw.poster_path),
    backdrop: backdropUrl(raw.backdrop_path),
    description: raw.overview || "No description available.",
    popularity: raw.popularity,
    voteCount: raw.vote_count,
  };
}

// ── Public API ────────────────────────────────────────────────

/** Trending movies this week */
export async function fetchTrending(page = 1) {
  const data = await tmdbFetch("/trending/movie/week", { page });
  return data.results.map(shapeMovie);
}

/** Popular movies */
export async function fetchPopular(page = 1) {
  const data = await tmdbFetch("/movie/popular", { page });
  return data.results.map(shapeMovie);
}

/** Discover movies — supports genre filter AND sort_by */
export async function fetchDiscover({
  genreId = null,
  sortBy = "popularity.desc",
  page = 1,
} = {}) {
  const params = { sort_by: sortBy, page, include_adult: false };
  if (genreId) params.with_genres = genreId;
  // Require minimum votes for vote_average sort to avoid noise
  if (sortBy === "vote_average.desc") params["vote_count.gte"] = 150;
  const data = await tmdbFetch("/discover/movie", params);
  return { results: data.results.map(shapeMovie), totalPages: data.total_pages };
}

/** Alias kept for backward compat */
export const fetchByGenre = (genreId, page = 1) =>
  fetchDiscover({ genreId, page });

/** Search movies */
export async function searchMovies(query, page = 1) {
  if (!query.trim()) return { results: [], totalPages: 0 };
  const data = await tmdbFetch("/search/movie", { query, page, include_adult: false });
  return { results: data.results.map(shapeMovie), totalPages: data.total_pages };
}

/** Full movie details (includes genres array) */
export async function fetchMovieDetail(tmdbId) {
  const data = await tmdbFetch(`/movie/${tmdbId}`, { append_to_response: "credits,videos" });

  const shaped = shapeMovie(data);

  // Cast
  const cast = (data.credits?.cast || []).slice(0, 10).map((c) => ({
    name: c.name,
    role: c.character,
    avatar: posterUrl(c.profile_path, "w185"),
    profileId: c.id,
  }));

  // Director
  const director = (data.credits?.crew || []).find((c) => c.job === "Director")?.name || null;

  // Runtime
  const duration = data.runtime ? `${data.runtime} min` : null;

  // Trailer from TMDB videos
  const trailer = (data.videos?.results || []).find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const trailerKey = trailer?.key || null;

  return {
    ...shaped,
    fullDescription: data.overview || shaped.description,
    tagline: data.tagline || null,
    director,
    duration,
    budget: data.budget || null,
    revenue: data.revenue || null,
    trailerKey,
    cast,
    // full genres list for display
    genreLabels: (data.genres || []).map((g) => g.name),
  };
}

/** Related movies (same genre / recommendations) */
export async function fetchRecommendations(tmdbId) {
  const data = await tmdbFetch(`/movie/${tmdbId}/recommendations`);
  return data.results.slice(0, 12).map(shapeMovie);
}

/** Streaming provider servers — Movies */
export const STREAM_SERVERS = [

  {
    id: "cinesrc",
    name: "CineSrc",
    badge: "Free",
    url: (id) => `https://cinesrc.st/embed/movie/${id}`,
  },

  {
    id: "multiembed",
    name: "MultiEmbed",
    badge: "Multi",
    url: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "embedwave",
    name: "EmbedWave",
    badge: "HQ",
    url: (id) => `https://embedwave.cc/embed/movie/${id}`,
  },
];

/** Default embed URL */
export const vidSrcMovieUrl = (tmdbId) => `https://embedwave.cc/embed/movie/${tmdbId}`;

// ============================================================
//  TV SHOWS API
// ============================================================

// TMDB TV genre_id → display label map
export const TV_GENRE_MAP = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

// Reverse: label → id
export const TV_GENRE_ID_MAP = Object.fromEntries(
  Object.entries(TV_GENRE_MAP).map(([id, name]) => [name, Number(id)])
);

// Genre tabs shown in TV UI
export const UI_TV_GENRES = [
  "All",
  "Action & Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Sci-Fi & Fantasy",
  "Animation",
];

// ── Shape a raw TMDB TV result into our app's shape ──────────
export function shapeTVShow(raw) {
  const genreLabel =
    raw.genres?.[0]?.name ??
    TV_GENRE_MAP[raw.genre_ids?.[0]] ??
    GENRE_MAP[raw.genre_ids?.[0]] ??
    "TV Show";

  return {
    id: raw.id,
    title: raw.name || raw.original_name || "Untitled",
    genre: genreLabel,
    genreIds: raw.genre_ids || raw.genres?.map((g) => g.id) || [],
    rating: raw.vote_average ? Math.round(raw.vote_average * 10) / 10 : 0,
    year: raw.first_air_date ? raw.first_air_date.slice(0, 4) : "N/A",
    poster: posterUrl(raw.poster_path),
    backdrop: backdropUrl(raw.backdrop_path),
    description: raw.overview || "No description available.",
    popularity: raw.popularity,
    voteCount: raw.vote_count,
    mediaType: "tv",
  };
}

// ── TV Public API ────────────────────────────────────────────

/** Trending TV shows this week */
export async function fetchTrendingTV(page = 1) {
  const data = await tmdbFetch("/trending/tv/week", { page });
  return data.results.map(shapeTVShow);
}

/** Popular TV shows */
export async function fetchPopularTV(page = 1) {
  const data = await tmdbFetch("/tv/popular", { page });
  return data.results.map(shapeTVShow);
}

/** Discover TV shows — supports genre filter AND sort_by */
export async function fetchDiscoverTV({
  genreId = null,
  sortBy = "popularity.desc",
  page = 1,
} = {}) {
  const params = { sort_by: sortBy, page, include_adult: false };
  if (genreId) params.with_genres = genreId;
  if (sortBy === "vote_average.desc") params["vote_count.gte"] = 100;
  const data = await tmdbFetch("/discover/tv", params);
  return { results: data.results.map(shapeTVShow), totalPages: data.total_pages };
}

/** Search TV shows */
export async function searchTV(query, page = 1) {
  if (!query.trim()) return { results: [], totalPages: 0 };
  const data = await tmdbFetch("/search/tv", { query, page, include_adult: false });
  return { results: data.results.map(shapeTVShow), totalPages: data.total_pages };
}

/** Search both movies and TV shows */
export async function searchMulti(query, page = 1) {
  if (!query.trim()) return { results: [], totalPages: 0, totalResults: 0 };
  const data = await tmdbFetch("/search/multi", { query, page, include_adult: false });
  const results = (data.results || [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => (item.media_type === "tv" ? shapeTVShow(item) : shapeMovie(item)));
  return { results, totalPages: data.total_pages, totalResults: data.total_results || results.length };
}

/** Full TV show details (includes genres, seasons overview, credits, videos) */
export async function fetchTVDetail(tmdbId) {
  const data = await tmdbFetch(`/tv/${tmdbId}`, { append_to_response: "credits,videos" });

  const shaped = shapeTVShow(data);

  // Cast
  const cast = (data.credits?.cast || []).slice(0, 10).map((c) => ({
    name: c.name,
    role: c.character,
    avatar: posterUrl(c.profile_path, "w185"),
    profileId: c.id,
  }));

  // Creator(s)
  const creators = (data.created_by || []).map((c) => c.name);

  // Trailer from TMDB videos
  const trailer = (data.videos?.results || []).find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const trailerKey = trailer?.key || null;

  // Seasons (filter out "Specials" season 0 unless it's the only one)
  const seasons = (data.seasons || [])
    .filter((s) => s.season_number > 0 || data.seasons.length === 1)
    .map((s) => ({
      id: s.id,
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      poster: posterUrl(s.poster_path),
      overview: s.overview || "",
    }));

  return {
    ...shaped,
    fullDescription: data.overview || shaped.description,
    tagline: data.tagline || null,
    creators,
    status: data.status || null,
    totalSeasons: data.number_of_seasons || 0,
    totalEpisodes: data.number_of_episodes || 0,
    firstAirDate: data.first_air_date || null,
    lastAirDate: data.last_air_date || null,
    episodeRuntime: data.episode_run_time?.[0] || null,
    trailerKey,
    cast,
    seasons,
    genreLabels: (data.genres || []).map((g) => g.name),
    networks: (data.networks || []).map((n) => n.name),
  };
}

/** Fetch episodes for a specific season */
export async function fetchTVSeason(tmdbId, seasonNumber) {
  const data = await tmdbFetch(`/tv/${tmdbId}/season/${seasonNumber}`);
  return {
    id: data.id,
    seasonNumber: data.season_number,
    name: data.name,
    overview: data.overview || "",
    airDate: data.air_date,
    episodes: (data.episodes || []).map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || "",
      airDate: ep.air_date,
      runtime: ep.runtime,
      still: ep.still_path ? posterUrl(ep.still_path, "w300") : null,
      rating: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : 0,
    })),
  };
}

/** Related TV shows (recommendations) */
export async function fetchTVRecommendations(tmdbId) {
  const data = await tmdbFetch(`/tv/${tmdbId}/recommendations`);
  return data.results.slice(0, 12).map(shapeTVShow);
}

/** Streaming provider servers — TV Shows */
export const TV_STREAM_SERVERS = [
  {
    id: "multiembed",
    name: "MultiEmbed",
    badge: "Multi",
    url: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },

  {
    id: "embedwave",
    name: "EmbedWave",
    badge: "HQ",
    url: (id, s, e) => `https://embedwave.cc/embed/tv/${id}/${s}/${e}`,
  },

  {
    id: "cinesrc",
    name: "CineSrc",
    badge: "Free",
    url: (id, s, e) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}`,
  },
];

/** Default TV embed URL */
export const vidSrcTVUrl = (tmdbId, season, episode) =>
  `https://embedwave.cc/embed/tv/${tmdbId}/${season}/${episode}`;
