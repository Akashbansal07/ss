import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Diamond, Star, ShieldCheck } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import JewelCard from '../components/JewelCard';

/* ────────────────────────────────────────────────
   Jewellery SVG icons (inline, no emoji)
──────────────────────────────────────────────── */
const RingIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <circle cx="20" cy="20" r="12"/>
    <circle cx="20" cy="20" r="6"/>
    <path d="M14 16 Q20 9 26 16" strokeLinecap="round"/>
  </svg>
);
const NecklaceIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <path d="M8 10 Q8 30 20 33 Q32 30 32 10" strokeLinecap="round"/>
    <circle cx="20" cy="33" r="3"/>
    <path d="M12 13 Q20 19 28 13" strokeLinecap="round"/>
  </svg>
);
const EarringIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <path d="M17 8 Q13 8 13 12" strokeLinecap="round"/>
    <path d="M13 12 L13 24 Q13 31 18 31 Q23 31 23 24 L23 12" strokeLinecap="round"/>
    <circle cx="18" cy="33" r="2.5"/>
  </svg>
);
const BraceletIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <ellipse cx="20" cy="18" rx="13" ry="8"/>
    <ellipse cx="20" cy="22" rx="13" ry="8"/>
    <circle cx="20" cy="10" r="2" fill="currentColor" stroke="none"/>
  </svg>
);
const PendantIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <path d="M17 6 Q17 3 20 3 Q23 3 23 6" strokeLinecap="round"/>
    <path d="M20 6 L26 17 L20 33 L14 17 Z"/>
    <circle cx="20" cy="19" r="2.5" fill="currentColor" stroke="none"/>
  </svg>
);
const BangleIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8">
    <circle cx="20" cy="20" r="14"/>
    <circle cx="20" cy="20" r="9"/>
    <circle cx="20" cy="6" r="2"  fill="currentColor" stroke="none"/>
    <circle cx="20" cy="34" r="2" fill="currentColor" stroke="none"/>
  </svg>
);

const CATEGORIES = [
  { name: 'Rings',     Icon: RingIcon,     slug: 'Rings' },
  { name: 'Necklaces', Icon: NecklaceIcon, slug: 'Necklaces' },
  { name: 'Earrings',  Icon: EarringIcon,  slug: 'Earrings' },
  { name: 'Bracelets', Icon: BraceletIcon, slug: 'Bracelets' },
  { name: 'Pendants',  Icon: PendantIcon,  slug: 'Pendants' },
  { name: 'Bangles',   Icon: BangleIcon,   slug: 'Bangles' },
];

const PROMISES = [
  { Icon: Diamond,     title: 'Certified Authentic', desc: 'Every piece carries a certificate of authenticity, ensuring the finest materials and genuine craftsmanship.' },
  { Icon: Star,        title: 'Master Craftsmanship', desc: 'Our artisan legacy shapes each jewel, creating pieces that transcend generations and endure beyond trends.' },
  { Icon: ShieldCheck, title: 'Lifetime Care',        desc: 'Complimentary cleaning, polishing, and servicing for every piece — because your jewel deserves to shine forever.' },
];

const STATS = [
  { value: 'New',  label: 'Fresh Beginnings' },
  { value: '100%', label: 'Certified Authentic' },
  { value: '5 ★',  label: 'Customer Rated' },
  { value: '∞',    label: 'Timeless Elegance' },
];

const MARQUEE_ITEMS = 'RINGS  ✦  NECKLACES  ✦  EARRINGS  ✦  BRACELETS  ✦  PENDANTS  ✦  BANGLES  ✦  ANKLETS  ✦  SETS  ✦  ';

export default function Home() {
  const heroRef    = useRef(null);
  const [featured, setFeatured] = useState([]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  /* tiny gold particles */
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i, size: Math.random() * 2 + 1,
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      duration: `${Math.random() * 8 + 12}s`, delay: `${Math.random() * 5}s`,
    })), []
  );

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'), limit(4)));
        setFeatured(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setFeatured([]); }
    })();
  }, []);

  /* GSAP hero char animation */
  useEffect(() => {
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo('.hero-char',
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, stagger: 0.045, ease: 'power4.out', delay: 0.3 }
        );
        document.querySelectorAll('.scroll-reveal').forEach(el => {
          gsap.fromTo(el, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      });
    });
  }, []);

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-white"
      >
        {/* particles */}
        {particles.map(p => (
          <div key={p.id} className="particle bg-[#A8751E]"
            style={{ width: p.size+'px', height: p.size+'px', left: p.left, top: p.top,
              animationDuration: p.duration, animationDelay: p.delay, opacity: .12 }} />
        ))}
        {/* soft glow */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 55%, rgba(168,117,30,0.07), transparent)' }} />

        {/* hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-8 w-full">

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-[#A8751E]/60 text-[10px] tracking-[.7em] mb-10">
            EST. 2026 &nbsp;✦&nbsp; HANDCRAFTED LUXURY
          </motion.p>

          {/* Title */}
          <div className="overflow-hidden mb-8 w-full flex justify-center">
            <h1
              className="font-['Cormorant_Garamond',serif] text-black leading-none whitespace-nowrap"
              style={{ fontSize: 'clamp(2.5rem, 9.5vw, 9rem)', letterSpacing: '0.04em' }}
            >
              {'SHRI SWASTIK'.split('').map((c, i) => (
                <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
            </h1>
          </div>

          {/* gold rule */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.9 }}
            className="h-px w-32 mb-8 origin-center"
            style={{ background: 'linear-gradient(to right, transparent, #A8751E, transparent)' }}
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            className="font-['Cormorant_Garamond',serif] italic text-black/50 text-xl md:text-2xl mb-12 tracking-wide">
            Where Every Jewel Tells a Story
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">

            <Link to="/collection">
              <button className="relative inline-flex items-center gap-2 px-10 py-4
                                 border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                                 overflow-hidden transition-colors duration-500 hover:text-white group">
                <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-2">Explore Collection <ArrowRight size={13} /></span>
              </button>
            </Link>

            <a href="#about"
              className="text-[10px] tracking-[.3em] text-black/40 hover:text-[#A8751E] uppercase
                         border-b border-black/20 hover:border-[#A8751E] pb-px transition-colors duration-300">
              Our Story
            </a>
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-14"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(168,117,30,.55), transparent)' }} />
          <p className="text-[8px] text-black/25 tracking-[.5em]">SCROLL</p>
        </motion.div>

        <p className="absolute left-7 top-1/2 -translate-y-1/2 text-[8px] text-black/8 tracking-[.3em] -rotate-90 hidden lg:block select-none">SHRI SWASTIK®</p>
        <p className="absolute right-7 top-1/2 -translate-y-1/2 text-[8px] text-black/8 tracking-[.3em] rotate-90 hidden lg:block select-none">EST. 2026</p>
      </section>


      {/* ═══════════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════════ */}
      <div className="border-y border-black/5 bg-[#fafafa] py-4 overflow-hidden">
        <div className="marquee-track inline-block">
          {[1,2,3,4].map(n => (
            <span key={n} className="font-['Cormorant_Garamond',serif] italic text-lg tracking-[.35em] text-black mr-0">
              {MARQUEE_ITEMS}
            </span>
          ))}
        </div>
      </div>


      {/* ═══════════════════════════════════════════
          FEATURED COLLECTION
      ═══════════════════════════════════════════ */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

          <div className="text-center mb-20 scroll-reveal">
            <p className="text-[#A8751E]/60 text-[10px] tracking-[.55em] mb-5">OUR FINEST PIECES</p>
            <h2 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl lg:text-7xl text-black mb-7">
              Crafted for <em>Eternity</em>
            </h2>
            <div className="w-10 h-px mx-auto" style={{ background: 'linear-gradient(to right,transparent,#A8751E,transparent)' }} />
          </div>

          {featured.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-black/5 gap-6">
              <div className="w-14 h-14 border border-[#A8751E]/30 flex items-center justify-center">
                <Diamond size={20} className="text-[#A8751E]/50" />
              </div>
              <p className="font-['Cormorant_Garamond',serif] text-2xl text-black italic">Collection Coming Soon</p>
              <p className="text-black/40 text-[10px] tracking-[.3em] uppercase">The owner is curating the finest pieces</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((j, i) => <JewelCard key={j.id} jewel={j} index={i} />)}
            </div>
          )}

          {featured.length > 0 && (
            <div className="flex justify-center mt-20 scroll-reveal">
              <Link to="/collection">
                <button className="relative inline-flex items-center gap-2 px-10 py-4
                                   border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                                   overflow-hidden hover:text-white group transition-colors duration-500">
                  <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-2">View Full Collection <ArrowRight size={13} /></span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          ABOUT  (alternate bg)
      ═══════════════════════════════════════════ */}
      <section id="about" className="bg-[#fafafa] py-32">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

          <div className="text-center mb-20 scroll-reveal">
            <p className="text-[#A8751E]/60 text-[10px] tracking-[.55em] mb-5">OUR STORY</p>
            <h2 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl lg:text-7xl text-black mb-7">
              Legacy of{' '}
              <em className="shimmer-text">Artistry</em>
            </h2>
            <div className="w-10 h-px mx-auto" style={{ background: 'linear-gradient(to right,transparent,#A8751E,transparent)' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-28 items-start">

            {/* left — paragraphs + CTA */}
            <div className="space-y-7 scroll-reveal">
              <p className="text-black text-base leading-[1.95]">
                Founded in 2026, Shri Swastik was born from a passion for timeless beauty and
                exceptional artisanship. We blend the rich heritage of traditional Indian jewellery-making
                with a contemporary vision — creating pieces that honour life's most precious moments.
              </p>
              <p className="text-black/50 text-base leading-[1.95]">
                Each jewel is shaped by our master artisans' relentless pursuit of perfection —
                using only the finest gold, silver, and gemstones sourced from around the world,
                every piece certified for authenticity and enduring beauty.
              </p>
              <div className="pt-3">
                <Link to="/collection">
                  <button className="relative inline-flex items-center gap-2 px-10 py-4
                                     border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                                     overflow-hidden hover:text-white group transition-colors duration-500">
                    <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-2">Discover Collection <ArrowRight size={13} /></span>
                  </button>
                </Link>
              </div>
            </div>

            {/* right — stats */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-12 scroll-reveal">
              {STATS.map(({ value, label }) => (
                <div key={label} className="border-t border-black/8 pt-8">
                  <p className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl text-[#A8751E] leading-none mb-3">
                    {value}
                  </p>
                  <p className="text-black/40 text-[10px] tracking-[.25em] uppercase">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          MARQUEE REVERSED
      ═══════════════════════════════════════════ */}
      <div className="border-y border-black/5 bg-[#f5f5f5] py-4 overflow-hidden">
        <div className="marquee-rev inline-block">
          {[1,2,3,4].map(n => (
            <span key={n} className="font-['Cormorant_Garamond',serif] italic text-lg tracking-[.35em] text-black">
              {MARQUEE_ITEMS}
            </span>
          ))}
        </div>
      </div>


      {/* ═══════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════ */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

          <div className="text-center mb-20 scroll-reveal">
            <p className="text-[#A8751E]/60 text-[10px] tracking-[.55em] mb-5">BROWSE</p>
            <h2 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl text-black mb-7">
              Shop by <em>Category</em>
            </h2>
            <div className="w-10 h-px mx-auto" style={{ background: 'linear-gradient(to right,transparent,#A8751E,transparent)' }} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, Icon, slug }, i) => (
              <Link key={slug} to={`/collection?category=${slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col items-center justify-center gap-5
                             py-11 px-4 border border-black/8
                             hover:border-[#A8751E]/50 transition-all duration-500 cursor-pointer bg-white"
                >
                  {/* corner accent lines */}
                  <span className="absolute top-0 left-0 h-px w-5 bg-[#A8751E] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                  <span className="absolute top-0 left-0 w-px h-5 bg-[#A8751E] scale-y-0 origin-top  group-hover:scale-y-100 transition-transform duration-500" />
                  <span className="absolute bottom-0 right-0 h-px w-5 bg-[#A8751E] scale-x-0 origin-right  group-hover:scale-x-100 transition-transform duration-500" />
                  <span className="absolute bottom-0 right-0 w-px h-5 bg-[#A8751E] scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500" />

                  <div className="text-black group-hover:text-[#A8751E] transition-colors duration-500">
                    <Icon />
                  </div>
                  <p className="text-black/40 text-[10px] tracking-[.3em] uppercase group-hover:text-[#A8751E] transition-colors duration-500 text-center">
                    {name}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════
          PROMISES  (alternate bg)
      ═══════════════════════════════════════════ */}
      <section className="bg-[#fafafa] py-32">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

          <div className="text-center mb-20 scroll-reveal">
            <p className="text-[#A8751E]/60 text-[10px] tracking-[.55em] mb-5">OUR PROMISE</p>
            <h2 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl text-black mb-7">
              The Shri Swastik <em>Difference</em>
            </h2>
            <div className="w-10 h-px mx-auto" style={{ background: 'linear-gradient(to right,transparent,#A8751E,transparent)' }} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROMISES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="group relative border border-black/8 px-10 py-14 bg-white
                           hover:border-[#A8751E]/35 transition-all duration-500"
              >
                <span className="absolute top-0 left-0 h-px w-10 bg-[#A8751E] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />

                <div className="mb-8">
                  <Icon size={20} className="text-black group-hover:text-[#A8751E] transition-colors duration-500" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-black mb-4">{title}</h3>
                <div className="w-7 h-px bg-black/8 mb-5 group-hover:bg-[#A8751E]/50 transition-colors duration-500" />
                <p className="text-black/50 text-sm leading-[1.85]">{desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}