# 🎬 MovieVerse

**MovieVerse** is a modern, high-performance web application built with **React**, **Vite**, and **React Router**. It offers a premium streaming experience for exploring trending movies, searching by title or genre, viewing rich movie details (ratings, overview, budget, revenue, cast, recommendations), watching trailers, and streaming movies directly in a custom HD player.

---

## ✨ Features

- 🌟 **Trending & Featured Banner**: Auto-cycling hero banner featuring top-rated and trending movies.
- 🎯 **Genre Filter**: Easily discover movies across Action, Comedy, Horror, Sci-Fi, Drama, Romance, and more.
- 🔍 **Instant Search**: Real-time keyword search with instant navigation to results.
- 📽️ **HD Streaming Player Modal**:
  - Embedded multi-server streaming video player (`VidSrc`, `SuperEmbed`, `2Embed`, `AutoEmbed`).
  - Dedicated **Player Navbar** with back navigation (`← Back`), brand logo shortcut, search bar, and genre quick-links.
  - **Cinema Mode (Lights Off)** for an immersive dark viewing experience.
  - **Player Reload** & automatic server switching.
- 📱 **Mobile Responsive Navigation**:
  - Full-screen glassmorphic mobile menu overlay.
  - Locked background scrolling when menu is open.
  - Clean top bar layout with logo on the left and hamburger on the right.
- 🎨 **Modern Aesthetic**: Rich dark theme built with Vanilla CSS, glassmorphic card overlays, skeleton loading states, and micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: Vanilla CSS (Custom Design System, Flexbox/Grid, Glassmorphism)
- **API Integration**: [TMDB (The Movie Database) API](https://www.themoviedb.org/documentation/api)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

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
   Create a `.env` file in the root directory (or use `.env`):
   ```env
   VITE_TMDB_TOKEN=your_tmdb_read_access_token
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

6. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 📂 Project Structure

```text
MovieVerse/
├── public/              # Static assets
├── src/
│   ├── api/             # TMDB API service & server configuration
│   ├── assets/          # Images and media
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx / Navbar.css       # Main header navigation
│   │   ├── Footer.jsx / Footer.css       # Page footer
│   │   ├── MovieCard.jsx / MovieCard.css # Movie poster cards
│   │   ├── HeroBanner.jsx                # Dynamic hero section
│   │   ├── GenreFilter.jsx               # Genre category pills
│   │   └── SkeletonCard.jsx              # Shimmer loading placeholders
│   ├── pages/           # Application views
│   │   ├── Home.jsx / Home.css           # Landing & trending page
│   │   ├── Movies.jsx / Movies.css       # Browse & search results page
│   │   └── MovieDetail.jsx / CSS         # Details & video streaming player
│   ├── App.jsx          # Route definitions
│   └── index.css        # Global CSS design tokens
├── package.json
└── README.md
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
