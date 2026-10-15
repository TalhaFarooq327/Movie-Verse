# 🎬 MovieVerse

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7-ca4245?style=flat-square&logo=react-router)](https://reactrouter.com/)
[![TMDB API](https://img.shields.io/badge/TMDB_API-v3-01b4e4?style=flat-square&logo=themoviedatabase)](https://www.themoviedb.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**MovieVerse** is a modern, high-performance web application for discovering and streaming movies and TV shows. Built with **React 19**, **Vite 8**, and **Vanilla CSS**, MovieVerse offers a cinematic, ad-free streaming experience with rich TMDB metadata, season/episode browsers, multi-server HD embeds, live universal search, and a curated dark-mode interface.

Developed with ❤️ by **[Talha Farooq](https://www.linkedin.com/in/talha-farooq327/)**.

---

## ✨ Key Features

### 🎥 Movies & TV Shows
- **Trending Highlights**: High-impact auto-cycling hero banner featuring weekly trending films and shows.
- **Dedicated Catalogs**:
  - **Movies** (`/movies`): Browse films with genre filtering, sorting (popularity, rating, release date, A–Z), and "Load More" pagination.
  - **TV Shows** (`/tv-shows`): Explore TV series with TV genre pills, multiple sort options, and infinite exploration.
- **Rich Detail Views**:
  - High-res backdrops, official trailers (YouTube embed), star ratings, runtime, release/air dates, networks/creators, and cast cards.
  - **12 Dynamic Recommendations** on every detail page ("You May Also Like").

### 📺 TV Seasons & Episode Player
- **Season Browser**: Seamlessly switch between seasons with interactive season tabs.
- **Episode List**: Episode cards complete with episode thumbnails, air dates, runtimes, ratings, synopsis, and "Watch" status indicators.
- **Instant Playback & Auto-Scroll**: Selecting any episode (whether the player is closed or already running) smoothly auto-scrolls the viewport directly to the top player.
- **In-Player Navigation**: Quick-step `⏮ Prev Ep` and `Next Ep ⏭` buttons right inside the player header so you can binge-watch without scrolling.

### ⚡ Inline Multi-Server Streaming Player
- **Embedded HD Player**: Inline video player at the top of detail pages with instant playback.
- **Multi-Server Switching**: Choose between fast, reliable HD embed servers (`EmbedWave`, `CineSrc`, `MultiEmbed`).
- **Cinema Mode (Lights Off)**: Dims the backdrop and page content below the player for an immersive theater-like experience.
- **Keyboard Shortcuts**: Dismiss the player instantly with `Escape`.

### 🔍 Universal Search & Live Dropdown
- **Live Search Preview**: Type 2+ characters in the navbar search input to get an instant live dropdown preview with top movie and TV matches, poster thumbnails, release years, and media type badges.
- **Universal Search Page** (`/search?q=...`):
  - Search across millions of movies and TV series simultaneously.
  - Filter results by **All**, **Movies Only**, or **TV Shows Only**.
  - Sort by popularity, rating, newest, oldest, or alphabetical order.

### 🎨 Design & Performance
- **Custom Design System**: Pure Vanilla CSS with CSS custom properties, glassmorphism, responsive grid layouts, and micro-animations (no Tailwind overhead).
- **Graceful Loading & Fallbacks**: Shimmer skeleton cards during async TMDB queries and self-contained SVG fallbacks for missing posters.
- **Mobile Responsive**: Smooth hamburger drawer menu with scroll locking and responsive grid layout across all screen sizes.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Functional components with modern hooks |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Lightning-fast HMR and optimized production bundle |
| **Routing** | [React Router 7](https://reactrouter.com/) | Client-side routing with URL search parameter state |
| **Styling** | Vanilla CSS | Custom tokens, dark mode, glassmorphism, keyframe animations |
| **API** | [TMDB REST API v3](https://developer.themoviedb.org/) | Comprehensive movie, TV, season, and multi-search data |
| **Fonts** | Google Fonts | `Inter` (UI typography) + `Bebas Neue` (display headings) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- A free **TMDB API Read Access Token** (from [The Movie Database](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TalhaFarooq327/Movie-Verse.git
   cd Movie-Verse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   VITE_TMDB_TOKEN=your_tmdb_v4_bearer_token_here
   VITE_TMDB_API_KEY=your_tmdb_v3_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or port indicated in terminal) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
MovieVerse/
├── index.html                   # HTML entry point with SEO meta tags & fonts
├── package.json                 # Dependencies & project scripts
├── context.md                   # Comprehensive AI agent architecture documentation
├── public/                      # Static assets
└── src/
    ├── main.jsx                 # Application DOM entry point
    ├── App.jsx                  # Route definitions (BrowserRouter shell)
    ├── index.css                # Global design system tokens and utilities
    ├── api/
    │   └── tmdb.js              # TMDB API client, data normalizers, stream servers
    ├── components/
    │   ├── Navbar.jsx / .css    # Navigation header with live multi-search dropdown
    │   ├── Footer.jsx / .css    # Footer with author credits and navigation links
    │   ├── MovieCard.jsx / .css # Media-type aware poster card (Movies & TV)
    │   ├── HeroBanner.jsx / .css# Dynamic hero showcase
    │   ├── GenreFilter.jsx /.css# Reusable horizontal genre filter tabs
    │   ├── SearchBar.jsx / .css # Controlled search input
    │   └── SkeletonCard.jsx/.css# Shimmer loading skeleton placeholders
    └── pages/
        ├── Home.jsx / .css      # Landing page: Hero, Trending Movies, Trending TV, Stats
        ├── Movies.jsx / .css    # Movies catalog with genre filtering, sort, and pagination
        ├── MovieDetail.jsx/.css # Movie details, cast, trailer, 12 recommendations, player
        ├── TVShows.jsx / .css   # TV Series catalog with TV genre filtering and sort
        ├── TVDetail.jsx / .css  # TV details, season tabs, episode list, player
        └── Search.jsx / .css    # Universal search results page with type filtering
```

---

## 🔀 Application Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Home` | Landing page featuring Trending Movies and Trending TV Shows |
| `/movies` | `Movies` | Full movie catalog with search, genre filters, and sort options |
| `/movie/:id` | `MovieDetail` | Movie details, trailer, cast, 12 recommendations, and inline player |
| `/tv-shows` | `TVShows` | TV shows catalog with search, TV genre filters, and sort options |
| `/tv/:id` | `TVDetail` | TV series details, seasons/episodes browser, and inline player |
| `/search` | `Search` | Universal search across both movies and TV series with type tabs |

---

## 👨‍💻 Author

**Talha Farooq**
- **LinkedIn**: [https://www.linkedin.com/in/talha-farooq327/](https://www.linkedin.com/in/talha-farooq327/)
- **GitHub**: [@TalhaFarooq327](https://github.com/TalhaFarooq327)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
