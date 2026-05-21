import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Collection', to: '/collection' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/85 backdrop-blur-xl py-3 border-b border-white/5' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="group">
            <div className="flex flex-col leading-none">
              <span className="font-display text-white text-xl md:text-2xl tracking-[0.2em] group-hover:text-gold transition-colors duration-300">
                SHRI SWASTIK
              </span>
              <span className="text-[8px] tracking-[0.5em] text-gold/60 mt-0.5">LUXURY JEWELLERY</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map(({ label, to }) => (
              <Link key={label} to={to}>
                <span
                  className={`relative text-[11px] tracking-[0.3em] uppercase transition-colors duration-300 group ${
                    pathname === to ? 'text-gold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </div>

          <button
            className="md:hidden text-white p-1"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10"
          >
            {links.map(({ label, to }, i) => (
              <motion.div
                key={label}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={to} onClick={() => setOpen(false)}>
                  <span className="font-display text-5xl text-white hover:text-gold transition-colors duration-300 italic">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-10 text-gray-600 text-[10px] tracking-[0.5em]"
            >
              SHRI SWASTIK © 2024
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
