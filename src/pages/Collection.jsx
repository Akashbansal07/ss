import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import JewelCard from '../components/JewelCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const CATS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Bangles', 'Anklets', 'Sets'];

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jewels, setJewels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        let q;
        if (activeCategory !== 'All') {
          q = query(collection(db, 'jewelry'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
        } else {
          q = query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'));
        }
        const snap = await getDocs(q);
        setJewels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setJewels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  const setCategory = (cat) => {
    if (cat === 'All') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  const filtered = jewels
    .filter(j => !search || j.name?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-28 pb-20"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-gold text-[10px] tracking-[0.6em] mb-4">BROWSE ALL</p>
          <h1 className="font-display text-5xl md:text-7xl text-white">
            Our <em>Collection</em>
          </h1>
          <div className="divider-gold mt-6" />
        </motion.div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        {/* Category tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide flex-wrap"
        >
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 text-[10px] tracking-[0.25em] uppercase whitespace-nowrap transition-all duration-300 border ${
                activeCategory === cat
                  ? 'border-gold text-gold bg-gold/5'
                  : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-4 mt-6 flex-wrap"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="w-full bg-transparent border border-white/10 py-3 pl-10 pr-4 text-xs text-gray-300 placeholder-gray-600 tracking-widest focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-2 border border-white/10 px-5 py-3 text-xs text-gray-500 tracking-widest hover:border-white/30 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Sort
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 bg-[#111] border border-white/10 z-20 min-w-[160px]"
                >
                  {[['newest', 'Newest First'], ['price-asc', 'Price: Low–High'], ['price-desc', 'Price: High–Low'], ['name', 'Name A–Z']].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => { setSortBy(v); setShowSort(false); }}
                      className={`w-full text-left px-5 py-3 text-xs tracking-wider transition-colors ${sortBy === v ? 'text-gold' : 'text-gray-500 hover:text-white'}`}
                    >
                      {l}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <p className="text-gray-600 text-[10px] tracking-widest">
            {filtered.length} {filtered.length === 1 ? 'PIECE' : 'PIECES'} FOUND
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-5">🔍</p>
            <h3 className="font-display text-3xl text-white italic mb-3">Nothing Found</h3>
            <p className="text-gray-500 text-sm">
              {search ? `No jewellery matching "${search}"` : 'No pieces in this category yet.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + search + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((j, i) => <JewelCard key={j.id} jewel={j} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
