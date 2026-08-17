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
  return data.results.slice(0, 8).map(shapeMovie);
}

/** Streaming provider servers */
export const STREAM_SERVERS = [
  { id: "vidsrc_me", name: "VidSrc Pro", badge: "HQ", url: (id) => `https://vidsrc.me/embed/movie/${id}` },
  { id: "vidsrc_sbs", name: "VidSrc Primary", badge: "Fast", url: (id) => `https://vidsrc.sbs/embed/movie/${id}` },
  { id: "vidsrc_cc", name: "VidSrc Fast", badge: "HD", url: (id) => `https://vidsrc.cc/v2/embed/movie/${id}` },
  { id: "embed_su", name: "SuperEmbed", badge: "4K", url: (id) => `https://embed.su/embed/movie/${id}` },
  { id: "embed_2", name: "2Embed", badge: "Alt", url: (id) => `https://www.2embed.cc/embed/${id}` },
];

/** VidSrc embed URL for a movie (default) */
export const vidSrcMovieUrl = (tmdbId) =>
  `https://vidsrc.sbs/embed/movie/${tmdbId}`;

