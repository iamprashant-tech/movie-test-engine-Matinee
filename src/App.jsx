import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import KeyDialog from './components/KeyDialog.jsx';
import Home from './pages/Home.jsx';
import Detail from './pages/Detail.jsx';
import ForYou from './pages/ForYou.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Taste from './pages/Taste.jsx';
import Compare from './pages/Compare.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:source/:id" element={<Detail />} />
          <Route path="/for-you" element={<ForYou />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/taste" element={<Taste />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <KeyDialog />
    </>
  );
}
