import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import JewelCard from '../components/JewelCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATS = ['All','Rings','Necklaces','Earrings','Bracelets','Pendants','Bangles','Anklets','Sets'];
const SORTS = [['newest','Newest First'],['price-asc','Price: Low–High'],['price-desc','Price: High–Low'],['name','Name A–Z']];

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jewels,  setJewels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sortBy,  setSortBy]  = useState('newest');
  const [showSort,setShowSort]= useState(false);

  const cat = searchParams.get('category') || 'All';

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const q = cat !== 'All'
          ? query(collection(db,'jewelry'), where('category','==',cat), orderBy('createdAt','desc'))
          : query(collection(db,'jewelry'), orderBy('createdAt','desc'));
        const snap = await getDocs(q);
        setJewels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setJewels([]); }
      finally  { setLoading(false); }
    })();
  }, [cat]);

  const setCat = (c) => {
    const p = new URLSearchParams(searchParams);
    c === 'All' ? p.delete('category') : p.set('category', c);
    setSearchParams(p);
  };

  const filtered = jewels
    .filter(j => !search || j.name?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==='price-asc')  return Number(a.price)-Number(b.price);
      if (sortBy==='price-desc') return Number(b.price)-Number(a.price);
      if (sortBy==='name')       return (a.name||'').localeCompare(b.name||'');
      return 0;
    });

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen bg-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

        {/* header */}
        <div className="text-center mb-16">
          <p className="text-[#A8751E] text-[10px] tracking-[.55em] mb-5">BROWSE ALL</p>
          <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl lg:text-7xl text-black mb-7">
            Our <em>Collection</em>
          </h1>
          <div className="w-10 h-px mx-auto" style={{ background:'linear-gradient(to right,transparent,#A8751E,transparent)' }} />
        </div>

        {/* category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5" style={{ scrollbarWidth:'none' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-5 py-2.5 text-[10px] tracking-[.2em] uppercase whitespace-nowrap
                          border transition-all duration-300 flex-shrink-0 ${
                cat===c
                  ? 'border-[#A8751E] text-[#A8751E] bg-[#A8751E]/5'
                  : 'border-black/10 text-black/50 hover:border-black/30 hover:text-black'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* search + sort */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search jewellery…"
              className="w-full bg-transparent border border-black/10 py-3 pl-10 pr-10
                         text-xs text-black placeholder-black/30 tracking-wider
                         outline-none focus:border-[#A8751E]/60 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <button onClick={() => setShowSort(v=>!v)}
              className="flex items-center gap-2 border border-black/10 px-5 py-3
                         text-xs text-black/50 tracking-widest hover:border-black/30 hover:text-black transition-colors">
              <SlidersHorizontal size={13} />
              <span className="hidden sm:inline">Sort</span>
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:6 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-black/10 z-20 min-w-[190px] shadow-sm">
                  {SORTS.map(([v,l]) => (
                    <button key={v} onClick={() => { setSortBy(v); setShowSort(false); }}
                      className={`w-full text-left px-5 py-4 text-xs tracking-wider border-b border-black/5 last:border-0 transition-colors ${
                        sortBy===v ? 'text-[#A8751E] bg-[#A8751E]/5' : 'text-black/50 hover:text-black hover:bg-black/3'
                      }`}>{l}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* count */}
        {!loading && (
          <p className="text-black/30 text-[10px] tracking-widest mb-10">
            {filtered.length} {filtered.length===1?'PIECE':'PIECES'} FOUND
            {cat!=='All' && <span className="ml-2 text-[#A8751E]/60">IN {cat.toUpperCase()}</span>}
          </p>
        )}

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length:8}).map((_,i) => (
              <div key={i} className="aspect-[3/4] bg-black/4 animate-pulse" />
            ))}
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-6">✦</p>
            <h3 className="font-['Cormorant_Garamond',serif] text-3xl text-black italic mb-4">Nothing Found</h3>
            <p className="text-black/40 text-sm mb-8">
              {search ? `No jewellery matching "${search}"` : 'No pieces in this category yet.'}
            </p>
            {(search||cat!=='All') && (
              <button onClick={() => { setSearch(''); setCat('All'); }}
                className="text-[10px] tracking-widest text-[#A8751E] border border-[#A8751E]/40 px-6 py-3 hover:bg-[#A8751E]/5 transition-colors">
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={cat+search+sortBy} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((j,i) => <JewelCard key={j.id} jewel={j} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </motion.div>
  );
}