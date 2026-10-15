# MovieVerse — Project Context

> **AI Agent Reference File** — Keep this file updated whenever new features, files, or structural changes are made.
> Last Updated: 2026-10-15

---

## 🗂️ Overview

**MovieVerse** is a modern movie and TV series discovery and streaming web application built with **React 19 + Vite 8**. Users can browse trending films and TV shows, filter by genre, search by title, view rich detail pages with cast, trailers, and seasons/episodes, and stream content via an embedded multi-server HD player.

- **Repo**: [TalhaFarooq327/Movie-Verse](https://github.com/TalhaFarooq327/Movie-Verse)
- **Root Path**: `/Users/talhafarooq/Desktop/Web/MovieVerse`
- **Dev Server**: `npm run dev` (runs on `http://localhost:5173` or `http://localhost:5174`)
- **Build**: `npx vite build --emptyOutDir` / `npm run build`
- **Styling Philosophy**: Vanilla CSS only (curated dark mode, glassmorphism, smooth animations; no Tailwind).

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19 (JSX) | Functional components with hooks |
| Build Tool | Vite 8 | Fast HMR, ESM bundling |
| Routing | React Router 7 | `BrowserRouter`, `Routes`, `Route`, `useSearchParams`, `useNavigate` |
| Styling | Vanilla CSS | Design tokens in `src/index.css`, component-scoped stylesheets |
| API | TMDB REST API v3 | `https://api.themoviedb.org/3`, Bearer token authentication |
| Typography | Google Fonts | `Inter` (body, 300–800) + `Bebas Neue` (display headings) |
| Package Manager | npm | Node.js environment |

---

## 📁 Complete Project File Structure

```
MovieVerse/
├── index.html                   # HTML entry point with SEO meta tags & Google fonts
├── package.json                 # Dependencies (react, react-dom, react-router-dom)
├── tsconfig.json                # TypeScript configuration
├── .env                         # VITE_TMDB_TOKEN & VITE_TMDB_API_KEY (gitignored)
├── context.md                   # This master agent context file
├── README.md                    # Project readme
├── public/                      # Static assets
├── dist/                        # Production build output
└── src/
    ├── main.jsx                 # React DOM mount (<App />)
    ├── App.jsx                  # Top-level shell with Navbar, Footer, and all Routes
    ├── index.css                # Global design system (color tokens, typography, utilities)
    ├── api/
    │   └── tmdb.js              # All TMDB API calls, data normalizers, streaming servers
    ├── components/
    │   ├── Navbar.jsx / .css    # Top nav bar with search, desktop links, mobile overlay
    │   ├── Footer.jsx / .css    # Global footer with branding and links
    │   ├── HeroBanner.jsx / .css# Dynamic hero featured banner on Home page
    │   ├── MovieCard.jsx / .css # Unified poster card (supports both movies & TV with badge)
    │   ├── GenreFilter.jsx /.css# Reusable horizontal genre pill tab bar
    │   ├── SearchBar.jsx / .css # Reusable search input component
    │   └── SkeletonCard.jsx/.css# Shimmer loading skeleton cards & SkeletonGrid export
    ├── data/
    │   └── movies.js            # Offline/fallback mock data for movies
    └── pages/
        ├── Home.jsx / .css      # Landing page: Hero, Trending Movies, Genres, Trending TV, Stats
        ├── Movies.jsx / .css    # Movie catalog with search, genre pills, sort, load-more
        ├── MovieDetail.jsx/.css # Movie details, cast, trailer, 12 recommendations, inline player
        ├── TVShows.jsx / .css   # TV catalog with search, TV genre pills, sort, load-more
        ├── TVDetail.jsx / .css  # TV details, season tabs, episode list, inline player with episode navigation
        └── Search.jsx / .css    # Universal search results for both Movies and TV Shows
```

---

## 🔀 Routes & Navigation

Defined in `src/App.jsx`. `Navbar` and `Footer` wrap every route as persistent layout shells.

| Path | Component | Key Query Params / Props | Description |
|---|---|---|---|
| `/` | `Home` | — | Landing page with Hero, Trending Movies, Trending TV Shows, Stats |
| `/movies` | `Movies` | `?genre=X`, `?search=X` | Movie catalog, filterable and searchable with pagination |
| `/movie/:id` | `MovieDetail` | `location.state.autoPlay` | Movie details + recommendations (12) + inline stream player |
| `/tv-shows` | `TVShows` | `?genre=X`, `?search=X` | TV Series catalog, filterable and searchable with pagination |
| `/tv/:id` | `TVDetail` | — | TV Series details + seasons/episodes + recommendations (12) + inline player |
| `/search` | `Search` | `?q=X`, `?type=all\|movie\|tv` | Universal search across movies and TV series with type tabs and sort |
| `*` | `Home` | — | Catch-all redirect to Home |

---

## 🌐 API Layer — `src/api/tmdb.js`

All network communication with TMDB is encapsulated in `src/api/tmdb.js`. **Never call TMDB directly from components.**

### Environment Variables
```env
VITE_TMDB_TOKEN=<TMDB v4 Bearer Token>   # Used for Authorization: Bearer <TOKEN>
VITE_TMDB_API_KEY=<TMDB v3 API Key>       # Optional fallback
```

### Movie Functions
- `fetchTrending(page = 1)` → Weekly trending movies shaped via `shapeMovie`.
- `fetchPopular(page = 1)` → Popular movies.
- `fetchDiscover({ genreId, sortBy, page })` → Movies filtered by genre and sort order.
- `fetchByGenre(genreId, page)` → Alias to `fetchDiscover`.
- `searchMovies(query, page = 1)` → Keyword search for movies.
- `fetchMovieDetail(tmdbId)` → Detailed movie record + cast (top 10) + trailer key + full genre names.
- `fetchRecommendations(tmdbId)` → Up to **12** recommended movies.

### TV Show Functions
- `fetchTrendingTV(page = 1)` → Weekly trending TV series shaped via `shapeTVShow`.
- `fetchPopularTV(page = 1)` → Popular TV series.
- `fetchDiscoverTV({ genreId, sortBy, page })` → TV series filtered by TV genre and sort order.
- `searchTV(query, page = 1)` → Keyword search for TV series.
- `searchMulti(query, page = 1)` → Keyword search across **both** movies and TV series (filters out person results and shapes appropriately).
- `fetchTVDetail(tmdbId)` → Full TV series record with seasons array, creators, networks, cast, trailer.
- `fetchTVSeason(tmdbId, seasonNumber)` → Episodes for a specific season with still thumbnails, air dates, runtimes, ratings, overviews.
- `fetchTVRecommendations(tmdbId)` → Up to **12** recommended TV shows.

### Streaming Providers Configuration

#### Movies (`STREAM_SERVERS`)
```javascript
export const STREAM_SERVERS = [
  { id: "embedwave",  name: "EmbedWave",  badge: "HQ",    url: (id) => `https://embedwave.cc/embed/movie/${id}` },
  { id: "cinesrc",    name: "CineSrc",    badge: "Free",  url: (id) => `https://cinesrc.st/embed/movie/${id}` },
  { id: "multiembed", name: "MultiEmbed", badge: "Multi", url: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
];
```

#### TV Shows (`TV_STREAM_SERVERS`)
```javascript
export const TV_STREAM_SERVERS = [
  { id: "embedwave",  name: "EmbedWave",  badge: "HQ",    url: (id, s, e) => `https://embedwave.cc/embed/tv/${id}/${s}/${e}` },
  { id: "multiembed", name: "MultiEmbed", badge: "Multi", url: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { id: "cinesrc",    name: "CineSrc",    badge: "Free",  url: (id, s, e) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}` },
];
```

### Data Normalizers & Shapes

#### Normalized Movie (`shapeMovie`):
```typescript
{
  id: number,
  title: string,
  genre: string,          // Primary genre name
  genreIds: number[],
  rating: number,         // Rounded to 1 decimal place (out of 10)
  year: string,           // YYYY
  duration: string,       // e.g. "124m"
  poster: string,         // Full image URL
  backdrop: string,       // Full image URL
  description: string,
  popularity: number,
  voteCount: number,
  mediaType: "movie"
}
```

#### Normalized TV Show (`shapeTVShow`):
```typescript
{
  id: number,
  title: string,          // Maps from raw.name
  genre: string,
  genreIds: number[],
  rating: number,
  year: string,           // From first_air_date
  poster: string,
  backdrop: string,
  description: string,
  popularity: number,
  voteCount: number,
  mediaType: "tv"
}
```

#### TV Detail Additional Fields (`fetchTVDetail`):
```typescript
{
  creators: string[],
  networks: string[],
  totalSeasons: number,
  totalEpisodes: number,
  firstAirDate: string,
  lastAirDate: string,
  episodeRuntime: number,
  status: string,         // e.g. "Returning Series", "Ended"
  seasons: Array<{
    id: number,
    seasonNumber: number,
    name: string,
    episodeCount: number,
    poster: string,
    overview: string
  }>,
  cast: Array<{ name: string, role: string, avatar: string, profileId: number }>,
  genreLabels: string[],
  trailerKey: string | null
}
```

---

## 🧩 Component Details

### `Navbar` (`src/components/Navbar.jsx`)
- Fixed top navigation with backdrop blur upon scrolling (`window.scrollY > 60` triggers `.scrolled`).
- Navigation links (desktop & mobile): **Home**, **Movies**, **TV Shows**.
- **Universal Search**:
  - Live preview dropdown appears as user types (≥2 chars, debounced), showing top 6 movie and TV show matches with badges, ratings, and posters.
  - Clicking a result routes directly to `/movie/:id` or `/tv/:id`.
  - Pressing `Enter`, clicking the search button, or clicking "View all results" navigates to `/search?q=<query>` across both movies and TV shows.
- Mobile drawer overlay handles smaller viewports; locks body scroll when opened.

### `MovieCard` (`src/components/MovieCard.jsx`)
- Universal card component used across Home, Movies, TVShows, and Recommendations grids.
- Automatically handles routing based on `movie.mediaType`:
  - `mediaType === "tv"` → links to `/tv/:id` and displays a purple **TV** badge.
  - `mediaType === "movie"` → links to `/movie/:id`.
- Lazy-loads posters with fallback error placeholder.
- Interactive hover overlay with play button and synopsis.

### `HeroBanner` (`src/components/HeroBanner.jsx`)
- Used on the Home page.
- Displays high-resolution backdrop, movie title, rating, year, duration, overview.
- Buttons: "Watch Now" (navigates to `/movie/:id` with `state: { autoPlay: true }`) and "More Info".

### `GenreFilter` (`src/components/GenreFilter.jsx`)
- Horizontal pill list for filtering genres.
- Props:
  - `activeGenre`: string
  - `onGenreChange`: (genre: string) => void
  - `genres`: optional array (defaults to `UI_GENRES`)

### `SearchBar` (`src/components/SearchBar.jsx`)
- Controlled input component used on catalog pages.
- Props: `value`, `onChange`, `placeholder`.

### `SkeletonCard` (`src/components/SkeletonCard.jsx`)
- Exports `SkeletonCard` and named export `SkeletonGrid({ count = 8 })`.
- Shimmer loading state placeholder for movie/show grids.

---

## 📄 Pages Architecture

### 1. `Home` (`src/pages/Home.jsx`)
- **Sections**:
  1. `HeroBanner`: Featured movie.
  2. `Trending Movies`: Weekly trending grid.
  3. `Trending TV Shows`: Weekly trending TV series grid with purple accent badge and "View All TV Shows" link.
  4. `Stats Section`: 500K+ movies & shows, 4K streaming quality, etc.

### 2. `Movies` (`src/pages/Movies.jsx`)
- URL-driven state using `useSearchParams` (`?genre=` and `?search=`).
- 400ms search input debounce.
- Sort dropdown: Most Popular, Top Rated, Newest First, Oldest First.
- "Load More" pagination button.

### 3. `TVShows` (`src/pages/TVShows.jsx`)
- Dedicated TV series browse and search page.
- Uses `UI_TV_GENRES` (Action & Adventure, Comedy, Crime, Drama, Sci-Fi & Fantasy, Animation).
- Sort options: Most Popular, Top Rated, Newest First, Oldest First.
- URL-driven filtering (`/tv-shows?genre=X&search=Y`).
- "Load More" pagination.

### 4. `MovieDetail` (`src/pages/MovieDetail.jsx`)
- Fetches movie details and 12 recommended movies.
- **Inline Video Player**:
  - Mounted directly at the top of the detail page when "Watch Now" is clicked.
  - Smoothly scrolls to the top (`window.scrollTo({ top: 0, behavior: "smooth" })`).
  - Features: Cinema Mode (dims rest of the page), Reload Player button, Server selector pills (`STREAM_SERVERS`), Close button.
  - Closes on `Escape` key.
- Displays poster, star rating, meta pills (year, runtime, status), director, cast grid, trailer button, and recommendations grid.

### 5. `TVDetail` (`src/pages/TVDetail.jsx`)
- Fetches TV show details, active season episodes, and 12 recommended TV shows.
- **Season Tabs**:
  - Horizontal scrollable season buttons (S1, S2, etc.).
  - Switches `activeSeason` and fetches season episodes from TMDB.
- **Episode List**:
  - Episode cards with episode thumbnail, duration badge, episode number, air date, rating, title, synopsis, and "Watch" / "Playing" button.
  - Entire episode card is clickable with `cursor: pointer`.
- **Inline TV Video Player**:
  - Mounted at top of page with Server selector (`TV_STREAM_SERVERS`).
  - **Auto-scroll to top**: Selecting any episode (whether the player is closed or already open) calls `window.scrollTo({ top: 0, behavior: "smooth" })` and triggers `useEffect([playerOpen, playingSeason, playingEpisode])` to ensure the player is in full view.
  - **In-Player Navigation**: Displays currently playing episode title plus `⏮ Prev Ep` and `Next Ep ⏭` buttons right inside `.tv-now-playing` bar.
  - Closes on `Escape` key or close button.

### 6. `Search` (`src/pages/Search.jsx`)
- Universal multi-media search page reachable at `/search?q=<query>`.
- Searches across both Movies and TV Shows via TMDB's `/search/multi` endpoint.
- Features:
  - In-page debounced search input for live query refining.
  - Media type filter pills: **All**, **Movies**, **TV Shows**.
  - Sort selector: Most Popular, Top Rated, Newest First, Oldest First, A–Z.
  - Result count indicators and responsive grid using unified `MovieCard` (with TV badges).
  - "Load More" pagination appending next page results.
  - Helpful empty states for empty queries and zero-result searches.

---

## 🎨 Design System & CSS Rules

Defined in `src/index.css` and extended by component CSS files.

### Design Tokens
| CSS Variable | Value | Purpose |
|---|---|---|
| `--bg-primary` | `#0a0a0f` | Main page background |
| `--bg-surface` | `#13131a` | Elevated bars and headers |
| `--bg-card` | `#1c1c28` | Cards, modals, containers |
| `--bg-card-hover` | `#22223a` | Hover states |
| `--accent-red` | `#e50914` | Primary brand accent (Movies) |
| `--accent-gold` | `#f5c518` | Ratings and stars |
| `--text-primary` | `#ffffff` | Primary text |
| `--text-secondary` | `#a0a0b8` | Subtitles and meta tags |
| `--text-muted` | `#6b6b80` | Placeholders, inactive items |
| `--border` | `rgba(255,255,255,0.07)` | Borders and dividers |

### TV Series Styling Accent
- Purple color scheme: `#7c3aed`, `#a855f7`
- Classes: `.tv-badge-accent`, `.card-tv-badge`, `.accent-bar-purple`, `.tv-now-playing`, `.tv-ep-step-btn`, `.episode-card.playing`

### Layout & Sizing
- Container: `max-width: 1400px`, `padding: 0 24px`
- Border Radii: `--radius-sm: 8px`, `--radius-md: 14px`, `--radius-lg: 20px`, `--radius-xl: 28px`
- Transitions: `--transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`

---

## ⚡ Engineering Rules & Agent Guidelines

When developing or modifying MovieVerse:

1. **Do NOT install or use TailwindCSS** — Always write clean Vanilla CSS adhering to the design system in `src/index.css`.
2. **All TMDB API calls belong in `src/api/tmdb.js`** — Components should only import shaped functions (`fetchTrending`, `fetchTVSeason`, etc.).
3. **Keep `MovieCard` media-type aware** — When rendering grids with mixed or TV media, pass items shaped with `mediaType: "tv"` or `mediaType: "movie"` so links route correctly.
4. **Detail Page Players are Inline** — Both `MovieDetail` and `TVDetail` render players at the top of the page (not fullscreen popups/modals). Always ensure scrolling to top occurs on player open / episode change.
5. **Recommendations Count is 12** — Both `fetchRecommendations` and `fetchTVRecommendations` load 12 items (not 8).
6. **Unique Test IDs** — Maintain `id` attributes on buttons, links, inputs, and cards for automated testing and browser agent inspection.
7. **Production Build Validation** — Always verify changes compile using `npx vite build --emptyOutDir`.

---

## 🔄 Changelog

| Date | Summary of Changes |
|---|---|
| 2026-10-15 | Created comprehensive `context.md` reference file. |
| 2026-10-15 | Increased recommendations ("You May Also Like") from 8 to 12 in `fetchRecommendations` and `fetchTVRecommendations`. |
| 2026-10-15 | Added complete **TV Shows** feature: `TVShows` page, `TVDetail` page with seasons & episodes, and TV routes in `App.jsx`. |
| 2026-10-15 | Added TV API methods to `src/api/tmdb.js`: `fetchTrendingTV`, `fetchPopularTV`, `fetchDiscoverTV`, `searchTV`, `fetchTVDetail`, `fetchTVSeason`, `fetchTVRecommendations`, `TV_STREAM_SERVERS`. |
| 2026-10-15 | Updated `MovieCard` to support `mediaType: "tv"`, routing to `/tv/:id` and rendering a purple TV badge. |
| 2026-10-15 | Added "Trending TV Shows" section on Home page with purple theme accent. |
| 2026-10-15 | Updated streaming servers for Movies & TV with `embedwave`, `cinesrc`, and `multiembed`. |
| 2026-10-15 | Fixed TV episode selection scrolling: selecting any episode while player is already open now smoothly auto-scrolls to top; made entire episode card clickable; added in-player `Prev Ep` / `Next Ep` step buttons. |
| 2026-10-15 | Fully audited and updated `context.md` with complete project architecture, component specifications, API references, design tokens, and engineering rules. |
| 2026-10-15 | Removed "Browse by Genre" section and unused genre fetching state from Home page (`src/pages/Home.jsx`). |
| 2026-10-15 | Simplified Navbar navigation links to keep only **Home**, **Movies**, and **TV Shows** (removed individual genre links from desktop & mobile). |
| 2026-10-15 | Implemented Universal Search across both Movies and TV Shows: added `searchMulti` in `src/api/tmdb.js`, added dedicated `/search` page (`src/pages/Search.jsx`) with type filter tabs and sorting, and added live search preview dropdown in Navbar. |
| 2026-10-15 | Modernized Footer with TV Shows & Search links, dynamic year, and TV tagline; updated MovieCard poster fallback to self-contained SVG data URI; updated Home stats card to "3+ Streaming Servers". |
| 2026-10-15 | Added personalized author credit in Footer bottom: "Made with ❤️ by Talha Farooq for cinema & TV lovers" linking to LinkedIn profile (`https://www.linkedin.com/in/talha-farooq327/`). |
| 2026-10-15 | Cleaned up Footer: removed social icons (X, Instagram, YouTube) and third-party disclaimer line per user request, and centered the footer credit. |
| 2026-10-15 | Comprehensively overhauled `README.md` to document TV shows, season/episode player, live search dropdown, universal search page, updated tech stack badges, and author info. |
