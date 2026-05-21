import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Diamond, Star, Shield } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import JewelCard from '../components/JewelCard';
import Marquee from '../components/Marquee';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CATEGORIES = [
  { name: 'Rings', emoji: '💍', slug: 'Rings' },
  { name: 'Necklaces', emoji: '📿', slug: 'Necklaces' },
  { name: 'Earrings', emoji: '✨', slug: 'Earrings' },
  { name: 'Bracelets', emoji: '⭕', slug: 'Bracelets' },
  { name: 'Pendants', emoji: '🔮', slug: 'Pendants' },
  { name: 'Bangles', emoji: '🔗', slug: 'Bangles' },
];

const PROMISES = [
  { Icon: Diamond, title: 'Certified Authentic', desc: 'Every piece comes with a certificate of authenticity, ensuring the finest materials and genuine craftsmanship.' },
  { Icon: Star, title: 'Master Craftsmanship', desc: 'Our artisans carry decades of legacy, crafting jewellery that transcends generations and trends.' },
  { Icon: Shield, title: 'Lifetime Care', desc: 'Complimentary lifetime cleaning, polishing, and maintenance for every piece purchased from Shri Swastik.' },
];

export default function Home() {
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const [featured, setFeatured] = useState([]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 12 + 12,
      delay: Math.random() * 6,
    })), []
  );

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'), limit(4));
        const snap = await getDocs(q);
        setFeatured(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setFeatured([]);
      }
    })();
  }, []);

  useGSAP(() => {
    gsap.fromTo('.hero-char',
      { y: 110, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.045, ease: 'power4.out', delay: 0.2 }
    );

    gsap.utils.toArray('.gs-reveal').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    gsap.utils.toArray('.gs-reveal-left').forEach(el => {
      gsap.fromTo(el,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });

    gsap.utils.toArray('.gs-reveal-right').forEach(el => {
      gsap.fromTo(el,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });
  }, { scope: sectionRef });

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black"
    >
      {/* ── HERO ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.left + '%',
              top: p.top + '%',
              animationDuration: p.duration + 's',
              animationDelay: p.delay + 's',
              opacity: 0.25,
            }}
          />
        ))}

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(201,168,76,0.06),transparent)]" />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 select-none"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-gold text-[10px] tracking-[0.7em] mb-8"
          >
            SINCE 1974 &nbsp;•&nbsp; HANDCRAFTED LUXURY
          </motion.p>

          <div className="overflow-hidden">
            <h1 className="font-display leading-none tracking-wide"
              style={{ fontSize: 'clamp(3.2rem,13vw,10rem)' }}>
              {'SHRI SWASTIK'.split('').map((c, i) => (
                <span key={i} className="hero-char inline-block text-white" style={{ opacity: 0 }}>
                  {c === ' ' ? ' ' : c}
                </span>
              ))}
            </h1>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="h-px w-32 bg-gold mx-auto my-6 origin-left"
          />

          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="font-display italic text-gray-400 text-xl md:text-2xl mb-10 tracking-wide"
          >
            Where Every Jewel Tells a Story
          </motion.p>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/collection">
              <button className="btn-gold">
                <span>
                  Explore Collection
                  <ArrowRight size={13} />
                </span>
              </button>
            </Link>
            <a href="#about">
              <button className="text-[11px] tracking-[0.3em] text-gray-500 hover:text-gold transition-colors uppercase border-b border-gray-700 pb-0.5 hover:border-gold">
                Our Story
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-gold to-transparent" />
          <p className="text-[9px] text-gray-600 tracking-[0.5em]">SCROLL</p>
        </motion.div>

        {/* Corner decorations */}
        <div className="absolute top-24 left-6 text-[9px] text-gray-700 tracking-[0.3em] rotate-90 hidden md:block">SHRI SWASTIK®</div>
        <div className="absolute top-24 right-6 text-[9px] text-gray-700 tracking-[0.3em] -rotate-90 hidden md:block">EST. 1974</div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────── */}
      <Marquee />

      {/* ── FEATURED COLLECTION ──────────────────────── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 gs-reveal">
          <p className="text-gold text-[10px] tracking-[0.6em] mb-4">OUR FINEST PIECES</p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white">
            Crafted for <em>Eternity</em>
          </h2>
          <div className="divider-gold mt-6" />
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-24 border border-white/5">
            <p className="text-6xl mb-5">💎</p>
            <p className="font-display text-2xl text-white italic mb-2">Collection Coming Soon</p>
            <p className="text-gray-600 text-xs tracking-widest">The owner is curating the finest pieces</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((j, i) => <JewelCard key={j.id} jewel={j} index={i} />)}
          </div>
        )}

        {featured.length > 0 && (
          <div className="text-center mt-16 gs-reveal">
            <Link to="/collection">
              <button className="btn-gold">
                <span>View Full Collection <ArrowRight size={13} /></span>
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section id="about" className="py-28 bg-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left visual */}
          <div className="gs-reveal-left relative">
            <div className="aspect-[3/4] border border-gold/15 relative overflow-hidden bg-gradient-to-br from-gold/5 via-transparent to-transparent">
              {/* Decorative lines */}
              <div className="absolute top-6 left-6 right-6 bottom-6 border border-gold/5" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="text-[80px] leading-none select-none">🔱</div>
                <p className="text-gold/40 text-[9px] tracking-[0.6em]">SHRI SWASTIK</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-dark to-transparent" />
            </div>

            {/* Stats block */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[['50+', 'Years Legacy'], ['10K+', 'Pieces Sold'], ['100%', 'Authentic'], ['5 ★', 'Rated']].map(([n, l]) => (
                <div key={l} className="border border-white/5 p-5 text-center bg-black">
                  <p className="font-display text-3xl text-gold">{n}</p>
                  <p className="text-gray-600 text-[9px] tracking-widest mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right text */}
          <div className="gs-reveal-right">
            <p className="text-gold text-[10px] tracking-[0.6em] mb-6">OUR STORY</p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-8">
              Legacy of<br /><em className="text-gold-gradient">Artistry</em>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Since 1974, Shri Swastik has been the trusted name in luxury jewellery across
              India. Founded with a vision to blend traditional Indian craftsmanship with
              contemporary design sensibilities, we have crafted pieces that adorn some of the
              most precious moments in life.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Each jewel from our collection is the result of our master artisans' relentless
              pursuit of perfection — using only the finest gold, silver, and gemstones sourced
              from around the world, certified for authenticity and beauty.
            </p>
            <Link to="/collection">
              <button className="btn-gold">
                <span>Discover the Collection <ArrowRight size={13} /></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE REVERSED ─────────────────────────── */}
      <Marquee reverse />

      {/* ── CATEGORIES ───────────────────────────────── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 gs-reveal">
          <p className="text-gold text-[10px] tracking-[0.6em] mb-4">BROWSE</p>
          <h2 className="font-display text-5xl md:text-6xl text-white">
            Shop by <em>Category</em>
          </h2>
          <div className="divider-gold mt-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 gs-reveal">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.slug} to={`/collection?category=${cat.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -10, borderColor: 'rgba(201,168,76,0.5)' }}
                className="border border-white/8 p-6 text-center group cursor-pointer transition-colors duration-300"
              >
                <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </div>
                <p className="text-gray-500 text-[10px] tracking-[0.3em] group-hover:text-gold transition-colors duration-300">
                  {cat.name.toUpperCase()}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PROMISES ─────────────────────────────────── */}
      <section id="contact" className="py-28 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 gs-reveal">
            <p className="text-gold text-[10px] tracking-[0.6em] mb-4">OUR PROMISE</p>
            <h2 className="font-display text-5xl md:text-6xl text-white">
              The Shri Swastik <em>Difference</em>
            </h2>
            <div className="divider-gold mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROMISES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="border border-white/5 p-10 text-center group hover:border-gold/20 transition-all duration-500"
              >
                <div className="w-14 h-14 border border-gold/25 flex items-center justify-center mx-auto mb-8 group-hover:border-gold transition-colors duration-500">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-display text-2xl text-white mb-4">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Address */}
          <div className="text-center mt-24 gs-reveal">
            <p className="text-gold text-[10px] tracking-[0.6em] mb-5">VISIT OUR STORE</p>
            <h3 className="font-display text-3xl md:text-4xl text-white italic mb-6">
              Experience Luxury in Person
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              123 Jewellery Market, Gold Bazaar, Mumbai – 400001, Maharashtra, India
            </p>
            <p className="text-gray-600 text-xs tracking-widest">
              MON–SAT: 10:00 AM – 8:00 PM &nbsp;•&nbsp; SUNDAY: 11:00 AM – 6:00 PM
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
