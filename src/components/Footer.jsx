import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',            to: '/' },
  { label: 'Full Collection', to: '/collection' },
  { label: 'Rings',           to: '/collection?category=Rings' },
  { label: 'Necklaces',       to: '/collection?category=Necklaces' },
  { label: 'Earrings',        to: '/collection?category=Earrings' },
  { label: 'Bracelets',       to: '/collection?category=Bracelets' },
  { label: 'Bangles',         to: '/collection?category=Bangles' },
];

export default function Footer() {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  const wa    = () => {
    const msg = encodeURIComponent('Hello! I would like to know more about Shri Swastik Jewellery.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <footer className="bg-[#fafafa]">

      {/* CTA band */}
      <div className="border-t border-black/5 py-28">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 text-center">
          <p className="text-[#A8751E]/60 text-[10px] tracking-[.55em] mb-6">GET IN TOUCH</p>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl text-black italic leading-snug mb-6">
            Ready to Own Your Dream Jewel?
          </h2>
          <p className="text-black/40 text-sm leading-relaxed max-w-xs mx-auto mb-10">
            Reach us on WhatsApp for personalised assistance, custom orders, and pricing.
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={wa}
            className="whatsapp-pulse inline-flex items-center gap-3 px-8 py-4
                       bg-[#25D366] text-white text-[11px] tracking-[.2em] uppercase font-semibold rounded-full">
            <MessageCircle size={17} />
            Chat on WhatsApp
          </motion.button>
        </div>
      </div>

      {/* gold rule */}
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
        <div className="h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(201,168,76,.25),transparent)' }} />
      </div>

      {/* columns */}
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 pt-20 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-14 sm:gap-10 lg:gap-20 mb-16">

          {/* brand */}
          <div>
            <p className="font-['Cormorant_Garamond',serif] text-3xl text-black tracking-widest mb-1">SHRI SWASTIK</p>
            <p className="text-[#A8751E]/60 text-[8px] tracking-[.45em] mb-8">LUXURY JEWELLERY · EST. 2026</p>
            <p className="text-black/50 text-[13px] leading-[1.85]">
              A new chapter in fine jewellery, crafted with timeless artistry
              and an eye for the extraordinary. Every piece is a masterwork of
              tradition, elegance, and enduring beauty.
            </p>
          </div>

          {/* links */}
          <div>
            <p className="text-[#A8751E]/60 text-[10px] tracking-[.4em] mb-8">EXPLORE</p>
            <ul className="space-y-4">
              {NAV_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>
                    <span className="text-black/50 hover:text-[#A8751E] transition-colors duration-300 text-xs tracking-wider">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* promise + wa */}
          <div className="flex flex-col gap-12">
            <div>
              <p className="text-[#A8751E]/60 text-[10px] tracking-[.4em] mb-8">OUR PROMISE</p>
              <p className="font-['Cormorant_Garamond',serif] text-2xl text-black/60 italic leading-snug mb-6">
                "Every jewel is a legacy.<br />Every moment, timeless."
              </p>
              <div className="h-px w-10" style={{ background: 'rgba(201,168,76,.35)' }} />
            </div>
            <div>
              <p className="text-black/30 text-[9px] tracking-[.3em] mb-4">DIRECT ORDER</p>
              <button onClick={wa}
                className="flex items-center gap-2 text-[#A8751E]/60 hover:text-[#A8751E] text-xs tracking-wider transition-colors">
                <MessageCircle size={13} /> Chat on WhatsApp
              </button>
            </div>
          </div>

        </div>

        {/* bottom bar */}
        <div className="border-t border-black/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-black/30 text-[10px] tracking-[.25em]">© 2026 SHRI SWASTIK. ALL RIGHTS RESERVED.</p>
          <p className="font-['Cormorant_Garamond',serif] italic text-black/30 text-[10px] tracking-widest">
            Crafted with love, worn with pride.
          </p>
        </div>
      </div>
    </footer>
  );
}