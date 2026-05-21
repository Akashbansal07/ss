import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { MessageCircle, ArrowLeft, Tag, Layers, Weight, Ruler, Package, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JewelDetail() {
  const { id } = useParams();
  const [jewel, setJewel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'jewelry', id));
        if (snap.exists()) setJewel({ id: snap.id, ...snap.data() });
      } catch {
        setJewel(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleWhatsApp = () => {
    if (!jewel) return;
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
    const url = window.location.href;
    const msg = encodeURIComponent(
      `Hey! 👋 I want to order *${jewel.name}* from Shri Swastik 💍\n\n` +
      `Product Link: ${url}\n\n` +
      `Kindly let me know about availability, pricing, and delivery. Thank you! 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: jewel?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xs tracking-widest">LOADING</p>
        </div>
      </div>
    );
  }

  if (!jewel) {
    return (
      <div className="min-h-screen bg-black pt-28 flex flex-col items-center justify-center text-center px-6">
        <p className="text-5xl mb-4">💍</p>
        <h2 className="font-display text-3xl text-white italic mb-4">Jewel Not Found</h2>
        <Link to="/collection">
          <button className="btn-gold mt-4"><span><ArrowLeft size={13} /> Back to Collection</span></button>
        </Link>
      </div>
    );
  }

  const price = Number(jewel.price).toLocaleString('en-IN');
  const images = jewel.images?.length ? jewel.images : ['https://placehold.co/600x700/111/C9A84C?text=✦'];

  const details = [
    jewel.category && { Icon: Tag, label: 'Category', value: jewel.category },
    jewel.material && { Icon: Layers, label: 'Material', value: jewel.material },
    jewel.weight && { Icon: Weight, label: 'Weight', value: jewel.weight },
    jewel.dimensions && { Icon: Ruler, label: 'Dimensions', value: jewel.dimensions },
    jewel.quantity != null && { Icon: Package, label: 'Availability', value: Number(jewel.quantity) > 0 ? `${jewel.quantity} in stock` : 'Out of Stock' },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-24 pb-20"
    >
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-gray-600">
          <Link to="/" className="hover:text-gold transition-colors">HOME</Link>
          <ChevronRight size={10} />
          <Link to="/collection" className="hover:text-gold transition-colors">COLLECTION</Link>
          <ChevronRight size={10} />
          <span className="text-gray-400">{jewel.name?.toUpperCase()}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Main Swiper */}
              <Swiper
                modules={[Navigation, Pagination, Thumbs, Zoom]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                zoom
                navigation
                pagination={{ clickable: true }}
                className="aspect-square md:aspect-[4/5] bg-card mb-3"
                style={{ '--swiper-navigation-size': '20px' }}
              >
                {images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <div className="swiper-zoom-container w-full h-full">
                      <img src={src} alt={`${jewel.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbs */}
              {images.length > 1 && (
                <Swiper
                  modules={[Thumbs]}
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={Math.min(images.length, 5)}
                  watchSlidesProgress
                  className="h-20"
                >
                  {images.map((src, i) => (
                    <SwiperSlide key={i} className="opacity-40 [&.swiper-slide-thumb-active]:opacity-100 transition-opacity cursor-pointer">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {jewel.category && (
              <p className="text-gold text-[10px] tracking-[0.5em] mb-4">{jewel.category.toUpperCase()}</p>
            )}

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
              {jewel.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <p className="font-display text-3xl text-gold">₹{price}</p>
              <div className={`px-3 py-1 text-[9px] tracking-widest border ${
                Number(jewel.quantity) > 0
                  ? 'border-green-800/50 text-green-400'
                  : 'border-red-800/50 text-red-400'
              }`}>
                {Number(jewel.quantity) > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
              </div>
            </div>

            {jewel.description && (
              <div className="mb-8 pb-8 border-b border-white/5">
                <p className="text-gray-400 text-sm leading-relaxed">{jewel.description}</p>
              </div>
            )}

            {/* Details */}
            {details.length > 0 && (
              <div className="mb-10 space-y-4">
                {details.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <Icon size={14} className="text-gold shrink-0" />
                    <span className="text-gray-600 text-xs tracking-widest w-24 shrink-0">{label}</span>
                    <span className="text-gray-300 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleWhatsApp}
              disabled={Number(jewel.quantity) === 0}
              className="whatsapp-btn w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-black text-xs tracking-widest uppercase font-semibold mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle size={18} />
              {Number(jewel.quantity) > 0 ? 'Order via WhatsApp' : 'Out of Stock'}
            </motion.button>

            <button
              onClick={handleShare}
              className="w-full py-4 border border-white/10 text-gray-500 hover:border-gold/50 hover:text-gold text-xs tracking-widest uppercase transition-all duration-300"
            >
              Share This Piece
            </button>

            {/* Note */}
            <p className="text-gray-600 text-[10px] text-center mt-6 leading-relaxed tracking-wider">
              Clicking "Order via WhatsApp" will open a chat with our team.<br />
              We'll confirm availability and arrange delivery for you.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
