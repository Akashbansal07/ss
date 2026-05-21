import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Clock, Phone } from 'lucide-react';

export default function Footer() {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;

  const openWhatsApp = () => {
    const msg = encodeURIComponent('Hello! I would like to know more about Shri Swastik Jewellery.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5">
      {/* CTA Strip */}
      <div className="py-16 px-6 bg-gradient-to-r from-black via-[#0d0a03] to-black border-b border-gold/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-[10px] tracking-[0.5em] mb-4">ORDER NOW</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 italic">
            Ready to Own Your Dream Jewel?
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Chat with us directly on WhatsApp for personalized assistance, pricing, and fast delivery.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={openWhatsApp}
            className="whatsapp-btn inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-black text-[11px] tracking-widest uppercase font-medium rounded-full"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </motion.button>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <p className="font-display text-3xl text-white tracking-widest">SHRI SWASTIK</p>
              <p className="text-gold/50 text-[9px] tracking-[0.5em] mt-1">LUXURY JEWELLERY</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Crafting timeless jewellery since 1974. Every piece is a masterwork of tradition,
              artistry, and enduring elegance. Trusted by generations.
            </p>
            <div className="divider-gold mt-8 ml-0 !mx-0" />
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] tracking-[0.4em] text-gold mb-6">EXPLORE</p>
            <ul className="space-y-4">
              {[
                { label: 'Home', to: '/' },
                { label: 'Collection', to: '/collection' },
                { label: 'Rings', to: '/collection?category=Rings' },
                { label: 'Necklaces', to: '/collection?category=Necklaces' },
                { label: 'Earrings', to: '/collection?category=Earrings' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>
                    <span className="text-gray-500 hover:text-gold transition-colors duration-300 text-xs tracking-wider">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.4em] text-gold mb-6">FIND US</p>
            <ul className="space-y-5">
              <li className="flex gap-3">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                <span className="text-gray-500 text-xs leading-relaxed">
                  123 Jewellery Market, Gold Bazaar,<br />Mumbai – 400001, Maharashtra
                </span>
              </li>
              <li className="flex gap-3">
                <Clock size={14} className="text-gold shrink-0 mt-0.5" />
                <span className="text-gray-500 text-xs leading-relaxed">
                  Mon – Sat: 10:00 AM – 8:00 PM<br />Sunday: 11:00 AM – 6:00 PM
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={14} className="text-gold shrink-0 mt-0.5" />
                <span className="text-gray-500 text-xs">+91 99999 99999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-[10px] tracking-widest">
            © 2024 SHRI SWASTIK. ALL RIGHTS RESERVED.
          </p>
          <p className="text-gray-700 text-[10px] tracking-widest italic font-display">
            Crafted with love, worn with pride.
          </p>
        </div>
      </div>
    </footer>
  );
}
