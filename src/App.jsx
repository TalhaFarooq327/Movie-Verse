import { BrowserRouter, Routes, Route, ScrollRestoration } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import TVShows from "./pages/TVShows";
import TVDetail from "./pages/TVDetail";
import Search from "./pages/Search";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/tv/:id" element={<TVDetail />} />
          <Route path="/search" element={<Search />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
