import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'Collection', to: '/collection' },
  { label: 'About',      to: '/#about' },
  { label: 'Contact',    to: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const active = (to) => {
    if (to.includes('#')) return false;
    return to === '/' ? pathname === '/' : pathname.startsWith(to);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/92 backdrop-blur-xl border-b border-white/6 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 flex items-center justify-between">

          <Link to="/" className="group">
            <p className="font-['Cormorant_Garamond',serif] text-xl text-white tracking-[.18em] group-hover:text-[#C9A84C] transition-colors duration-300">
              SHRI SWASTIK
            </p>
            <p className="text-[7px] tracking-[.45em] text-[#C9A84C]/50 mt-0.5 hidden sm:block">LUXURY JEWELLERY</p>
          </Link>

          {/* desktop */}
          <div className="hidden md:flex items-center gap-10">
            {LINKS.map(({ label, to }) => (
              <Link key={label} to={to}>
                <span className={`relative text-[10px] tracking-[.3em] uppercase transition-colors duration-300 group
                  ${active(to) ? 'text-[#C9A84C]' : 'text-gray-300 hover:text-white'}`}>
                  {label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-[#C9A84C] transition-all duration-300
                    ${active(to) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </span>
              </Link>
            ))}
          </div>

          {/* mobile burger */}
          <button onClick={() => setOpen(v => !v)}
            className="md:hidden text-white p-2 -mr-2 z-[60] relative" aria-label="menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10">
            {LINKS.map(({ label, to }, i) => (
              <motion.div key={label}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ delay: i * 0.07 }}>
                <Link to={to} onClick={() => setOpen(false)}>
                  <span className="font-['Cormorant_Garamond',serif] text-5xl italic text-white hover:text-[#C9A84C] transition-colors duration-300">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
            <p className="absolute bottom-10 text-gray-700 text-[9px] tracking-[.4em]">SHRI SWASTIK © 2024</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}