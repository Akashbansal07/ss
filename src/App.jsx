import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Collection from './pages/Collection';
import JewelDetail from './pages/JewelDetail';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      <CustomCursor />
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          {!isAdmin && <Navbar />}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/jewelry/:id" element={<JewelDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          {!isAdmin && <Footer />}
        </>
      )}
    </>
  );
}
