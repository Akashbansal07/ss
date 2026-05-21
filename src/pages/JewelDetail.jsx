import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css'; import 'swiper/css/navigation'; import 'swiper/css/pagination';
import 'swiper/css/thumbs'; import 'swiper/css/zoom';
import { MessageCircle, ArrowLeft, Tag, Layers, Weight, Ruler, Package, ChevronRight, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JewelDetail() {
  const { id } = useParams();
  const [jewel,setJewel] = useState(null);
  const [loading,setLoading] = useState(true);
  const [thumb,setThumb] = useState(null);

  useEffect(() => {
    window.scrollTo(0,0);
    (async () => {
      try {
        const snap = await getDoc(doc(db,'jewelry',id));
        if (snap.exists()) setJewel({ id:snap.id, ...snap.data() });
      } catch { setJewel(null); }
      finally { setLoading(false); }
    })();
  },[id]);

  const wa = () => {
    if (!jewel) return;
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
    const msg = encodeURIComponent(`Hey! 👋 I want to order *${jewel.name}* from Shri Swastik 💍\n\nProduct Link: ${window.location.href}\n\nKindly let me know about availability, pricing, and delivery. Thank you! 🙏`);
    window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
  };

  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title:jewel?.name, url:window.location.href }); } catch {} }
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white pt-28 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border border-[#A8751E]/30 border-t-[#A8751E] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-black/30 text-[10px] tracking-widest">LOADING</p>
      </div>
    </div>
  );

  if (!jewel) return (
    <div className="min-h-screen bg-white pt-28 flex flex-col items-center justify-center text-center px-6">
      <p className="text-5xl mb-5">✦</p>
      <h2 className="font-['Cormorant_Garamond',serif] text-3xl text-black italic mb-4">Jewel Not Found</h2>
      <Link to="/collection">
        <button className="mt-4 border border-[#A8751E] text-[#A8751E] text-[10px] tracking-[.25em] uppercase px-8 py-4 hover:bg-[#A8751E] hover:text-white transition-all duration-400 flex items-center gap-2">
          <ArrowLeft size={13} /> Back to Collection
        </button>
      </Link>
    </div>
  );

  const price   = Number(jewel.price).toLocaleString('en-IN');
  const images  = jewel.images?.length ? jewel.images : ['https://placehold.co/600x700/f5f5f5/C9A84C?text=✦'];
  const inStock = Number(jewel.quantity) > 0;

  const details = [
    jewel.category   && { Icon:Tag,     label:'Category',   value:jewel.category },
    jewel.material   && { Icon:Layers,  label:'Material',   value:jewel.material },
    jewel.weight     && { Icon:Weight,  label:'Weight',     value:jewel.weight },
    jewel.dimensions && { Icon:Ruler,   label:'Dimensions', value:jewel.dimensions },
    jewel.quantity!=null && { Icon:Package, label:'Stock',  value: inStock ? `${jewel.quantity} in stock` : 'Out of Stock' },
  ].filter(Boolean);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen bg-white pt-20 sm:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">

        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-[9px] tracking-widest text-black/30 mb-10 flex-wrap">
          <Link to="/" className="hover:text-[#A8751E] transition-colors">HOME</Link>
          <ChevronRight size={10} />
          <Link to="/collection" className="hover:text-[#A8751E] transition-colors">COLLECTION</Link>
          <ChevronRight size={10} />
          <span className="text-black/50 truncate">{jewel.name?.toUpperCase()}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">

          {/* images */}
          <motion.div initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }} transition={{ duration:.8 }}>
            <Swiper modules={[Navigation,Pagination,Thumbs,Zoom]}
              thumbs={{ swiper: thumb&&!thumb.destroyed ? thumb : null }}
              zoom navigation pagination={{ clickable:true }}
              className="aspect-square md:aspect-[4/5] bg-[#f5f5f5] mb-3"
              style={{ '--swiper-navigation-size':'18px' }}>
              {images.map((src,i) => (
                <SwiperSlide key={i}>
                  <div className="swiper-zoom-container w-full h-full">
                    <img src={src} alt={`${jewel.name} ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {images.length>1 && (
              <Swiper modules={[Thumbs]} onSwiper={setThumb}
                spaceBetween={6} slidesPerView={Math.min(images.length,6)} watchSlidesProgress
                className="h-16 sm:h-20">
                {images.map((src,i) => (
                  <SwiperSlide key={i} className="opacity-40 [&.swiper-slide-thumb-active]:opacity-100 transition-opacity cursor-pointer">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          {/* info */}
          <motion.div initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} transition={{ duration:.8 }}
            className="flex flex-col">
            {jewel.category && <p className="text-[#A8751E] text-[10px] tracking-[.4em] mb-4">{jewel.category.toUpperCase()}</p>}

            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl lg:text-6xl text-black leading-tight mb-5">
              {jewel.name}
            </h1>

            <div className="flex items-center gap-4 mb-7 flex-wrap">
              <p className="font-['Cormorant_Garamond',serif] text-3xl text-[#A8751E]">₹{price}</p>
              <span className={`px-3 py-1.5 text-[9px] tracking-widest border ${inStock?'border-green-500/40 text-green-600 bg-green-50':'border-red-400/40 text-red-500 bg-red-50'}`}>
                {inStock?'IN STOCK':'OUT OF STOCK'}
              </span>
            </div>

            {jewel.description && (
              <div className="mb-7 pb-7 border-b border-black/8">
                <p className="text-black/60 text-sm leading-relaxed">{jewel.description}</p>
              </div>
            )}

            {details.length>0 && (
              <div className="mb-8 space-y-3.5">
                {details.map(({ Icon,label,value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <Icon size={14} className="text-[#A8751E] flex-shrink-0" />
                    <span className="text-black/35 text-xs tracking-widest w-24 flex-shrink-0">{label}</span>
                    <span className="text-black/70 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 mt-auto">
              <motion.button whileHover={{ scale:inStock?1.02:1 }} whileTap={{ scale:inStock?.97:1 }}
                onClick={wa} disabled={!inStock}
                className="whatsapp-pulse w-full flex items-center justify-center gap-3 py-4
                           bg-[#25D366] text-white text-xs tracking-widest uppercase font-semibold
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none">
                <MessageCircle size={18} />
                {inStock ? 'Order via WhatsApp' : 'Currently Out of Stock'}
              </motion.button>

              <button onClick={share}
                className="w-full py-4 border border-black/10 text-black/40 text-xs tracking-widest uppercase
                           hover:border-[#A8751E]/50 hover:text-[#A8751E] transition-all duration-300 flex items-center justify-center gap-2">
                <Share2 size={13} /> Share This Piece
              </button>
            </div>

            <p className="text-black/30 text-[10px] text-center mt-5 leading-relaxed tracking-wider">
              Tapping "Order via WhatsApp" opens a chat with our team.<br />
              We'll confirm availability and arrange delivery for you.
            </p>

            <div className="mt-7 pt-7 border-t border-black/6">
              <Link to="/collection"
                className="inline-flex items-center gap-2 text-black/35 hover:text-[#A8751E] text-[10px] tracking-widest uppercase transition-colors">
                <ArrowLeft size={12} /> Back to Collection
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}